require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const { generateQuizFromAI } = require('./gemini');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: 'http://localhost:5173', methods: ['GET','POST'] } });

app.use(cors());
app.use(express.json());

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// In-memory store
const rooms = {}; // roomId -> { questions, students, answers, topic, duration }
const completedRooms = {}; // ← Ye add karo — permanently saved results

// Generate quiz
app.post('/api/generate', upload.single('pdf'), async (req, res) => {
  try {
    const { topic, notes, difficulty, numQuestions, duration } = req.body;
    let text = notes || '';
    if (req.file) {
      const data = await pdfParse(req.file.buffer);
      text = data.text;
    }
    const questions = await generateQuizFromAI({ topic, text, difficulty, numQuestions: parseInt(numQuestions) });
    const roomId = Math.random().toString(36).substring(2, 10);
    rooms[roomId] = { questions, students: {}, answers: {}, topic, duration: parseInt(duration) || 10, active: true };
    res.json({ roomId, questions });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/room/:roomId', (req, res) => {
  const room = rooms[req.params.roomId];
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json({
    topic: room.topic,
    duration: room.duration,
    questionCount: room.questions.length,
    questions: room.questions
  });
});

app.get('/api/topic/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms[roomId];
  const completed = completedRooms[roomId];
  const topic = room?.topic || completed?.topic;
  if (!topic) return res.status(404).json({ error: 'Room not found' });
  res.json({ topic, duration: room?.duration || completed?.duration });
});

// Get room info (for student to join)
// Ye existing endpoint hai — update karo
app.get('/api/results/:roomId', (req, res) => {
  const { roomId } = req.params;

  // Pehle completedRooms check karo — permanent data
  if (completedRooms[roomId]) {
    const saved = completedRooms[roomId];
    // Live room se latest students merge karo
    const liveStudents = rooms[roomId]
      ? Object.values(rooms[roomId].students).filter(s => s.done)
      : [];

    // Dono merge karo — duplicate names handle karo
    const allStudentsMap = {};

    // Pehle saved data daalo
    saved.leaderboard.forEach(s => {
      allStudentsMap[s.name] = s;
    });

    // Phir live data se update karo (zyada fresh)
    liveStudents.forEach(s => {
      allStudentsMap[s.name] = s;
    });

    const mergedLeaderboard = Object.values(allStudentsMap)
      .sort((a, b) => b.score - a.score);

    // completedRooms update karo merged data se
    completedRooms[roomId].leaderboard = mergedLeaderboard;

    return res.json({
      leaderboard: mergedLeaderboard,
      topic: saved.topic,
      questions: saved.questions,
      totalStudents: mergedLeaderboard.length,
      doneStudents: mergedLeaderboard.length,
    });
  }

  // completedRooms mein nahi hai — live room check karo
  const room = rooms[roomId];
  if (!room) return res.status(404).json({ error: 'Room not found' });

  const leaderboard = Object.values(room.students)
    .filter(s => s.done)
    .sort((a, b) => b.score - a.score);

  res.json({
    leaderboard,
    topic: room.topic,
    questions: room.questions,
    totalStudents: Object.values(room.students).length,
    doneStudents: leaderboard.length,
  });
});

// Socket.io — real-time quiz
io.on('connection', (socket) => {
  socket.on('join-room', ({ roomId, studentName }) => {
  const room = rooms[roomId];
  if (!room) { socket.emit('error', 'Room not found'); return; }

  // 🎯 Har student ke liye shuffle
const shuffledQuestions = [...room.questions]
  .sort(() => Math.random() - 0.5)
  .map(q => {
    const optionsWithIndex = q.options.map((opt, i) => ({
      opt,
      isCorrect: i === q.correctIndex
    }));

    const shuffledOptions = optionsWithIndex.sort(() => Math.random() - 0.5);

    return {
      question: q.question,
      options: shuffledOptions.map(o => o.opt),
      correctIndex: shuffledOptions.findIndex(o => o.isCorrect),
    };
  });

  room.students[socket.id] = {
  name: studentName,
  score: 0,
  done: false,
  shuffledQuestions: shuffledQuestions  // ← zaroori hai
};
  socket.join(roomId);

  // Agar quiz already khatam ho gaya hai toh seedha results bhejo
  const allDone = Object.values(room.students)
    .filter((_, id) => id !== socket.id) // naye student ko chhodo
    .every(s => s.done);

  if (allDone && Object.values(room.students).length > 1) {
    // Quiz khatam ho chuka hai — seedha results page pe bhejo
    const sorted = Object.values(room.students)
      .filter(s => s.done)
      .sort((a, b) => b.score - a.score);
    socket.emit('quiz-already-ended', {
      leaderboard: sorted,
      questions: shuffledQuestions,
      topic: room.topic
    });
    return;
  }

  socket.emit('quiz-started', { questions: shuffledQuestions, duration: room.duration });
  io.to(roomId).emit('students-update', Object.values(room.students));
});

  socket.on('submit-quiz', ({ roomId, answers: studentAnswers }) => {
  const room = rooms[roomId];
  if (!room || !room.students[socket.id]) return;

  // Student ke shuffled questions use karo — original nahi
  const studentData = room.students[socket.id];
  const questionsToUse = studentData.shuffledQuestions || room.questions;

  let score = 0;
  questionsToUse.forEach((q, i) => {
    const ans = studentAnswers[i] ?? studentAnswers[String(i)];
    if (ans !== undefined && Number(ans) === Number(q.correctIndex)) {
      score++;
    }
    // Debug log
    console.log(`Q${i+1}: StudentAns=${ans}, CorrectIdx=${q.correctIndex}, Correct="${q.options[q.correctIndex]}", Match=${Number(ans)===Number(q.correctIndex)}`);
  });

  studentData.score = Math.round((score / questionsToUse.length) * 100);
  studentData.correct = score;
  studentData.total = questionsToUse.length;
  studentData.answers = studentAnswers;
  studentData.studentQuestions = questionsToUse; // View modal ke liye
  studentData.done = true;

  const allStudents = Object.values(room.students);
  const doneStudents = allStudents.filter(s => s.done);

  const existingLeaderboard = completedRooms[roomId]?.leaderboard || [];
  const mergedMap = {};
  existingLeaderboard.forEach(s => { mergedMap[s.name] = s; });
  doneStudents.forEach(s => { mergedMap[s.name] = s; });
  const mergedLeaderboard = Object.values(mergedMap).sort((a, b) => b.score - a.score);

  completedRooms[roomId] = {
    topic: room.topic,
    questions: room.questions,
    duration: room.duration,
    leaderboard: mergedLeaderboard,
    savedAt: new Date().toISOString(),
  };

  io.to(roomId).emit('students-update', allStudents);

  if (doneStudents.length === allStudents.length) {
    io.to(roomId).emit('quiz-ended', {
      leaderboard: mergedLeaderboard,
      questions: room.questions,
      topic: room.topic
    });
  } else {
    io.to(roomId).emit('partial-results', {
      leaderboard: mergedLeaderboard,
      doneCount: doneStudents.length,
      totalCount: allStudents.length
    });
  }
});

socket.on('disconnect', () => {
  for (const roomId in rooms) {
    if (rooms[roomId].students[socket.id]) {
      const student = rooms[roomId].students[socket.id];

      // Agar student done tha toh completedRooms mein save karo
      if (student.done && completedRooms[roomId]) {
        const exists = completedRooms[roomId].leaderboard
          .find(s => s.name === student.name);
        if (!exists) {
          completedRooms[roomId].leaderboard.push(student);
          completedRooms[roomId].leaderboard.sort((a, b) => b.score - a.score);
        }
      }

      // Room se hatao
      delete rooms[roomId].students[socket.id];
      io.to(roomId).emit('students-update',
        Object.values(rooms[roomId].students));
    }
  }
});
});

// ✅ YAHAN ADD KARO (socket ke baad)
const path = require('path');

app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Last line change karo
server.listen(3001, () => console.log('Backend running on http://localhost:3001'));

// Server crash hone se bachao
process.on('uncaughtException', (err) => {
  console.error('An error occurred, but the server will remain operational', err.message);
});

process.on('unhandledRejection', (err) => {
  console.error('An error occurred, but the server will remain operational', err.message);
});
const Groq = require('groq-sdk');
const { evaluate } = require('mathjs');
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ── Math expression extract karne ki koshish ─────────────
function tryMathEval(questionText) {
  try {
    // Question se math expression dhundho
    const patterns = [
      /what\s+is\s+([\d\s\+\-\*\/\^\(\)\.]+)\??/i,
      /calculate\s+([\d\s\+\-\*\/\^\(\)\.]+)\??/i,
      /solve\s+([\d\s\+\-\*\/\^\(\)\.]+)\??/i,
      /evaluate\s+([\d\s\+\-\*\/\^\(\)\.]+)\??/i,
      /([\d]+\s*[\+\-\*\/\^]\s*[\d]+(?:\s*[\+\-\*\/\^]\s*[\d]+)*)/,
    ];

    for (const pattern of patterns) {
      const match = questionText.match(pattern);
      if (match) {
        const expr = match[1].trim();
        const result = evaluate(expr);
        if (typeof result === 'number' && isFinite(result)) {
          return Math.round(result * 1000) / 1000; // 3 decimal places
        }
      }
    }
  } catch (e) {}
  return null;
}

// ── Check karo option math answer se match karta hai ─────
function findCorrectIndexByMath(question, options) {
  const mathAnswer = tryMathEval(question);
  if (mathAnswer === null) return null;

  console.log(`🧮 Math detected: "${question}" → answer = ${mathAnswer}`);

  for (let i = 0; i < options.length; i++) {
    const optNum = parseFloat(options[i].toString().replace(/[^0-9.\-]/g, ''));
    if (!isNaN(optNum) && Math.abs(optNum - mathAnswer) < 0.01) {
      console.log(`✅ Math correct index: ${i} = "${options[i]}"`);
      return i;
    }
  }
  return null;
}

// ── Main generate function ────────────────────────────────
async function generateQuizFromAI({ topic, text, difficulty, numQuestions }) {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `You are a strict quiz generator. Generate EXACTLY ${numQuestions} MCQ questions.

Difficulty: ${difficulty}
Topic: ${topic}
Notes: ${text.substring(0, 4000)}

CRITICAL RULES:
- Generate questions ONLY from the provided notes
- Each question MUST have EXACTLY 4 options
- correctIndex MUST be the index of the actually correct answer (0=A,1=B,2=C,3=D)
- Return ONLY valid JSON array, no markdown, no explanation

Format:
[{"question":"...","options":["opt1","opt2","opt3","opt4"],"correctIndex":0}]`
    }],
    temperature: 0.2,
    max_tokens: 8000,
  });

  const raw = completion.choices[0].message.content
    .replace(/```json|```/g, '').trim();
  let questions = JSON.parse(raw);

  // ── Step 1: Math questions ke liye mathjs use karo ───────
  let mathFixed = 0;
  questions = questions.map((q, i) => {
    const mathIdx = findCorrectIndexByMath(q.question, q.options);
    if (mathIdx !== null && mathIdx !== q.correctIndex) {
      console.log(`🔧 Q${i+1} math fix: index ${q.correctIndex} → ${mathIdx}`);
      mathFixed++;
      return { ...q, correctIndex: mathIdx };
    }
    return q;
  });
  if (mathFixed > 0) console.log(`✅ Math fixed ${mathFixed} questions`);

  // ── Step 2: Baaki questions AI se verify karo ────────────
  const verified = await verifyAnswers(questions, topic, text);
  return verified;
}

// ── AI verification (non-math questions ke liye) ─────────
async function verifyAnswers(questions, topic, notes) {
  // Sirf non-math questions verify karo
  const needsVerify = questions.filter(q => tryMathEval(q.question) === null);

  if (needsVerify.length === 0) {
    console.log('✅ All questions are math — no AI verification needed');
    return questions;
  }

  const questionsText = needsVerify.map((q, i) =>
    `Q${i+1}: ${q.question}
A=${q.options[0]}, B=${q.options[1]}, C=${q.options[2]}, D=${q.options[3]}
Current correctIndex: ${q.correctIndex} = "${q.options[q.correctIndex]}"`
  ).join('\n\n');

  const verification = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{
      role: 'user',
      content: `Verify the correct answer for each question using the notes below.

Notes:
${notes.substring(0, 2000)}

Questions:
${questionsText}

Return ONLY a JSON array of correct indices (0=A,1=B,2=C,3=D).
Example: [0,2,1,3]
No explanation, no markdown.`
    }],
    temperature: 0.0,
    max_tokens: 200,
  });

  const verifyRaw = verification.choices[0].message.content
    .replace(/```json|```/g, '').trim();

  let verifiedIndices;
  try {
    verifiedIndices = JSON.parse(verifyRaw);
  } catch (e) {
    console.log('Verification parse failed, using original');
    return questions;
  }

  // Non-math questions mein verified indices apply karo
  let verifyIdx = 0;
  const result = questions.map(q => {
    if (tryMathEval(q.question) !== null) {
      return q; // Math questions unchanged
    }
    const corrected = { ...q, correctIndex: Number(verifiedIndices[verifyIdx] ?? q.correctIndex) };
    verifyIdx++;
    return corrected;
  });

  return result;
}

module.exports = { generateQuizFromAI };
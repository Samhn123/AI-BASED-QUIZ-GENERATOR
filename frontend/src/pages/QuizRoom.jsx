import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

let socket;

function getTheme(dark) {
  return dark ? {
    page: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
    card: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.1)',
    text: '#fff', textMuted: 'rgba(255,255,255,0.5)', textFaint: 'rgba(255,255,255,0.25)',
    label: 'rgba(255,255,255,0.45)',
    inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)', inputColor: '#fff',
    optBg: 'rgba(255,255,255,0.03)', optBorder: 'rgba(255,255,255,0.1)',
    optActive: 'rgba(99,102,241,0.2)', optActiveBorder: '#6366f1', optActiveColor: '#a5b4fc',
    badgeBg: 'rgba(99,102,241,0.2)', badgeBorder: 'rgba(99,102,241,0.4)', badgeColor: '#a5b4fc',
    accent: '#6366f1', accentGrad: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: '0 4px 20px rgba(99,102,241,0.4)',
    errBg: 'rgba(239,68,68,0.1)', errBorder: 'rgba(239,68,68,0.3)', errColor: '#fca5a5',
    title: 'linear-gradient(135deg,#fff 30%,#a5b4fc 100%)',
    timerGood: '#6366f1', timerWarn: '#f59e0b', timerDanger: '#ef4444',
    progressBg: 'rgba(255,255,255,0.08)',
    blur: 'blur(20px)', shadow: 'none',
  } : {
    page: 'linear-gradient(135deg,#eef2ff 0%,#faf5ff 50%,#f0fdf4 100%)',
    card: '#fff', cardBorder: '#e5e7eb',
    text: '#111827', textMuted: '#6b7280', textFaint: '#9ca3af',
    label: '#6b7280',
    inputBg: '#f9fafb', inputBorder: '#e5e7eb', inputColor: '#111827',
    optBg: '#f9fafb', optBorder: '#e5e7eb',
    optActive: 'rgba(79,70,229,0.08)', optActiveBorder: '#4f46e5', optActiveColor: '#4f46e5',
    badgeBg: 'rgba(79,70,229,0.08)', badgeBorder: 'rgba(79,70,229,0.25)', badgeColor: '#4f46e5',
    accent: '#4f46e5', accentGrad: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    glow: '0 4px 20px rgba(79,70,229,0.25)',
    errBg: '#fef2f2', errBorder: '#fca5a5', errColor: '#dc2626',
    title: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)',
    timerGood: '#4f46e5', timerWarn: '#d97706', timerDanger: '#dc2626',
    progressBg: '#e5e7eb',
    blur: 'none', shadow: '0 4px 30px rgba(0,0,0,0.07)',
  };
}

function Particles() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {[...Array(14)].map((_,i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%',
          width: Math.random()*5+3+'px', height: Math.random()*5+3+'px',
          background:`rgba(99,102,241,${Math.random()*0.25+0.08})`,
          left: Math.random()*100+'%', top: Math.random()*100+'%',
          animation:`float${i%3} ${Math.random()*8+6}s ease-in-out infinite`,
          animationDelay: Math.random()*5+'s',
        }} />
      ))}
    </div>
  );
}

function TimerRing({ timeLeft, total, t }) {
  const pct = total > 0 ? timeLeft/total : 0;
  const color = pct > 0.5 ? t.timerGood : pct > 0.2 ? t.timerWarn : t.timerDanger;
  const r = 28, circ = 2*Math.PI*r;
  const mins = Math.floor(timeLeft/60), secs = timeLeft%60;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
      <svg width={70} height={70} style={{ transform:'rotate(-90deg)', flexShrink:0 }}>
        <circle cx={35} cy={35} r={r} fill="none" stroke={t.progressBg} strokeWidth={5} />
        <circle cx={35} cy={35} r={r} fill="none" stroke={color} strokeWidth={5}
          strokeDasharray={circ} strokeDashoffset={circ*(1-pct)} strokeLinecap="round"
          style={{ transition:'stroke-dashoffset 1s linear, stroke 0.5s ease' }} />
      </svg>
      <div>
        <div style={{ fontSize:22, fontWeight:800, color, fontFamily:'monospace', lineHeight:1 }}>
          {mins}:{secs.toString().padStart(2,'0')}
        </div>
        <div style={{ fontSize:11, color:t.textFaint, fontWeight:600 }}>remaining</div>
      </div>
    </div>
  );
}

function WarningBanner({ count, onReenter }) {
  const isFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  );

  // 👉 Agar fullscreen me ho to banner hide kar do
  if (count === 0 || isFullscreen) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
      background: count >= 1 ? '#dc2626' : '#f59e0b',
      padding: '12px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      animation: 'shake 0.4s ease',
      boxShadow: '0 4px 20px rgba(220,38,38,0.5)',
    }}>
      <div style={{ color: '#fff', fontWeight: 700, fontSize: 14 }}>
        ⚠️ Warning {count}/2 — Fullscreen turned off! 
        {count === 1 && ' If you do it again, the quiz will auto-submit!'}
        {count >= 2 && ' The quiz has been auto-submitted!'}
      </div>
      {count < 2 && (
        <button onClick={onReenter} style={{
          padding: '6px 16px', background: '#fff', color: '#dc2626',
          border: 'none', borderRadius: 8, fontWeight: 700,
          fontSize: 13, cursor: 'pointer',
        }}>
          🔲 Return to full screen
        </button>
      )}
    </div>
  );
}

export default function QuizRoom() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const [dark] = useState(() => (localStorage.getItem('quiz-theme') ?? 'dark') === 'dark');
  const t = getTheme(dark);

  const [phase, setPhase] = useState('join');
  const [name, setName] = useState('');
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});   // FREE to change until submit
  const answersRef = useRef({});
  const [timeLeft, setTimeLeft] = useState(600);
  const [totalTime, setTotalTime] = useState(600);
  const [students, setStudents] = useState([]);
  const [error, setError] = useState('');
  // Fullscreen + Anti-cheat
  const [fullscreenWarning, setFullscreenWarning] = useState(0); // Warning count
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const [securityAlert, setSecurityAlert] = useState('');
  const [isBlurred, setIsBlurred] = useState(false);
  const [blurCount, setBlurCount] = useState(0);
  const blurLock = useRef(false);
  const longPressLock = useRef(false);


  const enterFullscreen = () => {
  const el = document.documentElement;
  if (el.requestFullscreen) el.requestFullscreen();
  else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
  else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
};

const showSecurityWarning = (msg) => {
  setSecurityAlert(msg);
  setTimeout(() => setSecurityAlert(''), 5000);
};

const exitFullscreenDetected = useCallback(() => {
  if (phase !== 'quiz' || autoSubmitted) return;

  const isFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  );

  // Fullscreen ENTER hone par ignore karo — sirf EXIT detect karo
  if (isFullscreen) return;

  setFullscreenWarning(prev => {
    const newCount = prev + 1;
    if (newCount >= 2) {
      setAutoSubmitted(true);
      const cleanAnswers = {};
      Object.entries(answersRef.current).forEach(([key, val]) => {
        cleanAnswers[Number(key)] = Number(val);
      });
      socket.emit('submit-quiz', { roomId, answers: cleanAnswers });
      setPhase('done');
    }
    return newCount;
  });

}, [phase, autoSubmitted, roomId]);

  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'qr-styles';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}
      @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px) translateX(12px)}}
      @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px) rotate(180deg)}}
      @keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:translateX(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.04)}}
      @keyframes pop{0%{transform:scale(0.95)}60%{transform:scale(1.04)}100%{transform:scale(1)}}
      .qcard{animation:fadeSlideUp 0.45s ease both}
      .qslide{animation:slideIn 0.3s ease both}
      .opt-btn{transition:all 0.18s ease;cursor:pointer}
      .opt-btn:hover{transform:translateY(-2px) scale(1.01)}
      .opt-btn.sel{animation:pop 0.3s ease}
      .nav-btn{transition:all 0.22s ease;cursor:pointer}
      .nav-btn:hover{transform:translateY(-2px)}
      @media(max-width:600px){
        .nav-row{flex-direction:column !important}
        .nav-btn{width:100% !important}
      }
    `;
    document.getElementById('qr-styles')?.remove();
    document.head.appendChild(style);
    return () => document.getElementById('qr-styles')?.remove();
  }, []);

  useEffect(() => {
    socket = io(window.location.origin, { extraHeaders:{'ngrok-skip-browser-warning':'true'} });
    socket.on('connect_error', () => setError('Unable to connect to the server. Is the backend running?'));
    socket.on('quiz-started', ({ questions:qs, duration }) => {
      setQuestions(qs);
      const s = duration*60; setTimeLeft(s); setTotalTime(s);
      setPhase('quiz');
    });
    socket.on('error', msg => setError(msg));
    socket.on('students-update', setStudents);
    socket.on('quiz-ended', ({ leaderboard, questions, topic }) => {
  // leaderboard localStorage mein BILKUL MAT DAALO
  if (questions) localStorage.setItem('questions_' + roomId, JSON.stringify(questions));
  if (topic) localStorage.setItem('topic_' + roomId, topic);
  navigate('/results/' + roomId);
});
  }, []);

  // Fullscreen change listener
  useEffect(() => {
  document.addEventListener('fullscreenchange', exitFullscreenDetected);
  document.addEventListener('webkitfullscreenchange', exitFullscreenDetected);
  document.addEventListener('mozfullscreenchange', exitFullscreenDetected);
  return () => {
    document.removeEventListener('fullscreenchange', exitFullscreenDetected);
    document.removeEventListener('webkitfullscreenchange', exitFullscreenDetected);
    document.removeEventListener('mozfullscreenchange', exitFullscreenDetected);
  };
  }, [exitFullscreenDetected]);


  // 🚨 Focus + Blur detection (Google Lens / Assist / App switch)
const handleBlur = useCallback(() => {
  if (blurLock.current) return; // 🔒 duplicate block
  blurLock.current = true;

  if (phase !== 'quiz' || autoSubmitted) return;

  setBlurCount(prev => {
    const newCount = prev + 1;

    if (newCount >= 2) {
      const cleanAnswers = {};
      Object.entries(answersRef.current).forEach(([key, val]) => {
        cleanAnswers[Number(key)] = Number(val);
      });

      socket.emit('submit-quiz', { roomId, answers: cleanAnswers });
      setAutoSubmitted(true);
      setPhase('done');
    } else {
      showSecurityWarning(`⚠️ Warning ${newCount}/2 — "Anomalous system behavior detected!"`);
    }

    return newCount;
  });

  // 🔓 500ms baad unlock
  setTimeout(() => {
    blurLock.current = false;
  }, 500);

}, [phase, autoSubmitted, roomId]);


useEffect(() => {
  if (phase !== 'quiz') return;

  window.addEventListener('blur', handleBlur);

  return () => {
    window.removeEventListener('blur', handleBlur);
  };
}, [phase, handleBlur]);

const handleVisibility = useCallback(() => {
  if (document.hidden) {
    handleBlur(); // Tab switch ya app switch detect karo
    setIsBlurred(true);
    showSecurityWarning('Tab switching detected!');
  } else {
    setIsBlurred(false);
  }
}, [showSecurityWarning]);

useEffect(() => {
  if (phase !== 'quiz') return;

  document.addEventListener('visibilitychange', handleVisibility);

  return () => {
    document.removeEventListener('visibilitychange', handleVisibility);
  };
}, [phase, handleVisibility]);


  // Screenshot/Screen capture block karo
useEffect(() => {
  if (phase !== 'quiz') return;

  // CSS se screenshot dark karo
  const style = document.createElement('style');
style.id = 'anti-screenshot';
style.textContent = `
  @media print {
    body { display: none !important; }
  }

  * {
    -webkit-user-select: none !important;
    user-select: none !important;
  }

  /* Screen capture CSS protection */
  body {
    -webkit-touch-callout: none !important;
  }

  /* Image copy block */
  img {
    pointer-events: none !important;
    -webkit-user-drag: none !important;
  }
`;
  document.head.appendChild(style);

  // Right click disable
  const blockMenu = (e) => e.preventDefault();
  document.addEventListener('contextmenu', blockMenu);

  // Screenshot shortcuts block karo
  const blockKeys = (e) => {
    // Windows: PrtScn, Win+Shift+S, Win+PrtScn
    if (e.key === 'PrintScreen') {
      e.preventDefault();
      navigator.clipboard.writeText(''); // clipboard clear karo
      showSecurityWarning('Screenshot lena allowed nahi hai!');
      return false;
    }
    // Windows shortcuts
    if (e.metaKey && e.shiftKey && ['s','S','3','4','5'].includes(e.key)) {
      e.preventDefault();
      showSecurityWarning('Screenshot lena allowed nahi hai!');
      return false;
    }
    // Alt+PrtScn
    if (e.altKey && e.key === 'PrintScreen') {
      e.preventDefault();
      return false;
    }
    // Developer tools block
    if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['i','I','j','J','c','C'].includes(e.key))) {
      e.preventDefault();
      showSecurityWarning('Developer tools allowed nahi hai!');
      return false;
    }
    // Ctrl+U (view source)
    if (e.ctrlKey && ['u','U'].includes(e.key)) {
      e.preventDefault();
      return false;
    }
  };
  document.addEventListener('keydown', blockKeys);

 

  return () => {
    document.getElementById('anti-screenshot')?.remove();
    document.removeEventListener('contextmenu', blockMenu);
    document.removeEventListener('keydown', blockKeys);
  };
}, [phase]);


useEffect(() => {
  if (phase !== 'quiz') return;

  let timer;
  let moved = false;

  const handleTouchStart = () => {
    if (longPressLock.current) return; // 🔒 spam block

    moved = false;

    timer = setTimeout(() => {
      if (!moved) {
        longPressLock.current = true;

        showSecurityWarning('⚠️ Long press detected!');

        // 🔓 1.5 sec baad unlock
        setTimeout(() => {
          longPressLock.current = false;
        }, 1500);
      }
    }, 600);
  };

  const handleTouchMove = () => {
    moved = true;
    clearTimeout(timer);
  };

  const handleTouchEnd = () => {
    clearTimeout(timer);
  };

  document.addEventListener('touchstart', handleTouchStart);
  document.addEventListener('touchmove', handleTouchMove);
  document.addEventListener('touchend', handleTouchEnd);

  return () => {
    document.removeEventListener('touchstart', handleTouchStart);
    document.removeEventListener('touchmove', handleTouchMove);
    document.removeEventListener('touchend', handleTouchEnd);
  };
}, [phase]);
  
  const handleTouchEnd = () => {
  clearTimeout(timer);
};

  useEffect(() => {
  if (phase !== 'quiz') return;
  const iv = setInterval(() => {
    setTimeLeft(prev => {
      if (prev <= 1) {
        clearInterval(iv);
        // answersRef use karo yahan bhi
        const cleanAnswers = {};
        Object.entries(answersRef.current).forEach(([key, val]) => {
          cleanAnswers[Number(key)] = Number(val);
        });
        socket.emit('submit-quiz', { roomId, answers: cleanAnswers });
        setPhase('done');
        return 0;
      }
      return prev - 1;
    });
  }, 1000);
  return () => clearInterval(iv);
  }, [phase, roomId]); // doSubmit dependency hatao

  // Quiz shuru hone par fullscreen enter karo
  useEffect(() => {
    if (phase === 'quiz') {
      enterFullscreen();
    }
}, [phase]);

  const join = () => {
  if (!name.trim()) { setError('Write your name!'); return; }
  setError('');
  socket.emit('join-room', { roomId, studentName: name });
  setPhase('waiting');
};


  // Option select — freely changeable, no lock
  const selectOption = (idx) => {
  const isFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  );

  if (!isFullscreen) {
    showSecurityWarning('Fullscreen required to select answer!');
    return;
  }

  if (document.hidden || !document.hasFocus()) {
  showSecurityWarning('Focus lost! Action blocked.');
  return;
}

  const newAnswers = { ...answers, [current]: idx };
  setAnswers(newAnswers);
  answersRef.current = newAnswers;
};

// doSubmit mein answersRef use karo:
const doSubmit = useCallback(() => {
  const isFullscreen = !!(
    document.fullscreenElement ||
    document.webkitFullscreenElement ||
    document.mozFullScreenElement
  );
  if (!isFullscreen) return; // Submit bhi lock
  const cleanAnswers = {};
  Object.entries(answersRef.current).forEach(([key, val]) => {
    cleanAnswers[Number(key)] = Number(val);
  });
  console.log('Final answers submitting:', cleanAnswers);
  socket.emit('submit-quiz', { roomId, answers: cleanAnswers });
  setPhase('done');
}, [roomId]); // answers dependency hatao — ref use ho raha hai

  const cardStyle = {
    background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:20,
    padding:'clamp(20px,5vw,32px)', backdropFilter:t.blur,
    WebkitBackdropFilter:t.blur, boxShadow:t.shadow, transition:'all 0.4s ease',
  };
  const titleStyle = {
    fontSize:'clamp(24px,5vw,36px)', fontWeight:800, margin:'0 0 8px', lineHeight:1.2,
    background:t.title, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent',
  };
  const inputStyle = {
    width:'100%', padding:'13px 16px', boxSizing:'border-box',
    background:t.inputBg, border:`1px solid ${t.inputBorder}`,
    borderRadius:12, fontSize:15, color:t.inputColor, outline:'none',
    fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'border 0.2s,box-shadow 0.2s',
  };
  const pageStyle = {
    minHeight:'100vh', background:t.page,
    fontFamily:"'Plus Jakarta Sans',sans-serif",
    padding:'24px 16px 60px', position:'relative',
    transition:'background 0.45s ease',
  };

  // ── JOIN ─────────────────────────────────────────────────────────────────────
  if (phase==='join') return (
    <div style={pageStyle}>
      {dark && <Particles />}
      <div style={{ maxWidth:460, margin:'48px auto', position:'relative', zIndex:1 }}>
        <div style={{ textAlign:'center', marginBottom:28, animation:'fadeSlideUp 0.5s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:t.badgeBg, border:`1px solid ${t.badgeBorder}`, borderRadius:20, padding:'4px 14px', fontSize:12, color:t.badgeColor, fontWeight:600, letterSpacing:0.5, marginBottom:16 }}>🎯 Quiz Room</div>
          <h1 style={titleStyle}>Join the Quiz!</h1>
          <p style={{ color:t.textMuted, fontSize:14, margin:0 }}>Room: <span style={{ color:t.accent, fontWeight:700, fontFamily:'monospace' }}>{roomId}</span></p>
        </div>
        <div className="qcard" style={cardStyle}>
          <label style={{ fontSize:12, fontWeight:700, color:t.label, textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8 }}>👤 Your Name</label>
          <input style={inputStyle} value={name} onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&join()} placeholder="Enter your Name..."
            onFocus={e=>{e.target.style.borderColor=t.accent;e.target.style.boxShadow=`0 0 0 3px ${t.accent}25`;}}
            onBlur={e=>{e.target.style.borderColor=t.inputBorder;e.target.style.boxShadow='none';}} />
          {error && <div style={{ background:t.errBg, border:`1px solid ${t.errBorder}`, borderRadius:10, padding:'10px 14px', color:t.errColor, fontSize:14, marginTop:12 }}>⚠️ {error}</div>}
          <button onClick={join} style={{ width:'100%', marginTop:20, padding:15, background:t.accentGrad, color:'#fff', border:'none', borderRadius:14, fontSize:16, fontWeight:700, cursor:'pointer', boxShadow:t.glow }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
            onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
            🚀 Join Now
          </button>
        </div>
      </div>
    </div>
  );

  // ── WAITING ──────────────────────────────────────────────────────────────────
  if (phase==='waiting') return (
    <div style={pageStyle}>
      {dark && <Particles />}
      <div style={{ maxWidth:460, margin:'80px auto', textAlign:'center', position:'relative', zIndex:1, animation:'fadeSlideUp 0.5s ease' }}>
        <div style={{ fontSize:56, marginBottom:16, animation:'pulse 2s ease infinite' }}>⏳</div>
        <h2 style={{ ...titleStyle, textAlign:'center' }}>Please wait for the teacher to begin</h2>
        <p style={{ color:t.textMuted, fontSize:15, margin:'0 0 24px' }}>Questions will load automatically once the quiz begins</p>
        <div style={{ ...cardStyle, display:'inline-block', padding:'16px 28px' }}>
          <div style={{ fontSize:13, color:t.textMuted, marginBottom:10, fontWeight:600 }}>Joined students:</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {students.map((s,i) => (
              <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, background:t.badgeBg, border:`1px solid ${t.badgeBorder}`, borderRadius:20, padding:'4px 12px', fontSize:13, color:t.badgeColor, fontWeight:600 }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#10b981', display:'inline-block' }} />{s.name}
              </div>
            ))}
            {students.length===0 && <span style={{ color:t.textFaint, fontSize:13 }}>No one has joined yet...</span>}
          </div>
        </div>
        <div style={{ marginTop:16, fontSize:12, color:t.textFaint }}>
          <div style={{ display:'inline-block', width:14, height:14, border:`2px solid ${t.accent}40`, borderTopColor:t.accent, borderRadius:'50%', animation:'spin 0.8s linear infinite', marginRight:8, verticalAlign:'middle' }} />
          Joined successfully — awaiting quiz start
        </div>
      </div>
    </div>
  );

  // ── DONE ─────────────────────────────────────────────────────────────────────
  if (phase==='done') return (
    <div style={pageStyle}>
      {dark && <Particles />}
      <div style={{ maxWidth:460, margin:'80px auto', textAlign:'center', position:'relative', zIndex:1, animation:'fadeSlideUp 0.5s ease' }}>
        <div style={{ fontSize:64, marginBottom:16 }}>{autoSubmitted ? '⚠️' : '🎉'}</div>
        <h2 style={{ ...titleStyle, textAlign:'center' }}>{autoSubmitted ? 'Quiz Auto-Submitted due to multiple fullscreen exits!' : 'Done! Your quiz is submitted'}</h2>
        <p style={{ color:t.textMuted, fontSize:15, margin:'0 0 24px' }}>{autoSubmitted
          ? 'Due to exiting fullscreen mode twice, your quiz has been submitted automatically.'
          : 'Generating results for all participants...'}</p>
        <div style={cardStyle}>
          <div style={{ fontSize:13, color:t.textMuted, marginBottom:12, fontWeight:600 }}>Submitted: {Object.keys(answers).length}/{questions.length} answers</div>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, justifyContent:'center' }}>
            {students.filter(s=>s.done).map((s,i) => (
              <div key={i} style={{ display:'inline-flex', alignItems:'center', gap:6, background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.3)', borderRadius:20, padding:'4px 12px', fontSize:13, color:'#10b981', fontWeight:600 }}>✓ {s.name}</div>
            ))}
          </div>
          <div style={{ marginTop:16, fontSize:13, color:t.textFaint }}>
            <div style={{ display:'inline-block', width:16, height:16, border:`2px solid ${t.accent}40`, borderTopColor:t.accent, borderRadius:'50%', animation:'spin 0.8s linear infinite', marginRight:8, verticalAlign:'middle' }} />
            Results are being calculated...
          </div>
        </div>
      </div>
    </div>
  );

  // ── QUIZ ─────────────────────────────────────────────────────────────────────
  const q = questions[current];
  const optLabels = ['A','B','C','D'];
  const totalQ = questions.length;
  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === totalQ;
const isFullscreen = !!(
  document.fullscreenElement ||
  document.webkitFullscreenElement ||
  document.mozFullScreenElement
);
  return (
    <div style={pageStyle}>

      {/* Security Alert Banner */}
{securityAlert && (
  <div style={{
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
    background: 'linear-gradient(135deg,#dc2626,#b91c1c)',
    color: '#fff', padding: '14px 20px',
    display: 'flex', alignItems: 'center', gap: 12,
    boxShadow: '0 4px 20px rgba(220,38,38,0.6)',
    animation: 'shake 0.4s ease',
    fontFamily: "'Plus Jakarta Sans',sans-serif",
    fontSize: 15, fontWeight: 700,
  }}>
    <span style={{ fontSize: 22 }}>🚨</span>
    {securityAlert}
  </div>
)}

      {/* Anti-cheat warning banner */}
      <WarningBanner
      count={fullscreenWarning}
      onReenter={() => {
        enterFullscreen();
        // Warning clear nahi hoti — sirf fullscreen mein wapas jaate hain
      }}
    />
      {dark && <Particles />}
      <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:12, animation:'fadeSlideUp 0.4s ease' }}>
          <TimerRing timeLeft={timeLeft} total={totalTime} t={t} />
          <div style={{ textAlign:'center' }}>
            <div style={{ fontSize:13, color:t.textMuted, fontWeight:600, marginBottom:6 }}>Q {current+1} / {totalQ}</div>
            <div style={{ display:'flex', gap:5, flexWrap:'wrap', justifyContent:'center' }}>
              {questions.map((_,i) => (
                <div key={i} onClick={()=>setCurrent(i)} style={{
                  width:32, height:8, borderRadius:4, cursor:'pointer',
                  background: i===current ? t.accent : answers[i]!==undefined ? `${t.accent}70` : t.progressBg,
                  transition:'all 0.2s ease', transform: i===current?'scaleY(1.4)':'scaleY(1)',
                }} title={`Q${i+1}${answers[i]!==undefined?' ✓':''}`} />
              ))}
            </div>
          </div>
          <div style={{ textAlign:'right' }}>
            <div style={{ fontSize:22, fontWeight:800, color:t.accent }}>{answeredCount}</div>
            <div style={{ fontSize:11, color:t.textFaint, fontWeight:600 }}>answered</div>
          </div>
        </div>

        {/* Question card */}
        {q && (
          <div key={current} className="qcard" style={{ ...cardStyle, marginBottom:14 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
              <div style={{ width:38, height:38, borderRadius:'50%', background:t.accentGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, fontWeight:700, color:'#fff', flexShrink:0, boxShadow:t.glow }}>{current+1}</div>
              <div style={{ fontSize:12, color:t.textMuted, fontWeight:600 }}>
                {answers[current]!==undefined ? '✅ Selected — you can proceed or change your answer' : 'Select an option'}
              </div>
            </div>
            <div style={{ fontSize:'clamp(15px,3vw,18px)', fontWeight:600, color:t.text, lineHeight:1.65, marginBottom:20 }}>
              {q.question}
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {q.options.map((opt,i) => {
                const isSel = answers[current]===i;
                const isFullscreen = !!(
                  document.fullscreenElement ||
                  document.webkitFullscreenElement ||
                  document.mozFullScreenElement
                );

                return (
                  <div key={i} className={`opt-btn${isSel?' sel':''}`} onClick={()=>selectOption(i)} style={{
                    display:'flex', alignItems:'center', gap:14,
                    padding:'13px 16px', borderRadius:12,
                    border:`1.5px solid ${isSel?t.optActiveBorder:t.optBorder}`,
                    background:isSel?t.optActive:t.optBg,
                    boxShadow:isSel?t.glow:'none',
                    cursor: isFullscreen ? 'pointer' : 'not-allowed',
                    opacity: isFullscreen ? 1 : 0.6,
                    pointerEvents: isFullscreen ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease'
                  }}>
                    <div style={{ width:34, height:34, borderRadius:'50%', flexShrink:0, background:isSel?t.accentGrad:t.progressBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:isSel?'#fff':t.textMuted, transition:'all 0.2s ease' }}>
                      {isSel?'✓':optLabels[i]}
                    </div>
                    <span style={{ fontSize:15, color:isSel?t.optActiveColor:t.text, fontWeight:isSel?600:400 }}>{opt}</span>
                  </div>
                );
              })}
            </div>
            {/* Change hint */}
            {answers[current]!==undefined && (
              <div style={{ marginTop:14, fontSize:12, color:t.textFaint, textAlign:'center', padding:'8px 12px', background:t.progressBg, borderRadius:8 }}>
                💡 To change your answer, select a different option. Edits are allowed until you click final submit!
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="nav-row" style={{ display:'flex', gap:12 }}>
          {current>0 ? (
            <button
  className="nav-btn"
  onClick={() => isFullscreen && setCurrent(current-1)}
  style={{
    flex:1,
    padding:'13px 20px',
    borderRadius:12,
    border:`1.5px solid ${t.optBorder}`,
    background:t.optBg,
    color:t.text,
    fontSize:14,
    fontWeight:700,

    // 🔒 LOCK STYLE
    cursor: isFullscreen ? 'pointer' : 'not-allowed',
    opacity: isFullscreen ? 1 : 0.5,
    pointerEvents: isFullscreen ? 'auto' : 'none',
  }}
>
  ← Previous
</button>
          ) : <div style={{flex:1}} />}

          {current<totalQ-1 ? (
            <button
  className="nav-btn"
  onClick={() => isFullscreen && setCurrent(current+1)}
  style={{
    flex:1,
    padding:'13px 20px',
    borderRadius:12,
    border:'none',
    background:t.accentGrad,
    color:'#fff',
    fontSize:14,
    fontWeight:700,
    boxShadow:t.glow,
    // 🔒 LOCK STYLE
    cursor: isFullscreen ? 'pointer' : 'not-allowed',
    opacity: isFullscreen ? 1 : 0.5,
    pointerEvents: isFullscreen ? 'auto' : 'none',
  }}
>
  Next →
</button>
          ) : (
            <button
  className="nav-btn"
  onClick={doSubmit}
  style={{
    flex:1,
    padding:'13px 20px',
    borderRadius:12,
    border:'none',
    background:'linear-gradient(135deg,#10b981,#059669)',
    color:'#fff',
    fontSize:14,
    fontWeight:700,
    boxShadow:'0 4px 15px rgba(16,185,129,0.4)',
    animation:allAnswered ? 'pulse 2s ease infinite' : 'none',

    // 🔒 LOCK STYLE
    cursor: isFullscreen ? 'pointer' : 'not-allowed',
    opacity: isFullscreen ? 1 : 0.5,
    pointerEvents: isFullscreen ? 'auto' : 'none',
  }}
>
  ✅ Final Submission
</button>
          )}
        </div>

        {/* Bottom info */}
        <div style={{ textAlign:'center', marginTop:14, fontSize:13, color:t.textFaint }}>
          {answeredCount} of {totalQ} answered
          {allAnswered && <span style={{ color:'#10b981', fontWeight:600 }}> — Ready to submit!</span>}
        </div>
        <div style={{ textAlign:'center', marginTop:24, fontSize:12, color:t.textFaint }}>Made with ❤️ for Final Year Project</div>
      </div>
    </div>
  );
}
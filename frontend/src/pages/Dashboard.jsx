import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const BACKEND = window.location.origin;

function Particles({ dark }) {
  if (!dark) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
      {[...Array(18)].map((_, i) => (
        <div key={i} style={{
          position: 'absolute',
          width: Math.random() * 6 + 3 + 'px',
          height: Math.random() * 6 + 3 + 'px',
          borderRadius: '50%',
          background: `rgba(99,102,241,${Math.random() * 0.3 + 0.1})`,
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animation: `float${i % 3} ${Math.random() * 8 + 6}s ease-in-out infinite`,
          animationDelay: Math.random() * 5 + 's',
        }} />
      ))}
    </div>
  );
}

function StepIndicator({ current, dark, accent }) {
  const steps = ['Notes', 'Settings', 'Generate'];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 32 }}>
      {steps.map((step, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: i <= current ? `linear-gradient(135deg, ${accent}, #8b5cf6)` : dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700,
              color: i <= current ? '#fff' : dark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
              transition: 'all 0.4s ease',
              boxShadow: i <= current ? `0 0 20px ${accent}60` : 'none',
            }}>
              {i < current ? '✓' : i + 1}
            </div>
            <span className="step-label" style={{
              fontSize: 11, fontWeight: 600, letterSpacing: 0.5,
              color: i <= current ? accent : dark ? 'rgba(255,255,255,0.3)' : '#9ca3af',
            }}>{step}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{
              width: 60, height: 2, margin: '0 8px', marginBottom: 22,
              background: i < current ? `linear-gradient(90deg, ${accent}, #8b5cf6)` : dark ? 'rgba(255,255,255,0.1)' : '#e5e7eb',
              transition: 'all 0.4s ease',
            }} />
          )}
        </div>
      ))}
    </div>
  );
}

function ThemeToggle({ dark, onToggle }) {
  return (
    <button onClick={onToggle} title={dark ? 'Switch to light mode' : 'Switch to dark mode'} style={{
      position: 'fixed', top: 20, right: 20, zIndex: 1000,
      width: 50, height: 50, borderRadius: '50%', border: 'none', cursor: 'pointer',
      background: dark ? 'rgba(255,255,255,0.15)' : 'rgba(79,70,229,0.12)',
      backdropFilter: 'blur(10px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, transition: 'all 0.3s ease',
      boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.4)' : '0 4px 20px rgba(79,70,229,0.2)',
    }}
    onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.15) rotate(20deg)'; }}
    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1) rotate(0deg)'; }}>
      {dark ? '☀️' : '🌙'}
    </button>
  );
}

export default function Dashboard() {
  const [dark, setDark] = useState(true);
  const [tab, setTab] = useState('paste');
  const [topic, setTopic] = useState('');
  const [notes, setNotes] = useState('');
  const [file, setFile] = useState(null);
  const [difficulty, setDifficulty] = useState('Easy');
  const [numQ, setNumQ] = useState(5);
  const [duration, setDuration] = useState(5);
  const [loading, setLoading] = useState(false);
  const [quizLink, setQuizLink] = useState('');
  const [roomId, setRoomId] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const fileInputRef = useRef();

  const loadingMessages = [
    '🧠 AI is analyzing your notes...',
    '⚡ Questions are being generated...',
    '🎯 Difficulty is being adjusted...',
    '✨ Quiz is ready...',
  ];

  // Load saved theme
  useEffect(() => {
    const saved = localStorage.getItem('quiz-theme');
    if (saved) setDark(saved === 'Light');
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('quiz-theme', next ? 'dark' : 'light');
  };

  // Inject CSS animations
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'dash-anim';
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
      @keyframes float0{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-30px) scale(1.1)}}
      @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-20px) translateX(15px)}}
      @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-25px) rotate(180deg)}}
      @keyframes fadeSlideUp{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}
      @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
      @keyframes spin{to{transform:rotate(360deg)}}
      @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
      @keyframes successPop{0%{transform:scale(0.85);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
      .dash-anim{animation:fadeSlideUp 0.5s ease both}
      .gen-btn{transition:all 0.3s ease;position:relative;overflow:hidden}
      .gen-btn:hover:not(:disabled){transform:translateY(-2px)}
      .gen-btn::after{content:'';position:absolute;inset:0;background:linear-gradient(90deg,transparent,rgba(255,255,255,0.15),transparent);transform:translateX(-100%);transition:transform 0.5s ease}
      .gen-btn:hover::after{transform:translateX(100%)}
      .pill-btn{transition:all 0.2s ease;cursor:pointer}
      .pill-btn:hover{transform:scale(1.06)}
      .opt-btn{transition:all 0.2s ease;cursor:pointer}
      .opt-btn:hover{transform:translateY(-2px)}
      .copy-btn{transition:all 0.2s ease}
      .copy-btn:hover{transform:scale(1.03)}
      .link-box{animation:successPop 0.5s ease both}
      @media(max-width:600px){
        .grid-2{grid-template-columns:1fr !important}
        .step-label{display:none}
        .action-btns{flex-direction:column !important}
      }
    `;
    document.getElementById('dash-anim')?.remove();
    document.head.appendChild(style);
    return () => document.getElementById('dash-anim')?.remove();
  }, []);

  // Loading text cycling
  useEffect(() => {
    if (!loading) return;
    let i = 0; setLoadingText(loadingMessages[0]);
    const iv = setInterval(() => { i = (i+1)%loadingMessages.length; setLoadingText(loadingMessages[i]); }, 1200);
    return () => clearInterval(iv);
  }, [loading]);

  useEffect(() => {
    if (topic && notes.length > 50) setStep(1); else setStep(0);
  }, [topic, notes]);

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f?.type === 'application/pdf') setFile(f);
  };

  const generate = async () => {
    if (!topic.trim()) { setError('⚠️ Must write the topic'); return; }
    if (tab === 'paste' && notes.trim().length < 10) { setError('⚠️ Notes must be at least 10 characters long!'); return; }
    if (tab === 'upload' && !file) { setError('⚠️ Please select a PDF file!'); return; }
    setError(''); setLoading(true); setStep(2);
    try {
      const fd = new FormData();
      fd.append('topic', topic); fd.append('difficulty', difficulty);
      fd.append('numQuestions', numQ); fd.append('duration', duration);
      if (tab === 'paste') fd.append('notes', notes);
      else if (file) fd.append('pdf', file);
      const { data } = await axios.post(`${BACKEND}/api/generate`, fd, {
  headers: { 'ngrok-skip-browser-warning': 'true' }
});

    // Ye sab save karo
    const link = `${BACKEND}/quiz/${data.roomId}`;
    setQuizLink(link);
    setRoomId(data.roomId);
    localStorage.setItem('topic_' + data.roomId, topic);
    localStorage.setItem('duration_' + data.roomId, duration);
    localStorage.setItem('questions_' + data.roomId, JSON.stringify(data.questions)); // Add karo
    } catch (e) {
      setError(e.response?.data?.error || '❌ An error occurred. Please try again.');
      setStep(1);
    }
    setLoading(false);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(quizLink);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  // ── Theme tokens ──────────────────────────────────────────────────────────
  const accent = dark ? '#6366f1' : '#4f46e5';
  const t = dark ? {
    page: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
    card: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.1)',
    text: '#fff', textMuted: 'rgba(255,255,255,0.5)', textFaint: 'rgba(255,255,255,0.25)',
    label: 'rgba(255,255,255,0.45)',
    inputBg: 'rgba(255,255,255,0.07)', inputBorder: 'rgba(255,255,255,0.12)', inputColor: '#fff',
    tabBg: 'rgba(0,0,0,0.3)', tabInactive: 'rgba(255,255,255,0.4)',
    optBg: 'rgba(255,255,255,0.03)', optBorder: 'rgba(255,255,255,0.1)', optActive: 'rgba(99,102,241,0.2)',
    linkCard: 'linear-gradient(135deg,rgba(16,185,129,0.1),rgba(99,102,241,0.1))',
    linkBorder: 'rgba(16,185,129,0.3)', linkBg: 'rgba(0,0,0,0.3)',
    statBg: 'rgba(255,255,255,0.05)', resBg: 'rgba(255,255,255,0.08)', resBorder: 'rgba(255,255,255,0.15)',
    badgeBg: 'rgba(99,102,241,0.2)', badgeBorder: 'rgba(99,102,241,0.4)', badgeColor: '#a5b4fc',
    glow: '0 4px 20px rgba(99,102,241,0.4)',
    errBg: 'rgba(239,68,68,0.1)', errBorder: 'rgba(239,68,68,0.3)', errColor: '#fca5a5',
    title: 'linear-gradient(135deg,#fff 30%,#a5b4fc 100%)',
    titleColor: 'transparent',
    shadow: 'none', blur: 'blur(20px)',
    diffEasy: { color:'#10b981', bg:'rgba(16,185,129,0.15)' },
    diffMed:  { color:'#f59e0b', bg:'rgba(245,158,11,0.15)' },
    diffHard: { color:'#ef4444', bg:'rgba(239,68,68,0.15)' },
  } : {
    page: 'linear-gradient(135deg,#eef2ff 0%,#faf5ff 50%,#f0fdf4 100%)',
    card: '#fff', cardBorder: '#e5e7eb',
    text: '#111827', textMuted: '#6b7280', textFaint: '#9ca3af',
    label: '#6b7280',
    inputBg: '#f9fafb', inputBorder: '#e5e7eb', inputColor: '#111827',
    tabBg: '#f3f4f6', tabInactive: '#9ca3af',
    optBg: '#f9fafb', optBorder: '#e5e7eb', optActive: 'rgba(79,70,229,0.08)',
    linkCard: 'linear-gradient(135deg,rgba(16,185,129,0.06),rgba(79,70,229,0.06))',
    linkBorder: 'rgba(16,185,129,0.4)', linkBg: '#f0fdf4',
    statBg: '#f3f4f6', resBg: '#f3f4f6', resBorder: '#e5e7eb',
    badgeBg: 'rgba(79,70,229,0.08)', badgeBorder: 'rgba(79,70,229,0.25)', badgeColor: '#4f46e5',
    glow: '0 4px 20px rgba(79,70,229,0.25)',
    errBg: '#fef2f2', errBorder: '#fca5a5', errColor: '#dc2626',
    title: 'none',
    titleColor: '#2a274b',
    shadow: '0 4px 30px rgba(0,0,0,0.07)', blur: 'none',
    diffEasy: { color:'#059669', bg:'rgba(5,150,105,0.08)' },
    diffMed:  { color:'#d97706', bg:'rgba(217,119,6,0.08)' },
    diffHard: { color:'#dc2626', bg:'rgba(220,38,38,0.08)' },
  };

  const diffMap = { Easy: t.diffEasy, Medium: t.diffMed, Hard: t.diffHard };
  const diffEmoji = { Easy:'🌱', Medium:'🔥', Hard:'💀' };

  const inp = {
    width:'100%', padding:'12px 16px', boxSizing:'border-box',
    background: t.inputBg, border:`1px solid ${t.inputBorder}`,
    borderRadius:12, fontSize:15, color:t.inputColor,
    fontFamily:"'Plus Jakarta Sans',sans-serif", transition:'border 0.2s,box-shadow 0.2s',
  };
  const lbl = {
    fontSize:12, fontWeight:700, color:t.label,
    textTransform:'uppercase', letterSpacing:1, display:'block', marginBottom:8,
  };
  const card = {
    background:t.card, border:`1px solid ${t.cardBorder}`,
    borderRadius:20, padding:'clamp(20px,5vw,32px)', marginBottom:16,
    backdropFilter:t.blur, WebkitBackdropFilter:t.blur,
    boxShadow:t.shadow, transition:'all 0.4s ease',
  };

  return (
    <div style={{
      minHeight:'100vh', background:t.page,
      fontFamily:"'Plus Jakarta Sans',sans-serif",
      padding:'24px 16px 60px', position:'relative',
      transition:'background 0.45s ease',
    }}>
      <Particles dark={dark} />
      <ThemeToggle dark={dark} onToggle={toggleTheme} />

      <div style={{ maxWidth:680, margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:36, animation:'fadeSlideUp 0.6s ease both' }}>
          <div style={{
            display:'inline-flex', alignItems:'center', gap:6,
            background:t.badgeBg, border:`1px solid ${t.badgeBorder}`,
            borderRadius:20, padding:'4px 14px', fontSize:12, color:t.badgeColor,
            fontWeight:600, letterSpacing:0.5, marginBottom:16,
          }}>
            ✨ AI-Powered Quiz Generator
          </div>
          <h1 style={{
            fontSize:'clamp(26px,6vw,42px)', fontWeight:800, margin:'0 0 10px', lineHeight:1.2,
            background: t.title !== 'none' ? t.title : 'none',
            WebkitBackgroundClip: t.title !== 'none' ? 'text' : 'unset',
            WebkitTextFillColor: t.title !== 'none' ? 'transparent' : t.titleColor,
            color: t.title !== 'none' ? 'transparent' : t.titleColor,
          }}>
            AI Quiz Generator
          </h1>
          <p style={{ fontSize:15, color:t.textMuted, margin:0 }}>
            Generate an AI-powered quiz from your notes
          </p>
        </div>

        <StepIndicator current={Math.min(step,2)} dark={dark} accent={accent} />

        {/* Card */}
        <div className="dash-anim" style={card}>

          {/* Tabs */}
          <div style={{ display:'flex', background:t.tabBg, borderRadius:12, padding:4, marginBottom:24, gap:4 }}>
            {[{key:'paste',label:'📝 Paste Note'},{key:'upload',label:'📄 Upload PDF'}].map(({key,label})=>(
              <button key={key} className="pill-btn" onClick={()=>setTab(key)} style={{
                flex:1, padding:'10px 16px', borderRadius:10, border:'none',
                background: tab===key ? `linear-gradient(135deg,${accent},#8b5cf6)` : 'transparent',
                color: tab===key ? '#fff' : t.tabInactive,
                fontSize:14, fontWeight:600, cursor:'pointer',
                boxShadow: tab===key ? `0 4px 15px ${accent}50` : 'none',
              }}>{label}</button>
            ))}
          </div>

          {/* Topic */}
          <div style={{ marginBottom:20 }}>
            <label style={lbl}>📌 Topic</label>
            <input style={inp} value={topic} onChange={e=>setTopic(e.target.value)}
              placeholder="e.g. Object-Oriented Programming in Java"
              onFocus={e=>{e.target.style.borderColor=accent;e.target.style.boxShadow=`0 0 0 3px ${accent}25`;}}
              onBlur={e=>{e.target.style.borderColor=t.inputBorder;e.target.style.boxShadow='none';}} />
          </div>

          {/* Notes / PDF */}
          {tab==='paste' ? (
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative', marginBottom: 8 }}>
    
              {/* Center wala Notes */}
              <label
              style={{
               ...lbl,
               marginBottom: 0,
               display: 'block',
               textAlign: 'center'
              }}
         >
           📋 Notes
             </label>

            {/* Right side character count */}
           <span
           style={{
           position: 'absolute',
           right: 0,
           top: 0,
           fontSize: 12,
           color: notes.length > 10 ? '#10b981' : t.textFaint,
           fontWeight: 600
           }}
         >
          {notes.length} character {notes.length > 10 ? '✓' : ''}
          </span>

              </div>
              <textarea style={{...inp,height:160,resize:'vertical',lineHeight:1.6}}
                value={notes} onChange={e=>setNotes(e.target.value)}
                placeholder="Enter your notes here... Minimum 10 characters required"
                onFocus={e=>{e.target.style.borderColor=accent;e.target.style.boxShadow=`0 0 0 3px ${accent}25`;}}
                onBlur={e=>{e.target.style.borderColor=t.inputBorder;e.target.style.boxShadow='none';}} />
            </div>
          ) : (
            <div style={{marginBottom:20}}>
              <label style={lbl}>📂 PDF File</label>
              <div onDrop={handleDrop}
                onDragOver={e=>{e.preventDefault();setDragOver(true);}}
                onDragLeave={()=>setDragOver(false)}
                onClick={()=>fileInputRef.current.click()}
                style={{
                  border:`2px dashed ${dragOver?accent:file?'#10b981':t.inputBorder}`,
                  borderRadius:14, padding:'36px 24px', textAlign:'center', cursor:'pointer',
                  background:dragOver?`${accent}15`:file?'rgba(16,185,129,0.05)':t.inputBg,
                  transition:'all 0.25s ease',
                }}>
                <div style={{fontSize:36,marginBottom:10}}>{file?'✅':'📁'}</div>
                <div style={{fontSize:15,color:file?'#10b981':t.textMuted,fontWeight:600,marginBottom:4}}>
                  {file?file.name:'Click here to upload your PDF file'}
                </div>
                <div style={{fontSize:12,color:t.textFaint}}>
                  {file?`${(file.size/1024/1024).toFixed(2)} MB`:'Max 100MB • PDF only'}
                </div>
                <input ref={fileInputRef} type="file" accept=".pdf" style={{display:'none'}}
                  onChange={e=>setFile(e.target.files[0])} />
              </div>
            </div>
          )}

          {/* Difficulty */}
          <div style={{marginBottom:20}}>
            <label style={lbl}>⚡ Difficulty</label>
            <div style={{display:'flex',gap:10}}>
              {['Easy','Medium','Hard'].map(d=>{
                const conf = diffMap[d];
                return (
                  <button key={d} className="pill-btn" onClick={()=>setDifficulty(d)} style={{
                    flex:1, padding:'10px 8px', borderRadius:10,
                    border:`1px solid ${difficulty===d?conf.color:t.optBorder}`,
                    background:difficulty===d?conf.bg:t.optBg,
                    color:difficulty===d?conf.color:t.textMuted,
                    fontSize:13, fontWeight:700, cursor:'pointer',
                    boxShadow:difficulty===d?`0 0 15px ${conf.color}40`:'none',
                  }}>{diffEmoji[d]} {d}</button>
                );
              })}
            </div>
          </div>

          {/* Questions + Duration */}
          <div className="grid-2" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:24}}>
            {[
              {lbl:'🔢 Questions', val:numQ, set:setNumQ, opts:[5,10,15,20,30,50], fmt:v=>v},
              {lbl:'⏱ Duration',  val:duration, set:setDuration, opts:[5,10,15,20,30,60], fmt:v=>`${v}m`},
            ].map(({lbl:l,val,set,opts,fmt})=>(
              <div key={l}>
                <label style={lbl}>{l}</label>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:6}}>
                  {opts.map(o=>(
                    <button key={o} className="opt-btn" onClick={()=>set(o)} style={{
                      padding:'10px', borderRadius:10,
                      border:`1px solid ${val==o?accent:t.optBorder}`,
                      background:val==o?t.optActive:t.optBg,
                      color:val==o?accent:t.textMuted,
                      fontSize:14, fontWeight:700, cursor:'pointer',
                      boxShadow:val==o?`0 0 10px ${accent}30`:'none',
                    }}>{fmt(o)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Error */}
          {error && (
            <div style={{
              background:t.errBg, border:`1px solid ${t.errBorder}`,
              borderRadius:10, padding:'12px 16px', color:t.errColor,
              fontSize:14, marginBottom:16, animation:'fadeSlideUp 0.3s ease',
            }}>{error}</div>
          )}

          {/* Generate Button */}
          <button className="gen-btn" onClick={generate} disabled={loading} style={{
            width:'100%', padding:16,
            background: loading
              ? (dark?'rgba(99,102,241,0.35)':'#c7d2fe')
              : `linear-gradient(135deg,${accent} 0%,#8b5cf6 50%,${accent} 100%)`,
            backgroundSize:'200% auto',
            color:'#fff', border:'none', borderRadius:14,
            fontSize:16, fontWeight:700, cursor:loading?'not-allowed':'pointer',
            boxShadow:loading?'none':t.glow,
            animation:!loading?'shimmer 3s linear infinite':'none',
          }}>
            {loading ? (
              <span style={{display:'flex',alignItems:'center',justifyContent:'center',gap:10}}>
                <span style={{width:18,height:18,border:'2px solid rgba(255,255,255,0.3)',borderTopColor:'#fff',borderRadius:'50%',display:'inline-block',animation:'spin 0.7s linear infinite'}} />
                {loadingText}
              </span>
            ) : '✨ Generate Quiz'}
          </button>
        </div>

        {/* Quiz Link Card */}
        {quizLink && (
          <div className="link-box" style={{
            background:t.linkCard, border:`1px solid ${t.linkBorder}`,
            borderRadius:20, padding:'clamp(20px,5vw,28px)',
            backdropFilter:t.blur, WebkitBackdropFilter:t.blur,
            boxShadow:t.shadow,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:16}}>
              <div style={{width:44,height:44,borderRadius:'50%',background:'rgba(16,185,129,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:22,animation:'bounce 2s ease infinite',flexShrink:0}}>
                🎉
              </div>
              <div>
                <div style={{fontSize:16,fontWeight:700,color:'#10b981'}}>Quiz is ready!</div>
                <div style={{fontSize:13,color:t.textMuted}}>Share this link with everyone</div>
              </div>
            </div>

            {/* Stats */}
            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:8,marginBottom:16}}>
              {[
                {label:'Questions',value:numQ,icon:'🔢'},
                {label:'Duration',value:`${duration}m`,icon:'⏱'},
                {label:'Difficulty',value:difficulty,icon:diffEmoji[difficulty]},
              ].map(({label,value,icon})=>(
                <div key={label} style={{background:t.statBg,borderRadius:10,padding:'10px 8px',textAlign:'center'}}>
                  <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:15,fontWeight:700,color:t.text}}>{value}</div>
                  <div style={{fontSize:11,color:t.textFaint}}>{label}</div>
                </div>
              ))}
            </div>

            {/* Link display */}
            <div style={{
              background:t.linkBg, borderRadius:12, padding:'12px 14px',
              fontFamily:'monospace', fontSize:12, color:accent,
              wordBreak:'break-all', marginBottom:12, border:`1px solid ${accent}30`, lineHeight:1.6,
            }}>
              {quizLink}
            </div>

            {/* Action buttons */}
            <div className="action-btns" style={{display:'flex',gap:10,flexWrap:'wrap'}}>
              <button className="copy-btn" onClick={copyLink} style={{
                flex:1, minWidth:140, padding:'12px 16px',
                background: copied?'rgba(16,185,129,0.15)':`linear-gradient(135deg,${accent},#8b5cf6)`,
                border: copied?'1px solid #10b981':'none',
                color: copied?'#10b981':'#fff', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer',
                boxShadow: copied?'none':t.glow,
              }}>
                {copied?'✅ Copied!':'📋 Copy this link'}
              </button>
              <a href={`/results/${roomId}`} style={{
                flex:1, minWidth:140, padding:'12px 16px', boxSizing:'border-box',
                background:t.resBg, border:`1px solid ${t.resBorder}`,
                color:t.text, borderRadius:12, fontSize:14, fontWeight:700,
                textDecoration:'none', textAlign:'center', display:'block',
              }}>
                🏆 See Result
              </a>
            </div>

            <div style={{marginTop:14,fontSize:12,color:t.textFaint,textAlign:'center'}}>
               Results will be automatically generated after the ⏳ {duration} minute timer ends.
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{textAlign:'center',marginTop:32,fontSize:13,color:t.textFaint}}>
          Made with ❤️ for Final Year Project
        </div>
      </div>
    </div>
  );
}
import { useParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

function getTheme(dark) {
  return dark ? {
    page: 'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
    card: 'rgba(255,255,255,0.05)', cardBorder: 'rgba(255,255,255,0.1)',
    text: '#fff', textMuted: 'rgba(255,255,255,0.5)', textFaint: 'rgba(255,255,255,0.25)',
    badgeBg: 'rgba(99,102,241,0.2)', badgeBorder: 'rgba(99,102,241,0.4)', badgeColor: '#a5b4fc',
    accent: '#6366f1', accentGrad: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    glow: '0 4px 20px rgba(99,102,241,0.4)',
    title: 'linear-gradient(135deg,#fff 30%,#a5b4fc 100%)',
    rowBg: 'rgba(255,255,255,0.03)', rowBorder: 'rgba(255,255,255,0.08)',
    row1Bg: 'rgba(251,191,36,0.08)', row1Border: 'rgba(251,191,36,0.25)',
    progressBg: 'rgba(255,255,255,0.08)',
    blur: 'blur(20px)', shadow: 'none',
    btnOutline: 'rgba(255,255,255,0.15)',
    optBg: 'rgba(255,255,255,0.03)',
    optBorder: 'rgba(255,255,255,0.1)',
  } : {
    page: 'linear-gradient(135deg,#eef2ff 0%,#faf5ff 50%,#f0fdf4 100%)',
    card: '#fff', cardBorder: '#e5e7eb',
    text: '#111827', textMuted: '#6b7280', textFaint: '#9ca3af',
    badgeBg: 'rgba(79,70,229,0.08)', badgeBorder: 'rgba(79,70,229,0.25)', badgeColor: '#4f46e5',
    accent: '#4f46e5', accentGrad: 'linear-gradient(135deg,#4f46e5,#7c3aed)',
    glow: '0 4px 20px rgba(79,70,229,0.25)',
    title: 'linear-gradient(135deg,#4f46e5 0%,#7c3aed 50%,#a855f7 100%)',
    rowBg: '#f9fafb', rowBorder: '#e5e7eb',
    row1Bg: '#fffbeb', row1Border: '#fcd34d',
    progressBg: '#e5e7eb',
    blur: 'none', shadow: '0 4px 30px rgba(0,0,0,0.07)',
    btnOutline: '#e5e7eb',
    optBg: '#f9fafb',
    optBorder: '#e5e7eb',
  };
}

function Particles() {
  return (
    <div style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, overflow:'hidden' }}>
      {[...Array(14)].map((_,i) => (
        <div key={i} style={{
          position:'absolute', borderRadius:'50%',
          width:Math.random()*5+3+'px', height:Math.random()*5+3+'px',
          background:`rgba(99,102,241,${Math.random()*0.25+0.08})`,
          left:Math.random()*100+'%', top:Math.random()*100+'%',
          animation:`float${i%3} ${Math.random()*8+6}s ease-in-out infinite`,
          animationDelay:Math.random()*5+'s',
        }} />
      ))}
    </div>
  );
}

// Certificate UI — shown on screen
function CertificateDisplay({ student, rank, topic, certRef }) {
  const isTop3 = rank < 3;
  const rankConfig = {
    0: { label:'1st Place', accentColor:'#1a2f6e', borderColor:'#c9a84c', ribbonBg:'#1a2f6e', starColor:'#f5c518' },
    1: { label:'2nd Place', accentColor:'#2a2a5a', borderColor:'#8a8a9a', ribbonBg:'#2a2a5a', starColor:'#c0c0c0' },
    2: { label:'3rd Place', accentColor:'#5a2a0a', borderColor:'#b45309', ribbonBg:'#78350f', starColor:'#fbbf24' },
  };
  const medals = ['🥇','🥈','🥉'];
  const conf = rankConfig[rank] || {
    label:'Quiz', accentColor:'#1e3a8a',
    borderColor:'#4f46e5', ribbonBg:'#3730a3', starColor:'#818cf8'
  };

  const certStyle = {
    width: '100%',
    maxWidth: 760,
    background: 'linear-gradient(160deg,#f8f6ee 0%,#fffef5 50%,#f5f3e8 100%)',
    position: 'relative',
    fontFamily: "'Lato',sans-serif",
    overflow: 'hidden',
    boxShadow: '0 12px 50px rgba(0,0,0,0.2)',
    margin: '0 auto',
    transformOrigin: 'top center',
  };

  const innerContent = (
    <>
      {/* LEFT bar */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:30, background:`linear-gradient(180deg,${conf.accentColor} 0%,#243899 50%,${conf.accentColor} 100%)`, zIndex:2 }}>
        {[15,35,55,75,85].map((pct,i)=>(
          <div key={i} style={{ position:'absolute', top:`${pct}%`, left:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:i===2?14:10, opacity:i===2?1:0.7 }}>★</div>
        ))}
      </div>
      {/* RIGHT bar */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:30, background:`linear-gradient(180deg,${conf.accentColor} 0%,#243899 50%,${conf.accentColor} 100%)`, zIndex:2 }}>
        {[15,35,55,75,85].map((pct,i)=>(
          <div key={i} style={{ position:'absolute', top:`${pct}%`, left:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:i===2?14:10, opacity:i===2?1:0.7 }}>★</div>
        ))}
      </div>
      {/* TOP bar */}
      <div style={{ position:'absolute', top:0, left:30, right:30, height:22, background:`linear-gradient(90deg,${conf.accentColor},#243899,${conf.accentColor})`, zIndex:2 }}>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:10, letterSpacing:12 }}>★ ★ ★</div>
      </div>
      {/* BOTTOM bar */}
      <div style={{ position:'absolute', bottom:0, left:30, right:30, height:22, background:`linear-gradient(90deg,${conf.accentColor},#243899,${conf.accentColor})`, zIndex:2 }}>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:10, letterSpacing:8 }}>★ ★ ★</div>
      </div>
      {/* Gold borders */}
      <div style={{ position:'absolute', top:22, left:38, right:38, bottom:22, border:`2px solid ${conf.borderColor}`, zIndex:1, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:28, left:44, right:44, bottom:28, border:`1px solid ${conf.borderColor}60`, zIndex:1, pointerEvents:'none' }} />
      {/* Corner diamonds */}
      {[{top:18,left:34},{top:18,right:34},{bottom:18,left:34},{bottom:18,right:34}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute', ...pos, zIndex:3, width:10, height:10, background:conf.borderColor, transform:'rotate(45deg)' }} />
      ))}
      {/* Content */}
      <div style={{ position:'relative', zIndex:1, padding: 'clamp(24px, 5vw, 36px) clamp(36px, 8vw, 68px) clamp(20px, 3vw, 30px)', textAlign:'center' }}>
        {/* Top dots */}
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${conf.borderColor})` }} />
          <div style={{ display:'flex', gap:5 }}>
            {[5,7,5].map((s,i)=><div key={i} style={{ width:s, height:s, background:conf.borderColor, borderRadius:'50%' }} />)}
          </div>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${conf.borderColor},transparent)` }} />
        </div>
        {/* Title */}
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:conf.accentColor, textTransform:'uppercase', fontFamily:"'Lato',sans-serif", marginBottom:8 }}>
          — {isTop3 ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION'} —
        </div>
        {/* AI Quiz Generator */}
        <div style={{ fontSize: 'clamp(22px, 4vw, 34px)', fontWeight:900, color:conf.accentColor, fontFamily:"'Cinzel',serif", marginBottom:12, letterSpacing:1 }}>
          AI Quiz Generator
        </div>
        {/* Dot divider */}
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, justifyContent:'center' }}>
          <div style={{ flex:1, height:1, background:`${conf.borderColor}50` }} />
          <div style={{ display:'flex', gap:4 }}>
            {[4,7,4].map((s,i)=><div key={i} style={{ width:s, height:s, borderRadius:'50%', background:conf.borderColor, opacity:i===1?1:0.55 }} />)}
          </div>
          <div style={{ flex:1, height:1, background:`${conf.borderColor}50` }} />
        </div>
        {/* This certifies that */}
        <div style={{ fontSize:11, color:'#666', letterSpacing:3, textTransform:'uppercase', fontFamily:"'Lato',sans-serif", marginBottom:8 }}>THIS CERTIFIES THAT</div>
        {/* Name */}
        <div style={{ fontSize: 'clamp(32px, 7vw, 52px)', fontFamily:"'Great Vibes',cursive", color:conf.accentColor, fontWeight:400, marginBottom:8, lineHeight:1.15 }}>
          {student.name}
        </div>
        {/* Achievement */}
        <div style={{ fontSize:13, color:'#555', fontFamily:"'Lato',sans-serif", marginBottom:12 }}>
          {isTop3 ? 'has successfully achieved' : 'has successfully participated in'}
        </div>
        {/* Ribbon */}
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', marginBottom:14 }}>
          <div style={{ width:0, height:0, borderTop:'19px solid transparent', borderBottom:'19px solid transparent', borderRight:`16px solid ${conf.ribbonBg}`, filter:'brightness(0.75)' }} />
          <div style={{ background:`linear-gradient(180deg,${conf.ribbonBg}ee,${conf.ribbonBg})`, padding:'9px 30px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 3px 14px rgba(0,0,0,0.25)' }}>
            <span style={{ fontSize:17, color:conf.starColor }}>★</span>
            <span style={{ fontSize:19, fontWeight:900, color:'#fff', fontFamily:"'Lato',sans-serif", letterSpacing:1.5 }}>{conf.label}</span>
            <span style={{ fontSize:17, color:conf.starColor }}>★</span>
          </div>
          <div style={{ width:0, height:0, borderTop:'19px solid transparent', borderBottom:'19px solid transparent', borderLeft:`16px solid ${conf.ribbonBg}`, filter:'brightness(0.75)' }} />
        </div>
        {/* Score */}
        <div style={{ fontSize:14, color:'#333', fontFamily:"'Lato',sans-serif", marginBottom:4 }}>
          with a score of <strong style={{ fontSize:18, color:conf.accentColor }}>{student.score}%</strong>
        </div>
        {student.correct !== undefined && (
          <div style={{ fontSize:12, color:'#777', fontFamily:"'Lato',sans-serif", marginBottom:16 }}>
            ({student.correct} out of {student.total} answers are correct)
          </div>
        )}
        {/* Divider */}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${conf.borderColor}70,transparent)`, marginBottom:16 }} />
        {/* Bottom row */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:8 }}>
          <div style={{ textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:20 }}>📖</div>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'#999', letterSpacing:2, textTransform:'uppercase', fontFamily:"'Lato',sans-serif" }}>TOPIC</div>
              <div style={{ fontSize:12, color:conf.accentColor, fontWeight:700, fontFamily:"'Lato',sans-serif", marginTop:2 }}>{topic}</div>
            </div>
          </div>
          <div>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'radial-gradient(circle at 38% 32%,#ffe87a,#d4a017 55%,#8a6000)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, border:`3px solid ${conf.borderColor}`, boxShadow:`0 0 0 4px #f8f6ee,0 0 0 6px ${conf.borderColor}80` }}>{rank < 3 ? medals[rank] : '🎖️'}</div>
          </div>
          <div style={{ textAlign:'right', display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end', minWidth:110  }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'#999', letterSpacing:2, textTransform:'uppercase', fontFamily:"'Lato',sans-serif" }}>DATE</div>
              <div style={{ fontSize:12, color:conf.accentColor, fontWeight:700, fontFamily:"'Lato',sans-serif", marginTop:2 }}>
                {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
              </div>
            </div>
            <div style={{
  width:32,                // 🔥 pehle 44 tha → ab compact
  borderRadius:6,
  overflow:'hidden',
  boxShadow:'0 1px 3px rgba(0,0,0,0.12)',
  border:`1px solid ${conf.borderColor}`,
  fontFamily:"'Lato',sans-serif"
}}>
  {/* Month */}
  <div style={{
    background:conf.accentColor,
    color:'#fff',
    fontSize:7,            // 🔽 smaller
    fontWeight:700,
    textAlign:'center',
    padding:'1px 0',
    letterSpacing:0.5
  }}>
    {new Date().toLocaleDateString('en-IN',{month:'short'}).toUpperCase()}
  </div>

  {/* Day */}
  <div style={{
    background:'#fff',
    textAlign:'center',
    padding:'2px 0'
  }}>
    <div style={{
      fontSize:12,         // 🔽 smaller
      fontWeight:800,
      color:conf.accentColor,
      lineHeight:1
    }}>
      {new Date().getDate()}
    </div>
  </div>
</div>
          </div>
        </div>
        <div style={{ marginTop:14, fontSize:10, color:conf.borderColor, letterSpacing:3, textTransform:'uppercase', fontFamily:"'Lato',sans-serif", fontWeight:700 }}>
          ✦ OFFICIAL SEAL OF ACHIEVEMENT ✦
        </div>
      </div>
    </>
  );

  return (
  <div style={{ width: '100%', overflow: 'hidden' }}>
    <div style={{
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
    }}>
      <div style={{
        width: '780px',
        transform: `scale(${Math.min(1, (window.innerWidth - 32) / 780)})`,
        transformOrigin: 'top center',
        marginBottom: `calc((${Math.min(1, (window.innerWidth - 32) / 780)} - 1) * 520px)`,
      }}>
        <div ref={certRef} style={certStyle}>
          {innerContent}
        </div>
      </div>
    </div>
  </div>
);
}

// Hidden certificate for capture — fixed size, always in DOM
function HiddenCertificate({ student, rank, topic, certRef }) {
  const isTop3 = rank < 3;
  const rankConfig = {
    0: { label:'1st Place', accentColor:'#1a2f6e', borderColor:'#c9a84c', ribbonBg:'#1a2f6e', starColor:'#f5c518' },
    1: { label:'2nd Place', accentColor:'#2a2a5a', borderColor:'#8a8a9a', ribbonBg:'#2a2a5a', starColor:'#c0c0c0' },
    2: { label:'3rd Place', accentColor:'#5a2a0a', borderColor:'#b45309', ribbonBg:'#78350f', starColor:'#fbbf24' },
  };
  const medals = ['🥇','🥈','🥉'];
  const conf = rankConfig[rank] || {
    label:'Quiz', accentColor:'#1e3a8a',
    borderColor:'#4f46e5', ribbonBg:'#3730a3', starColor:'#818cf8'
  };

  return (
    <div ref={certRef} style={{
      position: 'fixed',
      left: '-9999px',
      top: 0,
      width: '780px',
      background: 'linear-gradient(160deg,#f8f6ee 0%,#fffef5 50%,#f5f3e8 100%)',
      fontFamily: "'Lato',sans-serif",
      overflow: 'hidden',
      zIndex: -1,
    }}>
      {/* LEFT bar */}
      <div style={{ position:'absolute', left:0, top:0, bottom:0, width:30, background:`linear-gradient(180deg,${conf.accentColor} 0%,#243899 50%,${conf.accentColor} 100%)`, zIndex:2 }}>
        {[15,35,55,75,85].map((pct,i)=>(
          <div key={i} style={{ position:'absolute', top:`${pct}%`, left:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:i===2?14:10, opacity:i===2?1:0.7 }}>★</div>
        ))}
      </div>
      {/* RIGHT bar */}
      <div style={{ position:'absolute', right:0, top:0, bottom:0, width:30, background:`linear-gradient(180deg,${conf.accentColor} 0%,#243899 50%,${conf.accentColor} 100%)`, zIndex:2 }}>
        {[15,35,55,75,85].map((pct,i)=>(
          <div key={i} style={{ position:'absolute', top:`${pct}%`, left:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:i===2?14:10, opacity:i===2?1:0.7 }}>★</div>
        ))}
      </div>
      {/* TOP bar */}
      <div style={{ position:'absolute', top:0, left:30, right:30, height:22, background:`linear-gradient(90deg,${conf.accentColor},#243899,${conf.accentColor})`, zIndex:2 }}>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:10, letterSpacing:12 }}>★ ★ ★</div>
      </div>
      {/* BOTTOM bar */}
      <div style={{ position:'absolute', bottom:0, left:30, right:30, height:22, background:`linear-gradient(90deg,${conf.accentColor},#243899,${conf.accentColor})`, zIndex:2 }}>
        <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', color:conf.starColor, fontSize:10, letterSpacing:8 }}>★ ★ ★</div>
      </div>
      <div style={{ position:'absolute', top:22, left:38, right:38, bottom:22, border:`2px solid ${conf.borderColor}`, zIndex:1, pointerEvents:'none' }} />
      <div style={{ position:'absolute', top:28, left:44, right:44, bottom:28, border:`1px solid ${conf.borderColor}60`, zIndex:1, pointerEvents:'none' }} />
      {[{top:18,left:34},{top:18,right:34},{bottom:18,left:34},{bottom:18,right:34}].map((pos,i)=>(
        <div key={i} style={{ position:'absolute', ...pos, zIndex:3, width:10, height:10, background:conf.borderColor, transform:'rotate(45deg)' }} />
      ))}
      <div style={{ position:'relative', zIndex:1, padding:'36px 68px 30px', textAlign:'center' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,transparent,${conf.borderColor})` }} />
          <div style={{ display:'flex', gap:5 }}>{[5,7,5].map((s,i)=><div key={i} style={{ width:s, height:s, background:conf.borderColor, borderRadius:'50%' }} />)}</div>
          <div style={{ flex:1, height:1, background:`linear-gradient(90deg,${conf.borderColor},transparent)` }} />
        </div>
        <div style={{ fontSize:11, fontWeight:700, letterSpacing:4, color:conf.accentColor, textTransform:'uppercase', fontFamily:"'Lato',sans-serif", marginBottom:8 }}>
          — {isTop3 ? 'CERTIFICATE OF ACHIEVEMENT' : 'CERTIFICATE OF PARTICIPATION'} —
        </div>
        <div style={{ fontSize:34, fontWeight:900, color:conf.accentColor, fontFamily:"'Cinzel',serif", marginBottom:12, letterSpacing:1 }}>
          AI Quiz Generator
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12, justifyContent:'center' }}>
          <div style={{ flex:1, height:1, background:`${conf.borderColor}50` }} />
          <div style={{ display:'flex', gap:4 }}>{[4,7,4].map((s,i)=><div key={i} style={{ width:s, height:s, borderRadius:'50%', background:conf.borderColor, opacity:i===1?1:0.55 }} />)}</div>
          <div style={{ flex:1, height:1, background:`${conf.borderColor}50` }} />
        </div>
        <div style={{ fontSize:11, color:'#666', letterSpacing:3, textTransform:'uppercase', fontFamily:"'Lato',sans-serif", marginBottom:8 }}>THIS CERTIFIES THAT</div>
        <div style={{ fontSize:52, fontFamily:"'Great Vibes',cursive", color:conf.accentColor, fontWeight:400, marginBottom:8, lineHeight:1.15 }}>
          {student.name}
        </div>
        <div style={{ fontSize:13, color:'#555', fontFamily:"'Lato',sans-serif", marginBottom:12 }}>
          {isTop3 ? 'has successfully achieved' : 'has successfully participated in'}
        </div>
        <div style={{ display:'flex', justifyContent:'center', alignItems:'center', marginBottom:14 }}>
          <div style={{ width:0, height:0, borderTop:'19px solid transparent', borderBottom:'19px solid transparent', borderRight:`16px solid ${conf.ribbonBg}`, filter:'brightness(0.75)' }} />
          <div style={{ background:`linear-gradient(180deg,${conf.ribbonBg}ee,${conf.ribbonBg})`, padding:'9px 30px', display:'flex', alignItems:'center', gap:10, boxShadow:'0 3px 14px rgba(0,0,0,0.25)' }}>
            <span style={{ fontSize:17, color:conf.starColor }}>★</span>
            <span style={{ fontSize:19, fontWeight:900, color:'#fff', fontFamily:"'Lato',sans-serif", letterSpacing:1.5 }}>{conf.label}</span>
            <span style={{ fontSize:17, color:conf.starColor }}>★</span>
          </div>
          <div style={{ width:0, height:0, borderTop:'19px solid transparent', borderBottom:'19px solid transparent', borderLeft:`16px solid ${conf.ribbonBg}`, filter:'brightness(0.75)' }} />
        </div>
        <div style={{ fontSize:14, color:'#333', fontFamily:"'Lato',sans-serif", marginBottom:4 }}>
          with a score of <strong style={{ fontSize:18, color:conf.accentColor }}>{student.score}%</strong>
        </div>
        {student.correct !== undefined && (
          <div style={{ fontSize:12, color:'#777', fontFamily:"'Lato',sans-serif", marginBottom:16 }}>
            ({student.correct} out of {student.total} answers are correct)
          </div>
        )}
        <div style={{ height:1, background:`linear-gradient(90deg,transparent,${conf.borderColor}70,transparent)`, marginBottom:16 }} />
        <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', alignItems:'center', gap:8 }}>
          <div style={{ textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ fontSize:20 }}>📖</div>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'#999', letterSpacing:2, textTransform:'uppercase' }}>TOPIC</div>
              <div style={{ fontSize:12, color:conf.accentColor, fontWeight:700, marginTop:2 }}>{topic}</div>
            </div>
          </div>
          <div>
            <div style={{ width:72, height:72, borderRadius:'50%', background:'radial-gradient(circle at 38% 32%,#ffe87a,#d4a017 55%,#8a6000)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:32, border:`3px solid ${conf.borderColor}`, boxShadow:`0 0 0 4px #f8f6ee,0 0 0 6px ${conf.borderColor}80` }}>{rank < 3 ? medals[rank] : '🎖️'}</div>
          </div>
          <div style={{ textAlign:'right', display:'flex', alignItems:'center', gap:8, justifyContent:'flex-end', minWidth:110  }}>
            <div>
              <div style={{ fontSize:9, fontWeight:700, color:'#999', letterSpacing:2, textTransform:'uppercase' }}>DATE</div>
              <div style={{ fontSize:12, color:conf.accentColor, fontWeight:700, marginTop:2 }}>
                {new Date().toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})}
              </div>
            </div>
            <div style={{
  width:32,                // 🔥 pehle 44 tha → ab compact
  borderRadius:6,
  overflow:'hidden',
  boxShadow:'0 1px 3px rgba(0,0,0,0.12)',
  border:`1px solid ${conf.borderColor}`,
  fontFamily:"'Lato',sans-serif"
}}>
  {/* Month */}
  <div style={{
    background:conf.accentColor,
    color:'#fff',
    fontSize:7,            // 🔽 smaller
    fontWeight:700,
    textAlign:'center',
    padding:'1px 0',
    letterSpacing:0.5
  }}>
    {new Date().toLocaleDateString('en-IN',{month:'short'}).toUpperCase()}
  </div>

  {/* Day */}
  <div style={{
    background:'#fff',
    textAlign:'center',
    padding:'2px 0'
  }}>
    <div style={{
      fontSize:12,         // 🔽 smaller
      fontWeight:800,
      color:conf.accentColor,
      lineHeight:1
    }}>
      {new Date().getDate()}
    </div>
  </div>
</div>
          </div>
        </div>
        <div style={{ marginTop:14, fontSize:10, color:conf.borderColor, letterSpacing:3, textTransform:'uppercase', fontWeight:700 }}>
          ✦ OFFICIAL SEAL OF ACHIEVEMENT ✦
        </div>
      </div>
    </div>
  );
}

function StudentDetailModal({ student, questions, onClose, t }) {
  if (!student) return null;
  return (
    <div onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(6px)', display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}>
      <div onClick={e => e.stopPropagation()} style={{ background:t.card, border:`1px solid ${t.cardBorder}`, borderRadius:20, padding:'24px', width:'100%', maxWidth:620, maxHeight:'85vh', overflowY:'auto', boxShadow:'0 20px 60px rgba(0,0,0,0.5)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20 }}>
          <div>
            <div style={{ fontSize:18, fontWeight:800, color:t.text }}>{student.name}</div>
            <div style={{ fontSize:13, color:t.textMuted, marginTop:2 }}>
              Score: <strong style={{ color:t.accent }}>{student.score}%</strong>
              {student.correct !== undefined && <span> — {student.correct}/{student.total} correct</span>}
            </div>
          </div>
          <button onClick={onClose} style={{ width:36, height:36, borderRadius:'50%', border:'none', background:t.progressBg, color:t.text, fontSize:18, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
        </div>
        {questions.length === 0 ? (
          <div style={{ textAlign:'center', color:t.textMuted, padding:32 }}>Questions data unavailable.</div>
        ) : (
          questions.map((q, i) => {
            const studentAns = student.answers?.[i] ?? student.answers?.[String(i)];
            const isCorrect = Number(studentAns) === Number(q.correctIndex);
            const notAnswered = studentAns === undefined || studentAns === null;
            const optLabels = ['A','B','C','D'];
            return (
              <div key={i} style={{ marginBottom:16, padding:'14px 16px', borderRadius:12, border:`1.5px solid ${notAnswered?t.optBorder:isCorrect?'#10b981':'#ef4444'}`, background:notAnswered?t.optBg:isCorrect?'rgba(16,185,129,0.06)':'rgba(239,68,68,0.06)' }}>
                <div style={{ display:'flex', alignItems:'flex-start', gap:10, marginBottom:12 }}>
                  <div style={{ width:28, height:28, borderRadius:'50%', flexShrink:0, background:notAnswered?t.progressBg:isCorrect?'#10b981':'#ef4444', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#fff' }}>
                    {notAnswered?i+1:isCorrect?'✓':'✗'}
                  </div>
                  <div style={{ fontSize:14, fontWeight:600, color:t.text, lineHeight:1.5 }}>Q{i+1}. {q.question}</div>
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:6, paddingLeft:38 }}>
                  {q.options.map((opt, oi) => {
                    const isStudentChoice = Number(studentAns) === oi;
                    const isCorrectOpt = Number(q.correctIndex) === oi;
                    let bg='transparent', borderC='transparent', textC=t.textMuted, icon='';
                    if (isCorrectOpt) { bg='rgba(16,185,129,0.12)'; borderC='#10b981'; textC='#10b981'; icon=' ✓'; }
                    if (isStudentChoice && !isCorrectOpt) { bg='rgba(239,68,68,0.1)'; borderC='#ef4444'; textC='#ef4444'; icon=' ✗'; }
                    if (isStudentChoice && isCorrectOpt) icon=' ✓';
                    return (
                      <div key={oi} style={{ display:'flex', alignItems:'center', gap:8, padding:'7px 10px', borderRadius:8, border:`1px solid ${borderC||t.optBorder}`, background:bg }}>
                        <span style={{ width:22, height:22, borderRadius:'50%', flexShrink:0, background:isCorrectOpt?'#10b981':isStudentChoice?'#ef4444':t.progressBg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:(isCorrectOpt||isStudentChoice)?'#fff':t.textFaint }}>{optLabels[oi]}</span>
                        <span style={{ fontSize:13, color:textC, fontWeight:isCorrectOpt||isStudentChoice?600:400 }}>{opt}{icon}</span>
                        {isStudentChoice && <span style={{ marginLeft:'auto', fontSize:11, color:textC, fontWeight:700, flexShrink:0 }}>Selected</span>}
                      </div>
                    );
                  })}
                </div>
                {notAnswered && <div style={{ paddingLeft:38, marginTop:8, fontSize:12, color:t.textFaint, fontStyle:'italic' }}>⚠️ This Question was not answered</div>}
              </div>
            );
          })
        )}
        <button onClick={onClose} style={{ width:'100%', marginTop:8, padding:'12px', background:t.accentGrad, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:'pointer' }}>Close</button>
      </div>
    </div>
  );
}

export default function Results() {
  const { roomId } = useParams();
  const [dark] = useState(() => (localStorage.getItem('quiz-theme') ?? 'dark') === 'dark');
  const t = getTheme(dark);
  const [topic, setTopic] = useState('Loading...');
  const [questions, setQuestions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState({ index: null, type: null });
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [viewStudent, setViewStudent] = useState(null);

  // Hidden refs — ek per student, always in DOM
  const hiddenRefs = useRef([]);

  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Great+Vibes&family=Cinzel:wght@700;900&family=Lato:wght@400;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const style = document.createElement('style');
    style.id = 'res-styles';
    style.textContent = `
      @keyframes float0{0%,100%{transform:translateY(0)}50%{transform:translateY(-28px)}}
      @keyframes float1{0%,100%{transform:translateY(0)}50%{transform:translateY(-18px) translateX(12px)}}
      @keyframes float2{0%,100%{transform:translateY(0)}50%{transform:translateY(-22px) rotate(180deg)}}
      @keyframes fadeSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes pop{0%{transform:scale(0.9);opacity:0}60%{transform:scale(1.04)}100%{transform:scale(1);opacity:1}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .rcard{animation:fadeSlideUp 0.45s ease both}
      .cert-wrap{animation:pop 0.6s ease both}
      .dl-btn{transition:all 0.25s ease}
      .dl-btn:hover{transform:translateY(-2px)}
      .lb-row{transition:all 0.2s ease}
      .lb-row:hover{transform:translateX(4px)}
      .tab-btn{transition:all 0.2s ease}
    `;
    document.getElementById('res-styles')?.remove();
    document.head.appendChild(style);
    return () => { document.getElementById('res-styles')?.remove(); };
  }, []);

  useEffect(() => {
    const fetchAll = () => {
      fetch(`/api/results/${roomId}`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
        .then(r => r.json())
        .then(data => {
          if (data.leaderboard) setLeaderboard(data.leaderboard);
          if (data.topic) { setTopic(data.topic); localStorage.setItem('topic_'+roomId, data.topic); }
          if (data.questions?.length > 0) { setQuestions(data.questions); localStorage.setItem('questions_'+roomId, JSON.stringify(data.questions)); }
          setLoading(false);
        })
        .catch(() => {
          const tp = localStorage.getItem('topic_'+roomId);
          const qs = localStorage.getItem('questions_'+roomId);
          if (tp) setTopic(tp);
          if (qs) setQuestions(JSON.parse(qs));
          setLoading(false);
        });
    };
    fetchAll();
    const iv = setInterval(fetchAll, 5000);
    return () => clearInterval(iv);
  }, [roomId]);

 const downloadCert = async (idx, format = 'png') => {
  setDownloading({ index: idx, type: format });

  try {
    const { default: html2canvas } = await import('html2canvas');

    const el = hiddenRefs.current[idx];
    if (!el) {
      console.error('Certificate element not found');
      return;
    }

    // ✅ Ensure fonts loaded
    await document.fonts.ready;
    await new Promise(r => setTimeout(r, 300));

    // ✅ Capture
    const canvas = await html2canvas(el, {
      scale: 3, // 🔥 HD quality
      useCORS: true,
      backgroundColor: '#f8f6ee',
      logging: false,
    });

    // ✅ FIX: Crop bottom white line
    const cropPx = 6; // adjust if needed (4–8)
    const croppedCanvas = document.createElement('canvas');
    const ctx = croppedCanvas.getContext('2d');

    croppedCanvas.width = canvas.width;
    croppedCanvas.height = canvas.height - cropPx;

    ctx.drawImage(
      canvas,
      0, 0,
      canvas.width, canvas.height - cropPx,
      0, 0,
      canvas.width, canvas.height - cropPx
    );

    const name = leaderboard[idx]?.name || `student_${idx}`;

    // ✅ DOWNLOAD
    if (format === 'pdf') {
      const { jsPDF } = await import('jspdf');

      const imgData = croppedCanvas.toDataURL('image/png');

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [
          croppedCanvas.width / 2,
          croppedCanvas.height / 2
        ],
      });

      pdf.addImage(
        imgData,
        'PNG',
        0,
        0,
        croppedCanvas.width / 2,
        croppedCanvas.height / 2
      );

      pdf.save(`certificate_${name}.pdf`);
    } else {
      const a = document.createElement('a');
      a.href = croppedCanvas.toDataURL('image/png');
      a.download = `certificate_${name}.png`;
      a.click();
    }

  } catch (err) {
    console.error('Download failed:', err);
  }

  setDownloading({ index: null, type: null });
};

  const cardStyle = {
    background: t.card, border: `1px solid ${t.cardBorder}`, borderRadius: 20,
    padding: 'clamp(20px,5vw,28px)', backdropFilter: t.blur,
    WebkitBackdropFilter: t.blur, boxShadow: t.shadow, transition: 'all 0.4s ease',
  };
  const titleStyle = {
    fontSize: 'clamp(26px,5vw,40px)', fontWeight: 800, margin: '0 0 8px', lineHeight: 1.2,
    background: t.title, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
  };
  const medals = ['🥇','🥈','🥉'];
  const rankColors = ['#fbbf24','#9ca3af','#b45309'];

  if (loading && leaderboard.length === 0) return (
    <div style={{ minHeight:'100vh', background:t.page, fontFamily:"'Plus Jakarta Sans',sans-serif", display:'flex', alignItems:'center', justifyContent:'center' }}>
      {dark && <Particles />}
      <div style={{ textAlign:'center', position:'relative', zIndex:1 }}>
        <div style={{ fontSize:56, marginBottom:16 }}>⏳</div>
        <h2 style={{ ...titleStyle, textAlign:'center' }}>Results not available yet</h2>
        <p style={{ color:t.textMuted }}>Results will appear once the quiz is complete</p>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight:'100vh', background:t.page, fontFamily:"'Plus Jakarta Sans',sans-serif", padding:'24px 16px 60px', position:'relative', transition:'background 0.45s ease' }}>

      {/* HIDDEN CERTIFICATES — always in DOM for capture, off-screen */}
      {leaderboard.map((s, i) => (
        <HiddenCertificate
          key={`hidden-${i}`}
          student={s}
          rank={i}
          topic={topic}
          certRef={el => { hiddenRefs.current[i] = el; }}
        />
      ))}

      <StudentDetailModal
       student={viewStudent}
       questions={viewStudent?.studentQuestions || questions} // ← ye change karo
       onClose={() => setViewStudent(null)}
       t={t}
      />
      {dark && <Particles />}

      <div style={{ maxWidth:720, margin:'0 auto', position:'relative', zIndex:1 }}>

        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:32, animation:'fadeSlideUp 0.5s ease' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, background:t.badgeBg, border:`1px solid ${t.badgeBorder}`, borderRadius:20, padding:'4px 14px', fontSize:12, color:t.badgeColor, fontWeight:600, letterSpacing:0.5, marginBottom:16 }}>
            🏆 Quiz Results
          </div>
          <h1 style={titleStyle}>Final Results!</h1>
          <p style={{ color:t.textMuted, fontSize:15, margin:0 }}>
            Topic: <span style={{ color:t.accent, fontWeight:700 }}>{topic}</span>
          </p>
        </div>

        {/* Podium */}
        {leaderboard.length >= 2 && (
          <div className="rcard" style={{ ...cardStyle, marginBottom:16 }}>
            <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>🏅 Top Performers</div>
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:12 }}>
              {leaderboard[1] && (
                <div style={{ textAlign:'center', flex:1 }}>
                  <div style={{ fontSize:32, marginBottom:6 }}>🥈</div>
                  <div style={{ background:'rgba(156,163,175,0.15)', border:'1px solid rgba(156,163,175,0.3)', borderRadius:'12px 12px 0 0', padding:'16px 8px', minHeight:80, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:4, wordBreak:'break-word' }}>{leaderboard[1].name}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#9ca3af' }}>{leaderboard[1].score}%</div>
                  </div>
                </div>
              )}
              <div style={{ textAlign:'center', flex:1 }}>
                <div style={{ fontSize:42, marginBottom:6 }}>🥇</div>
                <div style={{ background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.3)', borderRadius:'12px 12px 0 0', padding:'20px 8px', minHeight:110, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', boxShadow:'0 0 20px rgba(251,191,36,0.15)' }}>
                  <div style={{ fontSize:14, fontWeight:700, color:t.text, marginBottom:4, wordBreak:'break-word' }}>{leaderboard[0].name}</div>
                  <div style={{ fontSize:22, fontWeight:800, color:'#fbbf24' }}>{leaderboard[0].score}%</div>
                  <div style={{ fontSize:11, color:'#fbbf24', fontWeight:600, marginTop:4 }}>WINNER 🎉</div>
                </div>
              </div>
              {leaderboard[2] && (
                <div style={{ textAlign:'center', flex:1 }}>
                  <div style={{ fontSize:32, marginBottom:6 }}>🥉</div>
                  <div style={{ background:'rgba(180,83,9,0.1)', border:'1px solid rgba(180,83,9,0.25)', borderRadius:'12px 12px 0 0', padding:'12px 8px', minHeight:60, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                    <div style={{ fontSize:13, fontWeight:700, color:t.text, marginBottom:4, wordBreak:'break-word' }}>{leaderboard[2].name}</div>
                    <div style={{ fontSize:18, fontWeight:800, color:'#b45309' }}>{leaderboard[2].score}%</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div style={{ display:'flex', background:dark?'rgba(0,0,0,0.3)':'#f3f4f6', borderRadius:12, padding:4, marginBottom:16, gap:4 }}>
          {[{key:'leaderboard',label:'📊 Leaderboard'},{key:'certificates',label:'📜 Certificates'}].map(({key,label})=>(
            <button key={key} className="tab-btn" onClick={()=>setActiveTab(key)} style={{
              flex:1, padding:'10px 16px', borderRadius:10, border:'none', cursor:'pointer',
              background:activeTab===key?t.accentGrad:'transparent',
              color:activeTab===key?'#fff':t.textMuted,
              fontSize:14, fontWeight:600,
              boxShadow:activeTab===key?t.glow:'none',
            }}>{label}</button>
          ))}
        </div>

        {/* LEADERBOARD */}
        {activeTab === 'leaderboard' && (
          <div className="rcard" style={cardStyle}>
            <div style={{ fontSize:12, fontWeight:700, color:t.textMuted, textTransform:'uppercase', letterSpacing:1, marginBottom:16 }}>Full Rankings</div>
            {leaderboard.map((s, i) => (
              <div key={i} className="lb-row" style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', padding:'14px 16px', borderRadius:12, marginBottom:8, border:`1px solid ${i===0?t.row1Border:t.rowBorder}`, background:i===0?t.row1Bg:t.rowBg, boxShadow:i===0?`0 0 15px ${t.row1Border}40`:'none' }}>
                <div style={{ width:40, height:40, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:i<3?22:16, fontWeight:700, background:i<3?`${rankColors[i]}20`:t.progressBg, border:i<3?`1px solid ${rankColors[i]}40`:'none', flexShrink:0 }}>
                  {i<3?medals[i]:i+1}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:15, fontWeight:700, color:t.text }}>{s.name}</div>
                  <div style={{ fontSize:12, color:t.textFaint }}>
                    {i===0?'🏆 Winner':i===1?'🥈 Runner-up':i===2?'🥉 3rd Place':`${i+1}th Place`}
                    {s.correct !== undefined && <span style={{ marginLeft:8, color:t.accent, fontWeight:600 }}>({s.correct}/{s.total} correct)</span>}
                  </div>
                </div>
                <div style={{ width:80, marginRight:12 }}>
                  <div style={{ height:6, background:t.progressBg, borderRadius:3, overflow:'hidden' }}>
                    <div style={{ height:'100%', width:`${s.score}%`, background:i<3?rankColors[i]:t.accent, borderRadius:3, transition:'width 1s ease' }} />
                  </div>
                </div>
                <div style={{ fontSize:20, fontWeight:800, color:i<3?rankColors[i]:t.accent, minWidth:52, textAlign:'right' }}>{s.score}%</div>
                <button onClick={() => setViewStudent(s)} style={{ padding:'5px 14px', borderRadius:20, border:`1px solid ${t.accent}`, background:'transparent', color:t.accent, fontSize:12, fontWeight:700, cursor:'pointer', flexShrink:0,marginLeft: 'auto', transition:'all 0.2s ease' }}
                  onMouseEnter={e=>{e.currentTarget.style.background=t.accent;e.currentTarget.style.color='#fff';}}
                  onMouseLeave={e=>{e.currentTarget.style.background='transparent';e.currentTarget.style.color=t.accent;}}>
                  👁 View
                </button>
                {s.done && <div style={{ fontSize:11, color:'#10b981', background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)', borderRadius:20, padding:'2px 10px', fontWeight:600, flexShrink:0 }}>Done ✓</div>}
              </div>
            ))}
          </div>
        )}

        {/* CERTIFICATES */}
        {activeTab === 'certificates' && (
          <div style={{ overflowX: 'auto' }}>  {/* ← ye add karo */}
            {leaderboard.map((s, i) => (
              <div key={i} className="cert-wrap" style={{ marginBottom:24, animationDelay:`${i*0.15}s` }}>
                {/* Visible certificate */}
                <CertificateDisplay student={s} rank={i} topic={topic} certRef={()=>{}} />
                {/* Download buttons */}
                <div style={{ display:'flex', gap:12, marginTop:12 }}>
                  <button className="dl-btn" onClick={() => downloadCert(i, 'png')}
                    disabled={downloading.index === i && downloading.type === 'png'}
                    style={{ flex:1, padding:'12px 16px', background:downloading.index===i&&downloading.type==='png'?t.progressBg:t.accentGrad, color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:downloading.index===i&&downloading.type==='png'?'not-allowed':'pointer', boxShadow:downloading.index===i&&downloading.type==='png'?'none':t.glow, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {downloading.index===i&&downloading.type==='png'?(<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Downloading...</>):'🖼 PNG Download'}
                  </button>
                  <button className="dl-btn" onClick={() => downloadCert(i, 'pdf')}
                    disabled={downloading.index === i && downloading.type === 'pdf'}
                    style={{ flex:1, padding:'12px 16px', background:downloading.index===i&&downloading.type==='pdf'?t.progressBg:'linear-gradient(135deg,#1e3a8a,#2563eb)', color:'#fff', border:'none', borderRadius:12, fontSize:14, fontWeight:700, cursor:downloading.index===i&&downloading.type==='pdf'?'not-allowed':'pointer', boxShadow:'0 4px 15px rgba(30,59,138,0.44)', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
                    {downloading.index===i&&downloading.type==='pdf'?(<><div style={{ width:16, height:16, border:'2px solid rgba(255,255,255,0.3)', borderTopColor:'#fff', borderRadius:'50%', animation:'spin 0.8s linear infinite' }}/>Downloading...</>):'📄 PDF Download'}
                  </button>
                </div>
              </div>
            ))}
            {leaderboard.length === 0 && (
              <div style={{ ...cardStyle, textAlign:'center', padding:40 }}>
                <div style={{ fontSize:40, marginBottom:12 }}>😔</div>
                <div style={{ color:t.textMuted }}>No students available for certification</div>
              </div>
            )}
          </div>
        )}

        <div style={{ textAlign:'center', marginTop:32, fontSize:12, color:t.textFaint }}>Made with ❤️ for Final Year Project</div>
      </div>
    </div>
  );
}
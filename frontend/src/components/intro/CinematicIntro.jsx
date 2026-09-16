import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ShieldCheck, Database, Compass } from 'lucide-react';

export const CinematicIntro = () => {
  const canvasRef = useRef(null);
  const navigate = useNavigate();
  const [phase, setPhase] = useState(1); // 1: Canvas, 2: Emergence, 3: Branding, 4: CTA
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Subtle data stream particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.5 + 1,
      alpha: Math.random() * 0.4 + 0.1,
    }));

    // Regional node hubs
    const nodes = [
      { x: 0.48, y: 0.35, label: 'Delhi' },
      { x: 0.38, y: 0.55, label: 'Mumbai' },
      { x: 0.55, y: 0.52, label: 'Varanasi' },
      { x: 0.65, y: 0.58, label: 'Kolkata' },
      { x: 0.45, y: 0.72, label: 'Bengaluru' },
      { x: 0.52, y: 0.75, label: 'Chennai' },
    ];

    let t = 0;

    const render = () => {
      t += 0.012;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Deep Grid System
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.3)';
      ctx.lineWidth = 1;
      const gridSize = 50;
      for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Connection Data Lines
      ctx.lineWidth = 1;
      nodes.forEach((n1, i) => {
        nodes.forEach((n2, j) => {
          if (i < j) {
            const x1 = n1.x * canvas.width;
            const y1 = n1.y * canvas.height;
            const x2 = n2.x * canvas.width;
            const y2 = n2.y * canvas.height;

            const dist = Math.hypot(x2 - x1, y2 - y1);
            if (dist < canvas.width * 0.3) {
              const alpha = (1 - dist / (canvas.width * 0.3)) * 0.25 * (0.5 + 0.5 * Math.sin(t * 2 + i));
              ctx.strokeStyle = `rgba(37, 99, 235, ${alpha})`;
              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        });
      });

      // Draw Particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.fillStyle = `rgba(59, 130, 246, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Pulsing Regional Hub Nodes
      nodes.forEach((n) => {
        const nx = n.x * canvas.width;
        const ny = n.y * canvas.height;

        ctx.fillStyle = '#2563eb';
        ctx.beginPath();
        ctx.arc(nx, ny, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = 'rgba(37, 99, 235, 0.35)';
        ctx.beginPath();
        const pulseR = 3.5 + 8 * ((t + nx) % 1);
        ctx.arc(nx, ny, pulseR, 0, Math.PI * 2);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    const timer1 = setTimeout(() => setPhase(2), 1000);
    const timer2 = setTimeout(() => setPhase(3), 2400);
    const timer3 = setTimeout(() => setPhase(4), 3800);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  const handleEnter = () => {
    setIsTransitioning(true);
    sessionStorage.setItem('nidhi_intro_completed', 'true');
    setTimeout(() => {
      navigate('/command-center');
    }, 500);
  };

  return (
    <div className={`relative w-screen h-screen bg-[#090d16] overflow-hidden flex flex-col items-center justify-center transition-all duration-700 ${isTransitioning ? 'opacity-0 scale-105' : 'opacity-100 scale-100'}`}>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" />

      {/* Main Editorial Card Container */}
      <div className="relative z-10 max-w-2xl px-6 text-center flex flex-col items-center">
        
        {/* Brand Logo Reveal */}
        <div className={`transition-all duration-1000 transform ${phase >= 2 ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`}>
          <img
            src="/assets/branding/nidhi-drishti-logo.png"
            alt="NIDHI DRISHTI Logo"
            className="h-20 w-auto mx-auto mb-6 object-contain"
          />
        </div>

        {/* Title & Subtitle Reveal */}
        <div className={`transition-all duration-1000 delay-200 transform ${phase >= 3 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-blue-950/60 text-blue-400 border border-blue-800/40 text-[11px] font-bold uppercase tracking-wider mb-4">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Smart India Hackathon 2026 • SIH26102</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-2 font-sans">
            NIDHI DRISHTI
          </h1>
          
          <h2 className="text-xs sm:text-sm font-extrabold tracking-widest text-slate-300 uppercase mb-4">
            PUBLIC FUND INTELLIGENCE
          </h2>

          <div className="h-0.5 w-12 bg-blue-600 mx-auto mb-5 rounded-full" />

          <p className="text-sm font-medium text-slate-300 tracking-wide mb-8">
            “Transparent Development • Stronger India”
          </p>
        </div>

        {/* Action Button Reveal */}
        <div className={`transition-all duration-700 delay-400 transform ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <button
            onClick={handleEnter}
            className="group relative inline-flex items-center gap-3 px-8 py-3 rounded bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold tracking-wider uppercase shadow-lg shadow-blue-950 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <span>ENTER NIDHI DRISHTI</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </button>

          <p className="text-[11px] font-mono text-slate-500 mt-4">
            National Public-Fund Situation Room & Risk Engine
          </p>
        </div>
      </div>
    </div>
  );
};

export default CinematicIntro;

'use client';
import { useEffect, useRef } from 'react';
import { Sparkles, Star, CheckCircle2, MessageSquare, Truck, ArrowRight, X, Phone } from 'lucide-react';

export default function CelebrationModal({ isOpen, onClose, orderData }) {
  const canvasRef = useRef(null);

  // Play PhonePe / Soundbox-style victory chime sound on order success
  useEffect(() => {
    if (!isOpen) return;

    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const notes = [
          { freq: 523.25, time: 0.0, duration: 0.12 },  // C5
          { freq: 659.25, time: 0.10, duration: 0.12 }, // E5
          { freq: 783.99, time: 0.20, duration: 0.15 }, // G5
          { freq: 1046.50, time: 0.32, duration: 0.40 } // C6 (Victory high chime)
        ];

        const now = ctx.currentTime;
        notes.forEach(n => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle'; // Warm soundbox tone
          osc.frequency.setValueAtTime(n.freq, now + n.time);

          gain.gain.setValueAtTime(0, now + n.time);
          gain.gain.linearRampToValueAtTime(0.35, now + n.time + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + n.time + n.duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + n.time);
          osc.stop(now + n.time + n.duration + 0.05);
        });
      }
    } catch (err) {
      console.warn('Audio playback notice:', err.message);
    }
  }, [isOpen]);

  // Confetti Animation Canvas
  useEffect(() => {
    if (!isOpen) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animationFrameId;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const colors = [
      '#f97316', '#fbbf24', '#34d399', '#60a5fa', '#a78bfa',
      '#f43f5e', '#e11d48', '#d97706', '#059669', '#2563eb',
      '#fb7185', '#f472b6', '#38bdf8'
    ];

    const particleCount = 140;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 3,
        vy: Math.random() * 4 + 2.5,
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 8,
        shape: Math.random() > 0.4 ? 'rect' : 'circle',
        opacity: 1,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRotation;

        if (p.y > canvas.height) {
          p.y = -20;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.opacity;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const productTitle = orderData?.product || orderData?.title || 'Custom Teakwood Furniture';
  const orderId = orderData?._id ? `#LD-${String(orderData._id).slice(-6).toUpperCase()}` : '#LD-SUCCESS';
  const waUrl = orderData?.waUrl || 'https://wa.me/916281653998';

  const handleWhatsAppClick = () => {
    if (typeof window !== 'undefined') {
      window.open(waUrl, '_blank');
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/65 backdrop-blur-md animate-fadeIn">
      {/* Confetti Animation Canvas */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[101]"
      />

      {/* Main Celebration Modal Card */}
      <div className="relative z-[102] w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-amber-200/80 transform transition-all animate-scaleUp">
        
        {/* Close Modal Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-all cursor-pointer shadow-sm"
          title="Close Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Hexagon Badge Header */}
        <div className="pt-8 pb-4 px-6 flex flex-col items-center text-center bg-gradient-to-b from-amber-50/90 via-orange-50/30 to-white">
          
          {/* HackerRank-style Hexagon Badge */}
          <div className="relative mb-3 flex items-center justify-center">
            <div 
              className="w-20 h-20 bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-400 flex flex-col items-center justify-center shadow-xl shadow-orange-500/30 transition-transform hover:scale-105"
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
              }}
            >
              <Sparkles className="w-8 h-8 text-white animate-pulse" />
              <div className="flex items-center gap-1 mt-0.5 text-amber-100">
                <Star className="w-3 h-3 fill-amber-200 text-amber-200" />
                <Star className="w-3 h-3 fill-amber-200 text-amber-200" />
              </div>
            </div>
          </div>

          {/* Celebration Header */}
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight font-serif">
            Congrats! 🎉
          </h2>
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-800 mt-1 bg-emerald-100/80 px-3 py-1 rounded-full border border-emerald-300 shadow-sm">
            Order Placed Successfully!
          </p>
          <p className="text-sm text-slate-600 mt-2 max-w-xs font-medium">
            మీ ఆర్డర్ విజయవంతంగా నమోదైంది!
          </p>
        </div>

        {/* Order Details Preview Box */}
        <div className="px-6 py-3">
          <div className="bg-gradient-to-br from-amber-50/60 to-orange-50/40 border border-amber-200/80 rounded-2xl p-4 text-left shadow-inner">
            <div className="flex items-center justify-between border-b border-amber-200/60 pb-2 mb-3">
              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Order Reference</span>
              <span className="text-xs font-mono font-bold bg-amber-200/80 text-amber-950 px-2.5 py-0.5 rounded-md shadow-xs">
                {orderId}
              </span>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-12 h-12 bg-white rounded-xl border border-amber-200 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                {orderData?.image || orderData?.imageUrl ? (
                  <img
                    src={orderData.image || orderData.imageUrl}
                    alt={productTitle}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <CheckCircle2 className="w-7 h-7 text-emerald-600" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {productTitle}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  LD Interiors Master Craftsmen Review
                </p>
                <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  Email & WhatsApp notification ready
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6 pt-2 space-y-3">
          {/* Main Green Action Button (HackerRank 'Continue' Style) */}
          <button
            onClick={handleWhatsAppClick}
            className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-all transform hover:-translate-y-0.5 cursor-pointer"
          >
            <MessageSquare className="w-5 h-5 fill-current" />
            <span>Continue to WhatsApp Chat</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Track Live Order Status Button */}
          <a
            href="/orders"
            className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs tracking-wider uppercase shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Truck className="w-4 h-4 text-amber-400" />
            <span>Track Live Order Status</span>
          </a>

          {/* Bottom Quick Links */}
          <div className="pt-2 flex items-center justify-center gap-6 border-t border-slate-100">
            <button
              onClick={handleWhatsAppClick}
              className="text-slate-500 hover:text-emerald-600 transition-colors flex items-center gap-1 text-xs font-medium cursor-pointer"
              title="Open WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <a
              href="tel:+919346325291"
              className="text-slate-500 hover:text-amber-600 transition-colors flex items-center gap-1 text-xs font-medium"
              title="Call Support"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Support</span>
            </a>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 transition-colors text-xs font-medium cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

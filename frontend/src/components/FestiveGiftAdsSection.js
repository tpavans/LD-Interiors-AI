'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Gift, Sparkles, Award, Flame, Crown, ShoppingBag, ArrowRight, CheckCircle2, Zap, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function FestiveGiftAdsSection() {
  const { language } = useLanguage();
  const isTelugu = language === 'TE';
  const [userBudget, setUserBudget] = useState(12000);
  const [isConfettiActive, setIsConfettiActive] = useState(false);
  const canvasRef = useRef(null);

  // Confetti foil blast animation on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationId;

    const resizeCanvas = () => {
      if (canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Golden & Silver foil metallic chips particles
    const particles = [];
    const colors = ['#f59e0b', '#d97706', '#fbbf24', '#e2e8f0', '#cbd5e1', '#f43f5e', '#10b981', '#ffffff'];

    for (let i = 0; i < 70; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 1.5,
        vy: Math.random() * 1.2 + 0.5,
        rotation: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 4,
        shape: Math.random() > 0.5 ? 'rect' : 'star'
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.vRot;

        if (p.y > canvas.height) {
          p.y = -10;
          p.x = Math.random() * canvas.width;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 3, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      animationId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  // Gift Tiers logic based on order value
  const GIFT_TIERS = [
    {
      minSpend: 1000,
      giftName: isTelugu ? 'వుడెన్ కిచెన్ గ్యాడ్జెట్' : 'Handcrafted Wooden Kitchen Gadget',
      giftDesc: isTelugu ? 'చెక్కతో చేసిన మసాలా ట్రే, స్పాటులా లేదా కోస్టర్ సెట్' : 'Hand-turned wooden spatula, spice tray, or coaster set',
      value: 100,
      badge: '🔥 STARTER GIFT',
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-400',
      badgeBg: 'bg-amber-500',
      giftIcon: '🥄'
    },
    {
      minSpend: 5000,
      giftName: isTelugu ? 'వుడెన్ వాల్ కీ హోల్డర్ / డెస్క్ ఆర్డర్' : 'Carved Teakwood Key Holder / Desk Organizer',
      giftDesc: isTelugu ? 'హ్యాండ్‌క్రాఫ్టెడ్ టేకు కార్వింగ్ కీ హోల్డర్' : 'Artisan carved Burma teak wall key holder',
      value: 500,
      badge: '⭐ POPULAR CHOICE',
      color: 'from-amber-600 to-yellow-600',
      borderColor: 'border-yellow-400',
      badgeBg: 'bg-yellow-500',
      giftIcon: '🔑'
    },
    {
      minSpend: 10000,
      giftName: isTelugu ? 'ప్రీమియం టీకువుడ్ పూజా ప్లేట్ / డెకర్' : 'Premium Burma Teak Puja Plate & Wall Carving',
      giftDesc: isTelugu ? 'ప్రత్యేకమైన టేకువుడ్ దేవుని పూజా ప్లేట్ లేదా వాల్ హ్యాంగింగ్' : 'Hand-carved solid teakwood puja thali or traditional idol stand',
      value: 1000,
      badge: '👑 GOLD GIFT (BEST VALUE)',
      color: 'from-amber-500 via-orange-500 to-amber-600',
      borderColor: 'border-amber-300',
      badgeBg: 'bg-gradient-to-r from-amber-600 to-yellow-500',
      giftIcon: '🪔'
    },
    {
      minSpend: 25000,
      giftName: isTelugu ? 'రాయల్ బర్మా టేకు కార్వింగ్ ఆర్ట్ స్పూర్తి బహుమతి' : 'Royal Burma Teak Artisan Miniature Carving',
      giftDesc: isTelugu ? 'మాస్టర్ ఆర్టిసాన్స్ చెక్కిన రాయల్ ఫర్నిచర్ ఆర్ట్ గిఫ్ట్' : 'Master craftsman carved Burma teak wall panel or miniature mandir art',
      value: 2500,
      badge: '💎 ROYAL TEAK REWARD',
      color: 'from-emerald-600 via-teal-600 to-amber-600',
      borderColor: 'border-emerald-400',
      badgeBg: 'bg-emerald-600',
      giftIcon: '🏛️'
    }
  ];

  // Calculate current tier based on slider
  const currentTier = GIFT_TIERS.reduce((prev, curr) => {
    return userBudget >= curr.minSpend ? curr : prev;
  }, GIFT_TIERS[0]);

  const nextTier = GIFT_TIERS.find(t => t.minSpend > userBudget);
  const neededForNext = nextTier ? nextTier.minSpend - userBudget : 0;

  return (
    <section className="relative overflow-hidden py-14 px-4 sm:px-6 lg:px-8 my-6 bg-gradient-to-b from-slate-950 via-slate-900 to-wood-dark text-white rounded-3xl shadow-2xl border border-amber-500/30">
      {/* Background Foil Confetti Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

      {/* Floating Animated Balloons in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 opacity-40">
        {/* Balloon 1 */}
        <div className="absolute left-[8%] bottom-[-40px] animate-float-slow text-3xl select-none">
          🎈
        </div>
        {/* Balloon 2 */}
        <div className="absolute left-[25%] bottom-[-50px] animate-float-medium text-4xl select-none">
          🎉
        </div>
        {/* Balloon 3 */}
        <div className="absolute right-[15%] bottom-[-30px] animate-float-fast text-4xl select-none">
          🎁
        </div>
        {/* Balloon 4 */}
        <div className="absolute right-[35%] bottom-[-60px] animate-float-slow text-3xl select-none">
          ✨
        </div>
      </div>

      {/* Main Container */}
      <div className="relative z-20 max-w-7xl mx-auto">
        
        {/* Top Header Badge & Announcement Banner */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 shadow-lg backdrop-blur-md animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{isTelugu ? 'ప్రత్యేక ఉచిత బహుమతి ఆఫర్లు' : 'Festive Order Celebration Offer'}</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif tracking-tight text-white leading-tight drop-shadow-md">
            {isTelugu ? (
              <>
                ఆర్డర్ చేయండి... <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200">ఉచిత వుడెన్ గిఫ్ట్‌లు</span> గెలుచుకోండి! 🎁
              </>
            ) : (
              <>
                Shop Teakwood Furniture & <span className="bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-orange-400 to-yellow-200">Get Free Wooden Gifts!</span> 🎁
              </>
            )}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            {isTelugu ? (
              'ప్రతి ఆర్డర్‌పై ఖచ్చితమైన బహుమతి! ₹1,000 లేదా అంతకంటే ఎక్కువ కొనుగోలు చేసినవారికి ఉచిత వుడెన్ కిచెన్ గ్యాడ్జెట్ (₹100 విలువైంది) మరియు ₹10,000 దాటితే ఉచిత వుడెన్ ఆర్ట్ గిఫ్ట్ (₹1,000 విలువైంది) అందించబడుతుంది.'
            ) : (
              'Guaranteed Free Gift on Every Order! Spend ₹1,000+ for a free wooden kitchen gadget (worth ₹100), or ₹10,000+ for a premium teakwood decor gift (worth ₹1,000+).'
            )}
          </p>
        </div>

        {/* 4 Tiered Reward Offer Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {GIFT_TIERS.map((tier, idx) => (
            <div
              key={idx}
              className={`relative rounded-3xl p-6 bg-slate-900/90 border ${tier.borderColor} shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1.5 flex flex-col justify-between overflow-hidden group`}
            >
              {/* Top Accent Gradient Ribbon */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tier.color}`} />

              <div>
                {/* Badge Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[10px] font-black tracking-widest text-white uppercase px-2.5 py-1 rounded-md shadow-xs ${tier.badgeBg}`}>
                    {tier.badge}
                  </span>
                  <span className="text-2xl">{tier.giftIcon}</span>
                </div>

                {/* Spend Threshold */}
                <div className="mt-2 border-b border-slate-800 pb-3">
                  <span className="text-xs text-slate-400 font-medium">Order Value:</span>
                  <div className="text-2xl font-black text-amber-300 font-serif">
                    Above ₹{tier.minSpend.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Free Gift Details */}
                <div className="mt-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded">
                    🎁 FREE GIFT (WORTH ₹{tier.value.toLocaleString('en-IN')})
                  </span>
                  <h3 className="text-base font-bold text-white mt-2 group-hover:text-amber-300 transition-colors">
                    {tier.giftName}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-light leading-relaxed">
                    {tier.giftDesc}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <div className="mt-6 pt-4 border-t border-slate-800">
                <Link
                  href="/products"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>{isTelugu ? 'ఆర్డర్ చేసి పొందండి' : 'Shop & Claim Gift'}</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Budget Reward Calculator */}
        <div className="bg-gradient-to-r from-slate-900 via-wood-dark to-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
            
            {/* Left Side: Slider Controls */}
            <div className="w-full md:w-1/2 text-left">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Zap className="w-4 h-4" />
                <span>{isTelugu ? 'మీ ప్లాన్ చేసిన ఆర్డర్ బడ్జెట్' : 'Order Budget Reward Estimator'}</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold font-serif text-white">
                {isTelugu ? 'మీ బడ్జెట్‌కి ఎంత గిఫ్ట్ వస్తుంది?' : 'Select Your Planned Budget'}
              </h3>

              <div className="mt-6">
                <div className="flex justify-between items-center mb-2 text-sm">
                  <span className="text-slate-300 font-medium">Order Value:</span>
                  <span className="font-extrabold text-amber-300 font-mono text-xl">
                    ₹{userBudget.toLocaleString('en-IN')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="1000"
                  value={userBudget}
                  onChange={(e) => setUserBudget(Number(e.target.value))}
                  className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
                  <span>₹1,000</span>
                  <span>₹10,000</span>
                  <span>₹25,000</span>
                  <span>₹50,000+</span>
                </div>
              </div>
            </div>

            {/* Right Side: Unlocked Gift Card Box */}
            <div className="w-full md:w-1/2 bg-slate-950/80 border border-amber-400/50 rounded-2xl p-5 text-left shadow-xl relative">
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800">
                ✓ UNLOCKED FREE GIFT
              </span>

              <div className="mt-3 flex items-start gap-3">
                <span className="text-3xl">{currentTier.giftIcon}</span>
                <div>
                  <h4 className="text-lg font-bold text-amber-300 font-serif">
                    {currentTier.giftName}
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Included FREE with your order (Worth ₹{currentTier.value.toLocaleString('en-IN')})
                  </p>
                </div>
              </div>

              {nextTier && (
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    Add <strong className="text-amber-300 font-mono">₹{neededForNext.toLocaleString('en-IN')}</strong> more to unlock:
                  </span>
                  <span className="text-emerald-400 font-bold">
                    Worth ₹{nextTier.value} Gift {nextTier.giftIcon}
                  </span>
                </div>
              )}

              <div className="mt-4">
                <a
                  href={`https://wa.me/916281653998?text=${encodeURIComponent(`Hello Nagaraju Garu! I want to order teakwood products worth ₹${userBudget.toLocaleString('en-IN')} and claim my Free ${currentTier.giftName} gift!`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
                >
                  <Gift className="w-4 h-4" />
                  <span>{isTelugu ? 'ఈ ఉచిత బహుమతితో ఆర్డర్ చేయండి' : 'Order Now & Claim Free Gift'}</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}

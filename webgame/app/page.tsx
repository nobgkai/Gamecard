'use client';
import { useState, useEffect } from 'react';
import { Itim, Kanit } from 'next/font/google';
import { QUESTIONS_HARD, QUESTIONS_MEDIUM } from './data/questions';

const itim = Itim({ weight: '400', subsets: ['thai'] });
const kanit = Kanit({ weight: ['300', '400', '500', '600'], subsets: ['thai'] });

type ScreenType = 'home' | 'card-medium' | 'card-hard' | 'duck-finger';
type DealState = 'idle' | 'start' | 'fan' | 'return';

export default function GamePage() {
  const [currentScreen, setCurrentScreen] = useState<ScreenType>('home');
  const [deck, setDeck] = useState<{ q: string; n: number }[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [mode, setMode] = useState<'medium' | 'hard'>('medium');
  
  const [dealState, setDealState] = useState<DealState>('idle');
  const [targetMode, setTargetMode] = useState<ScreenType | null>(null);

  const shuffledDeck = (questions: string[]) => {
    const pool = questions.map((q, i) => ({ q, n: i + 1 }));
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };

  const selectGame = (selectedMode: 'card-medium' | 'card-hard' | 'duck-finger') => {
    if (selectedMode === 'duck-finger') {
      setCurrentScreen('duck-finger');
      return;
    }
    
    const isHard = selectedMode === 'card-hard';
    setMode(isHard ? 'hard' : 'medium');
    setDeck(shuffledDeck(isHard ? QUESTIONS_HARD : QUESTIONS_MEDIUM));
    setDeckIndex(0);
    setIsFlipped(false);
    
    setTargetMode(selectedMode);
    setDealState('start');
  };

  useEffect(() => {
    if (dealState === 'start') {
      const fanTimer = setTimeout(() => setDealState('fan'), 50);

      return () => {
        clearTimeout(fanTimer);
      };
    }

    if (dealState === 'fan') {
      const returnTimer = setTimeout(() => setDealState('return'), 1350);

      return () => clearTimeout(returnTimer);
    }

    if (dealState === 'return') {
      const routeTimer = setTimeout(() => {
        if (targetMode) setCurrentScreen(targetMode);
        setDealState('idle');
      }, 780);

      return () => clearTimeout(routeTimer);
    }
  }, [dealState, targetMode]);

  const nextCard = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFlipped(false);
    setTimeout(() => {
      setDeckIndex((prev) => (prev + 1) % deck.length);
    }, 300);
  };

  const reshuffleDeck = (e: React.MouseEvent) => {
    e.stopPropagation();
    const questions = mode === 'hard' ? QUESTIONS_HARD : QUESTIONS_MEDIUM;
    setDeck(shuffledDeck(questions));
    setDeckIndex(0);
    setIsFlipped(false);
  };

  return (
    // เอา flex-col กับ justify-center ออกจาก wrapper หลัก เพื่อไม่ให้มันบีบเลย์เอาต์ตรงกลาง
    <div className={`app-root min-h-screen w-full bg-[#111111] text-white selection:bg-[#ffca28]/30 relative overflow-x-hidden ${kanit.className}`}>
      
      {/* ================= OVERLAY: แอนิเมชันกระจายไพ่ 8 ใบ ================= */}
      {dealState !== 'idle' && (
        <div className="deal-overlay fixed z-[100] flex flex-col items-center justify-center bg-[#0a0a0c] animate-in fade-in duration-300">
          <div className="deal-stage relative mx-auto flex flex-col items-center justify-end pb-20">
            <div className="deal-fan relative flex justify-center items-end mb-8 z-10">
              {[...Array(8)].map((_, i) => {
                const offset = i - 3.5;
                const angle = offset * 12;
                const x = offset * 50;
                const y = Math.abs(offset) * 15;
                
                return (
                  <div
                    key={i}
                    className="deal-card absolute rounded-xl border border-white/20 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] origin-bottom bg-cover bg-center"
                    style={{
                      backgroundImage: "url('/gamecard/infont.png')",
                      transform: dealState === 'fan'
                        ? `translateX(${x}px) translateY(${y}px) rotate(${angle}deg) scale(1)` 
                        : dealState === 'return'
                          ? 'translateX(0px) translateY(115px) rotate(0deg) scale(0.35)'
                          : `translateX(0px) translateY(100px) rotate(0deg) scale(0)`,
                      opacity: dealState === 'start' ? 0 : dealState === 'return' ? 0 : 1,
                      transitionDelay: `${Math.abs(offset) * 40}ms`
                    }}
                  />
                );
              })}
            </div>

            <div 
              className="deal-main-card relative rounded-2xl border-2 border-[#ffca28] shadow-[0_0_40px_rgba(255,202,40,0.25)] transition-all duration-700 ease-[cubic-bezier(0.2,0.9,0.25,1)] z-20 bg-cover bg-center"
              style={{
                backgroundImage: "url('/gamecard/infont.png')",
                transform: dealState === 'fan' ? 'translateY(0) scale(1)' : dealState === 'return' ? 'translateY(0) scale(0)' : 'translateY(150px) scale(0.5)',
                opacity: dealState === 'start' || dealState === 'return' ? 0 : 1,
                transitionDelay: '150ms'
              }}
            ></div>

          </div>
        </div>
      )}

      {/* ================= หน้าแรก (HOME) UI แนวนอน 3 คอลัมน์ ================= */}
      {currentScreen === 'home' && dealState === 'idle' && (
        <div className="home-screen w-full min-h-screen mx-auto px-4 py-3 flex flex-col items-center animate-in fade-in duration-700">
          
          {/* Header */}
          <h1 className={`home-title text-4xl md:text-6xl font-bold mb-16 tracking-wide drop-shadow-lg text-center ${itim.className}`}>
            รวมเกมใน <span className="text-[#ffca28]">วงเหล้า</span>
          </h1>

          {/* บังคับเป็นแนวนอนด้วย flex-row บนจอคอม */}
          <div className="home-grid flex flex-col md:flex-row justify-center items-start gap-12 md:gap-8 lg:gap-16 w-full">
            
            {/* โหมด 1: ท้าหรือทำ (ระดับยาก) */}
            <div onClick={() => selectGame('card-hard')} className="w-full md:w-1/3 flex flex-col items-center text-center group cursor-pointer">
              <h2 className={`text-3xl font-bold mb-1 ${itim.className}`}>ท้า<span className="text-[#ffca28]">หรือ</span>ทำ</h2>
              <p className="text-gray-400 text-xs mb-8">เปิดไพ่ใบแรกแล้วเริ่มเกมกันเลย</p>

              <div className="home-card-art relative w-44 h-64 mb-8">
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/20 transform -rotate-6 -translate-x-3 translate-y-1 transition-all duration-300 group-hover:-translate-x-5 group-hover:-rotate-12 bg-cover bg-center"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/20 transform rotate-6 translate-x-3 translate-y-1 transition-all duration-300 group-hover:translate-x-5 group-hover:rotate-12 bg-cover bg-center"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-2xl border-2 border-[#ffca28]/80 shadow-[0_0_20px_rgba(255,202,40,0.15)] z-10 transition-transform duration-300 group-hover:-translate-y-4 bg-cover bg-center"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
              </div>

              <div className={`text-[#ffca28] text-xl mb-1 ${itim.className}`}>เริ่มเกม</div>
              <div className={`text-2xl font-bold mb-3 ${itim.className}`}>สับไพ่ แล้วลุย</div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-[240px] font-light mx-auto">
                คำอธิบาย : นี่เป็นระดับยาก เนื้อหาภายในเป็นเนื้อหาแนวท้าทายเล่นสนุกแนว 18 +
              </p>
            </div>

            {/* โหมด 2: ท้าหรือทำ (ระดับกลาง) */}
            <div onClick={() => selectGame('card-medium')} className="w-full md:w-1/3 flex flex-col items-center text-center group cursor-pointer">
              <h2 className={`text-3xl font-bold mb-1 ${itim.className}`}>ท้า<span className="text-[#ffca28]">หรือ</span>ทำ</h2>
              <p className="text-gray-400 text-xs mb-8">เปิดไพ่ใบแรกแล้วเริ่มเกมกันเลย</p>

              <div className="home-card-art relative w-44 h-64 mb-8">
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/20 transform -rotate-6 -translate-x-3 translate-y-1 transition-all duration-300 group-hover:-translate-x-5 group-hover:-rotate-12 bg-cover bg-center"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-2xl border border-white/20 transform rotate-6 translate-x-3 translate-y-1 transition-all duration-300 group-hover:translate-x-5 group-hover:rotate-12 bg-cover bg-center"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
                <div 
                  className="absolute inset-0 rounded-2xl border-2 border-[#ffca28]/80 shadow-[0_0_20px_rgba(255,202,40,0.15)] z-10 transition-transform duration-300 group-hover:-translate-y-4 bg-cover bg-center"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
              </div>

              <div className={`text-[#ffca28] text-xl mb-1 ${itim.className}`}>เริ่มเกม</div>
              <div className={`text-2xl font-bold mb-3 ${itim.className}`}>สับไพ่ แล้วลุย</div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-[240px] font-light mx-auto">
                คำอธิบาย : นี่เป็นระดับกลาง เนื้อหาภายในเป็นเนื้อหาแนวฮาๆ เล่นสนุกกับเพื่อนฝูงทั่วไป
              </p>
            </div>

            {/* โหมด 3: Duck Finger */}
            <div onClick={() => selectGame('duck-finger')} className="w-full md:w-1/3 flex flex-col items-center text-center group cursor-pointer">
              <h2 className={`text-3xl font-bold text-[#ffca28] mb-1 ${itim.className}`}>Duck Finger</h2>
              <p className="text-gray-400 text-xs mb-8">กดที่ฟันเพื่อสุ่มหาผู้โชคดี</p>

              <div className="home-card-art home-duck-art relative w-56 h-64 mb-8 flex items-center justify-center">
                <img 
                  src="/duckfiger/duck1.png" 
                  alt="Duck" 
                  className="duck-image w-full h-full object-contain filter drop-shadow-[0_10px_25px_rgba(255,202,40,0.25)] transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" 
                />
              </div>

              <div className={`text-[#ffca28] text-xl mb-1 ${itim.className}`}>เริ่มเกม</div>
              <div className={`text-2xl font-bold mb-3 ${itim.className}`}>เลือกฟันที่ชอบที่สุด</div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-[280px] font-light mx-auto">
                คำอธิบาย : เกมนี้เป็นเกมวัดดวงชนิดแบบมาจากเกม CROCODILE โดยวิธีเล่นคือเลือกฟันที่ชอบ หากเป็ดงับลงมาถือว่าแพ้
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ================= หน้าเกมไพ่ (CARD GAME) ================= */}
      {(currentScreen === 'card-medium' || currentScreen === 'card-hard') && dealState === 'idle' && (
        <div className="card-screen w-full min-h-screen flex flex-col items-center justify-center p-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          <div className="card-panel">
            <div className="card-toolbar mb-8">
              <button 
                onClick={() => setCurrentScreen('home')}
                  className="card-home-button px-4 py-2 rounded-full border border-white/20 text-gray-400 text-sm hover:border-[#ffca28] hover:text-[#ffca28] transition-colors"
              >
                ← กลับหน้าแรก
              </button>
              <div className="card-count text-gray-400 text-sm">
                ใบที่ <b className="text-[#ffca28] text-lg ml-1">{deckIndex + 1}</b> / {deck.length}
              </div>
            </div>

            <div 
              className="card-stage-view relative w-full cursor-pointer [perspective:1400px] group" 
              onClick={() => setIsFlipped(true)}
            >
              <div className={`w-full h-full relative transition-transform duration-700 ease-[cubic-bezier(0.2,0.9,0.25,1)] [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : 'group-hover:scale-[1.03]'}`}>
                
                {/* ด้านหน้าไพ่ */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-[24px] shadow-[0_15px_40px_rgba(0,0,0,0.6)] bg-cover bg-center [backface-visibility:hidden]"
                  style={{ backgroundImage: "url('/gamecard/infont.png')" }}
                ></div>
                
                {/* ด้านหลังไพ่ */}
                <div 
                  className="absolute inset-0 w-full h-full rounded-[24px] shadow-[0_0_30px_rgba(255,202,40,0.15)] bg-cover bg-center [backface-visibility:hidden] [transform:rotateY(180deg)] flex flex-col items-center justify-center p-8 text-center"
                  style={{ backgroundImage: "url('/gamecard/black.png')" }}
                >
                  <p className={`card-question ${itim.className}`}>
                    {deck.length > 0 ? deck[deckIndex].q : "กำลังโหลด..."}
                  </p>
                  <span className={`card-number ${itim.className}`}>
                    ใบที่ {deck.length > 0 ? deck[deckIndex].n : ""}
                  </span>
                </div>

              </div>
            </div>

            {!isFlipped ? (
              <p className="text-center mt-8 text-gray-500 text-sm animate-pulse font-light">
                แตะที่ไพ่เพื่อเปิดคำถาม
              </p>
            ) : (
              <div className="card-actions mt-8 animate-in fade-in slide-in-from-bottom-4">
                <button
                  onClick={reshuffleDeck}
                  className={`reshuffle-button ${itim.className}`}
                >
                  สับไพ่ใหม่
                </button>
                <button 
                  onClick={nextCard}
                  className={`next-card-button ${itim.className}`}
                >
                  ใบถัดไป →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= หน้าเกม DUCK FINGER ================= */}
      {currentScreen === 'duck-finger' && dealState === 'idle' && (
        <div className="w-full min-h-screen flex flex-col items-center justify-center p-6 animate-in zoom-in-95 duration-500">
          <div className="w-full max-w-sm flex justify-start mb-8">
            <button 
              onClick={() => setCurrentScreen('home')}
              className="px-4 py-2 rounded-full border border-white/20 text-gray-400 text-sm hover:border-[#ffca28] hover:text-[#ffca28] transition-colors"
            >
              ← กลับหน้าแรก
            </button>
          </div>
          
          <img src="/duckfiger/duck.png" alt="Duck" className="duck-image w-64 mb-10 filter drop-shadow-[0_10px_30px_rgba(255,202,40,0.3)] animate-bounce" />
          <h2 className={`text-4xl md:text-5xl font-bold text-[#ffca28] mb-4 ${itim.className}`}>Duck Finger</h2>
          <p className="text-gray-400 text-center max-w-xs font-light">
            ระบบจิ้มนิ้วกำลังอยู่ระหว่างการพัฒนา เตรียมตัวโดนงับได้เลย!
          </p>
        </div>
      )}

    </div>
  );
}
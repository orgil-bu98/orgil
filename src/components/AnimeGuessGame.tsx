import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Flame, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Star, Play, Lightbulb, ArrowRight, ArrowLeft } from 'lucide-react';

interface AnimeQuestion {
  id: number;
  emojis: string;
  name: string;
  options: string[];
  defaultHint: string;
  imageUrl?: string;
}

const ANIME_QUESTIONS: AnimeQuestion[] = [
  {
    id: 1,
    emojis: '🥷🦊🍜',
    name: 'Naruto',
    options: ['Naruto', 'Demon Slayer', 'One Piece', 'Jujutsu Kaisen'],
    defaultHint: 'Хамгийн дуртай хоол нь Рамэн. Түүний дотор есөн сүүлт үнэг бий.',
    imageUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 2,
    emojis: '🏴‍☠️👒🍖',
    name: 'One Piece',
    options: ['Naruto', 'Hunter x Hunter', 'One Piece', 'Dragon Ball Z'],
    defaultHint: 'Сүрлэн малгайт ахмад далайн дээрэмчин болж хамгийн агуу эрдэнэсийг хайна.',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 3,
    emojis: '🧱👹🗡️',
    name: 'Attack on Titan',
    options: ['Sword Art Online', 'Attack on Titan', 'Fullmetal Alchemist', 'Tokyo Ghoul'],
    defaultHint: 'Асар том ханануудын цаадах аварга биетүүд болон хүн төрөлхтний амьд үлдэх тэмцэл.',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 4,
    emojis: '📓🍎💀',
    name: 'Death Note',
    options: ['Your Name', 'Jujutsu Kaisen', 'My Hero Academia', 'Death Note'],
    defaultHint: 'Тэнгэрийн элчийн санаандгүй унагаасан дэвтэр болон алим идэх дуртай шинигами Рюүк.',
    imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 5,
    emojis: '👹🗡️🌊',
    name: 'Demon Slayer',
    options: ['Demon Slayer', 'Naruto', 'Haikyuu!!', 'Tokyo Ghoul'],
    defaultHint: 'Гол дүр нь дүүгээ аврахын тулд усан амьсгал ашиглан чөтгөрүүдтэй тэмцэнэ.',
    imageUrl: 'https://images.unsplash.com/photo-1580234810907-b40315b76418?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 6,
    emojis: '🏐🧡👑',
    name: 'Haikyuu!!',
    options: ['Kuroko no Basket', 'Haikyuu!!', 'Slam Dunk', 'Blue Lock'],
    defaultHint: 'Гар бөмбөгийн спорт, жижигхэн аварга Хината болон талбайн хаан Кагэяма.',
    imageUrl: 'https://images.unsplash.com/photo-1592656094267-764a45160876?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 7,
    emojis: '👁️🤞👹',
    name: 'Jujutsu Kaisen',
    options: ['Demon Slayer', 'Tokyo Ghoul', 'Jujutsu Kaisen', 'Hunter x Hunter'],
    defaultHint: 'Хамгийн хүчтэй хараалын хаан Сукуна болон нүдний боолттой Гүжо Сэнсэй.',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 8,
    emojis: '🦸‍♂️⚡🏫',
    name: 'My Hero Academia',
    options: ['My Hero Academia', 'One Piece', 'Sword Art Online', 'Dragon Ball Z'],
    defaultHint: 'Ямар ч хүч чадалгүй төрсөн Деку хүү шилдэг баатар болохын тулд баатруудын сургуульд суралцана.',
    imageUrl: 'https://images.unsplash.com/photo-1569003339405-ea396a5a8a90?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 9,
    emojis: '🐉☄️🟠',
    name: 'Dragon Ball Z',
    options: ['Fullmetal Alchemist', 'Naruto', 'Dragon Ball Z', 'Your Name'],
    defaultHint: 'Сон Гоку болон түүний найзуудын адал явдал, долоон ширхэг шидэт бөмбөлөг.',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 10,
    emojis: '🎣🎒🕶️',
    name: 'Hunter x Hunter',
    options: ['Hunter x Hunter', 'One Piece', 'Jujutsu Kaisen', 'Haikyuu!!'],
    defaultHint: 'Гон аавыгаа хайж олохын тулд Хантерийн шалгалтанд орж, Килуа хүүтэй нөхөрлөно.',
    imageUrl: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 11,
    emojis: '☕🎭🩸',
    name: 'Tokyo Ghoul',
    options: ['Death Note', 'Tokyo Ghoul', 'One Piece', 'Hunter x Hunter'],
    defaultHint: 'Хагас хүн хагас гүүл болсон Канеки Кэн болон кофе уух дуртай нууцлаг амьтад.',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 12,
    emojis: '⚔️🥽🏰',
    name: 'Sword Art Online',
    options: ['Sword Art Online', 'Attack on Titan', 'Fullmetal Alchemist', 'My Hero Academia'],
    defaultHint: 'Виртуал тоглоомонд бүрмөсөн түгжигдсэн тоглогчид болон хар хувцаст сэлэмчин Кирито.',
    imageUrl: 'https://images.unsplash.com/photo-1593508512255-86ab42a8e620?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 13,
    emojis: '🦾🪙⚡',
    name: 'Fullmetal Alchemist',
    options: ['Naruto', 'Jujutsu Kaisen', 'Fullmetal Alchemist', 'Dragon Ball Z'],
    defaultHint: 'Алдагдсан бие махбодоо буцаан авах гэсэн Элрик ах дүүсийн алхимын хүнд бэрх аялал.',
    imageUrl: 'https://images.unsplash.com/photo-1613376023733-0a73315d9b06?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 14,
    emojis: '🌠☄️⏳',
    name: 'Your Name',
    options: ['Spirited Away', 'Your Name', 'Tokyo Ghoul', 'My Neighbor Totoro'],
    defaultHint: 'Сүүлт од унах шөнө бие биеийнхээ биед шилжсэн Мицуха охин болон Таки хүүгийн хайр.',
    imageUrl: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=500&h=500&q=80'
  },
  {
    id: 15,
    emojis: '🏮🐷🐉',
    name: 'Spirited Away',
    options: ['Your Name', 'Spirited Away', 'Tokyo Ghoul', 'My Neighbor Totoro'],
    defaultHint: 'Сүнсний хачирхалтай хотод ороод гахай болон хувирсан аав ээж, тэдэнд туслах Хаку луу.',
    imageUrl: 'https://images.unsplash.com/photo-1505993597083-3bd19fb75e57?auto=format&fit=crop&w=500&h=500&q=80'
  }
];

// Fisher-Yates Shuffle algorithm to randomize array elements
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Prepare questions with shuffled options
function prepareAnimeQuestions(): AnimeQuestion[] {
  const shuffledQuestions = shuffleArray(ANIME_QUESTIONS);
  return shuffledQuestions.map(q => ({
    ...q,
    options: shuffleArray(q.options)
  }));
}

interface AnimeGuessGameProps {
  onBack: () => void;
}

export default function AnimeGuessGame({ onBack }: AnimeGuessGameProps) {
  const [questions, setQuestions] = useState<AnimeQuestion[]>(() => prepareAnimeQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('anime_high_score') || '0');
    }
    return 0;
  });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  
  // Gemini AI Hint States
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);
  const [hintError, setHintError] = useState<string | null>(null);

  const currentQuestion = questions[currentIdx];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return; // Already answered this level
    setSelectedOption(option);
    
    const correct = option === currentQuestion.name;
    setIsCorrect(correct);
    setShowExplanation(true);

    if (correct) {
      const points = 10 + streak * 2;
      setScore(prev => {
        const nextScore = prev + points;
        const currentSaved = Number(localStorage.getItem('anime_high_score') || '0');
        if (nextScore > currentSaved) {
          localStorage.setItem('anime_high_score', String(nextScore));
          setHighScore(nextScore);
        }
        return nextScore;
      });
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > maxStreak) {
        setMaxStreak(newStreak);
      }
    } else {
      setStreak(0);
    }
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setAiHint(null);
    setHintError(null);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRestart = () => {
    setQuestions(prepareAnimeQuestions());
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setIsGameOver(false);
    setAiHint(null);
    setHintError(null);
  };

  const fetchAiHint = async () => {
    if (loadingHint || aiHint) return;
    setLoadingHint(true);
    setHintError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Хөөе, надад "${currentQuestion.emojis}" эможитой, мөн хүмүүсийн мэддэгээр "${currentQuestion.name}" анимэ-д зориулсан хөгжилтэй, нууцлаг, шууд анимэны нэрийг хэлэхгүйгээр монгол хэлээр маш сонирхолтой AI зөвлөгөө эсвэл сонирхолтой баримт хэлж өгөөч. Анимэ-г таахад туслах маш богинохон 1-2 өгүүлбэр байх хэрэгтэй. "Би анимэ-г шууд хэлэхгүй!" гэсэн маягаар бичээрэй.`
            }
          ],
          chatType: 'idol' // Reuse idol coach backend for system context
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setAiHint(data.text);
      } else {
        throw new Error(data.error || 'Зөвлөгөө авахад алдаа гарлаа.');
      }
    } catch (err: any) {
      console.error(err);
      setHintError('Gemini-ээс зөвлөгөө авахад алдаа гарлаа. Оронд нь доорх жирийн зөвлөгөөг уншаарай.');
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="w-full max-w-4xl bg-zinc-950/90 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 items-center shadow-2xl animate-fade-in text-white font-sans">
      
      {/* Header Panel */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-3 self-start">
          <button 
            onClick={onBack}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
            id="back_home_game_btn"
            title="Нүүр хуудас"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-semibold">Анимэ Таах Тоглоом</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight uppercase font-mono">EMOJI ANIME GUESSER</h2>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 bg-white/5 border border-white/10 rounded-2xl sm:rounded-full px-4 py-2 text-xs sm:text-sm">
          <div className="flex items-center gap-1.5" title="Оноо">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span className="font-mono font-bold text-amber-400">{score}</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-1 text-xs text-zinc-400" title="Хамгийн дээд оноо">
            <span>Дээд оноо:</span>
            <span className="font-mono font-bold text-amber-300">{highScore}</span>
          </div>
          <div className="w-px h-4 bg-white/10" />
          <div className="flex items-center gap-1.5" title="Дараалсан зөв хариулт">
            <Flame className={`w-4 h-4 ${streak > 0 ? 'text-orange-500 animate-bounce' : 'text-zinc-500'}`} />
            <span className="font-mono font-bold text-orange-400">{streak}</span>
          </div>
          <div className="w-px h-4 bg-white/10 hidden sm:block" />
          <div className="flex items-center gap-1 text-xs text-zinc-400" title="Шилдэг стрийк">
            <span>Шилдэг:</span>
            <span className="font-mono font-bold text-white">{maxStreak}</span>
          </div>
        </div>
      </div>

      {!isGameOver ? (
        <div className="w-full flex flex-col lg:flex-row gap-8 items-stretch">
          
          {/* Left panel: Emoji Display and Clues */}
          <div className="flex-1 bg-gradient-to-b from-orange-500/5 to-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center gap-6 relative min-h-[300px]">
            <div className="absolute top-4 left-4 bg-white/10 border border-white/10 rounded-full px-3 py-1 text-xs font-mono">
              Даалгавар {currentIdx + 1} / {questions.length}
            </div>

            {/* Emojis with large floating animation */}
            <div className="text-6xl sm:text-7xl py-6 animate-pulse select-none tracking-wider filter drop-shadow-[0_10px_20px_rgba(249,115,22,0.15)]">
              {currentQuestion.emojis}
            </div>

            {/* AI Clue Button */}
            <div className="w-full flex flex-col gap-2 mt-2">
              <button
                onClick={fetchAiHint}
                disabled={loadingHint || selectedOption !== null}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 disabled:opacity-50 border border-orange-500/30 text-orange-400 text-xs font-semibold uppercase transition-all duration-200 cursor-pointer active:scale-98"
                id="ai_clue_btn"
              >
                {loadingHint ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Gemini зөвлөгөөг бэлдэж байна...</span>
                  </>
                ) : (
                  <>
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{aiHint ? 'Gemini AI Зөвлөгөө ирлээ' : 'Gemini AI-аас тусламж авах'}</span>
                  </>
                )}
              </button>

              {/* Display hint if generated */}
              {aiHint && (
                <div className="bg-zinc-950/80 border border-orange-500/20 rounded-xl p-3.5 text-xs text-zinc-300 leading-relaxed font-sans relative animate-fade-in">
                  <div className="absolute -top-2 left-4 px-1.5 py-0.5 bg-orange-500 text-[8px] font-mono text-white rounded uppercase tracking-widest font-black">
                    GEMINI-3.5 CLUE
                  </div>
                  <p className="mt-1 font-medium">{aiHint}</p>
                </div>
              )}

              {hintError && (
                <div className="bg-red-950/20 border border-red-500/20 rounded-xl p-3.5 text-xs text-red-300 leading-relaxed font-sans">
                  <p className="font-semibold flex items-center gap-1.5 mb-1 text-red-400">
                    <AlertCircle size={13} />
                    <span>{hintError}</span>
                  </p>
                  <p className="text-zinc-400 text-[11px]">{currentQuestion.defaultHint}</p>
                </div>
              )}

              {/* Show default hint button if they just want standard tip */}
              {!aiHint && !hintError && (
                <div className="group text-center">
                  <p className="text-[10px] text-zinc-500 group-hover:text-zinc-400 transition-colors font-mono uppercase tracking-wider">
                    Энгийн зөвлөгөө: {currentQuestion.defaultHint}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right panel: Multiple Choices and Explanations */}
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-zinc-400">
                Зөв анимэг сонгоно уу:
              </h3>

              <div className="grid grid-cols-1 gap-3">
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedOption === option;
                  const isThisCorrect = option === currentQuestion.name;
                  
                  let btnStyle = "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white";
                  if (selectedOption !== null) {
                    if (isThisCorrect) {
                      btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-400";
                    } else if (isSelected) {
                      btnStyle = "bg-red-500/20 border-red-500 text-red-400";
                    } else {
                      btnStyle = "opacity-40 bg-zinc-900 border-white/5 text-zinc-500";
                    }
                  }

                  return (
                    <button
                      key={i}
                      onClick={() => handleOptionClick(option)}
                      disabled={selectedOption !== null}
                      className={`w-full text-left p-4 rounded-xl border font-sans text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-between active:scale-[0.98] ${btnStyle} ${selectedOption === null ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <span>{option}</span>
                      {selectedOption !== null && isThisCorrect && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
                      {selectedOption !== null && isSelected && !isThisCorrect && <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanatory overlay or Next button */}
            {showExplanation && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wide">
                      <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>ЗӨВ ХАРИУЛЛАА! (+{10 + (streak - 1) * 2} оноо)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-semibold text-xs font-mono uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>БУРУУ ХАРИУЛЛАА...</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center sm:items-start">
                  {currentQuestion.imageUrl && (
                    <img
                      src={currentQuestion.imageUrl}
                      alt={currentQuestion.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 object-cover rounded-xl border border-white/10 shadow-lg shrink-0 bg-white/5"
                      referrerPolicy="no-referrer"
                    />
                  )}
                  <div className="text-xs text-zinc-300 leading-relaxed flex-1 text-center sm:text-left">
                    <p className="font-bold text-sm text-white mb-1">
                      Зөв хариулт: {currentQuestion.name}
                    </p>
                    <p>{currentQuestion.defaultHint}</p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
                  id="next_game_level_btn"
                >
                  <span>{currentIdx < questions.length - 1 ? 'Дараагийн даалгавар' : 'Тоглоомыг дуусгах'}</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>

        </div>
      ) : (
        /* Game Over Screen */
        <div className="w-full py-12 flex flex-col items-center justify-center text-center gap-6 animate-fade-in max-w-xl mx-auto">
          <div className="w-24 h-24 rounded-full bg-orange-500/10 border-2 border-orange-500 flex items-center justify-center text-orange-400 animate-bounce">
            <Trophy size={48} />
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-black uppercase tracking-wider font-mono">Баяр хүргэе!</h3>
            <p className="text-sm text-zinc-400">
              Та анимэ таах тоглоомыг амжилттай дуусгалаа. Оргилын вэб хуудасны шилдэг анимэ мэдлэгтэн боллоо!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-[11px] sm:text-xs">
            <div className="flex flex-col gap-1 border-r border-white/10">
              <span className="text-zinc-500 uppercase text-[9px]">Нийт Оноо</span>
              <span className="text-lg sm:text-2xl font-bold text-amber-400">{score}</span>
            </div>
            <div className="flex flex-col gap-1 border-r border-white/10">
              <span className="text-zinc-500 uppercase text-[9px]">Хамгийн Дээд</span>
              <span className="text-lg sm:text-2xl font-bold text-amber-300">{highScore}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 uppercase text-[9px]">Шилдэг Стрийк</span>
              <span className="text-lg sm:text-2xl font-bold text-orange-500">{maxStreak}</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <button
              onClick={handleRestart}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              id="replay_game_btn"
            >
              <RefreshCw size={14} />
              <span>Дахин тоглох</span>
            </button>
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              id="exit_game_btn"
            >
              <span>Нүүр хуудас руу</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

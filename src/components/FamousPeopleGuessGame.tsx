import React, { useState, useEffect } from 'react';
import { Sparkles, Trophy, Flame, HelpCircle, CheckCircle2, AlertCircle, RefreshCw, Star, Play, Lightbulb, ArrowRight, ArrowLeft, Eye, EyeOff, Globe, Award } from 'lucide-react';
import gameData from '../data.json';

interface FamousPersonQuestion {
  id: number;
  emojis: string;
  name: string;
  options: string[];
  hint1: string; // Profession and Country
  hint2: string; // Fun fact / major achievement
  imageUrl?: string;
}

const FAMOUS_PEOPLE_QUESTIONS: FamousPersonQuestion[] = gameData.famousPeopleQuestions;

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
function prepareFamousQuestions(): FamousPersonQuestion[] {
  const shuffledQuestions = shuffleArray(FAMOUS_PEOPLE_QUESTIONS);
  return shuffledQuestions.map(q => ({
    ...q,
    options: shuffleArray(q.options)
  }));
}

interface FamousPeopleGuessGameProps {
  onBack: () => void;
}

export default function FamousPeopleGuessGame({ onBack }: FamousPeopleGuessGameProps) {
  const [questions, setQuestions] = useState<FamousPersonQuestion[]>(() => prepareFamousQuestions());
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      return Number(localStorage.getItem('famous_high_score') || '0');
    }
    return 0;
  });
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);

  // Hints display states
  const [showHint1, setShowHint1] = useState(false);
  const [showHint2, setShowHint2] = useState(false);
  const [usedHintsCount, setUsedHintsCount] = useState(0);

  // Gemini model custom AI hint
  const [aiHint, setAiHint] = useState<string | null>(null);
  const [loadingHint, setLoadingHint] = useState(false);

  const currentQuestion = questions[currentIdx];

  const handleOptionClick = (option: string) => {
    if (selectedOption !== null) return;
    setSelectedOption(option);

    const correct = option === currentQuestion.name;
    setIsCorrect(correct);
    setShowExplanation(true);

    // Score deduction or bonus based on hint usage
    let pointsEarned = 15;
    if (usedHintsCount === 1) pointsEarned = 10;
    if (usedHintsCount === 2) pointsEarned = 7;
    if (aiHint) pointsEarned -= 2; // small penalty for AI help
    if (pointsEarned < 5) pointsEarned = 5;

    if (correct) {
      const finalPoints = pointsEarned + streak * 3;
      setScore(prev => {
        const nextScore = prev + finalPoints;
        const currentSaved = Number(localStorage.getItem('famous_high_score') || '0');
        if (nextScore > currentSaved) {
          localStorage.setItem('famous_high_score', String(nextScore));
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
    setShowHint1(false);
    setShowHint2(false);
    setUsedHintsCount(0);
    setAiHint(null);

    if (currentIdx < questions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setIsGameOver(true);
    }
  };

  const handleRevealHint1 = () => {
    if (showHint1) return;
    setShowHint1(true);
    setUsedHintsCount(prev => prev + 1);
  };

  const handleRevealHint2 = () => {
    if (showHint2) return;
    setShowHint2(true);
    setUsedHintsCount(prev => prev + 1);
  };

  const handleRestart = () => {
    setQuestions(prepareFamousQuestions());
    setCurrentIdx(0);
    setScore(0);
    setStreak(0);
    setMaxStreak(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setShowExplanation(false);
    setShowHint1(false);
    setShowHint2(false);
    setUsedHintsCount(0);
    setAiHint(null);
    setIsGameOver(false);
  };

  const fetchAiHint = async () => {
    if (loadingHint || aiHint) return;
    setLoadingHint(true);

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
              content: `Хэрэглэгч анимэ болон алдартай хүмүүсийг таах тоглоом тоглож байна. Одоогийн таах ёстой алдартай хүн бол "${currentQuestion.name}". Түүний эможинууд нь "${currentQuestion.emojis}". Түүний нэрийг шууд хэлэхгүйгээр, маш нууцлаг, сонирхолтой хэрнээ богинохон 1-2 өгүүлбэр бүхий монгол хэл дээрх хөгжилтэй зөвлөгөө эсвэл сонирхолтой асуултыг үүсгэж өгнө үү. "Чи түүнийг ..." гэж эхэлж болно.`
            }
          ],
          chatType: 'idol'
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setAiHint(data.text);
      } else {
        throw new Error(data.error || 'Gemini-ээс зөвлөгөө авахад алдаа гарлаа.');
      }
    } catch (err) {
      console.error(err);
      setAiHint('Тэрээр дэлхийн хэмжээний маш алдартай эрхэм бөгөөд та түүнийг эможи болон нэмэлт 2 зөвлөгөөгөөр хялбархан тааж чадна!');
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
            id="back_home_famous_btn"
            title="Нүүр хуудас"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500 animate-pulse" />
              <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-semibold">Хүмүүсийг Таах Тоглоом</span>
            </div>
            <h2 className="text-lg font-bold tracking-tight uppercase font-mono">EMOJI FAMOUS GUESSER</h2>
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
          
          {/* Left Panel: Emojis and structured Hints */}
          <div className="flex-1 bg-gradient-to-b from-orange-500/5 to-zinc-900/40 border border-white/5 rounded-2xl p-6 flex flex-col justify-between gap-6 min-h-[350px]">
            <div className="flex justify-between items-center w-full">
              <span className="bg-white/10 border border-white/10 rounded-full px-3 py-1 text-[10px] font-mono">
                Түвшин {currentIdx + 1} / {questions.length}
              </span>
              <span className="text-[10px] font-mono text-orange-500/80 uppercase">
                2 Нэмэлт Зөвлөгөөтэй
              </span>
            </div>

            {/* Large Emoji Clue */}
            <div className="text-center">
              <div className="text-6xl sm:text-7xl py-4 animate-pulse select-none tracking-wider filter drop-shadow-[0_10px_20px_rgba(249,115,22,0.15)]">
                {currentQuestion.emojis}
              </div>
              <p className="text-xs text-zinc-400 font-mono mt-2 uppercase">Эможигоор хэн болохыг таана уу</p>
            </div>

            {/* Interactive 2 Hints Section */}
            <div className="flex flex-col gap-3">
              {/* Hint 1: Profession & Country */}
              <div className="w-full">
                {!showHint1 ? (
                  <button
                    onClick={handleRevealHint1}
                    disabled={selectedOption !== null}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer active:scale-98"
                    id="reveal_hint1_btn"
                  >
                    <span className="flex items-center gap-2">
                      <Globe size={13} className="text-orange-400" />
                      <span>Нэмэлт Зөвлөгөө 1 (Мэргэжил & Улс)</span>
                    </span>
                    <Eye size={14} className="text-zinc-500" />
                  </button>
                ) : (
                  <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-3.5 text-xs animate-fade-in flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-black">🌍 Нэмэлт зөвлөгөө 1:</span>
                    <p className="text-zinc-200 font-medium">{currentQuestion.hint1}</p>
                  </div>
                )}
              </div>

              {/* Hint 2: Accomplishment / Fun Fact */}
              <div className="w-full">
                {!showHint2 ? (
                  <button
                    onClick={handleRevealHint2}
                    disabled={selectedOption !== null}
                    className="w-full py-2.5 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl text-xs font-mono flex items-center justify-between transition-all cursor-pointer active:scale-98"
                    id="reveal_hint2_btn"
                  >
                    <span className="flex items-center gap-2">
                      <Award size={13} className="text-orange-400" />
                      <span>Нэмэлт Зөвлөгөө 2 (Онцлох баримт)</span>
                    </span>
                    <Eye size={14} className="text-zinc-500" />
                  </button>
                ) : (
                  <div className="bg-zinc-950/80 border border-white/10 rounded-xl p-3.5 text-xs animate-fade-in flex flex-col gap-1">
                    <span className="text-[9px] font-mono text-orange-400 uppercase tracking-widest font-black">⚡ Нэмэлт зөвлөгөө 2:</span>
                    <p className="text-zinc-200 font-medium leading-relaxed">{currentQuestion.hint2}</p>
                  </div>
                )}
              </div>

              {/* Gemini AI Custom Clue Button */}
              <div className="w-full">
                <button
                  onClick={fetchAiHint}
                  disabled={loadingHint || selectedOption !== null}
                  className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-orange-500/5 hover:bg-orange-500/15 border border-orange-500/20 text-orange-300 text-[11px] font-semibold uppercase transition-all duration-200 cursor-pointer"
                  id="gemini_people_hint_btn"
                >
                  {loadingHint ? (
                    <>
                      <RefreshCw className="w-3 h-3 animate-spin" />
                      <span>Gemini тусламж авч байна...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3 h-3" />
                      <span>{aiHint ? 'Gemini AI нэмэлт тусламж ирлээ' : 'Gemini AI-аас нэмэлт hint авах'}</span>
                    </>
                  )}
                </button>

                {aiHint && (
                  <div className="mt-2 bg-orange-950/10 border border-orange-500/20 rounded-xl p-3 text-[11px] text-zinc-300 leading-relaxed font-sans relative animate-fade-in">
                    <div className="absolute -top-2 left-4 px-1.5 py-0.5 bg-orange-500 text-[7px] font-mono text-white rounded uppercase tracking-widest font-black">
                      GEMINI-3.5 EXTRA HINT
                    </div>
                    <p className="mt-1 font-medium italic">"{aiHint}"</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Multiple Choices & Solution */}
          <div className="flex-1 flex flex-col justify-between gap-6">
            <div className="flex flex-col gap-4">
              <h3 className="text-sm font-semibold uppercase font-mono tracking-wider text-zinc-400">
                Зөв хүнийг сонгоно уу:
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

            {/* Answer Feedback overlay */}
            {showExplanation && (
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-4 animate-fade-in">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs font-mono uppercase tracking-wide">
                      <Star className="w-4 h-4 text-emerald-400 fill-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
                      <span>Зөв таалаа! (+{15 - (usedHintsCount * 3) + streak * 3} оноо)</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 text-red-400 font-semibold text-xs font-mono uppercase tracking-wide">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>УУЧЛААРАЙ, БУРУУ БАЙНА...</span>
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
                    <p>{currentQuestion.hint2}</p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 cursor-pointer"
                  id="next_famous_level_btn"
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
            <h3 className="text-2xl font-black uppercase tracking-wider font-mono">АМЖИЛТТАЙ ДУУСЛАА!</h3>
            <p className="text-sm text-zinc-400">
              Та эможи ашиглан дэлхийн болон Монголын хамгийн алдартай хүмүүсийг таах сорилтыг амжилттай давлаа!
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 w-full bg-white/5 border border-white/10 p-4 rounded-2xl font-mono text-[11px] sm:text-xs">
            <div className="flex flex-col gap-1 border-r border-white/10">
              <span className="text-zinc-500 uppercase text-[9px]">Нийт Оноо</span>
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
              id="replay_famous_game_btn"
            >
              <RefreshCw size={14} />
              <span>Дахин тоглох</span>
            </button>
            <button
              onClick={onBack}
              className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold uppercase tracking-wider transition-all cursor-pointer"
              id="exit_famous_game_btn"
            >
              <span>Нүүр хуудас руу</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

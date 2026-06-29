import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, ArrowLeft, Bot, Sparkles, User, Dumbbell, Trophy, Bike } from 'lucide-react';
import { ChatMessage } from '../types';

interface IdolCoachChatProps {
  onBack: () => void;
}

const COACH_PROFILES = [
  {
    id: 'idol_mongolz',
    name: 'Esports Coach (The Mongolz)',
    icon: Trophy,
    bgColor: 'from-amber-600/20 to-zinc-950',
    borderColor: 'border-amber-500/30',
    accentColor: 'text-amber-500',
    description: 'The Mongolz багийн CS2 стратеги болон сэтгэл зүйн зөвлөгөө өгөх дасгалжуулагч.',
    suggestedPrompts: [
      'The Mongolz шиг хэрхэн тууштай, амжилттай тоглох вэ?',
      'Тоглоомын үед сэтгэл зүйгээ яаж удирдах вэ?',
      'Teamwork болон харилцаагаа хэрхэн сайжруулах вэ?'
    ]
  },
  {
    id: 'idol_canyon',
    name: 'Cycling Coach (Canyon)',
    icon: Bike,
    bgColor: 'from-orange-600/20 to-zinc-950',
    borderColor: 'border-orange-500/30',
    accentColor: 'text-orange-500',
    description: 'Дугуйн спортын бэлтгэл сургуулилт, тэсвэр тэвчээр, тоног төхөөрөмжийн дасгалжуулагч.',
    suggestedPrompts: [
      'Дугуй унах хурд болон тэсвэр хатуужлаа хэрхэн нэмэгдүүлэх вэ?',
      'Дугуйн бэлтгэлийг ямар хуваариар хийвэл зохимжтой вэ?',
      'Canyon дугуйны давуу тал юу вэ?'
    ]
  },
  {
    id: 'idol_volleyball',
    name: 'Volleyball Coach (Stars Club)',
    icon: Dumbbell,
    bgColor: 'from-blue-600/20 to-zinc-950',
    borderColor: 'border-blue-500/30',
    accentColor: 'text-blue-400',
    description: 'Stars Volleyball Club-ын техникийн болон багийн хамтын ажиллагааны дасгалжуулагч.',
    suggestedPrompts: [
      'Волейболын хаалт болон довтолгоог яаж сайжруулах вэ?',
      'Тэмцээний өмнө ямар бэлтгэл хийвэл хамгийн үр дүнтэй вэ?',
      'Багийн ахлагч хүн ямар чадвартай байх ёстой вэ?'
    ]
  }
];

export default function IdolCoachChat({ onBack }: IdolCoachChatProps) {
  const [selectedCoach, setSelectedCoach] = useState(COACH_PROFILES[0]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`chat_history_${selectedCoach.id}`);
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Welcome message
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Сайн уу! Би бол чиний ${selectedCoach.name}. Спорт, дасгал сургуулилт эсвэл бэлтгэлийн талаар ямар асуулт байна? Би чамд туслахад бэлэн байна! 💪🏆`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, [selectedCoach]);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(`chat_history_${selectedCoach.id}`, JSON.stringify(messages));
    }
  }, [messages, selectedCoach]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue.trim();
    if (!text || isLoading) return;

    if (!textToSend) {
      setInputValue('');
    }

    const userMessage: ChatMessage = {
      id: Math.random().toString(36).substring(7),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          chatType: selectedCoach.id
        })
      });

      const data = await response.json();
      
      if (response.ok && data.text) {
        setMessages(prev => [
          ...prev,
          {
            id: Math.random().toString(36).substring(7),
            role: 'assistant',
            content: data.text,
            timestamp: new Date().toISOString()
          }
        ]);
      } else {
        throw new Error(data.error || 'Хариу ирсэнгүй');
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(36).substring(7),
          role: 'assistant',
          content: `Уучлаарай, холболтын алдаа гарлаа. (Алдаа: ${err.message || 'Unknown'}). Дахин оролдоно уу.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Энэ дасгалжуулагчтай хийсэн чатыг устгах уу?')) {
      localStorage.removeItem(`chat_history_${selectedCoach.id}`);
      setMessages([
        {
          id: 'welcome',
          role: 'assistant',
          content: `Сайн уу! Би бол чиний ${selectedCoach.name}. Спорт, дасгал сургуулилт эсвэл бэлтгэлийн талаар ямар асуулт байна? Би чамд туслахад бэлэн байна! 💪🏆`,
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  const ActiveIcon = selectedCoach.icon;

  return (
    <div className="w-full max-w-5xl bg-zinc-950/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row h-[78vh] shadow-2xl animate-fade-in text-white">
      {/* Sidebar: Coach Selector */}
      <div className="w-full md:w-80 bg-zinc-950 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors uppercase self-start"
          >
            <ArrowLeft size={14} />
            <span>Буцах</span>
          </button>
          
          <div className="flex items-center gap-2 mt-2">
            <Bot className="w-5 h-5 text-orange-500 animate-pulse" />
            <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-semibold">Idol Coach Сонгох</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed mb-2">
            Өөрийн сонирхолд нийцүүлэн Idol дасгалжуулагчаа сонгож, зөвлөгөө аваарай.
          </p>

          <div className="flex flex-col gap-2">
            {COACH_PROFILES.map((coach) => {
              const Icon = coach.icon;
              const isSelected = selectedCoach.id === coach.id;
              return (
                <button
                  key={coach.id}
                  onClick={() => setSelectedCoach(coach)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-center gap-3 active:scale-[0.98] ${
                    isSelected 
                      ? 'bg-white/10 border-orange-500/50 shadow-md shadow-orange-500/5' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className={`p-2 rounded-lg bg-white/5 ${isSelected ? coach.accentColor : 'text-zinc-400'}`}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold uppercase font-mono tracking-wider">{coach.name}</h4>
                    <p className="text-[10px] text-zinc-400 line-clamp-1 mt-0.5">{coach.description}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="mt-6 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-red-950/20 hover:border-red-500/20 border border-white/5 hover:text-red-400 text-zinc-500 text-xs font-mono transition-all uppercase"
          title="Сэдэв шинэчлэх"
        >
          <Trash2 size={13} />
          <span>Сэдэв Шинэчлэх</span>
        </button>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col justify-between bg-gradient-to-b ${selectedCoach.bgColor}`}>
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-white/5 border border-white/10 ${selectedCoach.accentColor}`}>
              <ActiveIcon size={20} className="animate-bounce" style={{ animationDuration: '3s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold uppercase font-mono tracking-wider">{selectedCoach.name}</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wide">GEMINI-3.5-FLASH POWERED</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">AI Mentor</span>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${
                  isUser ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-white/5 border-white/10 text-zinc-300'
                }`}>
                  {isUser ? <User size={14} /> : <Bot size={14} />}
                </div>
                
                <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  isUser 
                    ? 'bg-orange-500 text-white rounded-tr-none font-medium' 
                    : 'bg-zinc-900/90 border border-white/10 text-zinc-100 rounded-tl-none font-sans'
                }`}>
                  {msg.content}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="self-start flex gap-3 max-w-[85%]">
              <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0">
                <Bot size={14} className="animate-spin" />
              </div>
              <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-900/90 border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }} />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Prompts (when chat is empty/welcome) */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-6 py-2 flex flex-col gap-1.5 bg-black/20">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Санал болгох асуултууд:</span>
            <div className="flex flex-col sm:flex-row gap-2">
              {selectedCoach.suggestedPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left text-[11px] text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input Form */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-4 bg-black/40 border-t border-white/10 flex gap-2.5 items-center backdrop-blur-md"
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={`${selectedCoach.name} дасгалжуулагчаас асуух асуултаа энд бичнэ үү...`}
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-full px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { Send, Trash2, ArrowLeft, Bot, Sparkles, User, Dumbbell, Trophy } from 'lucide-react';
import { ChatMessage } from '../types';

interface IdolCoachChatProps {
  onBack: () => void;
}

export default function IdolCoachChat({ onBack }: IdolCoachChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat_history_yuji_nishida');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Welcome message from Yuji Nishida
      setMessages([
        {
          id: 'welcome_yuji',
          role: 'assistant',
          content: 'Сайн уу, Оргил! 🇯🇵🏐 Би байна, Южи Нишида байна. Чиний сургуулийн бэлтгэл, волейболын техник, довтолгоо эсвэл амжилтын талаар асуух зүйл байна уу? Би чамд туслахад үргэлж бэлэн байна! Хамтдаа хичээцгээе! 💪🔥',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history_yuji_nishida', JSON.stringify(messages));
    }
  }, [messages]);

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
          chatType: 'idol'
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
          content: `Уучлаарай Оргил оо, алдаа гарлаа. (Алдаа: ${err.message || 'Unknown'}). Дахин оролдоно уу.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Нишидатай хийсэн чатыг устгах уу?')) {
      localStorage.removeItem('chat_history_yuji_nishida');
      setMessages([
        {
          id: 'welcome_yuji',
          role: 'assistant',
          content: 'Сайн уу, Оргил! 🇯🇵🏐 Би байна, Южи Нишида байна. Чиний сургуулийн бэлтгэл, волейболын техник, довтолгоо эсвэл амжилтын талаар асуух зүйл байна уу? Би чамд туслахад үргэлж бэлэн байна! Хамтдаа хичээцгээе! 💪🔥',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div className="w-full max-w-5xl bg-zinc-950/90 border border-white/10 rounded-3xl overflow-hidden flex flex-col md:flex-row h-[78vh] shadow-2xl animate-fade-in text-white font-sans">
      {/* Sidebar: Coach Info */}
      <div className="w-full md:w-80 bg-zinc-950 border-b md:border-b-0 md:border-r border-white/10 p-5 flex flex-col justify-between shrink-0">
        <div className="flex flex-col gap-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-xs font-mono text-zinc-400 hover:text-white transition-colors uppercase self-start"
            id="back_to_home_btn"
          >
            <ArrowLeft size={14} />
            <span>Буцах</span>
          </button>
          
          <div className="flex items-center gap-2 mt-2">
            <Trophy className="w-5 h-5 text-orange-500 animate-bounce" style={{ animationDuration: '3s' }} />
            <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-semibold">My Idol Coach</span>
          </div>

          <div className="relative group rounded-2xl overflow-hidden bg-white/5 border border-white/10 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-800 border-2 border-orange-500 flex items-center justify-center shrink-0">
                <span className="text-lg font-black text-white">YN</span>
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide text-white uppercase">Yuji Nishida</h3>
                <span className="text-[10px] text-zinc-400 font-mono">Opposite Spiker</span>
              </div>
            </div>
            
            <div className="h-px bg-white/10" />

            <div className="flex flex-col gap-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Шигшээ баг:</span>
                <span className="text-zinc-300 font-medium">Japan 🇯🇵</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Өндөр:</span>
                <span className="text-zinc-300 font-medium">1.86 м</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Төрсөн өдөр:</span>
                <span className="text-zinc-300 font-medium">2000.01.30</span>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Японы шигшээ багийн шилдэг довтлогч, волейболын од Южи Нишидагаас мэргэжлийн бэлтгэл сургуулилт, зөвлөгөөг аваарай.
          </p>
        </div>

        <button
          onClick={handleClearChat}
          className="mt-6 flex items-center justify-center gap-2 p-2.5 rounded-xl bg-white/5 hover:bg-red-950/20 hover:border-red-500/20 border border-white/5 hover:text-red-400 text-zinc-500 text-xs font-mono transition-all uppercase cursor-pointer"
          id="clear_chat_yuji_btn"
        >
          <Trash2 size={13} />
          <span>Сэдэв Шинэчлэх</span>
        </button>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col justify-between bg-gradient-to-b from-orange-600/10 to-zinc-950">
        {/* Chat Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-black/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-orange-500">
              <Dumbbell size={20} className="animate-spin" style={{ animationDuration: '10s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold uppercase font-mono tracking-wider">Yuji Nishida AI Coach</h3>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </div>
              <p className="text-[10px] text-zinc-400 font-mono mt-0.5 uppercase tracking-wide">GEMINI-3.5-FLASH POWERED</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-orange-400 animate-pulse" />
            <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest hidden sm:inline">Idol Coach</span>
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
                  {isUser ? <User size={14} /> : <span className="text-xs font-bold">YN</span>}
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

        {/* Suggested Prompts */}
        {messages.length <= 1 && !isLoading && (
          <div className="px-6 py-2 flex flex-col gap-1.5 bg-black/20">
            <span className="text-[10px] font-mono text-white/30 uppercase tracking-widest">Асуух жишээ асуултууд:</span>
            <div className="flex flex-col sm:flex-row gap-2">
              {[
                'Чи хэрхэн волейболын шилдэг довтлогч болсон бэ?',
                'Өндөр маань 1.86м байхад өндөр хамгаалагчдын дээгүүр яаж довтлох вэ?',
                'Бэлтгэлийн үед шантрах үедээ сэтгэл зүйгээ хэрхэн бэлддэг вэ?'
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt)}
                  className="text-left text-[11px] text-zinc-300 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl px-3 py-2 transition-all duration-200 active:scale-95 cursor-pointer"
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
            placeholder="Нишида дасгалжуулагчаас асуух асуултаа энд бичнэ үү..."
            className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-full px-5 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-11 h-11 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0"
            id="send_yuji_msg_btn"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

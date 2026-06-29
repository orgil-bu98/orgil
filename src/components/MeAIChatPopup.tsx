import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, User, RefreshCw, Minus } from 'lucide-react';
import { ChatMessage } from '../types';

export default function MeAIChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Load chat history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('chat_history_me_ai');
    if (saved) {
      setMessages(JSON.parse(saved));
    } else {
      // Welcome message from Me-AI (Orgil's AI avatar)
      setMessages([
        {
          id: 'welcome_me',
          role: 'assistant',
          content: 'Сайн уу! ✌️ Намайг Оргилын AI туслах (Me-AI) гэдэг. Би 111-р сургуульд сурдаг, волейболд баруун гараараа довтолдог Оргил байна! Надаас миний тухай, волейболын бэлтгэл эсвэл дуртай волейболчны маань талаар асуугаарай!',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  }, []);

  // Save to localStorage when messages change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('chat_history_me_ai', JSON.stringify(messages));
    }
  }, [messages]);

  // Alert user about unread messages when closed
  useEffect(() => {
    if (!isOpen && messages.length > 1) {
      setHasUnread(true);
    }
  }, [messages, isOpen]);

  // Scroll to bottom
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

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
          chatType: 'me'
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
          content: `Холболтын алдаа гарлаа. (Алдаа: ${err.message || 'Unknown'}). Түр хүлээгээд дахин бичээрэй.`,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Оргил-AI-тай хийсэн чатыг устгах уу?')) {
      localStorage.removeItem('chat_history_me_ai');
      setMessages([
        {
          id: 'welcome_me',
          role: 'assistant',
          content: 'Сайн уу! ✌️ Намайг Оргилын AI туслах (Me-AI) гэдэг. Оргилын тухай, түүний сонирхол, дугуй, волейбол эсвэл хамтардаг спонсоруудын талаар надаас юуг ч хамаагүй асуугаарай!',
          timestamp: new Date().toISOString()
        }
      ]);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[120] font-sans">
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[350px] sm:w-[380px] h-[500px] bg-zinc-950/95 border border-white/10 rounded-2xl shadow-2xl flex flex-col justify-between overflow-hidden animate-fade-in text-white backdrop-blur-md">
          {/* Header */}
          <div className="px-4 py-3 bg-zinc-900 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Bot size={16} />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold uppercase font-mono tracking-wider">Оргил (Me-AI)</h4>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[9px] text-white/40 uppercase tracking-widest font-mono">My Virtual Avatar</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-white/40 hover:text-white rounded-md hover:bg-white/5 transition-all"
                title="Шинээр эхлэх"
              >
                <RefreshCw size={13} />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-white/40 hover:text-white rounded-md hover:bg-white/5 transition-all"
                title="Хаах"
              >
                <Minus size={15} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 bg-gradient-to-b from-zinc-950 to-zinc-900/40">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2 max-w-[85%] ${isUser ? 'self-end flex-row-reverse' : 'self-start'}`}
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border text-[10px] ${
                    isUser ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'bg-white/5 border-white/10 text-zinc-300'
                  }`}>
                    {isUser ? <User size={11} /> : <Bot size={11} />}
                  </div>
                  <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    isUser 
                      ? 'bg-orange-500 text-white rounded-tr-none font-medium' 
                      : 'bg-zinc-900/90 border border-white/5 text-zinc-100 rounded-tl-none font-sans'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="self-start flex gap-2 max-w-[85%]">
                <div className="w-6 h-6 rounded-full bg-white/5 border border-white/10 text-zinc-300 flex items-center justify-center shrink-0">
                  <Bot size={11} className="animate-spin" />
                </div>
                <div className="p-3 rounded-2xl rounded-tl-none bg-zinc-900/90 border border-white/5 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.15s' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick options */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 py-2 flex flex-col gap-1 bg-black/10">
              <span className="text-[9px] font-mono text-white/30 uppercase tracking-widest">Асуух жишээ:</span>
              <div className="flex flex-col gap-1">
                {[
                  'Чи аль сургуульд сурдаг вэ?',
                  'Волейбол тоглохдоо аль гараараа довтолдог вэ?',
                  'Чиний шүтдэг волейболчин хэн бэ?'
                ].map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(prompt)}
                    className="text-left text-[10px] text-zinc-400 hover:text-white bg-white/5 rounded-lg px-2.5 py-1.5 transition-colors"
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
            className="p-3 bg-zinc-950 border-t border-white/10 flex gap-2 items-center"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Оргилтой ярилцах уу..."
              className="flex-1 bg-white/5 border border-white/10 hover:border-white/20 focus:border-orange-500/50 rounded-full px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none transition-colors"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="w-8 h-8 rounded-full bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer shrink-0"
            >
              <Send size={12} />
            </button>
          </form>
        </div>
      )}

      {/* Floating Messenger Icon Button */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          setHasUnread(false);
        }}
        className={`w-14 h-14 rounded-full flex items-center justify-center text-white transition-all shadow-lg active:scale-90 cursor-pointer relative ${
          isOpen 
            ? 'bg-zinc-900 border border-white/10' 
            : 'bg-orange-500 hover:bg-orange-600 border border-transparent animate-pulse'
        }`}
        title="Me-AI-тай чатлах"
        style={{ animationDuration: '3s' }}
      >
        {isOpen ? <X size={20} /> : <MessageSquare size={22} />}
        
        {/* Unread dot */}
        {hasUnread && !isOpen && (
          <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-red-500 border border-zinc-950 flex items-center justify-center text-[8px] font-bold text-white">
            !
          </span>
        )}
      </button>
    </div>
  );
}

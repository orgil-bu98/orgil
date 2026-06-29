import { useEffect, useRef, useState } from 'react';
import { Menu, X, ArrowRight, Compass, Sparkles, Map, Database, ArrowUpRight, Layers, Volume2, VolumeX, Play, Pause, Music, Phone, Mail, Instagram, Facebook, Bot } from 'lucide-react';
import MeAIChatPopup from './components/MeAIChatPopup';
import IdolCoachChat from './components/IdolCoachChat';

const SPOTLIGHT_R = 260;
const BG_IMAGE_1 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_195923_b0ba8ace-1d1d-4f2c-9a28-1ab84b330680.png&w=1280&q=85";
const BG_IMAGE_2 = "https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260609_201152_bba90a12-bf12-459f-91f0-51f237dbaf3b.png&w=1280&q=85";

interface RevealLayerProps {
  image: string;
  cursorX: number;
  cursorY: number;
}

function RevealLayer({ image, cursorX, cursorY }: RevealLayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealRef = useRef<HTMLDivElement | null>(null);
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDimensions({ width: window.innerWidth, height: window.innerHeight });
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const revealDiv = revealRef.current;
    if (!canvas || !revealDiv) return;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    if (cursorX === -999 || cursorY === -999) {
      revealDiv.style.webkitMaskImage = 'none';
      revealDiv.style.maskImage = 'none';
      return;
    }

    const gradient = ctx.createRadialGradient(
      cursorX, cursorY, 0,
      cursorX, cursorY, SPOTLIGHT_R
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.75)');
    gradient.addColorStop(0.75, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(0.88, 'rgba(255, 255, 255, 0.12)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    try {
      const dataUrl = canvas.toDataURL();
      revealDiv.style.webkitMaskImage = `url(${dataUrl})`;
      revealDiv.style.maskImage = `url(${dataUrl})`;
      revealDiv.style.webkitMaskSize = '100% 100%';
      revealDiv.style.maskSize = '100% 100%';
    } catch (e) {
      console.error(e);
    }
  }, [cursorX, cursorY, dimensions]);

  return (
    <>
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ display: 'none' }} />
      <div 
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{ backgroundImage: `url(${image})` }}
      />
    </>
  );
}

export default function App() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number | null>(null);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });
  const [activeTab, setActiveTab] = useState('Home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [digging, setDigging] = useState(false);

  // Audio Player State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.4);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [audioExpanded, setAudioExpanded] = useState(false);

  const tracks = [
    { name: 'Lithos Deep Ambient', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3' },
    { name: 'Mantle Flow Synth', url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' }
  ];

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.log("Audio play failed, user gesture might be needed first: ", err);
          setIsPlaying(false);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentTrack]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY };
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchstart', handleTouchMove);

    const update = () => {
      if (mouse.current.x !== -999 && mouse.current.y !== -999) {
        if (smooth.current.x === -999) {
          smooth.current = { ...mouse.current };
        } else {
          smooth.current.x += (mouse.current.x - smooth.current.x) * 0.1;
          smooth.current.y += (mouse.current.y - smooth.current.y) * 0.1;
        }
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }
      rafRef.current = requestAnimationFrame(update);
    };
    rafRef.current = requestAnimationFrame(update);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleStartDigging = () => {
    setDigging(true);
    setTimeout(() => setDigging(false), 2000);
  };

  return (
    <div className="min-h-screen bg-white tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
        {/* Brand Logo (Replacing logo and text with the uploaded symbol image) */}
        <div className="z-[110] flex items-center">
          <svg 
            viewBox="0 0 512 512" 
            className="w-[42px] h-[42px] text-white hover:opacity-95 transition-opacity cursor-pointer select-none active:scale-95 duration-200" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="256" cy="256" r="248" fill="black" stroke="white" strokeWidth="8" />
            <path 
              d="M 256,64 
                 C 350,64 425,230 432,340 
                 C 438,390 405,420 360,420 
                 C 290,420 222,420 152,420 
                 C 107,420 74,390 80,340 
                 C 87,230 162,64 256,64 Z" 
              fill="none" 
              stroke="white" 
              strokeWidth="28" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
            <path d="M 125,335 C 140,280 180,230 220,230" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" />
            <path d="M 387,335 C 372,280 332,230 292,230" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" />
            <path d="M 256,105 C 245,160 200,210 185,260" fill="none" stroke="white" strokeWidth="22" strokeLinecap="round" />
            <path d="M 160,256 C 200,195 312,195 352,256 C 312,317 200,317 160,256 Z" fill="black" stroke="white" strokeWidth="22" strokeLinejoin="round" />
            <circle cx="256" cy="256" r="38" fill="white" />
            <circle cx="242" cy="242" r="14" fill="black" />
            <circle cx="236" cy="236" r="5" fill="white" />
          </svg>
        </div>

        {/* Center Pill Menu (Desktop only) */}
        <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1 z-50">
          {['Home', 'Бидний тухай', '🤖 My Idol'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                activeTab === tab 
                  ? 'bg-white text-black shadow-sm' 
                  : 'text-white/80 hover:bg-white/20 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Right Action (Desktop only with Music Player) */}
        <div className="hidden md:flex items-center gap-4 z-50">
          <div className="flex items-center bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-3 py-1.5 gap-2.5 transition-all duration-300">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all active:scale-95 cursor-pointer"
              title={isPlaying ? "Дууг зогсоох" : "Дууг тоглуулах"}
            >
              {isPlaying ? <Pause size={14} className="fill-white" /> : <Play size={14} className="fill-white translate-x-0.5" />}
            </button>
            
            <div className="flex flex-col select-none">
              <span className="text-[9px] font-mono text-white/50 leading-none">AMB_SOUND</span>
              <span className="text-[11px] font-medium text-white max-w-[110px] truncate leading-tight">
                {tracks[currentTrack].name}
              </span>
            </div>

            {/* Simulated Animated Sound Wave Bars */}
            <div className="flex items-end gap-[2px] h-4 px-1.5">
              <div className={`w-[2px] bg-orange-500 rounded-full ${isPlaying ? 'animate-soundwave' : 'h-1'}`} style={{ animationDelay: '0.1s' }} />
              <div className={`w-[2px] bg-orange-500 rounded-full ${isPlaying ? 'animate-soundwave' : 'h-1.5'}`} style={{ animationDelay: '0.3s' }} />
              <div className={`w-[2px] bg-orange-500 rounded-full ${isPlaying ? 'animate-soundwave' : 'h-1'}`} style={{ animationDelay: '0.5s' }} />
              <div className={`w-[2px] bg-orange-500 rounded-full ${isPlaying ? 'animate-soundwave' : 'h-2'}`} style={{ animationDelay: '0.2s' }} />
            </div>

            {/* Mute Button */}
            <button 
              onClick={() => setIsMuted(!isMuted)} 
              className="text-white/60 hover:text-white transition-colors cursor-pointer"
              title={isMuted ? "Дууг нээх" : "Дууг хаах"}
            >
              {isMuted ? <VolumeX size={14} /> : <Volume2 size={14} />}
            </button>

            {/* Change track button */}
            <button
              onClick={() => setCurrentTrack((currentTrack + 1) % tracks.length)}
              className="text-[10px] font-mono text-orange-400 hover:text-orange-300 font-semibold uppercase px-1.5 transition-colors border-l border-white/10 cursor-pointer"
              title="Дараагийн ая"
            >
              NEXT
            </button>
          </div>

          <button className="bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-black/10 active:scale-95">
            Sign Up
          </button>
        </div>

        {/* Mobile Hamburger Trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white hover:bg-white/10 p-2 rounded-full transition-all duration-200 z-[110]"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* HTML5 Audio Element */}
      <audio 
        ref={audioRef} 
        src={tracks[currentTrack].url} 
        loop 
        preload="auto"
      />

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-lg z-[105] flex flex-col justify-between p-8 pt-24 md:hidden animate-fade-in">
          <div className="flex flex-col gap-6">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-500/80 mb-2">Navigation Menu</span>
            {['Home', 'Бидний тухай', '🤖 My Idol'].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setMobileMenuOpen(false);
                }}
                className={`text-left text-3xl font-light transition-colors ${
                  activeTab === tab ? 'text-white font-normal' : 'text-white/60 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-5 border-t border-white/10 pt-6">
            {/* Mobile Music Player Control */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Music className="text-orange-500 w-4 h-4 animate-pulse" />
                  <span className="text-xs text-white/50 font-mono">LITHOS FM</span>
                </div>
                <button
                  onClick={() => setCurrentTrack((currentTrack + 1) % tracks.length)}
                  className="text-xs font-mono text-orange-400 font-semibold"
                >
                  СОЛИХ (NEXT)
                </button>
              </div>

              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-white truncate max-w-[180px]">{tracks[currentTrack].name}</p>
                <button 
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="bg-orange-500 text-white w-9 h-9 rounded-full flex items-center justify-center active:scale-90"
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
                </button>
              </div>

              <div className="flex items-center gap-2">
                {isMuted ? <VolumeX className="text-white/40" size={14} /> : <Volume2 className="text-white/40" size={14} />}
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1" 
                  value={volume} 
                  onChange={(e) => {
                    setVolume(parseFloat(e.target.value));
                    setIsMuted(false);
                  }}
                  className="w-full accent-orange-500 h-1 bg-white/20 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <button className="w-full bg-white text-gray-900 text-base font-semibold py-4 rounded-full hover:bg-gray-100 transition-all active:scale-95 text-center">
              Sign Up
            </button>
            <p className="text-xs text-white/40 text-center font-mono">
              Lithos Geology Interactive Engine © 2026
            </p>
          </div>
        </div>
      )}

      {/* Main Hero Section */}
      <section 
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: '100dvh' }}
      >
        {/* Base Image Layer (Ken Burns slow zoom-out effect) */}
        <div 
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BG_IMAGE_1})` }}
        />

        {/* Dynamic Cursor Spotlight Reveal Layer */}
        <RevealLayer 
          image={BG_IMAGE_2}
          cursorX={cursorPos.x}
          cursorY={cursorPos.y}
        />

        {/* Ambient Dark Overlay to enhance contrast and readability */}
        <div className="absolute inset-0 bg-black/35 z-20 pointer-events-none" />

        {/* Center Heading Block */}
        {activeTab === 'Home' ? (
          <>
            <div className="absolute top-[35%] sm:top-[40%] left-0 right-0 flex flex-col items-center text-center px-5 pointer-events-none z-40">
              <h1 className="text-white leading-[1.1] flex flex-col items-center">
                <span 
                  className="block font-playfair italic font-normal text-4xl sm:text-6xl md:text-7xl hero-anim hero-reveal"
                  style={{ letterSpacing: '-0.02em', animationDelay: '0.25s' }}
                >
                  Намайг Оргил гэдэг
                </span>
                <span 
                  className="block font-sans font-extrabold text-3xl sm:text-5xl md:text-6xl text-orange-500 mt-2 hero-anim hero-reveal"
                  style={{ letterSpacing: '-0.05em', animationDelay: '0.45s' }}
                >
                  14 настай
                </span>
              </h1>
              
              <button 
                onClick={() => setActiveTab('Бидний тухай')}
                className="pointer-events-auto group mt-6 flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-xs font-semibold text-white tracking-wider uppercase font-mono">Бидний тухай видео</span>
                <ArrowRight size={14} className="text-white group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>

            {/* Interactive Indicator (Floating element that encourages interaction) */}
            {cursorPos.x === -999 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 text-center pointer-events-none flex flex-col items-center gap-2 animate-bounce">
                <Compass className="text-white/40 w-8 h-8 animate-spin" style={{ animationDuration: '8s' }} />
                <span className="text-xs text-white/60 font-mono tracking-wider">MOVE CURSOR TO DISCOVER</span>
              </div>
            )}

            {/* Bottom-Left Nike & Adidas Logo Links */}
            <div 
              className="absolute bottom-10 left-5 sm:bottom-24 sm:left-10 md:left-14 z-50 flex flex-col items-start gap-2 hero-anim hero-fade bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              style={{ animationDelay: '0.7s' }}
            >
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">OFFICIAL PARTNERS</span>
              <div className="flex items-center gap-3">
                <a 
                  href="https://www.nike.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  title="Nike вэбсайт руу зочлох"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-14 h-8 text-white group-hover:text-orange-500 transition-colors duration-300"
                  >
                    <path d="M21 6.5c-2.5 2.1-6.1 4.7-9.8 6.5-3 .9-5.7 1.1-7 .9-.6-.1-.8-.3-.4-.7 1.3-1.4 3.7-3.6 6.8-5.4 2.8-1.6 5.6-2.6 7.2-2.8.5-.1.7 0 .4.4-1.2 1.8-1 2.1 0 .7.8-1.1 1.6-2.1 2.2-2.5.2-.2.3-.2.3-.2 0 .1-.1.3-.3.7z" />
                  </svg>
                </a>
                
                <a 
                  href="https://www.adidas.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  title="Adidas вэбсайт руу зочлох"
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="currentColor" 
                    className="w-12 h-8 text-white group-hover:text-orange-500 transition-colors duration-300"
                  >
                    <polygon points="1.5,18 4.5,18 9.5,8 6.5,8" />
                    <polygon points="7,18 10,18 16,6 13,6" />
                    <polygon points="12.5,18 15.5,18 22.5,4 19.5,4" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Middle-Left Sponsors Block */}
            <div 
              className="absolute top-[32%] sm:top-[38%] left-5 sm:left-10 md:left-14 -translate-y-1/2 z-50 flex flex-col items-start gap-2 hero-anim hero-fade bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              style={{ animationDelay: '0.6s' }}
            >
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">SPONSORS</span>
              <div className="flex flex-col gap-3 w-full">
                <a 
                  href="https://mongolz.shop" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex flex-col items-start gap-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 w-full"
                  title="The MongolZ Merch Shop руу зочлох"
                >
                  <span className="font-sans font-black text-sm text-white group-hover:text-orange-500 transition-colors duration-300 tracking-wider">THE MONGOLZ</span>
                  <span className="text-[8px] text-white/50 group-hover:text-white/80 transition-colors duration-300 font-mono">MERCH STORE</span>
                </a>

                <a 
                  href="https://www.canyon.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center justify-center p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95 w-full"
                  title="Canyon вэбсайт руу зочлох"
                >
                  <svg 
                    viewBox="0 0 180 40" 
                    fill="none" 
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-24 h-6 text-white group-hover:text-orange-500 transition-all duration-300"
                  >
                    <g transform="skewX(-15)">
                      {/* C */}
                      <path d="M 28,8 A 12,12 0 0,0 16,20 A 12,12 0 0,0 28,32 L 30,27 A 7,7 0 0,1 21,20 A 7,7 0 0,1 30,13 Z" fill="currentColor" />
                      {/* A */}
                      <path d="M 44,8 L 34,32 L 39,32 L 41.5,25 L 51.5,25 L 54,32 L 59,32 Z M 46.5,12 L 50.5,21 L 43,21 Z" fill="currentColor" />
                      {/* N */}
                      <path d="M 66,8 L 66,32 L 71,32 L 71,16 L 84,32 L 89,32 L 89,8 L 84,8 L 84,24 L 71,8 Z" fill="currentColor" />
                      {/* Y */}
                      <path d="M 96,8 L 104,20 L 104,32 L 109,32 L 109,20 L 117,8 L 111,8 L 106.5,15.5 L 102,8 Z" fill="currentColor" />
                      {/* O */}
                      <path d="M 134,8 A 12,12 0 0,0 122,20 A 12,12 0 0,0 134,32 A 12,12 0 0,0 146,20 A 12,12 0 0,0 134,8 Z M 134,13 A 7,7 0 0,1 139,20 A 7,7 0 0,1 134,27 A 7,7 0 0,1 129,20 A 7,7 0 0,1 134,13 Z" fill="currentColor" />
                      {/* N */}
                      <path d="M 153,8 L 153,32 L 158,32 L 158,16 L 171,32 L 176,32 L 176,8 L 171,8 L 171,24 L 158,8 Z" fill="currentColor" />
                    </g>
                  </svg>
                </a>
              </div>
            </div>

            {/* Middle-Right Instagram Block */}
            <div 
              className="absolute top-[32%] sm:top-[38%] right-5 sm:right-10 md:right-14 -translate-y-1/2 z-50 flex flex-col items-end gap-2 hero-anim hero-fade bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10"
              style={{ animationDelay: '0.65s' }}
            >
              <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">INSTAGRAM</span>
              <div className="flex flex-col gap-2 w-full">
                <a 
                  href="https://www.instagram.com/tamirmadsuey" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  title="Tamir's Instagram"
                >
                  <Instagram size={18} className="text-white group-hover:text-orange-500 transition-colors duration-300" />
                  <span className="text-[11px] text-white/80 group-hover:text-white transition-colors duration-300 font-mono">tamirmadsuey</span>
                </a>
                <a 
                  href="https://www.instagram.com/orgil9_" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  title="Orgil's Instagram"
                >
                  <Instagram size={18} className="text-white group-hover:text-orange-500 transition-colors duration-300" />
                  <span className="text-[11px] text-white/80 group-hover:text-white transition-colors duration-300 font-mono">orgil9_</span>
                </a>
              </div>
            </div>

            {/* Bottom-Right Contact Block */}
            <div 
              className="absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 w-full sm:w-[280px] flex flex-col items-start gap-4 z-50 hero-anim hero-fade bg-black/40 backdrop-blur-md p-5 rounded-2xl border border-white/10"
              style={{ animationDelay: '0.85s' }}
            >
              <div className="flex items-center gap-2 text-white/40 font-mono text-[10px] tracking-widest uppercase">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span>Холбоо барих</span>
              </div>
              
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                    <Phone size={14} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Утас</p>
                    <a href="tel:94141978" className="text-xs sm:text-sm font-medium text-white hover:text-orange-400 transition-colors">9414 1978</a>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/80">
                    <Mail size={14} className="text-orange-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-mono text-white/40 uppercase tracking-wider">Мэйл</p>
                    <a href="mailto:orgiltseren814@gmail.com" className="text-xs sm:text-sm font-medium text-white hover:text-orange-400 transition-colors break-all">orgiltseren814@gmail.com</a>
                  </div>
                </div>
              </div>
            </div>

            {/* Corner Branding Details (Geographical coordination accents) */}
            <div className="hidden lg:flex absolute top-1/2 right-6 -translate-y-1/2 flex-col items-center gap-6 z-40 text-white/30 font-mono text-[9px] tracking-widest uppercase [writing-mode:vertical-lr]">
              <span className="hover:text-white/70 transition-colors cursor-default">LAT 40.7128° N</span>
              <div className="h-12 w-[1px] bg-white/20" />
              <span className="hover:text-white/70 transition-colors cursor-default">LON 74.0060° W</span>
              <div className="h-12 w-[1px] bg-white/20" />
              <span className="text-orange-500/60 font-semibold">CRUST DEPTH: 35KM</span>
            </div>
          </>
        ) : activeTab === 'Бидний тухай' ? (
          /* 'Бидний тухай' Active Tab Content with Premium YouTube Player */
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-8 md:p-16 bg-black/60 backdrop-blur-md overflow-y-auto pt-24 pb-12">
            <div className="w-full max-w-5xl bg-zinc-950/80 border border-white/10 rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row gap-8 items-center shadow-2xl animate-fade-in">
              {/* Video Column */}
              <div className="w-full lg:w-3/5 flex flex-col gap-3">
                <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-lg bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/UckCrXDhy7o?rel=0"
                    title="Бидний тухай видео"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0 w-full h-full"
                  />
                </div>
                <span className="text-[10px] font-mono text-white/40 tracking-wider text-center uppercase">
                  БИЧЛЭГ: CANYON & ADVENTURE LIFESTYLE
                </span>
              </div>

              {/* Info Column */}
              <div className="w-full lg:w-2/5 flex flex-col items-start gap-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500 animate-pulse" />
                  <span className="text-xs font-mono text-orange-500 uppercase tracking-widest font-semibold">БИДНИЙ ТУХАЙ</span>
                </div>
                
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-tight">
                    Оргил & Тамир
                  </h2>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    Бид бол спорт, адал явдал, дугуйн спортод хайртай залуус. Намайг Оргил гэдэг, би 14 настай. Бид өөрсдийн сонирхол, өдөр тутмын амьдралын хэв маягаа энэхүү вэб хуудсаараа дамжуулан хуваалцаж байна.
                  </p>
                </div>

                <div className="w-full border-t border-white/10 my-1" />

                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase w-20">Спонсор:</span>
                    <div className="flex gap-2 flex-wrap">
                      <a 
                        href="https://mongolz.shop" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-md font-mono transition-colors"
                      >
                        The Mongolz Merch
                      </a>
                      <a 
                        href="https://www.canyon.com" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 px-2.5 py-1 rounded-md font-mono transition-colors"
                      >
                        Canyon Bikes
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono text-zinc-500 uppercase w-20">Хамтрагчид:</span>
                    <span className="text-xs text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-md font-mono">Nike, Adidas</span>
                  </div>
                </div>

                <button 
                  onClick={() => setActiveTab('Home')}
                  className="mt-4 px-6 py-2.5 rounded-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold tracking-wider uppercase transition-all duration-300 hover:scale-105 active:scale-95"
                >
                  Нүүр хуудас руу буцах
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* '🤖 My Idol' Active Tab Content with Chat Window */
          <div className="absolute inset-0 z-40 flex items-center justify-center p-4 sm:p-8 md:p-12 bg-black/60 backdrop-blur-md overflow-y-auto pt-24 pb-12">
            <IdolCoachChat onBack={() => setActiveTab('Home')} />
          </div>
        )}
      </section>

      {/* Decorative success feedback notification */}
      {digging && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[150] bg-zinc-900 border border-zinc-800 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in">
          <div className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <p className="text-xs font-mono tracking-wide">LITHOS CRUST DEEP SCAN IN PROGRESS...</p>
        </div>
      )}

      {/* Me-AI floating messenger chat popup */}
      <MeAIChatPopup />
    </div>
  );
}

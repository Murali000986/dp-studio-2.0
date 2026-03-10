import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Plus, 
  Eye, 
  Headphones, 
  Zap, 
  Link as LinkIcon, 
  MessageSquare, 
  Star, 
  Users,
  ChevronDown
} from 'lucide-react';
import { SERVICES, FAQS, PROJECTS } from './constants';

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBlurScreen, setShowBlurScreen] = useState(true);
  const [selectedService, setSelectedService] = useState(Object.keys(SERVICES)[0]);
  const [isScrolled, setIsScrolled] = useState(false);
  const [avgColor, setAvgColor] = useState('rgba(255, 183, 0, 0.2)');
  const [beatIntensity, setBeatIntensity] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const setupAudioReactivity = () => {
    if (!videoRef.current) return;

    // Initialize Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx = new AudioContextClass();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(videoRef.current);
    
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    
    analyser.fftSize = 256;
    audioCtxRef.current = audioCtx;
    analyserRef.current = analyser;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!analyserRef.current || !videoRef.current || !canvasRef.current) return;

      // 1. Audio Beat Detection
      analyserRef.current.getByteFrequencyData(dataArray);
      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const average = sum / bufferLength;
      // Normalize intensity (0 to 1)
      const intensity = Math.min(average / 128, 1);
      setBeatIntensity(intensity);

      // 2. Color Syncing
      const ctx = canvasRef.current.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 10, 10);
        const frameData = ctx.getImageData(0, 0, 10, 10).data;
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < frameData.length; i += 4) {
          r += frameData[i];
          g += frameData[i + 1];
          b += frameData[i + 2];
        }
        const count = frameData.length / 4;
        setAvgColor(`rgba(${Math.round(r/count)}, ${Math.round(g/count)}, ${Math.round(b/count)}, 0.4)`);
      }

      animationFrameRef.current = requestAnimationFrame(analyze);
    };

    analyze();
  };

  const handleStart = () => {
    setShowBlurScreen(false);
    if (videoRef.current) {
      videoRef.current.play().then(() => {
        setupAudioReactivity();
      }).catch(err => console.log("Video play blocked", err));
    }
  };

  const toggleVideoPlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play();
      } else {
        videoRef.current.pause();
      }
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <div className="min-h-screen font-sans selection:bg-amber-500 selection:text-black bg-[#0a0a0a] overflow-x-hidden">
      {/* Hidden canvas for color sampling */}
      <canvas ref={canvasRef} width="10" height="10" className="hidden" />

      {/* Dynamic Background Glow */}
      <div 
        className="fixed inset-0 pointer-events-none z-0 transition-colors duration-700"
        style={{ 
          background: `radial-gradient(circle at 50% 30%, ${avgColor} 0%, transparent 70%)`,
          transform: `scale(${1 + beatIntensity * 0.1})`,
          opacity: 0.5 + beatIntensity * 0.5
        }}
      />

      {/* Blur Screen Overlay */}
      <AnimatePresence>
        {showBlurScreen && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-[#0f0f0f]"
          >
            <button 
              onClick={handleStart}
              className="text-2xl text-white cursor-pointer hover:scale-110 transition-transform font-display tracking-widest"
            >
              CLICK TO ENTER THE EDIT
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav 
        className={`fixed top-0 left-0 w-full z-100 transition-all duration-500 h-20 flex items-center px-6 md:px-[100px] gap-8 ${
          isScrolled ? 'bg-black/80 backdrop-blur-xl border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <a href="/" className="flex items-center gap-3 group">
          <img 
            src="https://picsum.photos/seed/dp-logo/100/100" 
            alt="DP Studio Logo" 
            className={`w-10 h-10 rounded-full object-cover transition-transform duration-300 group-hover:scale-110 ${!showBlurScreen ? 'animate-core' : ''}`}
          />
          <p className="font-display text-2xl glitch tracking-wider group-hover:text-red-600 transition-colors whitespace-nowrap">
            DP STUDIO 2.0
          </p>
          <img 
            src="https://cdn-icons-png.flaticon.com/512/7641/7641727.png" 
            className="w-5 h-5" 
            alt="verified" 
          />
        </a>

        <div className="hidden lg:flex flex-1 h-[2px] bg-white/20 rounded-full" />

        <div className="hidden md:flex items-center gap-8">
          <a href="#home" className="text-lg hover:translate-y-1 transition-transform">Home</a>
          <a href="#features" className="text-lg hover:translate-y-1 transition-transform">Features</a>
          <a href="#services" className="text-lg hover:translate-y-1 transition-transform">Services</a>
          <a href="#faq" className="text-lg hover:translate-y-1 transition-transform">FAQ</a>
          
          <a href="https://wa.me/919092783899" className="button-main px-5 py-2 rounded-lg flex items-center gap-2 font-semibold hover:scale-105 hover:-translate-y-1 transition-all">
            Get Started <Plus size={20} />
          </a>
        </div>

        <button onClick={toggleMenu} className="md:hidden ml-auto">
          <Menu size={32} />
        </button>
      </nav>

      {/* Mobile Overlay Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ height: 0 }}
            animate={{ height: '100%' }}
            exit={{ height: 0 }}
            className="fixed inset-0 z-[110] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center overflow-hidden"
          >
            <button onClick={toggleMenu} className="absolute top-6 right-6">
              <X size={48} />
            </button>
            <div className="flex flex-col gap-8 text-center">
              <a href="#home" onClick={toggleMenu} className="text-4xl font-display text-white/60 hover:text-white transition-colors">Home</a>
              <a href="#features" onClick={toggleMenu} className="text-4xl font-display text-white/60 hover:text-white transition-colors">Features</a>
              <a href="#services" onClick={toggleMenu} className="text-4xl font-display text-white/60 hover:text-white transition-colors">Services</a>
              <a href="#faq" onClick={toggleMenu} className="text-4xl font-display text-white/60 hover:text-white transition-colors">FAQ</a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section id="home" className="pt-32 pb-20 px-6 md:px-[65px] flex flex-col lg:flex-row items-center justify-center gap-16 min-h-screen relative z-10">
        <div 
          onClick={toggleVideoPlay}
          className="relative w-full max-w-[671px] aspect-video rounded-2xl overflow-hidden transition-all duration-75 shadow-2xl cursor-pointer"
          style={{ 
            transform: `scale(${1 + beatIntensity * 0.08}) rotate(${beatIntensity * 1}deg)`,
            boxShadow: `0 0 ${30 + beatIntensity * 100}px ${avgColor}`,
            filter: `brightness(${1 + beatIntensity * 0.5}) contrast(${1 + beatIntensity * 0.2})`
          }}
        >
          <video 
            ref={videoRef}
            loop 
            muted={false}
            playsInline
            crossOrigin="anonymous"
            className="w-full h-full object-cover"
            src="/Home.mp4"
          />
          {/* Flash Overlay on Beats */}
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-75"
            style={{ 
              backgroundColor: avgColor,
              opacity: beatIntensity > 0.8 ? (beatIntensity - 0.8) * 2 : 0
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
        </div>

        <motion.div 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: { 
              opacity: 1,
              transition: { staggerChildren: 0.2, delayChildren: 0.1 }
            }
          }}
          className="max-w-xl text-center lg:text-left"
        >
          <motion.h1 
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            DP Studio 2.0 <br />
            <span className="coregrad-string">Cinematic Edits For Your Vision</span>
          </motion.h1>
          <motion.p 
            variants={{
              hidden: { y: 30, opacity: 0 },
              visible: { y: 0, opacity: 1, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="text-xl text-white/70 mb-10 leading-relaxed"
          >
            DP Studio 2.0 is a professional post-production house operating around the clock. 
            From viral social content to cinematic masterpieces, we bring your footage to life.
          </motion.p>
          <motion.div 
            variants={{
              hidden: { scale: 0.9, opacity: 0 },
              visible: { scale: 1, opacity: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
            }}
            className="flex flex-wrap justify-center lg:justify-start gap-4"
          >
            <a href="https://wa.me/919092783899" className="button-main px-10 py-4 rounded-xl text-2xl font-semibold flex items-center gap-3 hover:scale-105 hover:-translate-y-1 transition-all">
              Start Project <span className="text-lg font-normal opacity-80">500+ Done</span>
            </a>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 md:px-[65px] bg-black/40 relative z-10">
        <div className="max-w-7xl mx-auto text-center mb-16">
          <h2 className="text-xl tracking-[0.2em] uppercase text-white/50 mb-4">Professional Post-Production</h2>
          <h1 className="text-4xl md:text-6xl font-bold">What We Offer</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            { icon: <Eye />, title: "Cinematic Quality", desc: "4K rendering and professional color grading for every project." },
            { icon: <Headphones />, title: "Sound Design", desc: "Immersive audio landscapes and licensed music integration." },
            { icon: <Zap />, title: "Fast Turnaround", desc: "24-48 hour delivery for short-form content and Reels." },
            { icon: <LinkIcon />, title: "Seamless Workflow", desc: "Easy file sharing and direct communication with your editor." }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ scale: 0, rotate: -10 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-graphene-2 p-10 rounded-2xl flex flex-col items-center text-center gap-4 hover:bg-graphene-3 hover:-translate-y-2 transition-all cursor-default group"
            >
              <div className="text-amber-500 scale-150 mb-4 group-hover:scale-175 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-white/60 leading-relaxed">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6 md:px-[65px] relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-5xl md:text-7xl font-display italic text-transparent border-white/20 border-b pb-4 mb-8" style={{ WebkitTextStroke: '1px white' }}>
              SERVICES
            </h2>
            <h1 className="text-4xl md:text-6xl font-bold mb-12">Tailored For You</h1>
            
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-12">
              {Object.keys(SERVICES).map((service) => (
                <button
                  key={service}
                  onClick={() => setSelectedService(service)}
                  className={`aspect-square rounded-xl p-2 flex items-center justify-center transition-all ${
                    selectedService === service 
                    ? 'bg-graphene-3 border-b-4 border-amber-500 scale-110' 
                    : 'bg-graphene-2 hover:bg-white/10'
                  }`}
                >
                  <img 
                    src={`https://picsum.photos/seed/${service}/100/100`} 
                    alt={service}
                    className="w-full h-full object-cover rounded-lg opacity-80"
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="lg:w-1/2 flex items-center">
            <AnimatePresence mode="wait">
              <motion.div 
                key={selectedService}
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -20, opacity: 0 }}
                className="bg-graphene-2 p-8 md:p-12 rounded-2xl w-full flex flex-col md:flex-row gap-8 items-center"
              >
                <img 
                  src={`https://picsum.photos/seed/${selectedService}/800/600`} 
                  alt={selectedService}
                  className="w-full md:w-1/2 aspect-video object-cover rounded-xl shadow-2xl"
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-3xl font-bold mb-4">{selectedService}</h3>
                  <p className="text-lg text-white/70 leading-relaxed">
                    {SERVICES[selectedService as keyof typeof SERVICES]}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Project Showcase Section */}
      <section id="work" className="py-20 px-6 md:px-[65px] max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <p className="text-white/50 tracking-[0.4em] uppercase text-sm mb-4">Our Best Works</p>
          <h2 className="text-4xl md:text-6xl font-bold mb-6">Project Showcase</h2>
          <p className="text-white/70 max-w-2xl mx-auto">
            Explore some of our most recent and impactful post-production projects.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {PROJECTS.map((project, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group relative rounded-3xl overflow-hidden border border-white/5 shadow-2xl cursor-pointer h-[400px]"
            >
              <div className="absolute inset-0 overflow-hidden">
                <img 
                  src={project.image} 
                  alt={project.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                />
                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors duration-500" />
              </div>
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                <p className="text-amber-500 tracking-[0.2em] uppercase text-xs mb-2 font-semibold">
                  {project.category}
                </p>
                <h3 className="text-3xl font-bold mb-2 group-hover:text-amber-400 transition-colors">
                  {project.title}
                </h3>
                <p className="text-white/70 line-clamp-2">
                  {project.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 px-6 md:px-[65px] bg-black/20 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-white/50 tracking-[0.15em] uppercase text-sm mb-4">Support & Tips</h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-12">DP Studio 2.0 FAQ</h1>
          
          <div className="flex flex-col gap-4">
            {FAQS.map((faq, i) => (
              <details key={i} className="group bg-graphene-2 rounded-2xl border border-white/5 open:border-amber-500/50 open:bg-graphene-3/80 transition-all">
                <summary className="flex items-center justify-between p-6 text-lg font-semibold cursor-pointer list-none">
                  {faq.question}
                  <ChevronDown size={24} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="px-6 pb-6 text-left text-white/70 leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Footer / Contact */}
      <footer id="contact" className="py-12 border-t border-white/5 text-center relative z-10 flex flex-col items-center gap-8">
        <h2 className="text-3xl font-bold text-white/90">Get In Touch</h2>
        <div className="flex flex-col md:flex-row gap-6 text-white/70 items-center justify-center w-full max-w-4xl px-6">
          <a href="mailto:artistparvesh01@gmail.com" className="flex-1 flex flex-col items-center justify-center gap-2 hover:text-amber-500 transition-colors bg-graphene-2 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 w-full">
            <span className="text-sm uppercase tracking-widest text-white/40">Email</span>
            <span className="font-semibold text-lg overflow-hidden text-ellipsis max-w-full">artistparvesh01@gmail.com</span>
          </a>
          <a href="https://wa.me/919092783899" className="flex-1 flex flex-col items-center justify-center gap-2 hover:text-amber-500 transition-colors bg-graphene-2 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 w-full">
            <span className="text-sm uppercase tracking-widest text-white/40">WhatsApp</span>
            <span className="font-semibold text-lg">+91 90927 83899</span>
          </a>
          <a href="tel:09092783899" className="flex-1 flex flex-col items-center justify-center gap-2 hover:text-amber-500 transition-colors bg-graphene-2 p-6 rounded-2xl border border-white/5 hover:border-amber-500/50 w-full">
            <span className="text-sm uppercase tracking-widest text-white/40">Call Us</span>
            <span className="font-semibold text-lg">090927 83899</span>
          </a>
        </div>
        
        <div className="mt-8 pt-8 border-t border-white/5 w-full">
          <p className="text-white/40 mb-2">Made with ❤️ for DP Studio 2.0</p>
          <p className="text-xs text-white/20">© 2026 DP Studio 2.0. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

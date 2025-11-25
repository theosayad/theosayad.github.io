
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

const Hero: React.FC = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);
  const [typingSpeed, setTypingSpeed] = useState(150);

  const roles = ["Founder", "Developer", "Strategist"];

  useEffect(() => {
    const handleTyping = () => {
      const i = loopNum % roles.length;
      const fullText = roles[i];

      setText(isDeleting 
        ? fullText.substring(0, text.length - 1) 
        : fullText.substring(0, text.length + 1)
      );

      setTypingSpeed(isDeleting ? 30 : 150);

      if (!isDeleting && text === fullText) {
        setTimeout(() => setIsDeleting(true), 1500);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setLoopNum(loopNum + 1);
      }
    };

    const timer = setTimeout(handleTyping, typingSpeed);
    return () => clearTimeout(timer);
  }, [text, isDeleting, loopNum, typingSpeed, roles]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-12 md:py-0">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Static Background decoration fallback/accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[300px] md:h-[500px] bg-brand-400/5 dark:bg-brand-600/10 rounded-full blur-[80px] md:blur-[120px] -z-10 animate-pulse" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 relative z-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-brand-600 dark:text-brand-400 uppercase bg-brand-50 dark:bg-brand-900/30 rounded-full border border-brand-200 dark:border-brand-800 animate-fade-in-up backdrop-blur-sm">
            Available for opportunities
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-bold text-slate-900 dark:text-white mb-4 md:mb-6 leading-tight">
            Hi, I'm <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-indigo-600 dark:from-brand-400 dark:to-indigo-500 block md:inline mt-2 md:mt-0">Theo Sayad</span>
          </h1>
          <div className="h-8 mb-6 md:mb-8 flex items-center justify-center md:justify-start">
            <span className="text-lg md:text-2xl text-slate-600 dark:text-slate-400 mr-2">I am a</span>
            <span className="text-lg md:text-2xl text-brand-600 dark:text-brand-400 font-bold font-mono">
              {text}
              <span className="animate-blink">|</span>
            </span>
          </div>
          
          <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed px-4 md:px-0">
             Based in Berlin. Merging business acumen with technical expertise to build the future of tech.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full sm:w-auto px-8 sm:px-0">
            <a 
              href="#ventures" 
              onClick={(e) => handleNavClick(e, '#ventures')}
              className="w-full sm:w-auto justify-center px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-950 font-semibold rounded-lg hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors flex items-center gap-2 group cursor-pointer active:scale-95 duration-150 shadow-lg shadow-brand-500/20"
            >
              See my work
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, '#contact')}
              className="w-full sm:w-auto justify-center px-8 py-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm text-slate-900 dark:text-white font-medium rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors border border-slate-300 dark:border-slate-700 cursor-pointer active:scale-95 duration-150"
            >
              Contact Me
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end relative">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="absolute inset-0 border-2 border-brand-500/20 dark:border-brand-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <div className="absolute inset-4 border-2 border-indigo-500/20 dark:border-indigo-500/30 rounded-full animate-[spin_15s_linear_infinite_reverse]" />
                <div className="absolute inset-0 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl bg-slate-100 dark:bg-slate-800">
                    <img 
                        src="theo.jpg"
                        alt="Theo Sayad" 
                        className="w-full h-full object-cover md:hover:scale-110 transition-transform duration-700"
                    />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

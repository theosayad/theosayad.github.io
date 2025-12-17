
import React, { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import ParticleBackground from './ParticleBackground';

const ROLES = ["Founder", "Operator", "Strategist", "Developer"];

const getIndefiniteArticle = (word: string) => {
  const cleaned = word.trim().toLowerCase();
  if (!cleaned) return 'a';
  const first = cleaned[0];
  return ['a', 'e', 'i', 'o', 'u'].includes(first) ? 'an' : 'a';
};

const Hero: React.FC = () => {
  const [text, setText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [loopNum, setLoopNum] = useState(0);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (media.matches) {
      setText(ROLES[0]);
      return;
    }

    const fullText = ROLES[loopNum % ROLES.length];

    const randomBetween = (min: number, max: number) =>
      Math.floor(Math.random() * (max - min + 1)) + min;

    if (!isDeleting && text === fullText) {
      const timer = window.setTimeout(() => setIsDeleting(true), 2200);
      return () => window.clearTimeout(timer);
    }

    if (isDeleting && text === '') {
      const timer = window.setTimeout(() => {
        setIsDeleting(false);
        setLoopNum((n) => n + 1);
      }, 550);
      return () => window.clearTimeout(timer);
    }

    const delay = isDeleting ? randomBetween(65, 115) : randomBetween(125, 210);
    const timer = window.setTimeout(() => {
      setText(
        isDeleting
          ? fullText.substring(0, Math.max(0, text.length - 1))
          : fullText.substring(0, Math.min(fullText.length, text.length + 1))
      );
    }, delay);

    return () => window.clearTimeout(timer);
  }, [text, isDeleting, loopNum]);

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

  const currentRole = ROLES[loopNum % ROLES.length];
  const article = getIndefiniteArticle(currentRole);

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-24 pb-12 md:py-0">
      {/* Particle Background */}
      <ParticleBackground />
      
      {/* Static Background decoration fallback/accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] md:w-[1000px] h-[300px] md:h-[500px] bg-brand-400/10 dark:bg-brand-400/10 rounded-full blur-[90px] md:blur-[130px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col-reverse md:flex-row items-center gap-8 md:gap-12 relative z-10">
        <div className="flex-1 text-center md:text-left">
          <div className="inline-block px-4 py-1.5 mb-5 text-[11px] font-semibold tracking-[0.22em] text-brand-700 dark:text-brand-300 uppercase bg-white/50 dark:bg-stone-950/30 rounded-full border border-brand-200/60 dark:border-stone-800/60 animate-fade-in-up backdrop-blur-sm">
            Available for opportunities
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-7xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50 mb-4 md:mb-6 leading-[1.05]">
            Hi, I'm <span className="text-brand-700 dark:text-brand-300 italic block md:inline mt-2 md:mt-0">Theo Sayad</span>
          </h1>
          <div className="h-8 mb-6 md:mb-8 flex items-center justify-center md:justify-start">
            <span className="text-lg md:text-2xl text-stone-600 dark:text-stone-400 mr-2">
              I am {article}
            </span>
            <span className="text-lg md:text-2xl text-brand-700 dark:text-brand-300 font-semibold font-display italic">
              {text}
              <span className="animate-blink opacity-60">|</span>
            </span>
          </div>
          
          <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 mb-8 max-w-lg mx-auto md:mx-0 leading-relaxed px-4 md:px-0">
             Based in Berlin. Merging business acumen with technical expertise to{' '}
            <span
              className="relative inline-block"
            >
              solve modern-day problems
              <svg
                aria-hidden="true"
                viewBox="0 0 120 8"
                preserveAspectRatio="none"
                className="pointer-events-none absolute left-0 top-full mt-1 h-2 w-full text-brand-700 dark:text-brand-300"
              >
                <path
                  d="M0 4 Q 30 0 60 4 T 120 4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </span>
            .
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-4 w-full sm:w-auto px-8 sm:px-0">
            <a 
              href="#ventures" 
              onClick={(e) => handleNavClick(e, '#ventures')}
              className="w-full sm:w-auto justify-center px-8 py-3 bg-stone-900/95 dark:bg-stone-50 text-stone-50 dark:text-stone-950 font-semibold rounded-lg hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors flex items-center gap-2 group cursor-pointer active:scale-95 duration-150 shadow-lg shadow-brand-500/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
            >
              See my work
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <a 
              href="#contact" 
              onClick={(e) => handleNavClick(e, '#contact')}
              className="w-full sm:w-auto justify-center px-8 py-3 bg-white/60 dark:bg-stone-900/35 backdrop-blur-sm text-stone-900 dark:text-stone-50 font-medium rounded-lg hover:bg-white/75 dark:hover:bg-stone-900/55 transition-colors border border-stone-300/70 dark:border-stone-800/60 cursor-pointer active:scale-95 duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
            >
              Contact Me
            </a>
          </div>
        </div>

        <div className="flex-1 flex justify-center md:justify-end relative">
            <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96">
                <div className="absolute -inset-10 rounded-full bg-brand-200/25 dark:bg-brand-700/10 blur-3xl -z-10" />
                <div className="absolute -inset-2 rounded-full border border-brand-200/70 dark:border-brand-800/50" />
                <div className="absolute inset-0 rounded-full overflow-hidden border border-stone-200/70 dark:border-stone-800/60 shadow-2xl bg-white/40 dark:bg-stone-900/30 backdrop-blur-sm">
                    <img 
                        src="theo.jpg"
                        alt="Theo Sayad" 
                        className="w-full h-full object-cover md:hover:scale-[1.04] transition-transform duration-700"
                    />
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;

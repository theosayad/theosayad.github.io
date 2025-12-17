import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Ventures from './components/Ventures';
import Experience from './components/Experience';
import Skills from './components/Skills';
import Contact from './components/Contact';
import { Reveal } from './components/Reveal';
import MarketTape from './components/MarketTape';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Sync state with DOM on mount
    if (document.documentElement.classList.contains('dark')) {
      setIsDark(true);
    } else {
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <div className="min-h-screen pb-12 bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-brand-500 selection:text-white transition-colors duration-300">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[60] focus:bg-white/85 dark:focus:bg-stone-950/70 focus:backdrop-blur-md focus:border focus:border-stone-200/70 dark:focus:border-stone-800/60 focus:px-4 focus:py-2 focus:rounded-full focus:text-sm focus:font-semibold focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
      >
        Skip to content
      </a>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} />
      <main id="main">
        <Hero />
        <Reveal>
            <About />
        </Reveal>
        <Ventures />
        <Reveal>
            <Experience />
        </Reveal>
        <Reveal>
            <Skills isDark={isDark} />
        </Reveal>
      </main>
      <Contact />
      <MarketTape />
    </div>
  );
};

export default App;

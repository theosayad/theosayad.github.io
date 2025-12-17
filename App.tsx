import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Ventures from './components/Ventures';
import Experience from './components/Experience';
import Contact from './components/Contact';
import { Reveal } from './components/Reveal';
import MarketTape from './components/MarketTape';
import ArticleOfWeek from './components/ArticleOfWeek';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const Skills = useMemo(() => React.lazy(() => import('./components/Skills')), []);

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
        <ArticleOfWeek />
        <Reveal>
            <Experience />
        </Reveal>
        <Reveal>
            <Suspense
              fallback={
                <section id="education" className="py-16 md:py-24 bg-transparent transition-colors duration-300">
                  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/15 backdrop-blur-sm p-6 md:p-8">
                      <div className="h-6 w-40 bg-stone-200/70 dark:bg-stone-800/60 rounded-md" />
                      <div className="mt-4 h-4 w-72 max-w-full bg-stone-200/50 dark:bg-stone-800/40 rounded-md" />
                      <div className="mt-6 h-44 bg-stone-200/40 dark:bg-stone-800/30 rounded-xl" />
                    </div>
                  </div>
                </section>
              }
            >
              <Skills isDark={isDark} />
            </Suspense>
        </Reveal>
      </main>
      <Contact />
      <MarketTape />
    </div>
  );
};

export default App;

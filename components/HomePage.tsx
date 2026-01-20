import React, { Suspense, useEffect, useMemo } from 'react';
import About from './About';
import ArticleOfWeek from './ArticleOfWeek';
import Contact from './Contact';
import Experience from './Experience';
import Hero from './Hero';
import { Reveal } from './Reveal';
import Ventures from './Ventures';
import { scrollToIdWithOffset } from '../utils/scroll';
import { useAppLocation } from '../utils/navigation';

const HomePage: React.FC<{ isDark: boolean }> = ({ isDark }) => {
  const Skills = useMemo(() => React.lazy(() => import('./Skills')), []);
  const { hash } = useAppLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.replace('#', '');
    if (!id) return;
    // Defer to allow layout to paint before measuring.
    const t = window.setTimeout(() => scrollToIdWithOffset(id, id === 'reading' ? -140 : 80), 0);
    return () => window.clearTimeout(t);
  }, [hash]);

  return (
    <>
      <Hero />
      <Reveal>
        <About />
      </Reveal>
      <Ventures />
      <Reveal>
        <Experience />
      </Reveal>
      <Reveal>
        <Suspense
          fallback={
            <section id="education" className="py-16 md:py-24 bg-transparent transition-colors duration-300">
              <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <ArticleOfWeek />
      <Contact />
    </>
  );
};

export default HomePage;

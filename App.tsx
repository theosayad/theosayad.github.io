import React, { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import MarketTape from './components/MarketTape';
import HomePage from './components/HomePage';
import LabPage from './components/LabPage';
import LabWeeklyEntryPage from './components/LabWeeklyEntryPage';
import { navigate, useAppLocation } from './utils/navigation';

const App: React.FC = () => {
  const [isDark, setIsDark] = useState(false);
  const { pathname } = useAppLocation();

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

  const route = useMemo(() => {
    const p = pathname.replace(/\/+$/, '') || '/';
    if (p === '/') return { name: 'home' as const };
    if (p === '/lab') return { name: 'lab' as const };
    if (p.startsWith('/lab/weekly/')) {
      const slug = p.slice('/lab/weekly/'.length);
      return { name: 'labWeekly' as const, slug };
    }
    return { name: 'notFound' as const };
  }, [pathname]);

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
        {route.name === 'home' ? <HomePage isDark={isDark} /> : null}
        {route.name === 'lab' ? <LabPage /> : null}
        {route.name === 'labWeekly' ? <LabWeeklyEntryPage slug={route.slug} /> : null}
        {route.name === 'notFound' ? (
          <div className="pt-28 pb-16">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/60 dark:bg-stone-950/15 backdrop-blur-sm p-6 md:p-8">
                <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                  Not found
                </div>
                <div className="mt-2 font-display text-2xl text-stone-900 dark:text-stone-50 tracking-tight">
                  This page doesn’t exist.
                </div>
                <a
                  href={`${import.meta.env.BASE_URL}#home`}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/#home');
                  }}
                  className="mt-5 inline-flex items-center justify-center rounded-full bg-stone-900/95 dark:bg-stone-50 px-5 py-2.5 text-sm font-semibold text-stone-50 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                >
                  Go to Home
                </a>
              </div>
            </div>
          </div>
        ) : null}
      </main>
      <MarketTape />
    </div>
  );
};

export default App;

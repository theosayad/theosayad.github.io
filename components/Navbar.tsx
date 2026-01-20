import React, { useState, useEffect } from 'react';
import { Menu, X, Linkedin, Instagram, Sun, Moon } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';
import { navigate, useAppLocation } from '../utils/navigation';
import { scrollToIdWithOffset } from '../utils/scroll';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const { pathname } = useAppLocation();

  useEffect(() => {
    let lastY = window.scrollY;
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      const current = window.scrollY;
      if (current < 40) {
        setNavHidden(false);
      } else {
        const delta = current - lastY;
        if (delta > 6) setNavHidden(true);
        if (delta < -6) setNavHidden(false);
      }
      lastY = current;
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'Ventures', href: '#ventures' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
    { name: "Today’s Business Brief", href: '#reading' },
  ];
  const labLink = { name: 'Lab', href: '/lab' };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    if (href.startsWith('/')) {
      navigate(href);
      setIsOpen(false);
      // Smooth scroll to top when routing to Lab.
      window.setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 0);
      return;
    }

    if (!href.startsWith('#')) return;
    const targetId = href.slice(1);
    if (!targetId) return;

    if (pathname !== '/') {
      navigate(`/${href}`);
      setIsOpen(false);
      return;
    }

    // For Business News, nudge further down the page.
    scrollToIdWithOffset(targetId, targetId === 'reading' ? -140 : 80);
    setIsOpen(false);
  };

  return (
    <>
      <nav
        className={`fixed w-full z-50 transition-all duration-300 ${
          navHidden && !isOpen ? '-translate-y-full' : 'translate-y-0'
        } ${scrolled ? 'bg-white/65 dark:bg-stone-950/45 backdrop-blur-xl border-b border-stone-200/70 dark:border-stone-800/60 shadow-sm py-2' : 'bg-transparent py-4'}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-6">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className={`px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 ${
                      link.href === '#reading'
                        ? 'font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200 bg-brand-500/10 border border-brand-200/60 dark:border-stone-800/60 rounded-full'
                        : 'text-stone-600 dark:text-stone-300 hover:text-brand-700 dark:hover:text-brand-300'
                    }`}
                  >
                    {link.href === '#reading' ? (
                      <span className="inline-flex items-center gap-2">
                        <span>{link.name}</span>
                        <span className="px-2 py-0.5 rounded-full bg-brand-500/15 text-brand-800 dark:text-brand-200 text-[10px] font-semibold tracking-normal">
                          AI-powered
                        </span>
                      </span>
                    ) : (
                      link.name
                    )}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <a
                href={labLink.href}
                onClick={(e) => handleNavClick(e, labLink.href)}
                className={`inline-flex items-center justify-center rounded-full px-4 py-2 text-sm font-semibold transition-colors transition-transform duration-150 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 ${
                  pathname === '/lab'
                    ? 'bg-gradient-to-r from-purple-500 via-fuchsia-500 to-amber-400 text-white shadow-[0_10px_30px_-12px_rgba(147,51,234,0.6)]'
                    : 'border border-purple-300/60 dark:border-purple-600/50 bg-purple-500/10 text-purple-800 dark:text-purple-200 hover:bg-purple-500/20'
                }`}
              >
                Lab · AI
              </a>
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/40 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
               <div className="h-6 w-px bg-stone-300 dark:bg-stone-700 mx-2"></div>
               <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="text-stone-600 dark:text-stone-400 hover:text-brand-700 dark:hover:text-stone-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 rounded-md">
                  <Linkedin size={20} />
               </a>
               <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-stone-600 dark:text-stone-400 hover:text-pink-600 dark:hover:text-stone-50 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 rounded-md">
                  <Instagram size={20} />
               </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="flex md:hidden items-center gap-4 z-50 relative">
               <button 
                onClick={toggleTheme}
                className="p-2 rounded-full text-stone-600 dark:text-stone-400 hover:bg-stone-100/70 dark:hover:bg-stone-800/40 transition-colors focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                aria-label="Toggle Dark Mode"
              >
                {isDark ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-900 dark:text-stone-50 hover:bg-stone-100/70 dark:hover:bg-stone-800/40 focus:outline-none"
                aria-label="Menu"
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full Screen Mobile Menu */}
            <div className={`fixed inset-0 z-40 bg-white/80 dark:bg-stone-950/70 backdrop-blur-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col justify-center items-center ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col space-y-8 text-center">
          {[...navLinks, labLink].map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className={`text-2xl font-display font-medium transition-colors ${
                link.href === '#reading'
                  ? 'text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-200'
                  : link.href === '/lab'
                    ? 'text-purple-600 dark:text-purple-300 hover:text-purple-500 dark:hover:text-purple-200'
                    : 'text-stone-900 dark:text-stone-50 hover:text-brand-700 dark:hover:text-brand-300'
              }`}
            >
              {link.href === '#reading' ? (
                <span className="inline-flex items-center gap-3">
                  <span>{link.name}</span>
                  <span className="px-3 py-1 rounded-full bg-brand-500/15 text-brand-800 dark:text-brand-200 text-[11px] font-semibold tracking-normal">
                    AI
                  </span>
                </span>
              ) : (
                link.name
              )}
            </a>
          ))}
          <div className="flex justify-center gap-8 pt-8">
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noreferrer" className="text-stone-500 dark:text-stone-400 hover:text-brand-700 dark:hover:text-stone-50 transition-colors">
              <Linkedin size={28} />
            </a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" className="text-stone-500 dark:text-stone-400 hover:text-pink-600 dark:hover:text-stone-50 transition-colors">
              <Instagram size={28} />
            </a>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;

import React, { useState, useEffect } from 'react';
import { Menu, X, Linkedin, Instagram, Sun, Moon } from 'lucide-react';
import { SOCIAL_LINKS } from '../constants';

interface NavbarProps {
  isDark: boolean;
  toggleTheme: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ isDark, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
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
    { name: 'About', href: '#about' },
    { name: 'Ventures', href: '#ventures' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Contact', href: '#contact' },
  ];

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
      setIsOpen(false);
    }
  };

  return (
    <>
      <nav className={`fixed w-full z-50 transition-all duration-300 ${scrolled ? 'bg-white/65 dark:bg-stone-950/45 backdrop-blur-xl border-b border-stone-200/70 dark:border-stone-800/60 shadow-sm py-2' : 'bg-transparent py-4'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-12">
            {/* Brand */}
            <a
              href="#home"
              onClick={(e) => handleNavClick(e, '#home')}
              className="inline-flex items-center gap-2 font-display italic text-lg tracking-tight text-stone-900 dark:text-stone-50 hover:text-brand-700 dark:hover:text-brand-300 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 rounded-md"
              aria-label="Go to home"
            >
              <span className="hidden sm:inline">Theo Sayad</span>
              <span className="sm:hidden">TS</span>
            </a>
            
            {/* Desktop Menu */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-8">
                {navLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={(e) => handleNavClick(e, link.href)}
                    className="text-stone-600 dark:text-stone-300 hover:text-brand-700 dark:hover:text-brand-300 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
                  >
                    {link.name}
                  </a>
                ))}
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
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
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href)}
              className="text-2xl font-display font-medium text-stone-900 dark:text-stone-50 hover:text-brand-700 dark:hover:text-brand-300 transition-colors"
            >
              {link.name}
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

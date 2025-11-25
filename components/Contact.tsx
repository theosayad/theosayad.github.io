import React from 'react';
import { SOCIAL_LINKS } from '../constants';
import { Mail, Phone, Linkedin, Instagram, ArrowUp } from 'lucide-react';

const Contact: React.FC = () => {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 py-12 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white mb-6">Let's Connect</h2>
                <p className="text-slate-600 dark:text-slate-400 mb-8 max-w-md">
                    Always open to discussing new ventures, partnerships, or just chatting about the future of tech and business.
                </p>
                <div className="flex gap-4">
                     <a href={SOCIAL_LINKS.linkedin} className="p-3 bg-white dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-400 hover:text-white hover:bg-brand-600 dark:hover:bg-brand-600 shadow-sm dark:shadow-none transition-all active:scale-90">
                        <Linkedin size={20} />
                     </a>
                     <a href={SOCIAL_LINKS.instagram} className="p-3 bg-white dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-400 hover:text-white hover:bg-pink-600 dark:hover:bg-pink-600 shadow-sm dark:shadow-none transition-all active:scale-90">
                        <Instagram size={20} />
                     </a>
                     <a href={`mailto:${SOCIAL_LINKS.email}`} className="p-3 bg-white dark:bg-slate-900 rounded-full text-slate-600 dark:text-slate-400 hover:text-white hover:bg-brand-600 dark:hover:bg-brand-600 shadow-sm dark:shadow-none transition-all active:scale-90">
                        <Mail size={20} />
                     </a>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <Mail className="text-brand-600 dark:text-brand-500" />
                    <a href={`mailto:${SOCIAL_LINKS.email}`} className="hover:text-slate-900 dark:hover:text-white transition-colors">
                        {SOCIAL_LINKS.email}
                    </a>
                </div>
                <div className="flex items-center gap-4 text-slate-600 dark:text-slate-300">
                    <Phone className="text-brand-600 dark:text-brand-500" />
                    <span>{SOCIAL_LINKS.phone}</span>
                </div>
                <div className="pt-8 border-t border-slate-200 dark:border-slate-900">
                    <p className="text-slate-500 text-sm">
                        &copy; {new Date().getFullYear()} Theo Sayad. All rights reserved.
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-12 flex justify-center">
            <button 
                onClick={scrollToTop}
                className="flex items-center gap-2 text-sm text-slate-600 hover:text-brand-600 dark:text-slate-600 dark:hover:text-brand-400 transition-colors p-4 focus:outline-none"
            >
                Back to Top <ArrowUp size={14} />
            </button>
        </div>
      </div>
    </footer>
  );
};

export default Contact;
import React from 'react';
import { SOCIAL_LINKS } from '../constants';
import { Mail, Phone, Linkedin, Instagram, ArrowUp } from 'lucide-react';

const Contact: React.FC = () => {
  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-white/25 dark:bg-stone-950/30 border-t border-stone-200/70 dark:border-stone-900/60 py-12 md:py-16 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-7 shadow-sm shadow-stone-900/5 dark:shadow-none">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-[11px] font-semibold tracking-[0.22em] uppercase text-stone-500 dark:text-stone-400">
                Theo Sayad — Berlin
              </div>
              <div className="mt-2 font-display text-2xl md:text-3xl text-stone-900 dark:text-stone-50 tracking-tight">
                Let’s talk if you’re building something thoughtful.
              </div>
              <div className="mt-2 text-stone-600 dark:text-stone-400 max-w-2xl">
                I’m open to opportunities, partnerships, and founder-to-founder conversations.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href={`mailto:${SOCIAL_LINKS.email}`}
                className="inline-flex items-center gap-2 rounded-full bg-stone-900/95 dark:bg-stone-50 px-4 py-2 text-sm font-semibold text-stone-50 dark:text-stone-950 hover:bg-stone-800 dark:hover:bg-stone-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                <Mail size={16} /> Email
              </a>
              <a
                href={SOCIAL_LINKS.linkedin}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/35 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/55 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                <Linkedin size={16} /> LinkedIn
              </a>
              <a
                href="/theo-sayad.vcf"
                download
                className="inline-flex items-center gap-2 rounded-full bg-white/60 dark:bg-stone-900/35 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 px-4 py-2 text-sm font-semibold text-stone-700 dark:text-stone-200 hover:bg-white/80 dark:hover:bg-stone-900/55 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
              >
                Save Contact
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50 mb-6">Let's Connect</h2>
                <p className="text-stone-600 dark:text-stone-400 mb-8 max-w-md">
                    Always open to discussing new ventures, partnerships, or just chatting about the future of tech and business.
                </p>
                <div className="flex gap-4">
                     <a href={SOCIAL_LINKS.linkedin} className="p-3 bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 rounded-full text-stone-600 dark:text-stone-400 hover:text-white hover:bg-brand-600 dark:hover:bg-brand-600 shadow-sm shadow-stone-900/5 dark:shadow-none transition-all active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60">
                        <Linkedin size={20} />
                     </a>
                     <a href={SOCIAL_LINKS.instagram} className="p-3 bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 rounded-full text-stone-600 dark:text-stone-400 hover:text-white hover:bg-pink-600 dark:hover:bg-pink-600 shadow-sm shadow-stone-900/5 dark:shadow-none transition-all active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60">
                        <Instagram size={20} />
                     </a>
                     <a href={`mailto:${SOCIAL_LINKS.email}`} className="p-3 bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 rounded-full text-stone-600 dark:text-stone-400 hover:text-white hover:bg-brand-600 dark:hover:bg-brand-600 shadow-sm shadow-stone-900/5 dark:shadow-none transition-all active:scale-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60">
                        <Mail size={20} />
                     </a>
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4 text-stone-600 dark:text-stone-300">
                    <Mail className="text-brand-700 dark:text-brand-300" />
                    <a href={`mailto:${SOCIAL_LINKS.email}`} className="hover:text-stone-900 dark:hover:text-stone-50 transition-colors">
                        {SOCIAL_LINKS.email}
                    </a>
                </div>
                <div className="flex items-center gap-4 text-stone-600 dark:text-stone-300">
                    <Phone className="text-brand-700 dark:text-brand-300" />
                    <span>{SOCIAL_LINKS.phone}</span>
                </div>
                <div className="pt-8 border-t border-stone-200/70 dark:border-stone-900/60">
                    <p className="text-stone-500 dark:text-stone-400 text-sm">
                        &copy; {new Date().getFullYear()} Theo Sayad. All rights reserved.
                    </p>
                </div>
            </div>
        </div>

        <div className="mt-12 flex justify-center">
            <button 
                onClick={scrollToTop}
                className="flex items-center gap-2 text-sm text-stone-600 hover:text-brand-700 dark:text-stone-400 dark:hover:text-brand-300 transition-colors p-4 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60 rounded-md"
            >
                Back to Top <ArrowUp size={14} />
            </button>
        </div>
      </div>
    </footer>
  );
};

export default Contact;

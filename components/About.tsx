import React from 'react';
import { BIO_TEXT } from '../constants';
import { User } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-slate-100 dark:bg-slate-900/50 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-brand-500/10 rounded-lg">
                <User className="text-brand-600 dark:text-brand-400" size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">About Me</h2>
        </div>
        
        <div className="prose prose-lg text-slate-600 dark:text-slate-400 max-w-none">
            {BIO_TEXT.map((paragraph, index) => (
                <p key={index} className="mb-4 leading-relaxed text-base md:text-lg">
                    {paragraph}
                </p>
            ))}
        </div>
      </div>
    </section>
  );
};

export default About;
import React from 'react';
import { BIO_TEXT } from '../constants';
import { User } from 'lucide-react';

const About: React.FC = () => {
  return (
    <section id="about" className="py-16 md:py-24 bg-white/30 dark:bg-stone-900/20 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-8">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
                <User className="text-brand-700 dark:text-brand-300" size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">About Me</h2>
        </div>
        
        <div className="prose prose-stone dark:prose-invert prose-lg max-w-none">
            {BIO_TEXT.map((paragraph, index) => (
                <p key={index} className="mb-6 leading-relaxed">
                    {paragraph}
                </p>
            ))}
        </div>
      </div>
    </section>
  );
};

export default About;

import React from 'react';
import { EXPERIENCE_DATA } from '../constants';
import { Briefcase, MapPin } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-16 md:py-24 bg-white/20 dark:bg-stone-900/15 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
                <Briefcase className="text-brand-700 dark:text-brand-300" size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">Work Experience</h2>
        </div>

        <div className="relative border-l-2 border-stone-300/70 dark:border-stone-800/60 ml-4 md:ml-6 space-y-10">
          {EXPERIENCE_DATA.map((job) => (
            <div key={job.id} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-8 h-4 w-4 rounded-full bg-white/80 dark:bg-stone-950/40 border-2 border-brand-400/80"></div>
              
              <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-6 md:p-7 shadow-sm shadow-stone-900/5 dark:shadow-none">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                      <h3 className="text-lg md:text-xl font-semibold text-stone-900 dark:text-stone-50">{job.role}</h3>
                      <div className="text-base md:text-lg text-stone-600 dark:text-stone-300 font-medium">{job.company}</div>
                  </div>
                  <div className="text-left sm:text-right">
                      <div className="inline-flex items-center justify-center text-[11px] font-semibold tracking-[0.18em] uppercase text-brand-700 dark:text-brand-300 bg-white/50 dark:bg-stone-950/30 px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60">
                        {job.period}
                      </div>
                      <div className="flex items-center justify-start sm:justify-end gap-1 text-xs text-stone-500 dark:text-stone-400 mt-2">
                          <MapPin size={12} /> {job.location}
                      </div>
                  </div>
                </div>

                <ul className="mt-5 space-y-2">
                  {job.description.map((desc, idx) => (
                      <li key={idx} className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm md:text-base">
                          {desc}
                      </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;

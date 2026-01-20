import React from 'react';
import { EXPERIENCE_DATA } from '../constants';
import { ArrowUpRight, Briefcase, MapPin } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-14 md:py-20 bg-white/20 dark:bg-stone-900/15 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-10">
            <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
                <Briefcase className="text-brand-700 dark:text-brand-300" size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">Work Experience</h2>
        </div>

        <div className="relative border-l-2 border-stone-300/70 dark:border-stone-800/60 ml-4 md:ml-6 space-y-6 md:space-y-7">
          {EXPERIENCE_DATA.map((job) => (
            <div key={job.id} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute -left-[8px] top-6 h-3 w-3 rounded-full bg-white/80 dark:bg-stone-950/40 border-2 border-brand-400/80"></div>
              
              <div className="rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-950/20 backdrop-blur-sm p-4 md:p-5 shadow-sm shadow-stone-900/5 dark:shadow-none">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                  <div>
                      <h3 className="text-base md:text-lg font-semibold text-stone-900 dark:text-stone-50">{job.role}</h3>
                      <div className="text-sm md:text-base text-stone-600 dark:text-stone-300 font-medium">
                        {job.companyUrl ? (
                          <a
                            href={job.companyUrl}
                            target="_blank"
                            rel="noreferrer noopener"
                            className="group inline-flex items-center gap-1.5 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
                          >
                            <span className="underline decoration-stone-300/60 dark:decoration-stone-700/60 group-hover:decoration-brand-400/70 underline-offset-4">
                              {job.company}
                            </span>
                            <ArrowUpRight size={13} className="opacity-60 group-hover:opacity-100 transition-opacity" />
                          </a>
                        ) : (
                          job.company
                        )}
                      </div>
                  </div>
                  <div className="text-left sm:text-right">
                      <div className="inline-flex items-center justify-center text-[10px] font-semibold tracking-[0.18em] uppercase text-brand-700 dark:text-brand-300 bg-white/50 dark:bg-stone-950/30 px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60">
                        {job.period}
                      </div>
                      <div className="flex items-center justify-start sm:justify-end gap-1 text-[11px] text-stone-500 dark:text-stone-400 mt-2">
                          <MapPin size={12} /> {job.location}
                      </div>
                  </div>
                </div>

                <ul className="mt-3 space-y-1.5">
                  {job.description.map((desc, idx) => (
                      <li key={idx} className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
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

import React from 'react';
import { EXPERIENCE_DATA } from '../constants';
import { Briefcase, MapPin } from 'lucide-react';

const Experience: React.FC = () => {
  return (
    <section id="experience" className="py-16 md:py-24 bg-slate-100/50 dark:bg-slate-900/30 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 mb-12">
            <div className="p-3 bg-brand-500/10 rounded-lg">
                <Briefcase className="text-brand-600 dark:text-brand-400" size={24} />
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">Work Experience</h2>
        </div>

        <div className="relative border-l-2 border-slate-300 dark:border-slate-800 ml-4 md:ml-6 space-y-12">
          {EXPERIENCE_DATA.map((job) => (
            <div key={job.id} className="relative pl-8 md:pl-12">
              {/* Timeline Dot */}
              <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-slate-50 dark:bg-slate-950 border-2 border-brand-500"></div>
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2">
                <div>
                    <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">{job.role}</h3>
                    <div className="text-base md:text-lg text-slate-600 dark:text-slate-300 font-medium">{job.company}</div>
                </div>
                <div className="mt-1 sm:mt-0 text-left sm:text-right">
                    <div className="text-sm font-mono text-brand-600 dark:text-brand-400">{job.period}</div>
                    <div className="flex items-center justify-start sm:justify-end gap-1 text-xs text-slate-500 mt-1">
                        <MapPin size={12} /> {job.location}
                    </div>
                </div>
              </div>

              <ul className="mt-4 space-y-2">
                {job.description.map((desc, idx) => (
                    <li key={idx} className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm md:text-base">
                        {desc}
                    </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Experience;
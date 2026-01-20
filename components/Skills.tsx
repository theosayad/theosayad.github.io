import React from 'react';
import { SKILLS_DATA, EDUCATION_DATA } from '../constants';
import { Cpu, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SkillsProps {
  isDark: boolean;
}

const describeLevel = (level: number) => {
  if (level >= 90) return 'Expert';
  if (level >= 80) return 'Advanced';
  if (level >= 65) return 'Proficient';
  if (level >= 50) return 'Working knowledge';
  return 'Familiar';
};

const SkillsTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string; isDark: boolean }> = ({
  active,
  payload,
  isDark,
}) => {
  if (!active || !payload?.length) return null;
  const item = payload[0]?.payload as { name?: string; level?: number } | undefined;
  if (!item?.name || typeof item.level !== 'number') return null;

  return (
    <div
      style={{
        backgroundColor: isDark ? '#0c0a09' : '#ffffff',
        borderColor: isDark ? '#292524' : '#e7e5e4',
        color: isDark ? '#fafaf9' : '#1c1917',
      }}
      className="rounded-xl border px-3 py-2 shadow-sm"
    >
      <div className="text-xs font-semibold tracking-[0.18em] uppercase opacity-70">{item.name}</div>
      <div className="mt-1 text-sm">{describeLevel(item.level)}</div>
    </div>
  );
};

const Skills: React.FC<SkillsProps> = ({ isDark }) => {
  // Split skills for better visualization
  const techSkills = SKILLS_DATA.filter(s => s.category === 'Tech' || s.category === 'Business');
  const langSkills = SKILLS_DATA.filter(s => s.category === 'Language');

  return (
    <section id="education" className="py-16 md:py-24 bg-transparent transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            {/* Education Column */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
                        <GraduationCap className="text-brand-700 dark:text-brand-300" size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">Education</h2>
                </div>
                
                <div className="space-y-6 md:space-y-8">
                    {EDUCATION_DATA.map((edu, idx) => (
                        <div key={idx} className="bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 p-6 rounded-xl shadow-sm shadow-stone-900/5 dark:shadow-none">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-1 sm:gap-0">
                                <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">{edu.school}</h3>
                                <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-500 dark:text-stone-400">{edu.period}</span>
                            </div>
                            <p className="text-brand-700 dark:text-brand-300 font-medium mb-1">{edu.degree}</p>
                            <p className="text-sm text-stone-500 dark:text-stone-400 mb-4">{edu.location}</p>
                            <ul className="space-y-1">
                                {edu.details.map((detail, dIdx) => (
                                    <li key={dIdx} className="text-sm text-stone-600 dark:text-stone-400">• {detail}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills Column */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
                        <Cpu className="text-brand-700 dark:text-brand-300" size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">Skills</h2>
                </div>

                <div className="bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 p-6 rounded-xl mb-8 shadow-sm shadow-stone-900/5 dark:shadow-none">
                    <h3 className="text-stone-900 dark:text-stone-50 font-semibold mb-6">Technical & Commercial Proficiency</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={techSkills} layout="vertical" margin={{ left: 40 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fill: isDark ? '#d6d3d1' : '#57534e', fontSize: 12}} />
                                <Tooltip content={<SkillsTooltip isDark={isDark} />} cursor={{ fill: 'transparent' }} />
                                <Bar dataKey="level" radius={[0, 4, 4, 0]}>
                                    {techSkills.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#a88755" fillOpacity={0.55 + (index * 0.05)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm border border-stone-200/70 dark:border-stone-800/60 p-6 rounded-xl shadow-sm shadow-stone-900/5 dark:shadow-none">
                    <h3 className="text-stone-900 dark:text-stone-50 font-semibold mb-4">Languages</h3>
                    <div className="flex flex-wrap gap-3">
                        {langSkills.map((lang, idx) => (
                            <span 
                                key={idx} 
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                    lang.level >= 90 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' 
                                    : 'bg-stone-100/80 dark:bg-stone-800/40 text-stone-700 dark:text-stone-300 border-stone-200/70 dark:border-stone-700/50'
                                }`}
                            >
                                {lang.name} {lang.level >= 90 ? '(Native)' : lang.level >= 60 ? '(Fluent)' : '(Conversational)'}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
      </div>
    </section>
  );
};

export default Skills;

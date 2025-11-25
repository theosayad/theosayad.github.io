import React from 'react';
import { SKILLS_DATA, EDUCATION_DATA } from '../constants';
import { Cpu, GraduationCap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SkillsProps {
  isDark: boolean;
}

const Skills: React.FC<SkillsProps> = ({ isDark }) => {
  // Split skills for better visualization
  const techSkills = SKILLS_DATA.filter(s => s.category === 'Tech' || s.category === 'Business');
  const langSkills = SKILLS_DATA.filter(s => s.category === 'Language');

  return (
    <section id="education" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16">
            {/* Education Column */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-500/10 rounded-lg">
                        <GraduationCap className="text-brand-600 dark:text-brand-400" size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">Education</h2>
                </div>
                
                <div className="space-y-6 md:space-y-8">
                    {EDUCATION_DATA.map((edu, idx) => (
                        <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-none">
                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2 gap-1 sm:gap-0">
                                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{edu.school}</h3>
                                <span className="text-xs font-mono text-slate-500">{edu.period}</span>
                            </div>
                            <p className="text-brand-600 dark:text-brand-400 font-medium mb-1">{edu.degree}</p>
                            <p className="text-sm text-slate-500 mb-4">{edu.location}</p>
                            <ul className="space-y-1">
                                {edu.details.map((detail, dIdx) => (
                                    <li key={dIdx} className="text-sm text-slate-600 dark:text-slate-400">• {detail}</li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skills Column */}
            <div>
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-brand-500/10 rounded-lg">
                        <Cpu className="text-brand-600 dark:text-brand-400" size={24} />
                    </div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">Skills</h2>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl mb-8 shadow-sm dark:shadow-none">
                    <h3 className="text-slate-900 dark:text-white font-bold mb-6">Technical & Commercial Proficiency</h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={techSkills} layout="vertical" margin={{ left: 40 }}>
                                <XAxis type="number" domain={[0, 100]} hide />
                                <YAxis dataKey="name" type="category" width={100} tick={{fill: isDark ? '#94a3b8' : '#475569', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ 
                                        backgroundColor: isDark ? '#0f172a' : '#ffffff', 
                                        borderColor: isDark ? '#1e293b' : '#e2e8f0', 
                                        color: isDark ? '#fff' : '#0f172a' 
                                    }} 
                                    itemStyle={{ color: '#38bdf8' }}
                                    cursor={{fill: 'transparent'}}
                                />
                                <Bar dataKey="level" radius={[0, 4, 4, 0]}>
                                    {techSkills.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill="#0ea5e9" fillOpacity={0.6 + (index * 0.05)} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-xl shadow-sm dark:shadow-none">
                    <h3 className="text-slate-900 dark:text-white font-bold mb-4">Languages</h3>
                    <div className="flex flex-wrap gap-3">
                        {langSkills.map((lang, idx) => (
                            <span 
                                key={idx} 
                                className={`px-3 py-1 rounded-full text-sm font-medium border ${
                                    lang.level >= 90 
                                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900' 
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
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
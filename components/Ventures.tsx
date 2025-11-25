
import React, { useRef, useState } from 'react';
import { VENTURES_DATA } from '../constants';
import { Rocket, ExternalLink } from 'lucide-react';
import { Reveal } from './Reveal';

const VentureCard: React.FC<{ venture: any }> = ({ venture }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    
    // Spotlight position
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setPosition({ x, y });

    // Tilt Calculation
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 10 degrees)
    const rotateX = ((y - centerY) / centerY) * -5; 
    const rotateY = ((x - centerX) / centerX) * 5;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
    setTilt({ x: 0, y: 0 }); // Reset tilt
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 md:p-8 transition-all duration-200 hover:shadow-xl hover:shadow-brand-500/5 dark:hover:shadow-brand-900/20 group"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: opacity === 0 ? 'transform 0.5s ease-out' : 'none' // Smooth reset, instant follow
      }}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(56, 189, 248, 0.1), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 sm:gap-0">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">{venture.name}</h3>
            <p className="text-sm font-medium text-brand-600 dark:text-brand-500 mt-1">{venture.role}</p>
          </div>
          <span className="text-xs font-mono text-slate-500 dark:text-slate-500 bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 self-start">{venture.period}</span>
        </div>

        <ul className="space-y-2 mb-6">
          {venture.description.map((item: string, idx: number) => (
            <li key={idx} className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed flex items-start">
              <span className="mr-2 text-brand-500 mt-1.5">•</span>
              {item}
            </li>
          ))}
        </ul>

        {venture.link && (
          <a
            href={venture.link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors gap-2 p-2 -ml-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Visit Project <ExternalLink size={14} />
          </a>
        )}
      </div>
    </div>
  );
};

const Ventures: React.FC = () => {
  return (
    <section id="ventures" className="py-16 md:py-24 bg-slate-50 dark:bg-slate-950 relative transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-brand-500/10 rounded-lg">
                <Rocket className="text-brand-600 dark:text-brand-400" size={24} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white">Entrepreneurial Ventures</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Founding & Leading Projects since 2016</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-1000">
          {VENTURES_DATA.map((venture, idx) => (
            <Reveal key={venture.id} delay={idx * 0.1}>
              <VentureCard venture={venture} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Ventures;

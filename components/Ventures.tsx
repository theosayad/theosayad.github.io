
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
      className="relative h-full overflow-hidden rounded-2xl border border-stone-200/70 dark:border-stone-800/60 bg-white/70 dark:bg-stone-900/40 backdrop-blur-sm p-6 md:p-8 transition-all duration-200 hover:shadow-2xl hover:shadow-brand-500/10 dark:hover:shadow-brand-900/20 group flex flex-col"
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) scale3d(1.02, 1.02, 1.02)`,
        transition: opacity === 0 ? 'transform 0.5s ease-out' : 'none' // Smooth reset, instant follow
      }}
    >
      {/* Spotlight Effect */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100 hidden md:block"
        style={{
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, rgba(168, 135, 85, 0.14), transparent 40%)`,
        }}
      />
      
      <div className="relative z-10 flex flex-col h-full">
        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-2 sm:gap-0">
          <div>
            <h3 className="text-xl font-semibold text-stone-900 dark:text-stone-50 group-hover:text-brand-700 dark:group-hover:text-brand-300 transition-colors">{venture.name}</h3>
            <p className="text-sm font-medium text-brand-700 dark:text-brand-300 mt-1">{venture.role}</p>
          </div>
          <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-stone-600 dark:text-stone-400 bg-white/50 dark:bg-stone-950/30 px-3 py-1.5 rounded-full border border-stone-200/70 dark:border-stone-800/60 self-start">{venture.period}</span>
        </div>

        <ul className="space-y-2 mb-6 flex-1">
          {venture.description.map((item: string, idx: number) => (
            <li key={idx} className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed flex items-start">
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
            className="mt-auto inline-flex items-center text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-50 transition-colors gap-2 p-2 -ml-2 rounded-md hover:bg-stone-100/70 dark:hover:bg-stone-800/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-400/60"
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
    <section id="ventures" className="py-16 md:py-24 bg-transparent relative transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-12">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="p-3 bg-brand-500/10 rounded-lg border border-brand-200/60 dark:border-stone-800/60">
                <Rocket className="text-brand-700 dark:text-brand-300" size={24} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-display font-semibold tracking-tight text-stone-900 dark:text-stone-50">Entrepreneurial Ventures</h2>
                <p className="text-stone-500 dark:text-stone-400 mt-1 text-sm md:text-base">Founding & Leading Projects since 2016</p>
              </div>
            </div>
          </div>
        </Reveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 perspective-1000 items-stretch auto-rows-fr">
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

import React, { useEffect, useRef, useState } from 'react';

interface RevealProps {
  children: React.ReactNode;
  width?: 'fit-content' | '100%';
  delay?: number;
}

export const Reveal: React.FC<RevealProps> = ({ children, width = '100%', delay = 0 }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener?.('change', update);

    if (media.matches) {
      setIsVisible(true);
      return () => media.removeEventListener?.('change', update);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Only animate once
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      if (ref.current) observer.disconnect();
      media.removeEventListener?.('change', update);
    };
  }, []);

  return (
    <div ref={ref} style={{ width }} className="relative overflow-visible h-full">
      <div
        style={{
          transform: prefersReducedMotion ? 'none' : isVisible ? 'translateY(0)' : 'translateY(75px)',
          opacity: prefersReducedMotion ? 1 : isVisible ? 1 : 0,
          transition: prefersReducedMotion
            ? 'none'
            : `all 0.9s cubic-bezier(0.17, 0.55, 0.55, 1) ${delay}s`
        }}
        className="h-full"
      >
        {children}
      </div>
    </div>
  );
};

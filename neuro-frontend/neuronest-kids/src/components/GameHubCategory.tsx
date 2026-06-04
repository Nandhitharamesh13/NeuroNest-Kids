import { cn } from '@/lib/utils';
import { useRef, useEffect } from 'react';
import gsap from 'gsap';

interface GameHubCategoryProps {
  title: string;
  icon: React.ReactNode;
  color: string;
  children: React.ReactNode;
}

export function GameHubCategory({ title, icon, color, children }: GameHubCategoryProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      // Stagger children animation
      const cards = containerRef.current?.querySelectorAll('button');
      if (cards) {
        gsap.fromTo(cards,
          { opacity: 0, y: 30, scale: 0.9 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'back.out(1.5)',
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="mb-8">
      <div 
        ref={headerRef}
        className="flex items-center gap-3 mb-4 px-1"
      >
        <div className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-lg transform-gpu",
          color
        )}>
          {icon}
        </div>
        <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
        {children}
      </div>
    </div>
  );
}

import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InteractiveMascot } from '@/components/InteractiveMascot';
import { Sparkles, Heart, Star, Zap, Brain, Palette, BookOpen } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  const heroRef = useRef<HTMLDivElement>(null);
  const decorationsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const mascotContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const badgesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Floating decorations with parallax
      const decorations = decorationsRef.current?.children;
      if (decorations) {
        Array.from(decorations).forEach((el, i) => {
          gsap.to(el, {
            y: -30 + Math.random() * 60,
            x: -20 + Math.random() * 40,
            rotation: -15 + Math.random() * 30,
            duration: 3 + Math.random() * 2,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut',
            delay: i * 0.2,
          });
        });
      }

      // Hero entrance timeline
      const heroTl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      
      heroTl
        .fromTo(titleRef.current, 
          { opacity: 0, y: 60, skewY: 3 },
          { opacity: 1, y: 0, skewY: 0, duration: 1 }
        )
        .fromTo(subtitleRef.current,
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, duration: 0.8 },
          '-=0.5'
        )
        .fromTo(ctaRef.current?.children || [],
          { opacity: 0, y: 30, scale: 0.9 },
          { opacity: 1, y: 0, scale: 1, duration: 0.6, stagger: 0.15 },
          '-=0.4'
        )
        .fromTo(mascotContainerRef.current,
          { opacity: 0, scale: 0.5, rotation: -10 },
          { opacity: 1, scale: 1, rotation: 0, duration: 0.8, ease: 'back.out(2)' },
          '-=0.6'
        );

      // Mascot floating animation
      gsap.to(mascotContainerRef.current, {
        y: -15,
        duration: 2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Feature cards scroll animation
      const features = featuresRef.current?.children;
      if (features) {
        gsap.fromTo(features,
          { opacity: 0, y: 80, scale: 0.8 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'back.out(1.5)',
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 80%',
              toggleActions: 'play none none none',
            },
          }
        );
      }

      // Badges animation
      const badges = badgesRef.current?.children;
      if (badges) {
        gsap.fromTo(badges,
          { opacity: 0, scale: 0, rotation: -180 },
          {
            opacity: 1,
            scale: 1,
            rotation: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(2)',
            scrollTrigger: {
              trigger: badgesRef.current,
              start: 'top 85%',
            },
          }
        );
      }

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen bg-gradient-to-b from-background via-pastel-lavender/10 to-pastel-mint/20 overflow-hidden">
      {/* Animated floating decorations */}
      <div ref={decorationsRef} className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-16 left-[8%] text-pastel-lemon opacity-60">
          <Star className="w-10 h-10 fill-current" />
        </div>
        <div className="absolute top-32 right-[12%] text-pastel-rose opacity-60">
          <Heart className="w-8 h-8 fill-current" />
        </div>
        <div className="absolute bottom-48 left-[5%] text-pastel-mint opacity-50">
          <Sparkles className="w-9 h-9" />
        </div>
        <div className="absolute top-[45%] left-[20%] text-pastel-sky opacity-40">
          <Star className="w-6 h-6 fill-current" />
        </div>
        <div className="absolute bottom-32 right-[15%] text-pastel-peach opacity-50">
          <Heart className="w-7 h-7 fill-current" />
        </div>
        <div className="absolute top-24 left-[40%] text-duo-purple opacity-30">
          <Zap className="w-6 h-6 fill-current" />
        </div>
        <div className="absolute bottom-[35%] right-[8%] text-duo-blue opacity-30">
          <Brain className="w-8 h-8" />
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-4 md:p-6">
        <nav className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <InteractiveMascot size="sm" interactive={false} />
            <span className="font-display text-2xl md:text-3xl font-bold text-slate-800">
              NeuroNest
            </span>
          </div>
          <div className="flex gap-2 md:gap-3">
            <Link to="/auth?mode=login">
              <Button variant="ghost" size="lg" className="font-semibold text-sm md:text-base px-4 md:px-6">
                Login
              </Button>
            </Link>
            <Link to="/auth?mode=signup">
              <Button 
                size="lg" 
                className="font-semibold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base px-4 md:px-6 bg-gradient-to-r from-primary to-duo-purple hover:scale-105"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pt-8 md:pt-16 pb-20">
        <div className="grid lg:grid-cols-2 gap-8 md:gap-12 items-center">
          {/* Left Content */}
          <div className="text-center lg:text-left">
            <h1 
              ref={titleRef}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-4 md:mb-6"
              style={{ opacity: 0 }}
            >
              <span className="text-slate-800">Learning Made</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-duo-green via-duo-teal to-duo-blue">
                Fun
              </span>{' '}
              <span className="text-slate-800">&</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-duo-orange via-duo-pink to-duo-purple">
                Friendly
              </span>
            </h1>
            
            <p 
              ref={subtitleRef}
              className="text-base md:text-lg lg:text-xl text-slate-600 mb-6 md:mb-8 max-w-xl mx-auto lg:mx-0"
              style={{ opacity: 0 }}
            >
              An autism-friendly educational game app designed to help children learn 
              through playful shapes, colors, and nature exploration in a calming, 
              supportive environment.
            </p>

            <div ref={ctaRef} className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center lg:justify-start">
              <Link to="/auth?mode=signup">
                <Button 
                  size="lg" 
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 bg-gradient-to-r from-duo-green to-duo-teal"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Start Learning Today
                </Button>
              </Link>
              <Link to="/auth?mode=login">
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="w-full sm:w-auto text-base md:text-lg px-6 md:px-8 py-5 md:py-6 border-2 hover:bg-muted/50 transition-all duration-300"
                >
                  I Have an Account
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - Interactive Mascot */}
          <div className="flex justify-center order-first lg:order-last">
            <div ref={mascotContainerRef} className="relative" style={{ opacity: 0 }}>
              {/* Glow effect behind mascot */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-duo-purple/20 to-duo-blue/30 rounded-full blur-3xl scale-125 animate-pulse" />
              <div className="absolute inset-0 bg-duo-yellow/10 rounded-full blur-2xl scale-110" />
              <InteractiveMascot size="xl" emotion="happy" />
            </div>
          </div>
        </div>

        {/* Features */}
        <div ref={featuresRef} className="mt-16 md:mt-24 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <FeatureCard
            icon={<Palette className="w-8 h-8" />}
            emoji="🔷"
            title="Shape Matching"
            description="Learn shapes through fun drag-and-drop games with gentle animations"
            color="from-duo-purple to-duo-pink"
          />
          <FeatureCard
            icon={<Sparkles className="w-8 h-8" />}
            emoji="🎨"
            title="Color Recognition"
            description="Discover colors in an engaging, sensory-friendly environment"
            color="from-duo-blue to-duo-teal"
          />
          <FeatureCard
            icon={<BookOpen className="w-8 h-8" />}
            emoji="🍎"
            title="Fruits & Vegetables"
            description="Identify healthy foods through playful, interactive lessons"
            color="from-duo-green to-duo-teal"
          />
        </div>

        <div className="mt-12 md:mt-16 text-center">
          <p className="text-slate-500 mb-4 text-sm md:text-base font-medium">Designed with care for</p>
          <div ref={badgesRef} className="flex flex-wrap justify-center gap-2 md:gap-4">
            <Badge icon="✓" text="Sensory-Friendly" />
            <Badge icon="✓" text="Large Touch Targets" />
            <Badge icon="✓" text="High Contrast" />
            <Badge icon="✓" text="Soothing Audio" />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border py-6 md:py-8 mt-12">
        <div className="max-w-6xl mx-auto px-6 text-center text-muted-foreground">
          <p className="text-sm md:text-base">&copy; 2024 NeuroNest. Made with 💜 for special learners.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  emoji: string;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, emoji, title, description, color }: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    gsap.to(cardRef.current, {
      scale: 1.03,
      y: -8,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    gsap.to(cardRef.current, {
      scale: 1,
      y: 0,
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  return (
    <div 
      ref={cardRef}
      className="bg-card rounded-3xl p-5 md:p-6 shadow-card hover:shadow-glow transition-colors cursor-pointer border border-border/50"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white mb-4 shadow-lg`}>
        <span className="text-2xl">{emoji}</span>
      </div>
      <h3 className="font-display text-lg md:text-xl font-bold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 text-sm md:text-base">{description}</p>
    </div>
  );
}

interface BadgeProps {
  icon: string;
  text: string;
}

function Badge({ icon, text }: BadgeProps) {
  return (
    <span className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-slate-700 px-4 py-2 rounded-full text-xs md:text-sm font-medium shadow-md border border-duo-green/20">
      <span className="text-duo-green font-bold">{icon}</span>
      {text}
    </span>
  );
}

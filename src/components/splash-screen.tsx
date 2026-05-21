import { useState, useEffect } from "react";
import heroVideoMp4 from "@/assets/hero-video.mp4";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    // Check if the user has already seen the splash screen in this session
    const hasSeenSplash = sessionStorage.getItem("saf_splash_seen");
    if (hasSeenSplash) {
      setIsVisible(false);
      return;
    }

    // Sequence 1: Reveal the content after a tiny delay
    const contentTimer = setTimeout(() => setShowContent(true), 200);

    // Sequence 2: Start fading out the splash screen after 3.8 seconds
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 3800);

    // Sequence 3: Completely remove the splash screen from DOM
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("saf_splash_seen", "true");
    }, 4800); // 1s after fade begins

    return () => {
      clearTimeout(contentTimer);
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black transition-opacity duration-1000 ${
        isFading ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
    >
      {/* Cinematic Video Background with Futuristic Overlay */}
      <div className="absolute inset-0 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`w-full h-full object-cover transition-all duration-[4000ms] ease-out ${
            showContent ? "opacity-30 scale-100" : "opacity-0 scale-110"
          }`}
        >
          <source src={heroVideoMp4} type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-transparent" />
        
        {/* Subtle holographic grid / grain overlay for realism */}
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-10 mix-blend-overlay" />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl flex flex-col items-center w-full">
        {/* Sleek Top Label */}
        <div
          className={`inline-flex items-center gap-4 mb-10 transition-all duration-1000 ease-out delay-300 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-gold/80" />
          <span className="text-[10px] md:text-xs tracking-[0.5em] uppercase text-gold/90 font-light">
            Loading EventVerse
          </span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-gold/80" />
        </div>

        {/* Premium Brand Title */}
        <h1
          className={`font-display text-6xl md:text-8xl lg:text-9xl text-white mb-2 leading-none transition-all duration-1000 ease-out delay-500 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
          style={{ textShadow: "0 0 40px rgba(255,255,255,0.1)" }}
        >
          SAF
        </h1>
        <h2
          className={`gold-text italic text-3xl md:text-5xl lg:text-6xl font-light tracking-wide mb-16 transition-all duration-1000 ease-out delay-700 ${
            showContent ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          Convention Centre
        </h2>

        {/* Futuristic Automatic Loading Bar */}
        <div 
          className={`w-full max-w-md h-px bg-white/10 relative overflow-hidden transition-all duration-1000 ease-out delay-1000 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          <div 
            className="absolute top-0 left-0 h-full bg-gold transition-all ease-out"
            style={{ 
              width: showContent ? '100%' : '0%',
              transitionDuration: '3.5s' 
            }}
          />
          <div className="absolute top-0 left-0 h-full w-20 bg-white/50 blur-[2px] animate-shimmer" />
        </div>
        
        {/* Loading text sequence */}
        <div 
          className={`mt-4 text-[9px] uppercase tracking-[0.3em] text-white/40 transition-all duration-1000 delay-1000 ${
            showContent ? "opacity-100" : "opacity-0"
          }`}
        >
          Initializing Experience
        </div>
      </div>
    </div>
  );
}

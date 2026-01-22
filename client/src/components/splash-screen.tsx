import { useState, useEffect, useRef, useCallback } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SplashScreenProps {
  onComplete: () => void;
}

const SPLASH_DURATION = 5000;
const SKIP_DELAY = 800;

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [canSkip, setCanSkip] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const hasExited = useRef(false);
  const startTime = useRef(Date.now());

  const handleExit = useCallback((persist: boolean = false) => {
    if (hasExited.current) return;
    hasExited.current = true;
    
    if (persist) {
      try {
        sessionStorage.setItem("flashfusion_splash_skipped", "true");
      } catch {
        // sessionStorage unavailable in private mode or blocked
      }
    }
    
    setIsExiting(true);
    setTimeout(() => {
      onComplete();
    }, 500);
  }, [onComplete]);

  const handleSkip = useCallback(() => {
    handleExit(true);
  }, [handleExit]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      onComplete();
      return;
    }

    const skipTimer = setTimeout(() => setCanSkip(true), SKIP_DELAY);
    
    const autoDismissTimer = setTimeout(() => {
      handleExit(true);
    }, SPLASH_DURATION);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(autoDismissTimer);
    };
  }, [onComplete, handleExit]);

  useEffect(() => {
    const video = videoRef.current;
    
    const handleVideoTimeUpdate = () => {
      if (video && video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
    };

    const handleVideoEnded = () => {
      handleExit();
    };

    if (video) {
      video.addEventListener("timeupdate", handleVideoTimeUpdate);
      video.addEventListener("ended", handleVideoEnded);
    }

    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const percentage = Math.min((elapsed / SPLASH_DURATION) * 100, 100);
      setProgress(prev => Math.max(prev, percentage));
    }, 50);

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", handleVideoTimeUpdate);
        video.removeEventListener("ended", handleVideoEnded);
      }
      clearInterval(progressInterval);
    };
  }, [handleExit]);

  return (
    <div 
      className={`fixed inset-0 z-[100] bg-[#0d0b14] flex items-center justify-center overflow-hidden transition-opacity duration-500 ${
        isExiting ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      data-testid="splash-screen"
    >
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover opacity-60"
        autoPlay
        muted
        playsInline
        data-testid="splash-video"
      >
        <source src="/splash-video.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0d0b14]/50 to-[#0d0b14]" />

      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#4725f4]/20 blur-[100px] animate-pulse-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#ec4899]/15 blur-[80px] animate-pulse-slow" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#4725f4]/10 blur-[120px] animate-pulse-slow" style={{ animationDelay: "0.5s" }} />

      <div className="relative z-10 flex flex-col items-center gap-8">
        <div className={`flex items-center gap-3 transition-all duration-700 ${isExiting ? "scale-110 opacity-0" : "scale-100 opacity-100"}`}>
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-[#4725f4] to-[#ec4899] rounded-xl blur-xl opacity-60 animate-pulse-slow" />
            <div className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-[#4725f4] to-[#ec4899] flex items-center justify-center shadow-[0_0_40px_rgba(71,37,244,0.5)]">
              <Zap className="w-9 h-9 text-white" />
            </div>
          </div>
          <span className="font-display font-bold text-4xl bg-gradient-to-r from-[#4725f4] via-[#8b5cf6] to-[#ec4899] bg-clip-text text-transparent">
            FlashFusion
          </span>
        </div>

        <p className="text-white/60 text-sm tracking-widest uppercase animate-fade-in" style={{ animationDelay: "0.3s" }}>
          AI-Powered Ecommerce
        </p>

        <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-gradient-to-r from-[#4725f4] to-[#ec4899] rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/30 animate-shimmer" />
          </div>
        </div>
      </div>

      {canSkip && !isExiting && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-fade-in">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            className="text-white/40 hover:text-white/80 text-xs tracking-wider uppercase"
            data-testid="button-skip-splash"
          >
            Skip Intro
          </Button>
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#4725f4]/50 to-transparent" />
    </div>
  );
}

import { useLocation } from "wouter";
import { Zap, HelpCircle, Bolt } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Onboarding() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-mesh overflow-hidden max-w-[430px] mx-auto border-x border-white/5 shadow-2xl">
      {/* Top App Bar */}
      <div className="flex items-center p-6 pb-2 justify-between z-10">
        <div className="w-10" />
        <h2 className="text-white text-lg font-bold leading-tight tracking-wider uppercase text-center flex-1 font-display">
          FlashFusion
        </h2>
        <div className="w-10 flex justify-end">
          <HelpCircle className="w-5 h-5 text-white/50 cursor-pointer" data-testid="button-help" />
        </div>
      </div>

      {/* Hero Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 relative">
        {/* Energy Rings Decor */}
        <div className="absolute w-80 h-80 rounded-full border-2 border-[#4725f4]/30 opacity-20" style={{ borderTopColor: '#4725f4' }} />
        <div className="absolute w-64 h-64 rounded-full border-2 border-[#4725f4]/30 opacity-40 rotate-45" style={{ borderTopColor: '#4725f4' }} />
        <div className="absolute w-96 h-96 rounded-full border border-[#4725f4]/10" />

        {/* Mascot Image Container */}
        <div className="relative z-10 mb-8">
          <div className="w-64 h-64 flex items-center justify-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#4725f4]/10 to-[#ec4899]/10 border border-white/5">
            <img 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuC4sMHYVmuCdDJNyCqA-cabMBw83gRA8ihBl4bwv_Ysnt39Rci7Wi5FUv2sJo0PCT23V1p8wLakX-BXOnabjFL8wQcb8gWihh5suZVG-bTi57yxF_HAs9KFVqXtncNmNGFfvF4KOKbc9jqax1LlKAcx4Es_GPMXa7c7RLIRebzdBQ7N_40rPra6qosKfBGD0qXqVgcYprkyFjYQnw20kF8gwCZaQ_UWA4HHyD6ynHQ"
              alt="Futuristic robot mascot"
              className="w-full h-full object-cover animate-pulse"
            />
            {/* Glow Effect behind Mascot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-[#4725f4]/20 blur-[60px] rounded-full -z-10" />
          </div>
        </div>

        {/* Headline Text */}
        <h1 className="text-white tracking-tight text-4xl font-bold leading-tight text-center pb-2 z-10 font-display">
          Welcome to<br />FlashFusion
        </h1>

        {/* Body Text */}
        <p className="text-white/70 text-base font-normal leading-relaxed px-8 text-center max-w-sm z-10">
          Step into the future of e-commerce. AI-driven, lightning fast, and built for the next generation.
        </p>
      </div>

      {/* Bottom Controls */}
      <div className="px-8 pb-12 flex flex-col gap-6 z-10">
        {/* Page Indicators */}
        <div className="flex w-full flex-row items-center justify-center gap-2">
          <div className="h-1.5 w-6 rounded-full bg-[#4725f4]" style={{ boxShadow: '0 0 8px rgba(71, 37, 244, 0.6)' }} />
          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
          <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        </div>

        {/* Primary Action */}
        <Button
          onClick={() => setLocation("/dashboard")}
          className="w-full bg-[#4725f4] hover:bg-[#4725f4]/90 text-white font-bold py-4 rounded-xl text-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ boxShadow: '0 0 15px rgba(71, 37, 244, 0.4), 0 0 30px rgba(71, 37, 244, 0.2)', height: '56px' }}
          data-testid="button-start-fusion"
        >
          <span>Start Fusion</span>
          <Bolt className="w-5 h-5" />
        </Button>

        {/* Secondary Action */}
        <button
          onClick={() => setLocation("/auth")}
          className="w-full text-white/50 text-sm font-medium hover:text-white transition-colors py-2"
          data-testid="link-sign-in"
        >
          Already have an account? <span className="text-white">Sign In</span>
        </button>
      </div>

      {/* Aesthetic Bottom Glow */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#4725f4]/10 to-transparent pointer-events-none" />
    </div>
  );
}

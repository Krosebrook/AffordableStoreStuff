import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Zap, Diamond, Filter, CheckCircle, ArrowRight } from "lucide-react";

export default function BrandCalibration() {
  const [, setLocation] = useLocation();
  const [selectedArchetype, setSelectedArchetype] = useState("rebel");

  const archetypes = [
    { id: "luxury", icon: Diamond, label: "Luxury", desc: "Elegant, exclusive, high-status and refined." },
    { id: "rebel", icon: Zap, label: "Rebel", desc: "Bold, disruptive, unconventional and loud." },
    { id: "minimalist", icon: Filter, label: "Minimalist", desc: "Clean, essential, functional and precise." },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden max-w-[430px] mx-auto border-x border-white/5 shadow-2xl bg-[#0a0a0a] font-display text-white">
      <div className="flex items-center bg-transparent p-4 pb-2 justify-between z-10">
        <div className="text-white flex size-12 shrink-0 items-center justify-start">
          <ArrowLeft 
            className="w-5 h-5 cursor-pointer" 
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          />
        </div>
        <h2 className="text-white text-sm font-bold uppercase tracking-[0.2em] flex-1 text-center pr-12" data-testid="text-page-title">FlashFusion Hub</h2>
      </div>

      <div className="flex flex-col gap-3 p-6 pt-2">
        <div className="flex gap-6 justify-between items-end">
          <p className="text-white/60 text-xs font-medium uppercase tracking-widest">Neural Calibration</p>
          <p className="text-[#4725f4] text-xl font-bold leading-none" data-testid="text-calibration-percent">88%</p>
        </div>
        <div className="rounded-full bg-white/10 h-1.5 overflow-hidden">
          <div 
            className="h-full rounded-full bg-[#4725f4]" 
            style={{ width: '88%', boxShadow: '0 0 20px rgba(71, 37, 244, 0.4)' }}
          ></div>
        </div>
        <p className="text-white/40 text-[10px] font-medium tracking-tight">LINK STABILITY: OPTIMAL</p>
      </div>

      <div className="flex flex-col items-center justify-center py-4 relative">
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle, #4725f4 1px, transparent 1px)',
            backgroundSize: '30px 30px'
          }}
        ></div>

        <div className="size-48 rounded-full border border-[#4725f4]/30 flex items-center justify-center relative">
          <div className="size-32 rounded-full bg-[#4725f4]/20 border border-[#4725f4]/50 flex items-center justify-center animate-pulse">
            <div 
              className="size-20 rounded-full bg-[#4725f4] flex items-center justify-center"
              style={{ boxShadow: '0 0 20px rgba(71, 37, 244, 0.4)' }}
            >
              <Zap className="w-10 h-10 text-white" />
            </div>
          </div>
          <div className="absolute inset-0 border border-white/5 rounded-full rotate-45 scale-110"></div>
          <div className="absolute inset-0 border border-white/5 rounded-full -rotate-12 scale-125"></div>
        </div>
      </div>

      <div className="px-6 text-center space-y-2">
        <h1 className="text-white text-3xl font-bold leading-tight tracking-tight">Sync Brand Voice</h1>
        <p className="text-white/60 text-sm leading-relaxed px-4">Identify your core archetype to tune the FlashFusion neural engine.</p>
      </div>

      <div className="flex overflow-x-auto gap-4 px-6 py-8 no-scrollbar snap-x">
        {archetypes.map((arch) => (
          <Card 
            key={arch.id}
            onClick={() => setSelectedArchetype(arch.id)}
            className={`snap-center shrink-0 w-[240px] rounded-xl p-6 flex flex-col gap-4 cursor-pointer transition-all ${
              selectedArchetype === arch.id 
                ? 'border-[#4725f4] bg-[#4725f4]/10' 
                : 'border-white/5 bg-white/[0.03]'
            }`}
            style={{ 
              backdropFilter: 'blur(12px)',
              boxShadow: selectedArchetype === arch.id ? '0 0 20px rgba(71, 37, 244, 0.4)' : 'none'
            }}
            data-testid={`card-archetype-${arch.id}`}
          >
            <CardContent className="p-0">
              <div className={`size-12 rounded-lg flex items-center justify-center ${
                selectedArchetype === arch.id ? 'bg-[#4725f4]' : 'bg-white/5'
              }`}>
                <arch.icon className={`w-6 h-6 ${selectedArchetype === arch.id ? 'text-white' : 'text-white/80'}`} />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-bold">{arch.label}</h3>
                <p className={`text-xs leading-normal mt-1 ${selectedArchetype === arch.id ? 'text-white/80' : 'text-white/50'}`}>
                  {arch.desc}
                </p>
              </div>
              {selectedArchetype === arch.id && (
                <div className="flex items-center gap-2 text-[10px] font-bold text-[#4725f4] uppercase tracking-tighter mt-4">
                  <CheckCircle className="w-4 h-4" />
                  Selected for Sync
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-auto p-6 space-y-6 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent">
        <div className="flex flex-col items-center gap-2">
          <div 
            className="w-full h-10 opacity-80 rounded"
            style={{
              background: 'linear-gradient(90deg, transparent, #4725f4, #a855f7, #4725f4, transparent)',
            }}
          ></div>
          <p className="text-[10px] text-white/30 tracking-[0.3em] uppercase">Processing Archetype Frequency</p>
        </div>

        <button 
          className="w-full bg-[#4725f4] text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-3"
          data-testid="button-initiate-fusion"
        >
          INITIATE FINAL FUSION
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

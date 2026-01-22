import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Zap, 
  Sparkles,
  Smile,
  HeadphonesIcon,
  Rocket,
  Dna,
  Loader2
} from "lucide-react";
import { useLocation } from "wouter";

const aestheticOptions = [
  { id: "cyberpunk", label: "Cyberpunk", icon: Zap, active: true },
  { id: "y2k", label: "Y2K Retro", active: false },
  { id: "minimalist", label: "Minimalist", active: false },
];

const personalityOptions = [
  { id: "sassy", label: "Sassy", icon: Smile, active: false },
  { id: "helpful", label: "Helpful", icon: HeadphonesIcon, active: true },
  { id: "hypebeast", label: "Hype-beast", icon: Rocket, active: false },
];

export default function AIInfluencerStudio() {
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"aesthetic" | "personality" | "niche">("aesthetic");
  const [selectedAesthetic, setSelectedAesthetic] = useState("cyberpunk");
  const [selectedPersonality, setSelectedPersonality] = useState("helpful");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 3000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden font-display text-white bg-[#0a0914]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(71, 37, 244, 0.15) 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      <div className="sticky top-0 w-full z-50" style={{ background: 'rgba(19, 16, 34, 0.7)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(71, 37, 244, 0.2)' }}>
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <ArrowLeft 
              className="w-5 h-5 text-white cursor-pointer" 
              onClick={() => setLocation("/dashboard")}
            />
            <h2 className="text-white text-lg font-bold tracking-tight">AI Influencer Studio</h2>
          </div>
          <Badge 
            className="bg-[#4725f4]/20 px-3 py-1 border border-[#4725f4]/30 text-[#4725f4]"
          >
            <Zap className="w-3 h-3 mr-1" />
            <span className="text-xs font-bold tracking-widest uppercase">Labs</span>
          </Badge>
        </div>
      </div>

      <main className="pt-6 pb-32 px-4 max-w-md mx-auto relative min-h-screen">
        <div className="relative w-full aspect-square flex items-center justify-center mb-6">
          <div className="absolute inset-0 border border-[#4725f4]/20 rounded-full animate-pulse" />
          <div className="absolute inset-4 border-2 border-[#ec4899]/10 rounded-full" />
          <div className="absolute inset-8 border border-[#4725f4]/40 rounded-full" />

          <div 
            className="relative w-64 h-80 rounded-xl overflow-hidden flex flex-col items-center justify-center"
            style={{ 
              background: 'rgba(19, 16, 34, 0.7)', 
              backdropFilter: 'blur(12px)', 
              border: '1px solid rgba(71, 37, 244, 0.4)' 
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#4725f4]/30 to-transparent" />
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#4725f4] to-transparent" />

            <div className="w-48 h-64 bg-slate-800/40 rounded-lg relative overflow-hidden flex items-center justify-center border border-white/5">
              <div className="absolute inset-0 opacity-40 bg-center bg-cover bg-gradient-to-br from-[#4725f4]/20 to-[#ec4899]/10" />
              <div className="relative z-10 flex flex-col items-center">
                <Sparkles className="w-12 h-12 text-[#4725f4] animate-pulse" />
                <p className="text-[10px] uppercase tracking-[0.3em] mt-4 text-[#4725f4]/80 font-bold">Initializing DNA...</p>
              </div>
            </div>

            <div className="absolute bottom-4 flex gap-1">
              <div className="w-1 h-1 bg-[#4725f4] rounded-full" />
              <div className="w-1 h-3 bg-[#ec4899] rounded-full" />
              <div className="w-1 h-2 bg-[#4725f4] rounded-full" />
            </div>
          </div>
        </div>

        <div className="space-y-6 mb-8">
          <div className="flex items-center gap-2 px-2">
            <Dna className="w-4 h-4 text-[#4725f4]" />
            <h3 className="text-white text-sm font-bold uppercase tracking-widest">DNA Configuration</h3>
          </div>

          <div className="pb-1">
            <div className="flex border-b border-[#4725f4]/20 px-2 gap-6">
              {["aesthetic", "personality", "niche"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`flex flex-col items-center justify-center border-b-2 pb-2 transition-colors ${
                    activeTab === tab 
                      ? "border-[#4725f4] text-[#4725f4]" 
                      : "border-transparent text-slate-500"
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-wider">{tab}</p>
                </button>
              ))}
            </div>
          </div>

          {activeTab === "aesthetic" && (
            <div className="flex gap-2 p-2 flex-wrap">
              {aestheticOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedAesthetic(option.id)}
                  className={`flex h-10 items-center justify-center gap-x-2 rounded-lg px-4 border transition-all ${
                    selectedAesthetic === option.id
                      ? "bg-[#4725f4] text-white border-[#4725f4]/50"
                      : "bg-[#131022] text-slate-400 border-white/10"
                  }`}
                  style={selectedAesthetic === option.id ? { boxShadow: '0 0 15px rgba(71, 37, 244, 0.4)' } : {}}
                >
                  {option.icon && <option.icon className="w-4 h-4" />}
                  <p className="text-sm font-bold">{option.label}</p>
                </button>
              ))}
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 px-2">
            {personalityOptions.map((option) => (
              <button
                key={option.id}
                onClick={() => setSelectedPersonality(option.id)}
                className={`p-3 rounded-lg flex flex-col items-center transition-all ${
                  selectedPersonality === option.id
                    ? "bg-[#4725f4]/10 border-[#4725f4]/40"
                    : "border-white/5 opacity-60"
                }`}
                style={{ 
                  background: 'rgba(19, 16, 34, 0.7)', 
                  backdropFilter: 'blur(12px)', 
                  border: selectedPersonality === option.id ? '1px solid rgba(71, 37, 244, 0.4)' : '1px solid rgba(255, 255, 255, 0.05)' 
                }}
              >
                <option.icon className={`w-5 h-5 mb-1 ${selectedPersonality === option.id ? 'text-[#4725f4]' : 'text-slate-400'}`} />
                <p className={`text-[10px] font-bold uppercase ${selectedPersonality === option.id ? 'text-[#4725f4]' : 'text-slate-500'}`}>
                  {option.label}
                </p>
              </button>
            ))}
          </div>
        </div>

        <Card 
          className="p-4 rounded-xl mb-12 relative overflow-hidden border-[#4725f4]/20"
          style={{ 
            background: 'rgba(19, 16, 34, 0.7)', 
            backdropFilter: 'blur(12px)' 
          }}
        >
          <CardContent className="p-0">
            <div className="absolute top-0 right-0 p-2">
              <div className="text-[8px] text-[#ec4899] font-bold uppercase tracking-tighter animate-pulse">Live Analysis</div>
            </div>
            <div className="flex justify-between items-end mb-4">
              <div>
                <h4 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Brand Synergy</h4>
                <div className="text-3xl font-bold text-white tracking-tighter font-display">
                  84<span className="text-[#4725f4] text-xl">%</span>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <div className="flex gap-1 mb-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div 
                      key={i} 
                      className={`h-4 w-1 rounded-full ${i <= 3 ? 'bg-[#4725f4]' : 'bg-[#4725f4]/20'}`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-medium uppercase">Trend Alignment</span>
              </div>
            </div>
            <Progress 
              value={84} 
              className="h-1 bg-white/5"
            />
          </CardContent>
        </Card>
      </main>

      <div className="fixed bottom-0 w-full p-6 pb-8 z-50" style={{ background: 'linear-gradient(to top, #0a0914 60%, transparent)' }}>
        <div className="max-w-md mx-auto">
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full h-16 rounded-xl flex items-center justify-center gap-3 relative group overflow-hidden"
            style={{ 
              background: 'linear-gradient(to right, #4725f4, #6c4eff, #ec4899)',
              boxShadow: '0 0 20px rgba(236, 72, 153, 0.5)'
            }}
            data-testid="button-generate-pipeline"
          >
            <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity" />
            <div className="absolute top-0 left-0 w-full h-[1px] bg-white/30" />
            {isGenerating ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Sparkles className="w-5 h-5" />
            )}
            <span className="text-white font-bold uppercase tracking-[0.15em] text-sm">
              {isGenerating ? "Generating..." : "Generate Content Pipeline"}
            </span>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
              <Zap className="w-5 h-5 text-white" />
            </div>
          </Button>
          <p className="text-center text-[10px] text-slate-500 mt-4 uppercase tracking-widest font-medium">
            Estimated compute time: 14s
          </p>
        </div>
      </div>
    </div>
  );
}

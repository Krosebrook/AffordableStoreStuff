import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, Zap, BarChart3, TrendingUp, CheckCircle, Sparkles } from "lucide-react";

export default function ProductPulseHeatmap() {
  const [, setLocation] = useLocation();
  const [timePosition, setTimePosition] = useState(66);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#050505]">
      <div 
        className="absolute inset-0 z-10 pointer-events-none opacity-20"
        style={{
          background: 'linear-gradient(to bottom, transparent 50%, rgba(166, 13, 242, 0.05) 50%)',
          backgroundSize: '100% 4px'
        }}
      />

      <div className="flex items-center bg-[#050505]/80 backdrop-blur-md p-4 pb-2 justify-between z-40 border-b border-[#a60df2]/20">
        <div className="text-[#a60df2] flex size-12 shrink-0 items-center justify-start">
          <ChevronLeft 
            className="w-6 h-6 cursor-pointer" 
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          />
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight font-display" data-testid="text-page-title">FlashFusion Pulse</h2>
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Live Sync</span>
          </div>
        </div>
        <div className="flex w-12 items-center justify-end">
          <button 
            className="flex items-center justify-center rounded-xl h-10 w-10 bg-[#a60df2]/20 text-[#a60df2] border border-[#a60df2]/30"
            data-testid="button-analytics"
          >
            <BarChart3 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 py-3 flex justify-between items-center bg-[#050505]/40 z-30">
        <h4 className="text-[#a60df2]/70 text-xs font-bold uppercase tracking-widest">3D Performance Treemap</h4>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#a60df2]" style={{ boxShadow: '0 0 15px rgba(166, 13, 242, 0.6)' }}></div>
            <span className="text-[10px] text-white/60">Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-[#ff00e5]" style={{ boxShadow: '0 0 15px rgba(255, 0, 229, 0.6)' }}></div>
            <span className="text-[10px] text-white/60">Growth</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 relative z-20">
        <div className="grid grid-cols-6 grid-rows-6 gap-2 h-[450px]">
          <div 
            className="col-span-4 row-span-3 bg-gradient-to-br from-[#a60df2]/80 to-[#a60df2]/40 rounded-lg p-3 border border-[#a60df2]/50 flex flex-col justify-end relative overflow-hidden group cursor-pointer"
            style={{ boxShadow: '0 0 15px rgba(166, 13, 242, 0.6)' }}
            data-testid="card-product-sku992"
          >
            <div className="absolute top-2 right-2 opacity-30"><TrendingUp className="w-5 h-5" /></div>
            <p className="text-[10px] text-white/70 uppercase font-bold tracking-tighter">SKU-992</p>
            <p className="text-white text-lg font-bold leading-none font-display">Aura-7 Max</p>
          </div>

          <div 
            className="col-span-2 row-span-2 bg-gradient-to-br from-[#ff00e5]/80 to-[#ff00e5]/40 rounded-lg p-2 border border-[#ff00e5]/50 flex flex-col justify-end cursor-pointer"
            style={{ boxShadow: '0 0 15px rgba(255, 0, 229, 0.6)' }}
            data-testid="card-product-sku102"
          >
            <p className="text-[9px] text-white/70 uppercase font-bold">SKU-102</p>
            <p className="text-white text-xs font-bold leading-tight font-display">Neon Pulse</p>
          </div>

          <div className="col-span-2 row-span-1 bg-[#a60df2]/20 rounded-lg border border-[#a60df2]/30 flex items-center justify-center" data-testid="card-product-sku441">
            <span className="text-[8px] text-[#a60df2] font-bold">SKU-441</span>
          </div>

          <div 
            className="col-span-3 row-span-2 bg-gradient-to-tr from-[#a60df2]/60 to-[#ff00e5]/60 rounded-lg p-2 border border-white/20 flex flex-col justify-end cursor-pointer"
            data-testid="card-product-sku582"
          >
            <p className="text-[10px] text-white/70 font-bold uppercase">SKU-582</p>
            <p className="text-white text-sm font-bold leading-tight font-display">Glitch X</p>
          </div>

          <div className="col-span-3 row-span-1 bg-[#050505] border border-white/10 rounded-lg flex items-center px-2">
            <div className="w-1 h-full bg-[#a60df2]/50 mr-2 rounded-full"></div>
            <span className="text-[10px] text-white/40">Stable Vol.</span>
          </div>

          <div 
            className="col-span-2 row-span-2 bg-[#a60df2]/30 rounded-lg border border-[#a60df2]/40 p-2 flex flex-col justify-between cursor-pointer"
            data-testid="card-product-sku882"
          >
            <CheckCircle className="w-4 h-4 text-[#a60df2]" />
            <p className="text-[9px] text-white/80 font-bold">SKU-882</p>
          </div>

          <div className="col-span-4 row-span-1 bg-[#ff00e5]/20 rounded-lg border border-[#ff00e5]/30 flex items-center px-3 justify-between">
            <span className="text-[10px] text-[#ff00e5] font-bold">Emerging: SKU-201</span>
            <span className="text-[10px] text-white/50">+44%</span>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Card 
            className="rounded-xl p-4 border-[#a60df2]/30"
            style={{ background: 'rgba(28, 16, 34, 0.7)', backdropFilter: 'blur(12px)' }}
            data-testid="card-velocity"
          >
            <CardContent className="p-0 flex flex-col gap-1">
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Revenue Velocity</p>
              <p className="text-white text-xl font-bold leading-tight tracking-tight font-display" data-testid="text-velocity-value">
                $42.5k<span className="text-xs text-[#a60df2]">/hr</span>
              </p>
              <p className="text-green-400 text-xs font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12.4%
              </p>
            </CardContent>
          </Card>

          <Card 
            className="rounded-xl p-4 border-[#a60df2]/30"
            style={{ background: 'rgba(28, 16, 34, 0.7)', backdropFilter: 'blur(12px)' }}
            data-testid="card-health"
          >
            <CardContent className="p-0 flex flex-col gap-1">
              <p className="text-white/60 text-[10px] uppercase font-bold tracking-widest">Inventory Health</p>
              <p className="text-white text-xl font-bold leading-tight tracking-tight font-display" data-testid="text-health-value">
                98.2<span className="text-xs text-[#a60df2]">%</span>
              </p>
              <p className="text-green-400 text-xs font-bold flex items-center gap-1">
                <CheckCircle className="w-3 h-3" /> Optimal
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6">
          <Card 
            className="rounded-2xl overflow-hidden border-[#a60df2]/30"
            style={{ background: 'rgba(28, 16, 34, 0.7)', backdropFilter: 'blur(12px)' }}
            data-testid="card-insight-sku882"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-[#a60df2] via-[#ff00e5] to-[#a60df2]"></div>
            <CardContent className="p-5">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-white text-xl font-bold leading-tight font-display">Insight: SKU-882</h3>
                  <p className="text-white/50 text-xs">High Intensity Product Segment</p>
                </div>
                <div className="bg-[#a60df2]/20 text-[#a60df2] text-[10px] px-2 py-1 rounded-full font-bold border border-[#a60df2]/30">
                  AI RECOMMENDED
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Profit Margin</span>
                  <span className="text-[#a60df2] font-bold">+18.2%</span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#a60df2] h-full" style={{ width: '75%', boxShadow: '0 0 15px rgba(166, 13, 242, 0.6)' }}></div>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-white/60">Demand Forecast</span>
                  <span className="text-[#ff00e5] font-bold">Aggressive</span>
                </div>
              </div>

              <button 
                className="w-full py-4 bg-[#a60df2] text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-95 transition-transform"
                style={{ boxShadow: '0 4px 20px rgba(166, 13, 242, 0.3)' }}
                data-testid="button-optimize-inventory"
              >
                <Sparkles className="w-5 h-5" />
                Optimize Inventory
              </button>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="bg-[#050505]/90 backdrop-blur-xl border-t border-[#a60df2]/20 p-6 z-50">
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] font-bold text-[#a60df2] uppercase tracking-tighter italic">Time Warp Control</span>
          <span className="text-xs font-bold text-white px-2 py-0.5 bg-[#a60df2]/20 rounded border border-[#a60df2]/30" data-testid="text-time-latest">LATEST: 18:42</span>
        </div>
        <div className="relative flex items-center px-2 h-10">
          <div className="absolute left-0 right-0 h-1 bg-white/10 rounded-full mx-2"></div>
          <div 
            className="absolute left-0 h-1 bg-[#a60df2] rounded-full ml-2"
            style={{ width: `${timePosition}%`, boxShadow: '0 0 10px #a60df2' }}
          ></div>
          <input
            type="range"
            min="0"
            max="100"
            value={timePosition}
            onChange={(e) => setTimePosition(parseInt(e.target.value))}
            className="absolute w-full opacity-0 cursor-pointer z-10"
            data-testid="input-time-slider"
          />
          <div 
            className="absolute w-6 h-6 bg-[#a60df2] rounded-full border-4 border-[#050505] shadow-xl flex items-center justify-center pointer-events-none"
            style={{ left: `calc(${timePosition}% - 12px)` }}
          >
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="w-full flex justify-between mt-4 px-2">
          <span className="text-[9px] text-white/30 font-bold">7D</span>
          <span className="text-[9px] text-white/30 font-bold">24H</span>
          <span className="text-[9px] text-[#a60df2] font-bold">1H</span>
          <span className="text-[9px] text-white/30 font-bold">LIVE</span>
        </div>
      </div>

      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-[#a60df2]/5 rounded-full blur-[80px] z-0 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-[#ff00e5]/5 rounded-full blur-[100px] z-0 pointer-events-none"></div>
    </div>
  );
}

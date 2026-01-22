import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  DollarSign, 
  Zap, 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Settings,
  ChevronLeft,
  Bell,
  Brain
} from "lucide-react";
import { Link, useLocation } from "wouter";

const categoryData = [
  { name: "Home Decor", height: 40 },
  { name: "Electronics", height: 65 },
  { name: "Flash Candles", height: 90, highlight: true },
  { name: "Apparel", height: 55 },
  { name: "Beauty", height: 45 },
  { name: "Other", height: 30 },
];

export default function StorePulse() {
  const [location, setLocation] = useLocation();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#0c0810]">
      <div className="flex items-center bg-transparent p-4 pb-2 justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="text-white flex size-12 shrink-0 items-center justify-start">
          <ChevronLeft 
            className="w-6 h-6 cursor-pointer" 
            onClick={() => setLocation("/dashboard")}
          />
        </div>
        <div className="flex flex-col items-center flex-1">
          <h2 className="text-white text-lg font-bold leading-tight tracking-tight font-display">FlashFusion</h2>
          <div className="flex items-center gap-1.5">
            <div className="size-2 rounded-full bg-[#0bda76] animate-pulse" style={{ boxShadow: '0 0 8px #0bda76' }} />
            <span className="text-[10px] font-bold text-[#0bda76] uppercase tracking-widest">Live Sync</span>
          </div>
        </div>
        <div className="flex w-12 items-center justify-end">
          <Button variant="ghost" size="icon" className="bg-white/5" data-testid="button-notifications">
            <Bell className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center py-10 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 bg-[#9d25f4] rounded-full blur-[1px]" />
          <div className="absolute top-1/2 right-1/3 w-1.5 h-1.5 bg-[#9d25f4]/60 rounded-full blur-[1px]" />
          <div className="absolute bottom-1/4 left-1/2 w-1 h-1 bg-white/40 rounded-full blur-[1px]" />
        </div>
        <div className="relative flex items-center justify-center">
          <div 
            className="absolute size-40 rounded-full bg-[#9d25f4]/10 border border-[#9d25f4]/30"
            style={{ 
              boxShadow: '0 0 0 0 rgba(157, 37, 244, 0.7)',
              animation: 'pulse 2s infinite'
            }}
          />
          <div 
            className="absolute size-28 rounded-full bg-[#9d25f4]/20 border border-[#9d25f4]/40"
            style={{ 
              boxShadow: '0 0 0 0 rgba(157, 37, 244, 0.7)',
              animation: 'pulse 2s infinite',
              animationDelay: '0.5s'
            }}
          />
          <div className="z-10 flex flex-col items-center">
            <h1 className="text-white tracking-tighter text-4xl font-bold leading-tight text-center font-display">Store Core</h1>
            <p className="text-[#9d25f4] font-bold text-sm tracking-[0.2em] uppercase mt-1">Operational</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 p-4">
        <Card 
          className="col-span-2 rounded-xl p-5 border-[#9d25f4]/20"
          style={{ 
            background: 'rgba(157, 37, 244, 0.05)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <CardContent className="p-0">
            <div className="flex justify-between items-start">
              <p className="text-white/70 text-sm font-medium">Today's Revenue</p>
              <DollarSign className="w-5 h-5 text-[#9d25f4]" />
            </div>
            <div className="flex items-end gap-2 mt-2">
              <p className="text-white tracking-tight text-3xl font-bold leading-tight font-display">$12,450</p>
              <p className="text-[#0bda76] text-sm font-bold mb-1.5">+12%</p>
            </div>
          </CardContent>
        </Card>
        
        <Card 
          className="rounded-xl p-5 border-[#9d25f4]/20"
          style={{ 
            background: 'rgba(157, 37, 244, 0.05)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <CardContent className="p-0 flex flex-col gap-2">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Live Visitors</p>
            <p className="text-white tracking-tight text-2xl font-bold leading-tight font-display">842</p>
            <p className="text-[#0bda76] text-xs font-medium">+5% vs avg</p>
          </CardContent>
        </Card>
        
        <Card 
          className="rounded-xl p-5 border-[#9d25f4]/20"
          style={{ 
            background: 'rgba(157, 37, 244, 0.05)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <CardContent className="p-0 flex flex-col gap-2">
            <p className="text-white/70 text-xs font-medium uppercase tracking-wider">Conv. Velocity</p>
            <p className="text-white tracking-tight text-2xl font-bold leading-tight font-display">4.2%</p>
            <p className="text-[#0bda76] text-xs font-medium">+0.8% peak</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-2 px-4 py-2">
        <div className="flex gap-6 justify-between items-center">
          <p className="text-white/90 text-sm font-bold uppercase tracking-widest">Platform Integrity</p>
          <p className="text-[#0bda76] text-xs font-bold leading-normal">99.9% UPTIME</p>
        </div>
        <Progress value={100} className="h-1.5 bg-white/5" />
        <p className="text-white/40 text-[10px] font-medium leading-normal">Global edge nodes fully operational - Last sync: 2s ago</p>
      </div>

      <div className="p-4">
        <Card 
          className="rounded-xl overflow-hidden border-[#9d25f4]/20"
          style={{ 
            background: 'rgba(157, 37, 244, 0.05)',
            backdropFilter: 'blur(12px)'
          }}
        >
          <div className="p-4 border-b border-white/5 flex justify-between items-center">
            <h3 className="font-bold text-sm uppercase tracking-wider">Category Heatmap</h3>
            <BarChart3 className="w-4 h-4 text-white/40" />
          </div>
          <CardContent className="p-4">
            <div className="flex w-full aspect-[16/7] gap-1 items-end">
              {categoryData.map((cat, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-sm ${cat.highlight ? 'bg-[#9d25f4]/80' : 'bg-[#9d25f4]/30'}`}
                  style={{ 
                    height: `${cat.height}%`,
                    boxShadow: cat.highlight ? '0 0 15px rgba(157, 37, 244, 0.4)' : 'none'
                  }}
                  title={cat.name}
                />
              ))}
            </div>
            <div className="flex justify-between mt-3 text-[10px] text-white/40 font-bold uppercase">
              <span>Low Density</span>
              <span>High Volume</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-auto p-4 pb-8">
        <div 
          className="bg-[#9d25f4] rounded-2xl p-5 relative overflow-hidden"
          style={{ boxShadow: '0 20px 50px rgba(157, 37, 244, 0.3)' }}
        >
          <div className="absolute -right-10 -top-10 size-32 bg-white/10 rounded-full blur-2xl" />
          <div className="flex items-center gap-3 mb-4">
            <div className="size-8 rounded-lg bg-white/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-white font-bold text-base">AI Optimizer</h3>
          </div>
          <p className="text-white/90 text-sm leading-relaxed mb-5">
            High conversion surge detected in <span className="font-bold">Neon Zen Candles</span>. Suggested action: Increase ad spend by 15% for the next 4 hours.
          </p>
          <Button 
            className="w-full bg-white text-[#9d25f4] font-bold py-3 rounded-xl transition-transform active:scale-95 flex items-center justify-center gap-2"
            data-testid="button-execute-suggestion"
          >
            Execute Suggestion
            <Zap className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="h-20 bg-[#0c0810]/80 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-6 pb-4">
        <Link href="/store-pulse">
          <div className="flex flex-col items-center gap-1 text-[#9d25f4] cursor-pointer">
            <LayoutDashboard className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Pulse</span>
          </div>
        </Link>
        <Link href="/analytics">
          <div className="flex flex-col items-center gap-1 text-white/40 cursor-pointer hover:text-white/60">
            <BarChart3 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Insights</span>
          </div>
        </Link>
        <Link href="/products">
          <div className="flex flex-col items-center gap-1 text-white/40 cursor-pointer hover:text-white/60">
            <Package className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Stock</span>
          </div>
        </Link>
        <Link href="/settings">
          <div className="flex flex-col items-center gap-1 text-white/40 cursor-pointer hover:text-white/60">
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">Config</span>
          </div>
        </Link>
      </div>
    </div>
  );
}

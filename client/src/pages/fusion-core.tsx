import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, Bell, Grid3X3, BarChart3, Package, Settings, Brain, Sparkles, User, AlertTriangle, Activity } from "lucide-react";

export default function FusionCore() {
  const [, setLocation] = useLocation();

  const kpiCards = [
    { icon: Zap, label: "Live Revenue", value: "$12,840", badge: "+12%", badgeColor: "text-green-400" },
    { icon: Package, label: "Orders Today", value: "482", badge: "HOT", badgeColor: "text-[#9d25f4]" },
    { icon: Activity, label: "System Pulse", value: "98.2%", badge: "Active", badgeColor: "text-[#9d25f4]", pulse: true },
  ];

  const feedItems = [
    { icon: Sparkles, iconBg: "bg-[#9d25f4]/20", iconColor: "text-[#9d25f4]", iconBorder: "border-[#9d25f4]/40", title: "Sale: $142.00", badge: "TOKYO", subtitle: "Just now • Processed via Core", glow: true },
    { icon: User, iconBg: "bg-[#9d25f4]/20", iconColor: "text-[#9d25f4]", iconBorder: "border-[#9d25f4]/40", title: "New User Joined:", highlight: "@CyborgX", subtitle: "2m ago • Referral link active" },
    { icon: AlertTriangle, iconBg: "bg-red-500/20", iconColor: "text-red-400", iconBorder: "border-red-500/40", title: "Stock Alert: Fusion-X Core Low", subtitle: "5m ago • Restock recommended", subtitleColor: "text-red-400/80" },
    { icon: Activity, iconBg: "bg-[#9d25f4]/20", iconColor: "text-[#9d25f4]", iconBorder: "border-[#9d25f4]/40", title: "Peak Traffic Detected", subtitle: "12m ago • Servers scaling", isLast: true },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden bg-[#0a060e] font-display text-white">
      <div 
        className="fixed inset-0 z-50 opacity-20 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03))',
          backgroundSize: '100% 2px, 3px 100%'
        }}
      />

      <header className="flex items-center bg-transparent p-4 pb-2 justify-between z-10">
        <div className="text-[#9d25f4] flex size-12 shrink-0 items-center justify-start">
          <Zap className="w-8 h-8" data-testid="icon-logo" />
        </div>
        <h2 className="text-white text-sm font-bold leading-tight tracking-[0.3em] flex-1 text-center" data-testid="text-page-title">FLASHFUSION</h2>
        <div className="flex w-12 items-center justify-end">
          <button 
            className="flex cursor-pointer items-center justify-center rounded-lg h-10 w-10 bg-[#9d25f4]/10 text-[#9d25f4] border border-[#9d25f4]/20"
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="mt-4 px-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-bold text-[#9d25f4] tracking-widest uppercase">Network Status: Optimized</p>
          <div className="flex gap-1">
            <div className="h-1 w-4 bg-[#9d25f4] rounded-full"></div>
            <div className="h-1 w-1 bg-[#9d25f4]/30 rounded-full"></div>
            <div className="h-1 w-1 bg-[#9d25f4]/30 rounded-full"></div>
          </div>
        </div>

        <div className="flex overflow-x-auto gap-3 pb-4 no-scrollbar">
          {kpiCards.map((kpi, idx) => (
            <Card 
              key={idx}
              className="flex flex-col gap-3 rounded-xl min-w-[160px] p-4 border-[#9d25f4]/30"
              style={{ background: 'rgba(157, 37, 244, 0.1)', backdropFilter: 'blur(8px)' }}
              data-testid={`card-kpi-${idx}`}
            >
              <CardContent className="p-0">
                <div className="flex justify-between items-start">
                  <kpi.icon className="w-5 h-5 text-[#9d25f4]" />
                  <div className="flex items-center gap-1">
                    {kpi.pulse && <div className="h-1.5 w-1.5 rounded-full bg-[#9d25f4] animate-pulse"></div>}
                    <span className={`text-[10px] font-bold ${kpi.badgeColor}`}>{kpi.badge}</span>
                  </div>
                </div>
                <div className="mt-3">
                  <p className="text-white text-xl font-bold leading-none tracking-tight" data-testid={`text-kpi-value-${idx}`}>{kpi.value}</p>
                  <p className="text-[#ad9cba] text-[10px] uppercase font-bold tracking-wider mt-1">{kpi.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 pt-4">
        <h3 className="text-white text-xs font-bold leading-tight tracking-[0.1em] uppercase">Live Fusion Stream</h3>
        <span className="text-[10px] text-[#9d25f4] font-medium cursor-pointer" data-testid="link-view-all">VIEW ALL</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 mt-2 mb-32">
        <div className="grid grid-cols-[32px_1fr] gap-x-4">
          {feedItems.map((item, idx) => (
            <div key={idx} className="contents">
              <div className={`flex flex-col items-center ${idx === 0 ? 'pt-3' : ''} ${item.isLast ? 'pb-3' : ''}`}>
                <div 
                  className={`flex items-center justify-center size-8 rounded-full ${item.iconBg} ${item.iconColor} border ${item.iconBorder}`}
                  style={item.glow ? { boxShadow: '0 0 10px rgba(157,37,244,0.3)' } : {}}
                  data-testid={`icon-feed-${idx}`}
                >
                  <item.icon className="w-4 h-4" />
                </div>
                {!item.isLast && (
                  <div className={`w-[1px] h-12 grow ${item.glow ? 'bg-gradient-to-b from-[#9d25f4]/50 to-transparent' : item.iconColor.includes('red') ? 'bg-red-500/20' : 'bg-[#9d25f4]/30'}`}></div>
                )}
              </div>
              <div className="flex flex-1 flex-col py-3" data-testid={`card-feed-${idx}`}>
                <div className="flex items-center gap-2">
                  <p className="text-white text-sm font-medium">
                    {item.title}
                    {item.highlight && <span className="text-[#9d25f4]"> {item.highlight}</span>}
                  </p>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#9d25f4]/20 text-[#9d25f4] border border-[#9d25f4]/30 font-bold">{item.badge}</span>
                  )}
                </div>
                <p className={`text-xs font-normal ${item.subtitleColor || 'text-[#ad9cba]'}`}>{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-[88px] left-1/2 -translate-x-1/2 w-[90%] max-w-[380px] z-30">
        <div 
          className="bg-black/40 rounded-full h-10 flex items-center px-4 gap-3 border border-[#9d25f4]/30"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <span className="text-[#9d25f4] text-sm">$</span>
          <span className="text-white/40 text-[11px] font-medium tracking-wide">Enter command or ask Fusion AI...</span>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 max-w-[430px] mx-auto z-40">
        <div className="absolute inset-0 bg-[#0a060e]/80 backdrop-blur-xl border-t border-[#9d25f4]/20"></div>
        <div className="relative flex items-center justify-around h-20 px-4">
          <Link href="/fusion-core" data-testid="link-tab-hub">
            <button className="flex flex-col items-center justify-center text-[#9d25f4]">
              <Grid3X3 className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-tighter mt-1 uppercase">Hub</span>
            </button>
          </Link>

          <Link href="/analytics" data-testid="link-tab-stats">
            <button className="flex flex-col items-center justify-center text-white/50">
              <BarChart3 className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-tighter mt-1 uppercase">Stats</span>
            </button>
          </Link>

          <div className="relative -mt-14">
            <div className="absolute -inset-4 bg-[#9d25f4]/20 blur-2xl rounded-full"></div>
            <button 
              className="relative flex size-16 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#9d25f4] text-white border-4 border-[#0a060e] transition-transform active:scale-95"
              style={{ boxShadow: '0 0 20px rgba(157, 37, 244, 0.5)' }}
              data-testid="button-core-fab"
            >
              <Brain className="w-8 h-8" />
            </button>
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <span className="text-[10px] font-bold text-[#9d25f4] tracking-widest uppercase">Core</span>
            </div>
          </div>

          <Link href="/products" data-testid="link-tab-stock">
            <button className="flex flex-col items-center justify-center text-white/50">
              <Package className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-tighter mt-1 uppercase">Stock</span>
            </button>
          </Link>

          <Link href="/settings" data-testid="link-tab-config">
            <button className="flex flex-col items-center justify-center text-white/50">
              <Settings className="w-6 h-6" />
              <span className="text-[9px] font-bold tracking-tighter mt-1 uppercase">Config</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

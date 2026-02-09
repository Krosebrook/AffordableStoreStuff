import { useLocation, Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Bell, Bot, TrendingUp, LayoutDashboard, BarChart3, Plus, Package, Settings } from "lucide-react";

export default function AIInsights() {
  const [, setLocation] = useLocation();

  const platforms = ["All Platforms", "Shopify", "Amazon", "Etsy"];

  return (
    <div className="min-h-screen bg-[#0a0a0a] font-display text-white">
      <div className="h-12 w-full bg-[#0a0a0a]"></div>

      <header className="flex items-center justify-between px-6 py-4 sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-full border-2 border-[#0db9f2]/50 overflow-hidden bg-gradient-to-br from-[#0db9f2]/30 to-[#bf5af2]/30 flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          <div>
            <h1 className="text-xs font-medium text-gray-400 uppercase tracking-widest">Dashboard</h1>
            <p className="text-sm font-bold text-white" data-testid="text-page-title">Founder View</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button 
            className="p-2 rounded-full border border-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
            data-testid="button-sync"
          >
            <RefreshCw className="w-5 h-5 text-[#0db9f2]" />
          </button>
          <button 
            className="p-2 rounded-full border border-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
            data-testid="button-notifications"
          >
            <Bell className="w-5 h-5 text-white" />
          </button>
        </div>
      </header>

      <main className="px-4 pb-32">
        <div className="flex gap-3 py-4 overflow-x-auto no-scrollbar">
          {platforms.map((platform, idx) => (
            <div 
              key={platform}
              className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 cursor-pointer ${
                idx === 0 
                  ? 'bg-[#0db9f2] shadow-lg shadow-[#0db9f2]/20' 
                  : 'border border-white/10'
              }`}
              style={idx !== 0 ? { background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' } : {}}
              data-testid={`chip-platform-${idx}`}
            >
              <p className={`text-xs font-bold uppercase tracking-tight ${idx === 0 ? 'text-white' : 'text-gray-400'}`}>{platform}</p>
            </div>
          ))}
        </div>

        <Card 
          className="rounded-xl p-6 mt-2 relative overflow-hidden border-white/10"
          style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
          data-testid="card-radar"
        >
          <CardContent className="p-0">
            <div className="absolute top-0 right-0 p-4">
              <span className="text-[10px] font-bold text-[#0db9f2] bg-[#0db9f2]/10 px-2 py-1 rounded">LIVE DATA</span>
            </div>
            <h2 className="text-lg font-bold mb-1">Cross-Platform Radar</h2>
            <p className="text-xs text-gray-400 mb-6">Performance comparison across core metrics</p>
            
            <div className="relative aspect-square w-full flex items-center justify-center">
              <svg className="w-full h-full max-w-[280px]" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="60" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <circle cx="100" cy="100" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="100" y1="10" x2="100" y2="190" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <line x1="10" y1="100" x2="190" y2="100" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
                <polygon points="100,30 170,100 100,160 50,100" fill="rgba(13, 185, 242, 0.2)" stroke="#0db9f2" strokeWidth="2" />
                <polygon points="100,60 140,100 100,120 40,100" fill="rgba(191, 90, 242, 0.2)" stroke="#bf5af2" strokeWidth="2" />
                <text x="100" y="20" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">REACH</text>
                <text x="185" y="103" fill="white" fontSize="8" fontWeight="bold" textAnchor="start">CONV</text>
                <text x="100" y="185" fill="white" fontSize="8" fontWeight="bold" textAnchor="middle">MARGIN</text>
                <text x="15" y="103" fill="white" fontSize="8" fontWeight="bold" textAnchor="end">RET</text>
              </svg>
            </div>

            <div className="flex justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#0db9f2]"></div>
                <span className="text-[10px] font-bold text-gray-300">SHOPIFY</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-[#bf5af2]"></div>
                <span className="text-[10px] font-bold text-gray-300">AMAZON</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="grid grid-cols-2 gap-4 mt-6">
          <Card 
            className="p-5 rounded-xl border-[#0db9f2]/30"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
            data-testid="card-roas"
          >
            <CardContent className="p-0 flex items-start gap-3">
              <div className="w-1 h-12 bg-[#0db9f2] rounded-full shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400">Total ROAS</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-bold tracking-tight text-white" data-testid="text-roas-value">4.2x</p>
                  <p className="text-[10px] font-bold text-green-400 mb-1">+0.5x</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card 
            className="p-5 rounded-xl border-[#bf5af2]/30"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
            data-testid="card-profit"
          >
            <CardContent className="p-0 flex items-start gap-3">
              <div className="w-1 h-12 bg-[#bf5af2] rounded-full shrink-0" />
              <div>
                <p className="text-xs font-medium text-gray-400">Net Profit</p>
                <div className="flex items-end gap-2 mt-1">
                  <p className="text-2xl font-bold tracking-tight text-white" data-testid="text-profit-value">$12.4k</p>
                  <p className="text-[10px] font-bold text-green-400 mb-1">+18%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="flex items-center justify-between mt-8 mb-4">
          <h3 className="text-lg font-bold">AI Recommendations</h3>
          <button className="text-[#0db9f2] text-xs font-bold uppercase" data-testid="button-view-all">View All</button>
        </div>

        <div className="space-y-4">
          <Card 
            className="rounded-xl p-5 border-[#0db9f2]/20 border-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
            data-testid="card-recommendation-1"
          >
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-[#0db9f2]/10 flex items-center justify-center shrink-0">
                  <Bot className="w-5 h-5 text-[#0db9f2]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#0db9f2] tracking-widest uppercase">Inventory Opt</span>
                    <span className="text-[10px] text-gray-500">2m ago</span>
                  </div>
                  <p className="text-sm text-gray-100 font-medium leading-relaxed">
                    Move inventory from <span className="text-[#bf5af2] font-bold">Etsy</span> to <span className="text-[#0db9f2] font-bold">Shopify</span>. Conversion rates for 'Ceramic Vases' are 12% higher on web direct.
                  </p>
                  <Button 
                    className="mt-4 w-full py-2.5 bg-[#0db9f2] text-black font-bold rounded-lg text-xs uppercase tracking-wider"
                    data-testid="button-execute-transfer"
                  >
                    Execute Transfer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card 
            className="rounded-xl p-5 border-[#bf5af2]/20 border-white/10"
            style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
            data-testid="card-recommendation-2"
          >
            <CardContent className="p-0">
              <div className="flex items-start gap-4">
                <div className="size-10 rounded-lg bg-[#bf5af2]/10 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-[#bf5af2]" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] font-bold text-[#bf5af2] tracking-widest uppercase">Ad Spend</span>
                    <span className="text-[10px] text-gray-500">1h ago</span>
                  </div>
                  <p className="text-sm text-gray-100 font-medium leading-relaxed">
                    Increase ad spend on <span className="font-bold">Instagram</span> for 'Summer Collection' based on recent 15% conversion lift in California.
                  </p>
                  <div className="flex gap-2 mt-4">
                    <Button 
                      variant="outline"
                      className="flex-1 py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                      data-testid="button-dismiss"
                    >
                      Dismiss
                    </Button>
                    <Button 
                      className="flex-[2] py-2.5 bg-[#bf5af2] text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                      data-testid="button-adjust-budget"
                    >
                      Adjust Budget
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <nav 
        className="fixed bottom-0 w-full border-t border-white/10 px-8 py-4 flex justify-between items-center z-50"
        style={{ background: 'rgba(255, 255, 255, 0.03)', backdropFilter: 'blur(16px)' }}
      >
        <Link href="/dashboard" data-testid="link-tab-home">
          <button className="flex flex-col items-center gap-1">
            <LayoutDashboard className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500 font-medium">Home</span>
          </button>
        </Link>
        <Link href="/ai-insights" data-testid="link-tab-insights">
          <button className="flex flex-col items-center gap-1">
            <BarChart3 className="w-5 h-5 text-[#0db9f2]" style={{ filter: 'drop-shadow(0 0 15px rgba(13, 185, 242, 0.4))' }} />
            <span className="text-[10px] text-[#0db9f2] font-bold">Insights</span>
          </button>
        </Link>
        <div className="relative -top-6">
          <button 
            className="size-14 bg-[#0db9f2] rounded-full flex items-center justify-center shadow-lg border-4 border-[#0a0a0a]"
            style={{ boxShadow: '0 4px 20px rgba(13, 185, 242, 0.4)' }}
            data-testid="button-add-fab"
          >
            <Plus className="w-8 h-8 text-black font-bold" />
          </button>
        </div>
        <Link href="/products" data-testid="link-tab-stock">
          <button className="flex flex-col items-center gap-1">
            <Package className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500 font-medium">Stock</span>
          </button>
        </Link>
        <Link href="/settings" data-testid="link-tab-settings">
          <button className="flex flex-col items-center gap-1">
            <Settings className="w-5 h-5 text-gray-500" />
            <span className="text-[10px] text-gray-500 font-medium">Settings</span>
          </button>
        </Link>
      </nav>

      <div className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#0db9f2]/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#bf5af2]/10 rounded-full blur-[100px]"></div>
      </div>
    </div>
  );
}

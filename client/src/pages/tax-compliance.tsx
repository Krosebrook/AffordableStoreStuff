import { Shield, Flag, Euro, PoundSterling, Brain, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function TaxCompliance() {
  return (
    <div className="relative min-h-screen bg-[#0d0b14] font-sans text-white overflow-hidden pb-32">
      {/* Holographic Grid Background */}
      <div 
        className="absolute inset-0 opacity-20 h-[200%] w-full pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(13, 242, 242, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(13, 242, 242, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '30px 30px',
          perspective: '1000px',
          transform: 'perspective(500px) rotateX(20deg)',
          zIndex: -1
        }}
      />

      <main className="relative z-10 px-4 pt-8">
        {/* Hero: Tax Shield Visualization */}
        <div className="flex flex-col items-center justify-center py-8">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* The "3D" Glass Shield */}
            <div className="absolute inset-0 rounded-full border border-[#0df2f2]/30 bg-[#0df2f2]/10 animate-pulse" 
                 style={{ boxShadow: '0 0 40px 10px rgba(13, 242, 242, 0.2)', backdropFilter: 'blur(12px)' }} />
            <div className="relative z-10 flex flex-col items-center text-[#0df2f2]">
              <Shield className="w-20 h-20 drop-shadow-[0_0_15px_rgba(13,242,242,0.8)]" />
              <span className="text-[10px] font-bold tracking-[0.2em] uppercase mt-2">Shield Active</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <h1 className="text-white tracking-tight text-4xl font-bold leading-tight">
              $42,850.00
            </h1>
            <p className="text-[#0df2f2]/70 text-sm font-medium flex items-center justify-center gap-2 mt-2">
              <span className="w-2 h-2 bg-[#0df2f2] rounded-full animate-ping"></span>
              Estimated Tax Liability
            </p>
          </div>
        </div>

        {/* Stats: Global Breakdown */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: "VAT", value: "$12.4k" },
            { label: "Sales Tax", value: "$18.2k" },
            { label: "Corporate", value: "$12.2k" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-white/5 border-white/10 backdrop-blur-md">
              <CardContent className="p-4 flex flex-col gap-1">
                <p className="text-[#0df2f2]/60 text-[10px] font-bold uppercase tracking-wider">{stat.label}</p>
                <p className="text-white tracking-tight text-xl font-bold">{stat.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Regional Compliance Cards */}
        <div className="space-y-4 mb-8">
          <h3 className="text-white/60 text-[10px] font-bold uppercase tracking-[0.2em] px-1">Regional Status</h3>
          
          <ComplianceCard 
            icon={Flag} 
            title="United States" 
            subtitle="Next filing: Oct 15" 
            status="Safe" 
            color="text-[#0df2f2]"
            bg="bg-[#0df2f2]/20"
            border="border-[#0df2f2]/20"
          />

          <ComplianceCard 
            icon={Euro} 
            title="European Union" 
            subtitle="Missing VAT ID (DE)" 
            status="Action" 
            color="text-orange-500"
            bg="bg-orange-500/20"
            border="border-orange-500/20"
            isWarning
          />

          <ComplianceCard 
            icon={PoundSterling} 
            title="United Kingdom" 
            subtitle="Fully Compliant" 
            status="Safe" 
            color="text-[#0df2f2]"
            bg="bg-[#0df2f2]/20"
            border="border-[#0df2f2]/20"
          />
        </div>

        {/* Deduction Finder Panel */}
        <Card className="bg-gradient-to-br from-[#0df2f2]/10 to-transparent border-[#0df2f2]/20 relative overflow-hidden">
          <CardContent className="p-6">
            <div className="absolute top-4 right-4 text-[#0df2f2]/30">
              <Brain className="w-10 h-10" />
            </div>
            <div className="relative z-10">
              <h4 className="text-[#0df2f2] font-bold text-lg mb-1 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                AI Deduction Finder
              </h4>
              <p className="text-white/70 text-sm mb-4">Scanning real-time transactions for potential write-offs.</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">New Savings Found</p>
                  <p className="text-2xl font-bold text-white">+$2,140.50</p>
                </div>
                <Button variant="default" className="bg-[#0df2f2] text-[#050a0a] hover:bg-[#0df2f2]/90 font-bold text-xs h-9 px-4">
                  Review All
                </Button>
              </div>
            </div>
            {/* Scanning line effect */}
            <div className="absolute inset-x-0 h-[1px] bg-[#0df2f2]/40 top-0 animate-bounce" />
          </CardContent>
        </Card>
      </main>

      {/* Fixed Bottom Action Area */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#050a0a] via-[#050a0a] to-transparent z-50">
        <Button 
          className="w-full h-16 rounded-2xl flex items-center justify-center gap-3 active:scale-95 transition-transform"
          style={{ 
            background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
            boxShadow: '0 0 20px rgba(168, 85, 247, 0.4)'
          }}
        >
          <Zap className="text-white w-6 h-6" />
          <span className="text-white font-bold text-lg tracking-tight uppercase">One-Click Filing</span>
        </Button>
        <p className="text-center text-[10px] text-white/30 mt-3 uppercase tracking-[0.3em]">SECURE ENCRYPTED GATEWAY</p>
      </div>
    </div>
  );
}

function ComplianceCard({ icon: Icon, title, subtitle, status, color, bg, border, isWarning }: any) {
  return (
    <Card className={`bg-white/5 ${border} backdrop-blur-xl`}>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color}`}>
            <Icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-white font-bold text-sm">{title}</p>
            <p className="text-xs text-white/50">{subtitle}</p>
          </div>
        </div>
        <Badge variant="outline" className={`${border} ${bg} px-3 py-1 flex items-center gap-2`}>
          {isWarning ? (
            <AlertTriangle className={`w-3.5 h-3.5 ${color}`} />
          ) : (
            <span className={`w-2 h-2 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`} />
          )}
          <span className={`${color} text-[10px] font-bold uppercase`}>{status}</span>
        </Badge>
      </CardContent>
    </Card>
  );
}

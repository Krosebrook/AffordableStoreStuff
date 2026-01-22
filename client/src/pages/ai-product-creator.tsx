import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Sparkles, 
  Zap, 
  Image as ImageIcon, 
  Mic, 
  Rocket, 
  History, 
  Star,
  ChevronRight,
  Loader2,
  Check,
  RefreshCw,
  Copy,
  ExternalLink,
  Smartphone,
  Shirt,
  Home,
  Dumbbell,
  Monitor,
  ShoppingBag,
  Palette,
  Package,
  Music,
  MapPin
} from "lucide-react";
import { SiShopify, SiEtsy, SiAmazon, SiTiktok, SiPinterest } from "react-icons/si";
import type { ProductConcept, BrandVoiceProfile } from "@shared/schema";

const marketplaces = [
  { id: "tech", label: "Tech", icon: Monitor },
  { id: "fashion", label: "Fashion", icon: Shirt },
  { id: "lifestyle", label: "Lifestyle", icon: Sparkles },
  { id: "home", label: "Home", icon: Home },
  { id: "sports", label: "Sports", icon: Dumbbell },
];

const platforms = [
  { id: "shopify", name: "Shopify", icon: SiShopify },
  { id: "etsy", name: "Etsy", icon: SiEtsy },
  { id: "amazon", name: "Amazon", icon: SiAmazon },
  { id: "tiktok", name: "TikTok Shop", icon: SiTiktok },
  { id: "pinterest", name: "Pinterest", icon: SiPinterest },
];

export default function AIProductCreator() {
  const { toast } = useToast();
  const qc = useQueryClient();
  
  const [prompt, setPrompt] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState("tech");
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["shopify"]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConcept, setGeneratedConcept] = useState<ProductConcept | null>(null);

  const { data: brandVoices } = useQuery<BrandVoiceProfile[]>({
    queryKey: ["/api/ai/brand-voices"],
  });

  const { data: recentConcepts } = useQuery<ProductConcept[]>({
    queryKey: ["/api/ai/product-concepts"],
  });

  const generateMutation = useMutation({
    mutationFn: async (data: { prompt: string; marketplace: string; platforms: string[] }) => {
      const res = await apiRequest("POST", "/api/ai/product-concepts/generate", data);
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedConcept(data);
      qc.invalidateQueries({ queryKey: ["/api/ai/product-concepts"] });
      toast({
        title: "Product concept generated",
        description: "Your AI-powered product is ready for review",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt required",
        description: "Please describe your product vision",
        variant: "destructive",
      });
      return;
    }
    setIsGenerating(true);
    generateMutation.mutate(
      { prompt, marketplace: selectedMarketplace, platforms: selectedPlatforms },
      { onSettled: () => setIsGenerating(false) }
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(p => p !== platformId)
        : [...prev, platformId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-ff-purple/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-ff-pink/10 blur-[80px] rounded-full" />
        
        <div className="relative z-10 container mx-auto px-6 py-8 max-w-6xl">
          <header className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl btn-gradient flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-display font-bold text-foreground">AI Product Creator</h1>
                <p className="text-sm text-ff-pink font-semibold uppercase tracking-widest">V4 Engine</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="glass-card rounded-full" data-testid="button-history">
                <History className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="glass-card rounded-full neon-border-pink" data-testid="button-favorites">
                <Star className="w-5 h-5 text-ff-pink" />
              </Button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-6">
              <Card className="glass-card neon-border-purple overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-ff-purple animate-pulse" />
                      Creative Prompt
                    </Label>
                    <Badge className="bg-gradient-to-r from-ff-purple to-ff-pink text-white border-0 text-[10px] font-bold">
                      V4 ENGINE
                    </Badge>
                  </div>
                  <Textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe your product vision... e.g., 'A premium wireless charging pad with ambient LED lighting for gaming setups'"
                    className="min-h-[120px] bg-transparent border-none resize-none text-base placeholder:text-muted-foreground/50 focus-visible:ring-0 p-0"
                    data-testid="input-product-prompt"
                  />
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" className="glass rounded-lg text-muted-foreground" data-testid="button-voice-input">
                        <Mic className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="glass rounded-lg text-muted-foreground" data-testid="button-image-input">
                        <ImageIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button 
                      onClick={handleGenerate}
                      disabled={isGenerating || !prompt.trim()}
                      className="bg-gradient-to-r from-ff-purple to-ff-pink border-ff-purple"
                      data-testid="button-generate-product"
                    >
                      {isGenerating ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      {isGenerating ? "Generating..." : "Generate"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  Target Marketplace
                </Label>
                <div className="flex gap-3 overflow-x-auto pb-2 flex-wrap">
                  {marketplaces.map((market) => {
                    const Icon = market.icon;
                    const isSelected = selectedMarketplace === market.id;
                    return (
                      <Button
                        key={market.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => setSelectedMarketplace(market.id)}
                        className={isSelected ? "bg-gradient-to-r from-ff-purple to-ff-pink border-ff-purple" : ""}
                        data-testid={`button-marketplace-${market.id}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {market.label}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  Publish To
                </Label>
                <div className="flex flex-wrap gap-2">
                  {platforms.map((platform) => {
                    const Icon = platform.icon;
                    const isSelected = selectedPlatforms.includes(platform.id);
                    return (
                      <Button
                        key={platform.id}
                        variant={isSelected ? "default" : "outline"}
                        onClick={() => togglePlatform(platform.id)}
                        className={isSelected ? "bg-ff-purple border-ff-purple" : ""}
                        data-testid={`button-platform-${platform.id}`}
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {platform.name}
                        {isSelected && <Check className="w-3 h-3 ml-1" />}
                      </Button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {generatedConcept ? (
                <>
                  <div className="relative aspect-[4/5] rounded-3xl overflow-hidden neon-border-pink">
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
                    {generatedConcept.heroImageUrl ? (
                      <img 
                        src={generatedConcept.heroImageUrl} 
                        alt="Generated product" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-ff-purple/20 to-ff-pink/20 flex items-center justify-center">
                        <div className="text-center">
                          <Sparkles className="w-16 h-16 text-ff-purple/50 mx-auto mb-4" />
                          <p className="text-muted-foreground">AI-generated preview</p>
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-6 left-6 right-6 glass-card rounded-2xl p-4 z-20">
                      <p className="text-[10px] font-bold text-ff-pink uppercase tracking-widest mb-1">
                        Concept Ready
                      </p>
                      <h4 className="text-lg font-bold text-foreground">
                        {generatedConcept.generatedTitle || "Your Product"}
                      </h4>
                    </div>
                  </div>

                  <Card className="glass-card neon-border-purple">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-ff-purple/20 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-ff-purple" />
                        </div>
                        <h3 className="font-bold">AI Generated Copy</h3>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Optimized Title
                        </Label>
                        <div className="glass rounded-xl px-4 py-3 text-sm font-medium flex items-center justify-between gap-2">
                          <span data-testid="text-generated-title">{generatedConcept.generatedTitle}</span>
                          <Button variant="ghost" size="sm" data-testid="button-copy-title">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          Marketing Description
                        </Label>
                        <div className="glass rounded-xl px-4 py-4 text-sm text-muted-foreground leading-relaxed" data-testid="text-generated-description">
                          {generatedConcept.generatedDescription}
                        </div>
                      </div>

                      {generatedConcept.generatedTags?.length > 0 && (
                        <div className="space-y-2">
                          <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            SEO Tags
                          </Label>
                          <div className="flex flex-wrap gap-2" data-testid="container-seo-tags">
                            {generatedConcept.generatedTags.map((tag: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs" data-testid={`badge-seo-tag-${i}`}>
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="glass-card border-dashed border-2 border-muted">
                  <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
                    <div className="w-20 h-20 rounded-full bg-ff-purple/10 flex items-center justify-center mb-6">
                      <Sparkles className="w-10 h-10 text-ff-purple/50" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Create Your Product</h3>
                    <p className="text-muted-foreground max-w-sm">
                      Enter a creative prompt and let AI generate a complete product concept with images, copy, and SEO optimization.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {generatedConcept && (
            <div className="mt-8 glass-card rounded-3xl p-6 neon-border-purple">
              <div className="flex items-center justify-between mb-5 gap-4 flex-wrap">
                <div className="flex -space-x-3">
                  {selectedPlatforms.slice(0, 4).map((platformId) => {
                    const platform = platforms.find(p => p.id === platformId);
                    const Icon = platform?.icon;
                    return (
                      <div 
                        key={platformId}
                        className="w-9 h-9 rounded-full border-2 border-background bg-card flex items-center justify-center"
                      >
                        {Icon && <Icon className="w-4 h-4 text-foreground" />}
                      </div>
                    );
                  })}
                  {selectedPlatforms.length > 4 && (
                    <div className="w-9 h-9 rounded-full border-2 border-background bg-muted flex items-center justify-center">
                      <span className="text-[10px] font-bold">+{selectedPlatforms.length - 4}</span>
                    </div>
                  )}
                </div>
                <p className="text-xs font-bold text-ff-pink uppercase tracking-wider">
                  Multi-Channel Sync Ready
                </p>
              </div>
              <Button 
                size="lg"
                className="w-full bg-gradient-to-r from-ff-purple to-ff-pink border-ff-purple"
                data-testid="button-publish-all"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Publish to All Hubs
              </Button>
            </div>
          )}

          {recentConcepts && recentConcepts.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
                <h2 className="text-xl font-display font-bold">Recent Concepts</h2>
                <Button variant="ghost" className="text-ff-purple" data-testid="button-view-all-concepts">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {recentConcepts.slice(0, 3).map((concept) => (
                  <Card key={concept.id} className="glass-card card-glow overflow-hidden" data-testid={`card-concept-${concept.id}`}>
                    <div className="aspect-video bg-gradient-to-br from-ff-purple/20 to-ff-pink/20">
                      {concept.heroImageUrl && (
                        <img src={concept.heroImageUrl} alt={concept.generatedTitle || ""} className="w-full h-full object-cover" />
                      )}
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-bold truncate" data-testid={`text-concept-title-${concept.id}`}>{concept.generatedTitle}</h4>
                      <p className="text-sm text-muted-foreground truncate">{concept.marketplace}</p>
                      <div className="flex items-center justify-between mt-3 gap-2">
                        <Badge variant="outline" className="text-xs" data-testid={`badge-concept-status-${concept.id}`}>
                          {concept.status}
                        </Badge>
                        <Button variant="ghost" size="icon" data-testid={`button-open-concept-${concept.id}`}>
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

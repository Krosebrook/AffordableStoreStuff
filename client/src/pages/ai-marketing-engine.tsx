import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Megaphone, 
  Sparkles, 
  Target, 
  TrendingUp,
  Mail,
  Share2,
  BarChart3,
  Calendar,
  Users,
  DollarSign,
  Eye,
  MousePointer,
  ShoppingCart,
  Loader2,
  ChevronRight,
  Play,
  Pause,
  Copy,
  Plus,
  Zap,
  FileText
} from "lucide-react";
import { SiInstagram, SiFacebook, SiTiktok, SiLinkedin, SiX, SiYoutube, SiPinterest } from "react-icons/si";

interface MarketingCampaign {
  id: string;
  name: string;
  objective?: string;
  description?: string;
  targetAudience?: {
    age?: string;
    gender?: string;
    interests?: string[];
    locations?: string[];
  };
  channels?: string[];
  platforms?: string[];
  startDate?: string;
  endDate?: string;
  status?: string;
  generatedAssets?: {
    emails?: string[];
    socialPosts?: string[];
    adCopy?: string[];
    headlines?: string[];
  };
  budget?: string;
  spent?: string;
  impressions?: number;
  clicks?: number;
  conversions?: number;
  revenue?: string;
  aiProvider?: string;
  createdAt: string;
}

const PLATFORM_ICONS: Record<string, React.ElementType> = {
  instagram: SiInstagram,
  facebook: SiFacebook,
  tiktok: SiTiktok,
  linkedin: SiLinkedin,
  twitter: SiX,
  youtube: SiYoutube,
  pinterest: SiPinterest,
};

const CHANNELS = [
  { id: "email", label: "Email Marketing", icon: Mail },
  { id: "social", label: "Social Media", icon: Share2 },
  { id: "ads", label: "Paid Ads", icon: Target },
  { id: "sms", label: "SMS/Text", icon: FileText },
];

const PLATFORMS = [
  { id: "instagram", label: "Instagram", icon: SiInstagram },
  { id: "facebook", label: "Facebook", icon: SiFacebook },
  { id: "tiktok", label: "TikTok", icon: SiTiktok },
  { id: "linkedin", label: "LinkedIn", icon: SiLinkedin },
  { id: "twitter", label: "X/Twitter", icon: SiX },
  { id: "youtube", label: "YouTube", icon: SiYoutube },
  { id: "pinterest", label: "Pinterest", icon: SiPinterest },
];

const OBJECTIVES = [
  { id: "awareness", label: "Brand Awareness", description: "Increase visibility and recognition" },
  { id: "traffic", label: "Website Traffic", description: "Drive visitors to your site" },
  { id: "engagement", label: "Engagement", description: "Boost likes, comments, and shares" },
  { id: "conversions", label: "Conversions", description: "Generate leads and sign-ups" },
  { id: "sales", label: "Sales", description: "Drive purchases and revenue" },
];

export default function AIMarketingEngine() {
  const { toast } = useToast();
  const [campaignName, setCampaignName] = useState("");
  const [objective, setObjective] = useState("");
  const [description, setDescription] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCampaign, setGeneratedCampaign] = useState<MarketingCampaign | null>(null);

  const { data: campaigns = [], isLoading: campaignsLoading } = useQuery<MarketingCampaign[]>({
    queryKey: ["/api/ai/campaigns"],
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (data: Partial<MarketingCampaign>) => {
      const response = await apiRequest("POST", "/api/ai/campaigns", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/campaigns"] });
      setGeneratedCampaign(data);
      toast({
        title: "Campaign Created",
        description: "Your marketing campaign has been generated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Generation Failed",
        description: "Failed to create campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToggleChannel = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    );
  };

  const handleTogglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId) 
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const handleGenerate = async () => {
    if (!campaignName.trim() || !objective) {
      toast({
        title: "Missing Information",
        description: "Please provide a campaign name and select an objective.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      await createCampaignMutation.mutateAsync({
        name: campaignName,
        objective,
        description,
        channels: selectedChannels,
        platforms: selectedPlatforms,
        budget: budget || undefined,
        targetAudience: targetAudience ? {
          interests: targetAudience.split(",").map(s => s.trim()),
        } : undefined,
        status: "draft",
        generatedAssets: {
          headlines: [
            `Discover the power of ${campaignName}`,
            `Transform your ${objective} strategy today`,
            `Unlock growth with intelligent marketing`,
          ],
          socialPosts: [
            `Ready to revolutionize your marketing? Our AI-powered platform helps you reach the right audience at the right time.`,
            `Smart marketing starts here. Join thousands of businesses already seeing results.`,
          ],
          emails: [
            `Subject: Your path to marketing success starts now\n\nDear valued customer,\n\nWe're excited to share our latest campaign designed to help you achieve your ${objective} goals...`,
          ],
          adCopy: [
            `Drive real results with data-driven marketing. Start your journey today.`,
          ],
        },
        aiProvider: "mock",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "scheduled": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "paused": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "completed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-ff-purple/20 text-ff-purple border-ff-purple/30";
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text" data-testid="text-page-title">
              AI Marketing Engine
            </h1>
            <p className="text-muted-foreground mt-1">
              Create and manage AI-powered marketing campaigns across multiple channels
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" data-testid="button-view-analytics">
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button className="btn-gradient" data-testid="button-create-campaign">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="glass-card" data-testid="card-campaign-builder">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-ff-purple to-ff-pink">
                    <Megaphone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle>Campaign Builder</CardTitle>
                    <CardDescription>Configure your marketing campaign settings</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="campaign-name">Campaign Name</Label>
                  <Input
                    id="campaign-name"
                    placeholder="Summer Sale 2026"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="glass"
                    data-testid="input-campaign-name"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Campaign Objective</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {OBJECTIVES.map((obj) => (
                      <button
                        key={obj.id}
                        onClick={() => setObjective(obj.id)}
                        className={`p-4 rounded-xl border text-left transition-all ${
                          objective === obj.id
                            ? "border-ff-purple bg-ff-purple/10"
                            : "border-border hover-elevate"
                        }`}
                        data-testid={`button-objective-${obj.id}`}
                      >
                        <p className="font-semibold text-sm">{obj.label}</p>
                        <p className="text-xs text-muted-foreground mt-1">{obj.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Campaign Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your campaign goals, target audience, and key messaging..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="glass min-h-[100px]"
                    data-testid="input-campaign-description"
                  />
                </div>

                <div className="space-y-3">
                  <Label>Marketing Channels</Label>
                  <div className="flex flex-wrap gap-3">
                    {CHANNELS.map((channel) => {
                      const Icon = channel.icon;
                      const isSelected = selectedChannels.includes(channel.id);
                      return (
                        <button
                          key={channel.id}
                          onClick={() => handleToggleChannel(channel.id)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${
                            isSelected
                              ? "border-ff-purple bg-ff-purple/10 text-foreground"
                              : "border-border hover-elevate text-muted-foreground"
                          }`}
                          data-testid={`button-channel-${channel.id}`}
                        >
                          <Icon className="w-4 h-4" />
                          <span className="text-sm font-medium">{channel.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {selectedChannels.includes("social") && (
                  <div className="space-y-3">
                    <Label>Social Platforms</Label>
                    <div className="flex flex-wrap gap-3">
                      {PLATFORMS.map((platform) => {
                        const Icon = platform.icon;
                        const isSelected = selectedPlatforms.includes(platform.id);
                        return (
                          <button
                            key={platform.id}
                            onClick={() => handleTogglePlatform(platform.id)}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${
                              isSelected
                                ? "border-ff-purple bg-ff-purple/10 text-foreground"
                                : "border-border hover-elevate text-muted-foreground"
                            }`}
                            data-testid={`button-platform-${platform.id}`}
                          >
                            <Icon className="w-4 h-4" />
                            <span className="text-sm">{platform.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (Optional)</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="budget"
                        type="number"
                        placeholder="5000"
                        value={budget}
                        onChange={(e) => setBudget(e.target.value)}
                        className="glass pl-9"
                        data-testid="input-budget"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="audience">Target Audience (comma-separated)</Label>
                    <Input
                      id="audience"
                      placeholder="tech enthusiasts, entrepreneurs, marketers"
                      value={targetAudience}
                      onChange={(e) => setTargetAudience(e.target.value)}
                      className="glass"
                      data-testid="input-target-audience"
                    />
                  </div>
                </div>

                <Button 
                  className="w-full btn-gradient" 
                  size="lg"
                  onClick={handleGenerate}
                  disabled={isGenerating || !campaignName.trim() || !objective}
                  data-testid="button-generate-campaign"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Campaign...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generate AI Campaign
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {generatedCampaign && generatedCampaign.generatedAssets && (
              <Card className="glass-card" data-testid="card-generated-assets">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                      <Zap className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>Generated Assets</CardTitle>
                      <CardDescription>AI-created content for your campaign</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedCampaign.generatedAssets.headlines && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Headlines
                      </Label>
                      <div className="space-y-2">
                        {generatedCampaign.generatedAssets.headlines.map((headline, i) => (
                          <div key={i} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                            <span className="text-sm font-medium" data-testid={`text-headline-${i}`}>{headline}</span>
                            <Button variant="ghost" size="sm" data-testid={`button-copy-headline-${i}`}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedCampaign.generatedAssets.socialPosts && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Social Posts
                      </Label>
                      <div className="space-y-2">
                        {generatedCampaign.generatedAssets.socialPosts.map((post, i) => (
                          <div key={i} className="glass rounded-xl px-4 py-3">
                            <p className="text-sm text-muted-foreground leading-relaxed" data-testid={`text-social-post-${i}`}>
                              {post}
                            </p>
                            <div className="flex items-center gap-2 mt-3">
                              <Button variant="ghost" size="sm" data-testid={`button-copy-post-${i}`}>
                                <Copy className="w-3 h-3 mr-1" /> Copy
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedCampaign.generatedAssets.adCopy && (
                    <div className="space-y-3">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Ad Copy
                      </Label>
                      <div className="space-y-2">
                        {generatedCampaign.generatedAssets.adCopy.map((ad, i) => (
                          <div key={i} className="glass rounded-xl px-4 py-3 flex items-center justify-between gap-2">
                            <span className="text-sm" data-testid={`text-ad-copy-${i}`}>{ad}</span>
                            <Button variant="ghost" size="sm" data-testid={`button-copy-ad-${i}`}>
                              <Copy className="w-3 h-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="glass-card" data-testid="card-campaign-stats">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass rounded-xl p-4 text-center">
                    <Eye className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-total-impressions">
                      {campaigns.reduce((sum, c) => sum + (c.impressions || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Impressions</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <MousePointer className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-total-clicks">
                      {campaigns.reduce((sum, c) => sum + (c.clicks || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Clicks</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <ShoppingCart className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-total-conversions">
                      {campaigns.reduce((sum, c) => sum + (c.conversions || 0), 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Conversions</p>
                  </div>
                  <div className="glass rounded-xl p-4 text-center">
                    <DollarSign className="w-5 h-5 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-2xl font-bold" data-testid="text-total-revenue">
                      ${campaigns.reduce((sum, c) => sum + parseFloat(c.revenue || "0"), 0).toFixed(0)}
                    </p>
                    <p className="text-xs text-muted-foreground">Revenue</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card" data-testid="card-recent-campaigns">
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <CardTitle className="text-lg">Recent Campaigns</CardTitle>
                <Button variant="ghost" size="sm" data-testid="button-view-all-campaigns">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {campaignsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : campaigns.length === 0 ? (
                  <div className="text-center py-8">
                    <Megaphone className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No campaigns yet</p>
                    <p className="text-xs text-muted-foreground">Create your first campaign above</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div 
                        key={campaign.id} 
                        className="glass rounded-xl p-4 hover-elevate cursor-pointer"
                        data-testid={`card-campaign-${campaign.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h4 className="font-semibold text-sm truncate" data-testid={`text-campaign-name-${campaign.id}`}>
                              {campaign.name}
                            </h4>
                            <p className="text-xs text-muted-foreground capitalize mt-1">
                              {campaign.objective}
                            </p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-xs shrink-0 ${getStatusColor(campaign.status)}`}
                            data-testid={`badge-campaign-status-${campaign.id}`}
                          >
                            {campaign.status}
                          </Badge>
                        </div>
                        {campaign.platforms && campaign.platforms.length > 0 && (
                          <div className="flex items-center gap-2 mt-3">
                            {campaign.platforms.slice(0, 4).map((platformId) => {
                              const Icon = PLATFORM_ICONS[platformId];
                              return Icon ? (
                                <Icon key={platformId} className="w-4 h-4 text-muted-foreground" />
                              ) : null;
                            })}
                            {campaign.platforms.length > 4 && (
                              <span className="text-xs text-muted-foreground">
                                +{campaign.platforms.length - 4}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="glass-card bg-gradient-to-br from-ff-purple/10 to-ff-pink/10" data-testid="card-pro-features">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-ff-purple to-ff-pink">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold">Pro Features</h3>
                    <p className="text-xs text-muted-foreground">Unlock advanced AI capabilities</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground mb-4">
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-ff-purple" /> A/B testing optimization
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-ff-purple" /> Predictive analytics
                  </li>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3 h-3 text-ff-purple" /> Auto-scheduling
                  </li>
                </ul>
                <Button variant="outline" className="w-full" data-testid="button-upgrade-pro">
                  Upgrade to Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

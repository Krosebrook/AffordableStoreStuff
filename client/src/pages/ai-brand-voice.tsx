import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Mic, 
  Sparkles, 
  Settings,
  Plus,
  Save,
  Trash2,
  Star,
  Check,
  X,
  Loader2,
  ChevronRight,
  Palette,
  Users,
  Megaphone,
  FileText,
  Target,
  Pencil
} from "lucide-react";

interface BrandVoiceProfile {
  id: string;
  userId?: string;
  name: string;
  description?: string;
  isDefault?: boolean;
  tone?: string;
  personality?: string[];
  targetAudience?: string;
  brandValues?: string[];
  writingStyle?: string;
  vocabularyLevel?: string;
  avoidWords?: string[];
  preferredPhrases?: string[];
  exampleContent?: {
    headlines?: string[];
    descriptions?: string[];
    emails?: string[];
  };
  industry?: string;
  colorPalette?: string[];
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

const TONES = [
  { id: "professional", label: "Professional", description: "Polished and business-appropriate" },
  { id: "casual", label: "Casual", description: "Relaxed and conversational" },
  { id: "playful", label: "Playful", description: "Fun and lighthearted" },
  { id: "authoritative", label: "Authoritative", description: "Expert and commanding" },
  { id: "friendly", label: "Friendly", description: "Warm and approachable" },
];

const WRITING_STYLES = [
  { id: "formal", label: "Formal" },
  { id: "conversational", label: "Conversational" },
  { id: "technical", label: "Technical" },
  { id: "creative", label: "Creative" },
];

const VOCABULARY_LEVELS = [
  { id: "simple", label: "Simple", description: "Easy to understand" },
  { id: "intermediate", label: "Intermediate", description: "Standard vocabulary" },
  { id: "advanced", label: "Advanced", description: "Sophisticated language" },
  { id: "technical", label: "Technical", description: "Industry-specific terms" },
];

const PERSONALITY_TRAITS = [
  "Innovative", "Trustworthy", "Bold", "Elegant", "Energetic",
  "Sophisticated", "Approachable", "Reliable", "Creative", "Authentic"
];

const INDUSTRIES = [
  "E-commerce", "Technology", "Healthcare", "Finance", "Education",
  "Fashion", "Food & Beverage", "Real Estate", "Travel", "Entertainment"
];

export default function AIBrandVoice() {
  const { toast } = useToast();
  const [selectedProfile, setSelectedProfile] = useState<BrandVoiceProfile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    tone: "professional",
    writingStyle: "conversational",
    vocabularyLevel: "intermediate",
    targetAudience: "",
    industry: "",
    personality: [] as string[],
    brandValues: [] as string[],
    avoidWords: "",
    preferredPhrases: "",
  });

  const { data: profiles = [], isLoading } = useQuery<BrandVoiceProfile[]>({
    queryKey: ["/api/ai/brand-voices"],
  });

  const createProfileMutation = useMutation({
    mutationFn: async (data: Partial<BrandVoiceProfile>) => {
      const response = await apiRequest("POST", "/api/ai/brand-voices", data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/brand-voices"] });
      setSelectedProfile(data);
      setIsCreating(false);
      toast({
        title: "Profile Created",
        description: "Your brand voice profile has been saved.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateProfileMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BrandVoiceProfile> }) => {
      const response = await apiRequest("PATCH", `/api/ai/brand-voices/${id}`, data);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/brand-voices"] });
      setSelectedProfile(data);
      toast({
        title: "Profile Updated",
        description: "Your brand voice profile has been updated.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const deleteProfileMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/ai/brand-voices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/brand-voices"] });
      setSelectedProfile(null);
      toast({
        title: "Profile Deleted",
        description: "The brand voice profile has been removed.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSelectProfile = (profile: BrandVoiceProfile) => {
    setSelectedProfile(profile);
    setIsCreating(false);
    setFormData({
      name: profile.name,
      description: profile.description || "",
      tone: profile.tone || "professional",
      writingStyle: profile.writingStyle || "conversational",
      vocabularyLevel: profile.vocabularyLevel || "intermediate",
      targetAudience: profile.targetAudience || "",
      industry: profile.industry || "",
      personality: profile.personality || [],
      brandValues: profile.brandValues || [],
      avoidWords: profile.avoidWords?.join(", ") || "",
      preferredPhrases: profile.preferredPhrases?.join(", ") || "",
    });
  };

  const handleCreateNew = () => {
    setSelectedProfile(null);
    setIsCreating(true);
    setFormData({
      name: "",
      description: "",
      tone: "professional",
      writingStyle: "conversational",
      vocabularyLevel: "intermediate",
      targetAudience: "",
      industry: "",
      personality: [],
      brandValues: [],
      avoidWords: "",
      preferredPhrases: "",
    });
  };

  const handleTogglePersonality = (trait: string) => {
    setFormData(prev => ({
      ...prev,
      personality: prev.personality.includes(trait)
        ? prev.personality.filter(t => t !== trait)
        : [...prev.personality, trait]
    }));
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Missing Name",
        description: "Please provide a name for your brand voice profile.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    const profileData = {
      name: formData.name,
      description: formData.description || undefined,
      tone: formData.tone,
      writingStyle: formData.writingStyle,
      vocabularyLevel: formData.vocabularyLevel,
      targetAudience: formData.targetAudience || undefined,
      industry: formData.industry || undefined,
      personality: formData.personality,
      brandValues: formData.brandValues,
      avoidWords: formData.avoidWords ? formData.avoidWords.split(",").map(s => s.trim()).filter(Boolean) : [],
      preferredPhrases: formData.preferredPhrases ? formData.preferredPhrases.split(",").map(s => s.trim()).filter(Boolean) : [],
    };

    try {
      if (isCreating) {
        await createProfileMutation.mutateAsync(profileData);
      } else if (selectedProfile) {
        await updateProfileMutation.mutateAsync({ id: selectedProfile.id, data: profileData });
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8 gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text" data-testid="text-page-title">
              Brand Voice Settings
            </h1>
            <p className="text-muted-foreground mt-1">
              Configure your AI's personality, tone, and writing style for consistent messaging
            </p>
          </div>
          <Button className="btn-gradient" onClick={handleCreateNew} data-testid="button-create-profile">
            <Plus className="w-4 h-4 mr-2" />
            New Profile
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="space-y-4">
            <Card className="glass-card" data-testid="card-profiles-list">
              <CardHeader>
                <CardTitle className="text-lg">Voice Profiles</CardTitle>
                <CardDescription>Select or create a profile</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : profiles.length === 0 && !isCreating ? (
                  <div className="text-center py-8">
                    <Mic className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">No profiles yet</p>
                    <Button variant="ghost" size="sm" className="mt-2" onClick={handleCreateNew} data-testid="button-create-first-profile">
                      Create your first profile
                    </Button>
                  </div>
                ) : (
                  <>
                    {profiles.map((profile) => (
                      <div
                        key={profile.id}
                        onClick={() => handleSelectProfile(profile)}
                        className={`p-4 rounded-xl border cursor-pointer transition-all ${
                          selectedProfile?.id === profile.id
                            ? "border-ff-purple bg-ff-purple/10"
                            : "border-border hover-elevate"
                        }`}
                        data-testid={`card-profile-${profile.id}`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-sm truncate" data-testid={`text-profile-name-${profile.id}`}>
                                {profile.name}
                              </h4>
                              {profile.isDefault && (
                                <Star className="w-3 h-3 text-ff-purple shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground capitalize mt-1">
                              {profile.tone} tone
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isCreating && (
                      <div className="p-4 rounded-xl border border-ff-purple bg-ff-purple/10">
                        <div className="flex items-center gap-2">
                          <Plus className="w-4 h-4 text-ff-purple" />
                          <span className="font-semibold text-sm">New Profile</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-3 space-y-6">
            {(selectedProfile || isCreating) ? (
              <>
                <Card className="glass-card" data-testid="card-profile-editor">
                  <CardHeader>
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-gradient-to-br from-ff-purple to-ff-pink">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <CardTitle>{isCreating ? "Create New Profile" : "Edit Profile"}</CardTitle>
                          <CardDescription>Configure your brand voice settings</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedProfile && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => deleteProfileMutation.mutate(selectedProfile.id)}
                            disabled={deleteProfileMutation.isPending}
                            data-testid="button-delete-profile"
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                          </Button>
                        )}
                        <Button 
                          size="sm"
                          onClick={handleSave}
                          disabled={isSaving || !formData.name.trim()}
                          className="btn-gradient"
                          data-testid="button-save-profile"
                        >
                          {isSaving ? (
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-1" />
                          )}
                          Save Profile
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="profile-name">Profile Name</Label>
                        <Input
                          id="profile-name"
                          placeholder="My Brand Voice"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="glass"
                          data-testid="input-profile-name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="industry">Industry</Label>
                        <Select
                          value={formData.industry}
                          onValueChange={(value) => setFormData({ ...formData, industry: value })}
                        >
                          <SelectTrigger className="glass" data-testid="select-industry">
                            <SelectValue placeholder="Select industry" />
                          </SelectTrigger>
                          <SelectContent>
                            {INDUSTRIES.map((ind) => (
                              <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Brand Description</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your brand's mission, values, and unique selling points..."
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="glass min-h-[100px]"
                        data-testid="input-description"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>Voice Tone</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                        {TONES.map((toneOption) => (
                          <button
                            key={toneOption.id}
                            onClick={() => setFormData({ ...formData, tone: toneOption.id })}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              formData.tone === toneOption.id
                                ? "border-ff-purple bg-ff-purple/10"
                                : "border-border hover-elevate"
                            }`}
                            data-testid={`button-tone-${toneOption.id}`}
                          >
                            <p className="font-semibold text-sm">{toneOption.label}</p>
                            <p className="text-xs text-muted-foreground mt-1">{toneOption.description}</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="writing-style">Writing Style</Label>
                        <Select
                          value={formData.writingStyle}
                          onValueChange={(value) => setFormData({ ...formData, writingStyle: value })}
                        >
                          <SelectTrigger id="writing-style" className="glass" data-testid="select-writing-style">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {WRITING_STYLES.map((style) => (
                              <SelectItem key={style.id} value={style.id}>{style.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vocabulary-level">Vocabulary Level</Label>
                        <Select
                          value={formData.vocabularyLevel}
                          onValueChange={(value) => setFormData({ ...formData, vocabularyLevel: value })}
                        >
                          <SelectTrigger id="vocabulary-level" className="glass" data-testid="select-vocabulary-level">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {VOCABULARY_LEVELS.map((level) => (
                              <SelectItem key={level.id} value={level.id}>
                                {level.label} - {level.description}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <Label>Personality Traits</Label>
                      <p className="text-xs text-muted-foreground">Select traits that define your brand's character</p>
                      <div className="flex flex-wrap gap-2">
                        {PERSONALITY_TRAITS.map((trait) => (
                          <Badge
                            key={trait}
                            variant={formData.personality.includes(trait) ? "default" : "outline"}
                            className={`cursor-pointer transition-all toggle-elevate ${
                              formData.personality.includes(trait) 
                                ? "toggle-elevated bg-ff-purple border-ff-purple" 
                                : ""
                            }`}
                            onClick={() => handleTogglePersonality(trait)}
                            data-testid={`badge-personality-${trait.toLowerCase()}`}
                          >
                            {formData.personality.includes(trait) && (
                              <Check className="w-3 h-3 mr-1" />
                            )}
                            {trait}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="target-audience">Target Audience</Label>
                      <Input
                        id="target-audience"
                        placeholder="e.g., Young professionals aged 25-35 interested in technology"
                        value={formData.targetAudience}
                        onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                        className="glass"
                        data-testid="input-target-audience"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="avoid-words">Words to Avoid (comma-separated)</Label>
                        <Textarea
                          id="avoid-words"
                          placeholder="cheap, discount, limited time..."
                          value={formData.avoidWords}
                          onChange={(e) => setFormData({ ...formData, avoidWords: e.target.value })}
                          className="glass"
                          data-testid="input-avoid-words"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="preferred-phrases">Preferred Phrases (comma-separated)</Label>
                        <Textarea
                          id="preferred-phrases"
                          placeholder="premium quality, customer-first, innovation..."
                          value={formData.preferredPhrases}
                          onChange={(e) => setFormData({ ...formData, preferredPhrases: e.target.value })}
                          className="glass"
                          data-testid="input-preferred-phrases"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card" data-testid="card-voice-preview">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500">
                        <FileText className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle>Voice Preview</CardTitle>
                        <CardDescription>See how your brand voice sounds in different contexts</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="glass rounded-xl p-4">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Sample Headline
                      </Label>
                      <p className="mt-2 font-semibold" data-testid="text-sample-headline">
                        {formData.tone === "playful" 
                          ? "Get ready to level up your game!"
                          : formData.tone === "authoritative"
                          ? "Industry-leading solutions for your business"
                          : formData.tone === "casual"
                          ? "Hey there! Check out what's new"
                          : formData.tone === "friendly"
                          ? "We're here to help you succeed"
                          : "Discover excellence in every detail"}
                      </p>
                    </div>
                    <div className="glass rounded-xl p-4">
                      <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Sample Description
                      </Label>
                      <p className="mt-2 text-sm text-muted-foreground leading-relaxed" data-testid="text-sample-description">
                        {formData.tone === "playful" 
                          ? "Jump into a world of possibilities! Our amazing products are designed to bring joy and excitement to your everyday life. Let's make something awesome together!"
                          : formData.tone === "authoritative"
                          ? "Our comprehensive solutions leverage cutting-edge technology to deliver measurable results. Trust our expertise to transform your business operations."
                          : formData.tone === "casual"
                          ? "Looking for something that just works? We've got you covered. No fancy jargon, just quality products that make your life easier."
                          : formData.tone === "friendly"
                          ? "We believe in building lasting relationships with our customers. That's why we focus on creating products that truly add value to your life."
                          : "Experience the perfect blend of quality and innovation. Our meticulously crafted products are designed to exceed your expectations."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card className="glass-card border-dashed border-2 border-muted">
                <CardContent className="p-12 flex flex-col items-center justify-center text-center min-h-[500px]">
                  <div className="w-20 h-20 rounded-full bg-ff-purple/10 flex items-center justify-center mb-6">
                    <Mic className="w-10 h-10 text-ff-purple/50" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Configure Your Brand Voice</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    Create a brand voice profile to ensure consistent AI-generated content that matches your brand's personality.
                  </p>
                  <Button className="btn-gradient" onClick={handleCreateNew} data-testid="button-get-started">
                    <Plus className="w-4 h-4 mr-2" />
                    Get Started
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

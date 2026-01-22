import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sparkles,
  Wand2,
  Copy,
  RotateCcw,
  FileText,
  Mail,
  MessageSquare,
  ShoppingBag,
  Zap,
  Check,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const generatorTypes = [
  {
    id: "product",
    name: "Product Description",
    icon: ShoppingBag,
    description: "Generate compelling product descriptions",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "email",
    name: "Marketing Email",
    icon: Mail,
    description: "Create engaging email campaigns",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "social",
    name: "Social Post",
    icon: MessageSquare,
    description: "Generate viral social media content",
    gradient: "from-pink-500 to-rose-500",
  },
  {
    id: "blog",
    name: "Blog Article",
    icon: FileText,
    description: "Write SEO-optimized blog posts",
    gradient: "from-green-500 to-emerald-500",
  },
];

const toneOptions = [
  { value: "professional", label: "Professional" },
  { value: "casual", label: "Casual" },
  { value: "playful", label: "Playful" },
  { value: "luxury", label: "Luxury" },
  { value: "technical", label: "Technical" },
];

export default function Generator() {
  const [selectedType, setSelectedType] = useState("product");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Please enter a prompt",
        description: "Describe what you want to generate.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    await new Promise((resolve) => setTimeout(resolve, 2000));

    const mockContent = generateMockContent(selectedType, prompt, tone);
    setGeneratedContent(mockContent);
    setIsGenerating(false);
  };

  const generateMockContent = (type: string, prompt: string, tone: string) => {
    const templates: Record<string, string> = {
      product: `Introducing our latest innovation - the perfect solution for ${prompt}.

Experience unparalleled quality with premium materials and cutting-edge design. This product has been meticulously crafted to exceed your expectations.

Key Features:
• Premium quality construction
• Innovative design for maximum efficiency
• Eco-friendly and sustainable materials
• Backed by our satisfaction guarantee

Transform your experience today. Order now and discover why thousands of customers trust our brand.`,
      email: `Subject: You're Going to Love This!

Hi there,

We have exciting news about ${prompt}!

As one of our valued customers, we wanted you to be the first to know about our latest offering. We've put our heart and soul into creating something truly special.

Here's what makes this different:
✨ Exclusive early access for subscribers
✨ Limited-time special pricing
✨ Free shipping on all orders

Don't miss out on this opportunity!

[Shop Now]

Best regards,
The Team`,
      social: `✨ Big news! ✨

We're thrilled to announce: ${prompt}

This is the game-changer you've been waiting for. Who else is excited? Drop a 🔥 in the comments!

#Innovation #NewLaunch #MustHave #Trending`,
      blog: `# The Complete Guide to ${prompt}

In today's fast-paced world, understanding ${prompt} has never been more important. Whether you're a beginner or an expert, this comprehensive guide will help you master the essentials.

## Why This Matters

The landscape is constantly evolving, and staying ahead means embracing new approaches. Let's dive into what makes this topic so crucial for your success.

## Key Takeaways

1. Start with a solid foundation
2. Focus on what matters most
3. Continuously iterate and improve

## Getting Started

Ready to take the next step? Here's your actionable roadmap...`,
    };

    return templates[type] || templates.product;
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedContent);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard.",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const selectedGenerator = generatorTypes.find((t) => t.id === selectedType);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-400" />
            AI Content Generator
          </h1>
          <p className="text-muted-foreground">
            Create compelling content powered by AI
          </p>
        </div>
        <Badge variant="secondary" className="glass">
          <Zap className="w-3 h-3 mr-1 text-yellow-400" />
          Pro Feature
        </Badge>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {generatorTypes.map((type) => (
          <Card
            key={type.id}
            className={`cursor-pointer transition-all duration-300 ${
              selectedType === type.id
                ? "glass border-purple-500/50 ring-2 ring-purple-500/20"
                : "glass border-white/10 hover:border-white/20"
            }`}
            onClick={() => setSelectedType(type.id)}
            data-testid={`generator-type-${type.id}`}
          >
            <CardContent className="p-4">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center mb-3`}
              >
                <type.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-medium text-sm">{type.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{type.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="glass border-white/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {selectedGenerator && <selectedGenerator.icon className="w-5 h-5 text-purple-400" />}
              {selectedGenerator?.name}
            </CardTitle>
            <CardDescription>
              Describe what you want to generate
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Prompt</label>
              <Textarea
                placeholder={
                  selectedType === "product"
                    ? "e.g., Wireless noise-canceling headphones with 30-hour battery life"
                    : selectedType === "email"
                    ? "e.g., Black Friday sale with 50% off all products"
                    : selectedType === "social"
                    ? "e.g., Launch of our new sustainable product line"
                    : "e.g., How to improve your productivity"
                }
                className="min-h-[120px] glass border-white/10"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                data-testid="input-generator-prompt"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger className="glass border-white/10" data-testid="select-tone">
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {toneOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Length</label>
                <Select defaultValue="medium">
                  <SelectTrigger className="glass border-white/10" data-testid="select-length">
                    <SelectValue placeholder="Select length" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="short">Short</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="long">Long</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full btn-gradient"
              onClick={handleGenerate}
              disabled={isGenerating}
              data-testid="button-generate"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate Content
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-white/10">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Generated Content</CardTitle>
              <CardDescription>
                AI-generated content based on your prompt
              </CardDescription>
            </div>
            {generatedContent && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setGeneratedContent("");
                    handleGenerate();
                  }}
                  data-testid="button-regenerate"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyToClipboard}
                  data-testid="button-copy"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            {generatedContent ? (
              <div className="prose prose-invert prose-sm max-w-none">
                <div className="glass rounded-lg p-4 whitespace-pre-wrap font-mono text-sm leading-relaxed">
                  {generatedContent}
                </div>
              </div>
            ) : (
              <div className="h-[300px] flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full glass flex items-center justify-center mb-4">
                  <Sparkles className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-medium text-lg mb-2">No content yet</h3>
                <p className="text-muted-foreground text-sm max-w-xs">
                  Enter a prompt and click generate to create AI-powered content
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="glass border-white/10">
        <CardHeader>
          <CardTitle>Tips for Better Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg glass">
              <h4 className="font-medium mb-2">Be Specific</h4>
              <p className="text-sm text-muted-foreground">
                Include key details like product features, target audience, and unique selling points.
              </p>
            </div>
            <div className="p-4 rounded-lg glass">
              <h4 className="font-medium mb-2">Set the Right Tone</h4>
              <p className="text-sm text-muted-foreground">
                Match the tone to your brand voice and target audience for authentic content.
              </p>
            </div>
            <div className="p-4 rounded-lg glass">
              <h4 className="font-medium mb-2">Iterate & Refine</h4>
              <p className="text-sm text-muted-foreground">
                Use the regenerate button to explore different variations of your content.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

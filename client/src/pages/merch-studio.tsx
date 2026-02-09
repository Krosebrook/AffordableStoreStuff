import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Shirt, Coffee, ShoppingBag, Home, Image, Loader2, Sparkles, Filter,
  Camera, Sun, BookOpen, Square, Zap, Droplet, Clock, Briefcase, Download,
} from "lucide-react";
import type { MerchProduct, MerchSession, MerchCategory, MerchStylePreference } from "@shared/schema";
import { MERCH_STYLE_INFO, MERCH_CATEGORY_INFO } from "@shared/schema";
import { TextOverlayEditor, type TextOverlay } from "@/components/text-overlay-editor";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  apparel: <Shirt className="w-4 h-4" />,
  drinkware: <Coffee className="w-4 h-4" />,
  accessories: <ShoppingBag className="w-4 h-4" />,
  home: <Home className="w-4 h-4" />,
  art: <Image className="w-4 h-4" />,
};

const STYLE_ICONS: Record<string, React.ReactNode> = {
  camera: <Camera className="w-4 h-4" />,
  sun: <Sun className="w-4 h-4" />,
  "book-open": <BookOpen className="w-4 h-4" />,
  square: <Square className="w-4 h-4" />,
  zap: <Zap className="w-4 h-4" />,
  droplet: <Droplet className="w-4 h-4" />,
  clock: <Clock className="w-4 h-4" />,
  briefcase: <Briefcase className="w-4 h-4" />,
};

export default function MerchStudio() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<MerchProduct | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<MerchStylePreference>("studio");
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [showGenerator, setShowGenerator] = useState(false);
  const [textOverlays, setTextOverlays] = useState<TextOverlay[]>([]);

  const { data: products = [], isLoading } = useQuery<MerchProduct[]>({
    queryKey: ["/api/merch/products"],
  });

  const { data: sessions = [] } = useQuery<MerchSession[]>({
    queryKey: ["/api/merch/sessions"],
  });

  const createSessionMutation = useMutation({
    mutationFn: async (data: { productId: string; stylePreference: string; additionalPrompt?: string; textOverlays?: TextOverlay[] }) => {
      return apiRequest("POST", "/api/merch/sessions", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merch/sessions"] });
      toast({ title: "Session created", description: "Your mockup session has been started." });
    },
  });

  const seedMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/merch/seed");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/merch/products"] });
      toast({ title: "Catalog seeded", description: "18 products loaded into the merch catalog." });
    },
  });

  const filteredProducts = selectedCategory === "all"
    ? products
    : products.filter(p => p.category === selectedCategory);

  const popularProducts = products.filter(p => p.popular);

  const handleStartMockup = (product: MerchProduct) => {
    setSelectedProduct(product);
    setShowGenerator(true);
  };

  const handleGenerate = () => {
    if (!selectedProduct) return;
    createSessionMutation.mutate({
      productId: selectedProduct.id,
      stylePreference: selectedStyle,
      additionalPrompt: additionalPrompt || undefined,
      textOverlays: textOverlays.length > 0 ? textOverlays : undefined,
    });
    setShowGenerator(false);
    setAdditionalPrompt("");
  };

  const categories = ["all", ...Object.keys(MERCH_CATEGORY_INFO)] as const;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Merch Studio</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered product mockups across 18 product types
          </p>
        </div>
        {products.length === 0 && (
          <Button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending}>
            {seedMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Load Product Catalog
          </Button>
        )}
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">Product Types</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{Object.keys(MERCH_CATEGORY_INFO).length}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{Object.keys(MERCH_STYLE_INFO).length}</p>
            <p className="text-xs text-muted-foreground">Style Presets</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold">{sessions.length}</p>
            <p className="text-xs text-muted-foreground">Mockup Sessions</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList>
          <TabsTrigger value="catalog">Product Catalog</TabsTrigger>
          <TabsTrigger value="styles">Style Presets</TabsTrigger>
          <TabsTrigger value="sessions">My Sessions ({sessions.length})</TabsTrigger>
        </TabsList>

        {/* Product Catalog */}
        <TabsContent value="catalog" className="space-y-4">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat)}
              >
                {cat !== "all" && CATEGORY_ICONS[cat]}
                <span className="ml-1 capitalize">{cat === "all" ? "All Products" : MERCH_CATEGORY_INFO[cat as MerchCategory]?.name}</span>
              </Button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
          ) : filteredProducts.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Image className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No products loaded</h3>
                <p className="text-sm text-muted-foreground mt-1">Click "Load Product Catalog" to populate the merch catalog with 18 product types.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <Card key={product.id} className="glass hover:border-purple-500/50 transition-colors group">
                  <CardContent className="p-0">
                    <div className="aspect-square bg-muted/30 rounded-t-lg flex items-center justify-center overflow-hidden">
                      {product.placeholderImage ? (
                        <img src={product.placeholderImage} alt={product.name} className="w-full h-full object-cover" />
                      ) : (
                        <Image className="w-16 h-16 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        {product.popular && <Badge variant="secondary" className="text-xs">Popular</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{product.description}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {CATEGORY_ICONS[product.category]}
                          <span className="ml-1">{product.category}</span>
                        </Badge>
                        {(product.printArea as any)?.dpi && (
                          <Badge variant="outline" className="text-xs">
                            {(product.printArea as any).dpi} DPI
                          </Badge>
                        )}
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => handleStartMockup(product)}
                      >
                        <Sparkles className="w-3 h-3 mr-1" />
                        Create Mockup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Style Presets */}
        <TabsContent value="styles" className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(Object.entries(MERCH_STYLE_INFO) as [MerchStylePreference, { name: string; description: string; icon: string }][]).map(([key, style]) => (
              <Card key={key} className={`glass cursor-pointer transition-all ${selectedStyle === key ? "border-purple-500 ring-1 ring-purple-500" : "hover:border-purple-500/30"}`}
                onClick={() => setSelectedStyle(key)}
              >
                <CardContent className="p-4 text-center space-y-2">
                  <div className="w-10 h-10 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center">
                    {STYLE_ICONS[style.icon] || <Camera className="w-5 h-5 text-purple-400" />}
                  </div>
                  <h3 className="font-medium">{style.name}</h3>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                  {selectedStyle === key && <Badge className="bg-purple-500">Selected</Badge>}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Sessions */}
        <TabsContent value="sessions" className="space-y-4">
          {sessions.length === 0 ? (
            <Card className="glass">
              <CardContent className="p-12 text-center">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No mockup sessions yet</h3>
                <p className="text-sm text-muted-foreground mt-1">Select a product from the catalog and create your first AI mockup.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sessions.map(session => (
                <Card key={session.id} className="glass">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{session.productId}</h3>
                      <Badge variant={session.status === "ready" ? "default" : "secondary"}>
                        {session.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Style: {MERCH_STYLE_INFO[session.stylePreference as MerchStylePreference]?.name || session.stylePreference}
                    </p>
                    {session.generatedMockup && (
                      <img src={session.generatedMockup} alt="Mockup" className="rounded-lg w-full" />
                    )}
                    <p className="text-xs text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Generate Mockup Dialog */}
      <Dialog open={showGenerator} onOpenChange={setShowGenerator}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Generate Mockup</DialogTitle>
            <DialogDescription>
              Create an AI-powered mockup for {selectedProduct?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Style Preset</label>
              <Select value={selectedStyle} onValueChange={(v) => setSelectedStyle(v as MerchStylePreference)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(MERCH_STYLE_INFO).map(([key, style]) => (
                    <SelectItem key={key} value={key}>{style.name} - {style.description}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Additional Instructions (optional)</label>
              <Textarea
                placeholder="e.g. Use a beach background, make it look premium..."
                value={additionalPrompt}
                onChange={e => setAdditionalPrompt(e.target.value)}
              />
            </div>
            <TextOverlayEditor overlays={textOverlays} onChange={setTextOverlays} />
            {Boolean(selectedProduct?.printArea) && (
              <div className="text-xs text-muted-foreground">
                Print area: {(selectedProduct.printArea as any).width}x{(selectedProduct.printArea as any).height}px @ {(selectedProduct.printArea as any).dpi} DPI
              </div>
            )}
            <Button className="w-full" onClick={handleGenerate} disabled={createSessionMutation.isPending}>
              {createSessionMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Generate Mockup
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

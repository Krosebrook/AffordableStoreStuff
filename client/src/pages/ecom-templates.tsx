import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Code, Copy, Loader2, ExternalLink, Key, ShoppingBag, Palette, Boxes } from "lucide-react";

interface EcomTemplate {
  id: string;
  platform: string;
  displayName: string;
  description: string;
  logoUrl: string;
  category: string;
  authType: string;
  requiredKeys: string[];
  codeTemplate?: string;
}

const CATEGORY_COLORS: Record<string, string> = {
  ecommerce: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  pod: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  marketplace: "bg-green-500/20 text-green-400 border-green-500/30",
  "social-commerce": "bg-pink-500/20 text-pink-400 border-pink-500/30",
  ai: "bg-amber-500/20 text-amber-400 border-amber-500/30",
};

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  ecommerce: <ShoppingBag className="w-4 h-4" />,
  pod: <Palette className="w-4 h-4" />,
  marketplace: <Boxes className="w-4 h-4" />,
  "social-commerce": <ExternalLink className="w-4 h-4" />,
  ai: <Code className="w-4 h-4" />,
};

export default function EcomTemplates() {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<EcomTemplate | null>(null);
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  const { data: templates = [], isLoading } = useQuery<EcomTemplate[]>({
    queryKey: ["/api/integrations/templates"],
  });

  const { data: templateDetail } = useQuery<EcomTemplate>({
    queryKey: ["/api/integrations/templates", selectedTemplate?.id],
    enabled: !!selectedTemplate,
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/integrations/templates/${selectedTemplate!.id}`);
      return res.json();
    },
  });

  const generateMutation = useMutation({
    mutationFn: async ({ id, vars }: { id: string; vars: Record<string, string> }) => {
      const res = await apiRequest("POST", `/api/integrations/templates/${id}/generate`, { variables: vars });
      return res.json();
    },
    onSuccess: (data) => {
      setGeneratedCode(data.generatedCode);
      toast({ title: "Code generated", description: `${data.platform} integration code is ready.` });
    },
    onError: () => {
      toast({ title: "Generation failed", variant: "destructive" });
    },
  });

  const handleSelectTemplate = (template: EcomTemplate) => {
    setSelectedTemplate(template);
    setGeneratedCode(null);
    const initialVars: Record<string, string> = {};
    template.requiredKeys.forEach((key) => { initialVars[key] = ""; });
    setVariables(initialVars);
  };

  const handleGenerate = () => {
    if (!selectedTemplate) return;
    generateMutation.mutate({ id: selectedTemplate.id, vars: variables });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard" });
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold gradient-text">Ecom Templates</h1>
        <p className="text-muted-foreground mt-1">
          Ready-to-use integration code for 6 e-commerce platforms
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Code className="w-5 h-5 mx-auto mb-1 text-purple-400" />
            <p className="text-2xl font-bold">{templates.length}</p>
            <p className="text-xs text-muted-foreground">Templates</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <ShoppingBag className="w-5 h-5 mx-auto mb-1 text-blue-400" />
            <p className="text-2xl font-bold">{new Set(templates.map(t => t.category)).size}</p>
            <p className="text-xs text-muted-foreground">Categories</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <Key className="w-5 h-5 mx-auto mb-1 text-amber-400" />
            <p className="text-2xl font-bold">{templates.filter(t => t.authType === "api_key").length}</p>
            <p className="text-xs text-muted-foreground">API Key Auth</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="p-4 text-center">
            <ExternalLink className="w-5 h-5 mx-auto mb-1 text-green-400" />
            <p className="text-2xl font-bold">{templates.filter(t => t.authType === "oauth").length}</p>
            <p className="text-xs text-muted-foreground">OAuth</p>
          </CardContent>
        </Card>
      </div>

      {/* Template Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((template) => (
            <Card
              key={template.id}
              className="glass hover:border-purple-500/50 transition-colors cursor-pointer"
              onClick={() => handleSelectTemplate(template)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-muted/30 flex items-center justify-center">
                      {CATEGORY_ICONS[template.category] || <Code className="w-5 h-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm">{template.displayName}</CardTitle>
                      <CardDescription className="text-xs">{template.platform}</CardDescription>
                    </div>
                  </div>
                  <Badge className={CATEGORY_COLORS[template.category] || ""}>
                    {template.category}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">{template.description}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs">
                    <Key className="w-3 h-3 mr-1" />
                    {template.authType}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {template.requiredKeys.length} key{template.requiredKeys.length !== 1 ? "s" : ""}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Template Detail Dialog */}
      <Dialog open={!!selectedTemplate} onOpenChange={(open) => { if (!open) setSelectedTemplate(null); }}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedTemplate?.displayName}</DialogTitle>
            <DialogDescription>{selectedTemplate?.description}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {/* Code Preview */}
            {templateDetail?.codeTemplate && !generatedCode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Code Template</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(templateDetail.codeTemplate!)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="bg-muted/30 rounded-lg p-4 text-xs overflow-x-auto border border-border/50 max-h-64 overflow-y-auto">
                  <code>{templateDetail.codeTemplate}</code>
                </pre>
              </div>
            )}

            {/* Variable Inputs */}
            {selectedTemplate && (
              <div className="space-y-3">
                <span className="text-sm font-medium">API Keys & Variables</span>
                {selectedTemplate.requiredKeys.map((key) => (
                  <div key={key}>
                    <label className="text-xs font-medium text-muted-foreground">{key}</label>
                    <Input
                      type="password"
                      placeholder={`Enter ${key}`}
                      value={variables[key] || ""}
                      onChange={(e) => setVariables((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Generate Button */}
            <Button
              className="w-full"
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Code className="w-4 h-4 mr-2" />
              )}
              Generate Code
            </Button>

            {/* Generated Output */}
            {generatedCode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-green-400">Generated Code</span>
                  <Button size="sm" variant="ghost" onClick={() => copyToClipboard(generatedCode)}>
                    <Copy className="w-3 h-3 mr-1" /> Copy
                  </Button>
                </div>
                <pre className="bg-green-500/5 border border-green-500/20 rounded-lg p-4 text-xs overflow-x-auto max-h-64 overflow-y-auto">
                  <code>{generatedCode}</code>
                </pre>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

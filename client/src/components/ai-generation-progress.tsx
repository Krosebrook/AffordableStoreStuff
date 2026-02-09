import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, X, Sparkles, CheckCircle, AlertCircle } from "lucide-react";

interface AIGenerationProgressProps {
  isStreaming: boolean;
  progress: number;
  content: string;
  error: string | null;
  title?: string;
  onCancel?: () => void;
  showPreview?: boolean;
  className?: string;
}

export function AIGenerationProgress({
  isStreaming,
  progress,
  content,
  error,
  title = "Generating with AI",
  onCancel,
  showPreview = true,
  className = "",
}: AIGenerationProgressProps) {
  if (!isStreaming && !content && !error) {
    return null;
  }

  return (
    <Card className={`glass border-white/10 overflow-visible ${className}`} data-testid="card-generation-progress">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {isStreaming && (
              <Loader2 className="w-4 h-4 text-ff-purple animate-spin" />
            )}
            {!isStreaming && !error && content && (
              <CheckCircle className="w-4 h-4 text-green-500" />
            )}
            {error && (
              <AlertCircle className="w-4 h-4 text-destructive" />
            )}
            <span className="font-medium text-sm" data-testid="text-generation-title">
              {error ? "Generation Failed" : isStreaming ? title : "Generation Complete"}
            </span>
          </div>
          {isStreaming && onCancel && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onCancel}
              data-testid="button-cancel-generation"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {isStreaming && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" data-testid="progress-generation" />
            <p className="text-xs text-muted-foreground text-right" data-testid="text-progress-percent">
              {progress}% complete
            </p>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20" data-testid="text-generation-error">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {showPreview && content && (
          <div className="relative" data-testid="text-generation-preview">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-ff-purple to-ff-pink rounded-lg opacity-20 blur" />
            <div className="relative p-3 rounded-md bg-background/50 border border-white/10 max-h-48 overflow-y-auto">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-ff-purple flex-shrink-0 mt-0.5" />
                <p className="text-sm whitespace-pre-wrap">{content}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface StreamingTextDisplayProps {
  content: string;
  isStreaming: boolean;
  placeholder?: string;
  className?: string;
}

export function StreamingTextDisplay({
  content,
  isStreaming,
  placeholder = "AI-generated content will appear here...",
  className = "",
}: StreamingTextDisplayProps) {
  return (
    <div className={`relative min-h-[100px] ${className}`} data-testid="container-streaming-text">
      {content ? (
        <div className="whitespace-pre-wrap text-sm">
          {content}
          {isStreaming && (
            <span className="inline-block w-2 h-4 ml-1 bg-ff-purple animate-pulse" />
          )}
        </div>
      ) : (
        <p className="text-muted-foreground text-sm italic">{placeholder}</p>
      )}
    </div>
  );
}

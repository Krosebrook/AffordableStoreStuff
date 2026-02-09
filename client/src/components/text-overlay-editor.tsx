import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2, Type } from "lucide-react";

export interface TextOverlay {
  id: string;
  text: string;
  fontFamily: string;
  fontSize: number;
  color: string;
  opacity: number;
  rotation: number;
  x: number;
  y: number;
  alignment: "left" | "center" | "right";
  bold: boolean;
  italic: boolean;
  underline: boolean;
  backgroundColor: string | null;
  backgroundPadding: number;
  backgroundRadius: number;
}

const FONTS = [
  "Inter",
  "Roboto",
  "Playfair Display",
  "Montserrat",
  "Oswald",
  "Bebas Neue",
  "Permanent Marker",
  "Press Start 2P",
];

const defaultOverlay: Omit<TextOverlay, "id"> = {
  text: "Your Text",
  fontFamily: "Inter",
  fontSize: 24,
  color: "#ffffff",
  opacity: 100,
  rotation: 0,
  x: 50,
  y: 50,
  alignment: "center",
  bold: false,
  italic: false,
  underline: false,
  backgroundColor: null,
  backgroundPadding: 8,
  backgroundRadius: 4,
};

interface TextOverlayEditorProps {
  overlays: TextOverlay[];
  onChange: (overlays: TextOverlay[]) => void;
}

export function TextOverlayEditor({ overlays, onChange }: TextOverlayEditorProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = overlays.find((o) => o.id === selectedId);

  const addOverlay = () => {
    const id = `overlay-${Date.now()}`;
    const newOverlay: TextOverlay = { ...defaultOverlay, id };
    const updated = [...overlays, newOverlay];
    onChange(updated);
    setSelectedId(id);
  };

  const updateOverlay = (id: string, changes: Partial<TextOverlay>) => {
    onChange(overlays.map((o) => (o.id === id ? { ...o, ...changes } : o)));
  };

  const removeOverlay = (id: string) => {
    onChange(overlays.filter((o) => o.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Type className="w-4 h-4" />
          Text Overlays
        </h3>
        <Button size="sm" variant="outline" onClick={addOverlay}>
          <Plus className="w-3 h-3 mr-1" />
          Add Text
        </Button>
      </div>

      {overlays.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-4">
          No text overlays. Click "Add Text" to get started.
        </p>
      )}

      <div className="space-y-2">
        {overlays.map((overlay) => (
          <div
            key={overlay.id}
            className={`flex items-center gap-2 p-2 rounded border cursor-pointer ${
              selectedId === overlay.id ? "border-primary bg-primary/5" : "border-border"
            }`}
            onClick={() => setSelectedId(overlay.id)}
          >
            <span className="text-sm truncate flex-1">{overlay.text}</span>
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6"
              onClick={(e) => {
                e.stopPropagation();
                removeOverlay(overlay.id);
              }}
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        ))}
      </div>

      {selected && (
        <div className="space-y-3 border rounded-lg p-3">
          <div>
            <Label className="text-xs">Text</Label>
            <Input
              value={selected.text}
              onChange={(e) => updateOverlay(selected.id, { text: e.target.value })}
              className="h-8 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">Font</Label>
              <Select
                value={selected.fontFamily}
                onValueChange={(v) => updateOverlay(selected.id, { fontFamily: v })}
              >
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONTS.map((f) => (
                    <SelectItem key={f} value={f} className="text-xs">
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Color</Label>
              <Input
                type="color"
                value={selected.color}
                onChange={(e) => updateOverlay(selected.id, { color: e.target.value })}
                className="h-8 p-1"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Size: {selected.fontSize}px</Label>
            <Slider
              value={[selected.fontSize]}
              onValueChange={([v]) => updateOverlay(selected.id, { fontSize: v })}
              min={8}
              max={120}
              step={1}
            />
          </div>

          <div>
            <Label className="text-xs">Opacity: {selected.opacity}%</Label>
            <Slider
              value={[selected.opacity]}
              onValueChange={([v]) => updateOverlay(selected.id, { opacity: v })}
              min={0}
              max={100}
              step={1}
            />
          </div>

          <div>
            <Label className="text-xs">Rotation: {selected.rotation}deg</Label>
            <Slider
              value={[selected.rotation]}
              onValueChange={([v]) => updateOverlay(selected.id, { rotation: v })}
              min={-180}
              max={180}
              step={1}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X Position: {selected.x}%</Label>
              <Slider
                value={[selected.x]}
                onValueChange={([v]) => updateOverlay(selected.id, { x: v })}
                min={0}
                max={100}
                step={1}
              />
            </div>
            <div>
              <Label className="text-xs">Y Position: {selected.y}%</Label>
              <Slider
                value={[selected.y]}
                onValueChange={([v]) => updateOverlay(selected.id, { y: v })}
                min={0}
                max={100}
                step={1}
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Alignment</Label>
            <Select
              value={selected.alignment}
              onValueChange={(v: "left" | "center" | "right") =>
                updateOverlay(selected.id, { alignment: v })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="left">Left</SelectItem>
                <SelectItem value="center">Center</SelectItem>
                <SelectItem value="right">Right</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <Switch
                checked={selected.bold}
                onCheckedChange={(v) => updateOverlay(selected.id, { bold: v })}
              />
              <Label className="text-xs">Bold</Label>
            </div>
            <div className="flex items-center gap-1">
              <Switch
                checked={selected.italic}
                onCheckedChange={(v) => updateOverlay(selected.id, { italic: v })}
              />
              <Label className="text-xs">Italic</Label>
            </div>
            <div className="flex items-center gap-1">
              <Switch
                checked={selected.underline}
                onCheckedChange={(v) => updateOverlay(selected.id, { underline: v })}
              />
              <Label className="text-xs">Underline</Label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Switch
              checked={selected.backgroundColor !== null}
              onCheckedChange={(v) =>
                updateOverlay(selected.id, {
                  backgroundColor: v ? "#000000" : null,
                })
              }
            />
            <Label className="text-xs">Background</Label>
            {selected.backgroundColor !== null && (
              <Input
                type="color"
                value={selected.backgroundColor}
                onChange={(e) =>
                  updateOverlay(selected.id, { backgroundColor: e.target.value })
                }
                className="h-6 w-10 p-0.5"
              />
            )}
          </div>

          {selected.backgroundColor !== null && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Padding: {selected.backgroundPadding}px</Label>
                <Slider
                  value={[selected.backgroundPadding]}
                  onValueChange={([v]) =>
                    updateOverlay(selected.id, { backgroundPadding: v })
                  }
                  min={0}
                  max={32}
                  step={1}
                />
              </div>
              <div>
                <Label className="text-xs">Radius: {selected.backgroundRadius}px</Label>
                <Slider
                  value={[selected.backgroundRadius]}
                  onValueChange={([v]) =>
                    updateOverlay(selected.id, { backgroundRadius: v })
                  }
                  min={0}
                  max={24}
                  step={1}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

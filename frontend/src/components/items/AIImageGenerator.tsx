"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface AIImageGeneratorProps {
  itemName: string;
  onGenerate: (prompt?: string, async?: boolean) => Promise<void>;
  isGenerating: boolean;
}

export function AIImageGenerator({
  itemName,
  onGenerate,
  isGenerating,
}: AIImageGeneratorProps) {
  const [customPrompt, setCustomPrompt] = useState("");
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);

  const handleGenerate = async (async: boolean = false) => {
    const prompt = useCustomPrompt && customPrompt ? customPrompt : undefined;
    await onGenerate(prompt, async);
  };

  return (
    <Card className="p-4">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">AI Image Generation</h3>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600">
          Generate a professional food image using AI. The AI will create an
          image based on your item name{" "}
          <span className="font-medium">&quot;{itemName}&quot;</span>.
        </p>

        {/* Custom Prompt Option */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="custom-prompt"
              checked={useCustomPrompt}
              onChange={(e) => setUseCustomPrompt(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300"
            />
            <Label htmlFor="custom-prompt" className="text-sm">
              Use custom prompt (optional)
            </Label>
          </div>

          {useCustomPrompt && (
            <Input
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g., A delicious butter chicken in a clay pot"
              className="w-full"
            />
          )}
        </div>

        {/* Generation Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={() => handleGenerate(false)}
            disabled={isGenerating}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Now
              </>
            )}
          </Button>

          <Button
            onClick={() => handleGenerate(true)}
            disabled={isGenerating}
            variant="outline"
            className="flex-1"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Generate in Background
          </Button>
        </div>

        {/* Info */}
        <div className="rounded-lg bg-blue-50 p-3">
          <p className="text-xs text-blue-900">
            <strong>Tip:</strong> &quot;Generate Now&quot; waits for the image
            to be ready (30-45 seconds). &quot;Generate in Background&quot;
            continues while the AI works.
          </p>
        </div>
      </div>
    </Card>
  );
}

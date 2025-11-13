"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Wand2, Download, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import Image from "next/image";

export default function AIImagesPage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [itemName, setItemName] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string>("");

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      // Use placeholder image
      setGeneratedImage(
        "https://placehold.co/600x400/blue/white?text=AI+Generated+Image"
      );
      setIsGenerating(false);
      toast.success("Image generated successfully!");
    }, 3000);
  };

  const handleSave = () => {
    toast.success(`Image saved for ${itemName || "item"}!`);
    router.push("/items");
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                AI Image Generator
              </h1>
              <p className="text-sm text-gray-600">
                Create images for menu items
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-600" />
              Generate Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="itemName">Item Name (Optional)</Label>
              <Input
                id="itemName"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g., Paneer Tikka"
              />
            </div>

            <div>
              <Label htmlFor="prompt">
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the dish in detail (e.g., Golden grilled paneer cubes with colorful bell peppers on a white plate, garnished with mint leaves)"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific about colors, presentation, and garnish
              </p>
            </div>

            <Button
              className="w-full bg-purple-600 hover:bg-purple-700"
              onClick={handleGenerate}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Image */}
        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generated Image</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                <Image
                  src={generatedImage}
                  alt="Generated"
                  fill
                  className="object-cover"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSave}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Save & Use
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-purple-900 mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-purple-800 space-y-1 list-disc list-inside">
              <li>Describe colors, textures, and presentation style</li>
              <li>Mention garnishes and plating details</li>
              <li>Specify lighting (natural, warm, bright)</li>
              <li>Include background context (wooden table, white plate)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

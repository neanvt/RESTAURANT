"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  Camera,
  Scan,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Image from "next/image";

interface ScannedItem {
  name: string;
  price: number;
  category: string;
  description: string;
  confidence: number;
}

export default function MenuScannerPage() {
  const router = useRouter();
  const [isScanning, setIsScanning] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [scannedItems, setScannedItems] = useState<ScannedItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image size should be less than 10MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScan = async () => {
    if (!imagePreview) {
      toast.error("Please upload a menu image first");
      return;
    }

    setIsScanning(true);

    // Simulate AI scanning
    setTimeout(() => {
      const mockItems: ScannedItem[] = [
        {
          name: "Paneer Butter Masala",
          price: 280,
          category: "Main Course",
          description: "Rich and creamy paneer curry",
          confidence: 0.95,
        },
        {
          name: "Butter Naan",
          price: 45,
          category: "Breads",
          description: "Soft and fluffy Indian bread",
          confidence: 0.92,
        },
        {
          name: "Masala Dosa",
          price: 120,
          category: "South Indian",
          description: "Crispy dosa with potato filling",
          confidence: 0.88,
        },
      ];

      setScannedItems(mockItems);
      setSelectedItems(new Set(mockItems.map((_, i) => i)));
      setIsScanning(false);
      toast.success(`Found ${mockItems.length} items!`);
    }, 3000);
  };

  const handleToggleItem = (index: number) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedItems(newSelected);
  };

  const handleImport = () => {
    const itemsToImport = scannedItems.filter((_, i) => selectedItems.has(i));
    if (itemsToImport.length === 0) {
      toast.error("Please select at least one item to import");
      return;
    }

    toast.success(`Imported ${itemsToImport.length} items successfully!`);
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
                AI Menu Scanner
              </h1>
              <p className="text-sm text-gray-600">
                Scan physical menus with AI
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Upload Section */}
        {!scannedItems.length && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Upload Menu Image</CardTitle>
              </CardHeader>
              <CardContent>
                {imagePreview ? (
                  <div className="space-y-3">
                    <div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Menu preview"
                        fill
                        className="object-contain"
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setImagePreview("")}
                    >
                      Change Image
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                      <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        Click to upload menu image
                      </p>
                      <p className="text-xs text-gray-600">
                        PNG, JPG up to 10MB
                      </p>
                    </div>
                  </label>
                )}
              </CardContent>
            </Card>

            {imagePreview && (
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleScan}
                disabled={isScanning}
              >
                {isScanning ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Scanning with AI...
                  </>
                ) : (
                  <>
                    <Scan className="h-4 w-4 mr-2" />
                    Scan Menu
                  </>
                )}
              </Button>
            )}

            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <h3 className="font-semibold text-blue-900 mb-2">
                  💡 How it works
                </h3>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Take a clear photo of your physical menu</li>
                  <li>AI will extract item names, prices, and descriptions</li>
                  <li>Review and edit extracted items before importing</li>
                  <li>Import directly to your item list</li>
                </ul>
              </CardContent>
            </Card>
          </>
        )}

        {/* Scanned Items */}
        {scannedItems.length > 0 && (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">
                  Scanned Items ({selectedItems.size} selected)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {scannedItems.map((item, index) => (
                    <Card
                      key={index}
                      className={`cursor-pointer transition-all ${
                        selectedItems.has(index)
                          ? "border-blue-500 ring-2 ring-blue-100"
                          : "border-gray-200"
                      }`}
                      onClick={() => handleToggleItem(index)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <div className="mt-1">
                            <input
                              type="checkbox"
                              checked={selectedItems.has(index)}
                              onChange={() => handleToggleItem(index)}
                              className="w-5 h-5 text-blue-600 rounded"
                            />
                          </div>

                          {/* Info */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-1">
                              <div className="font-semibold text-gray-900">
                                {item.name}
                              </div>
                              <div className="font-bold text-gray-900">
                                ₹{item.price}
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-xs mb-2">
                              {item.category}
                            </Badge>
                            <p className="text-sm text-gray-600 mb-2">
                              {item.description}
                            </p>
                            <div className="flex items-center gap-1 text-xs">
                              {item.confidence >= 0.9 ? (
                                <>
                                  <CheckCircle className="h-3 w-3 text-green-600" />
                                  <span className="text-green-600">
                                    High confidence (
                                    {Math.round(item.confidence * 100)}%)
                                  </span>
                                </>
                              ) : (
                                <>
                                  <AlertCircle className="h-3 w-3 text-yellow-600" />
                                  <span className="text-yellow-600">
                                    Medium confidence (
                                    {Math.round(item.confidence * 100)}%)
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="sticky bottom-0 bg-white border-t p-4 -mx-4 space-y-2">
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                onClick={handleImport}
                disabled={selectedItems.size === 0}
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Import {selectedItems.size} Items
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setScannedItems([]);
                  setImagePreview("");
                  setSelectedItems(new Set());
                }}
              >
                Scan Another Menu
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

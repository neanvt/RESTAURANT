"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Upload, X, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategorySelector } from "./CategorySelector";
import { useCategoryStore } from "@/store/categoryStore";
import { useItemStore } from "@/store/itemStore";
import { Item } from "@/types/item";
import { toast } from "sonner";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/imageUtils";

const itemFormSchema = z.object({
  name: z.string().min(1, "Item name is required").max(100),
  description: z.string().max(500).optional(),
  price: z.number().min(0, "Price must be positive"),
  category: z.string().min(1, "Category is required"),
  tax: z.object({
    enabled: z.boolean(),
    rate: z.number().min(0).max(100).optional(),
    type: z.enum(["CGST_SGST", "IGST"]).optional(),
  }),
  isFavourite: z.boolean(),
  isAvailable: z.boolean(),
  trackInventory: z.boolean(),
  stock: z.number().min(0).optional(),
  lowStockThreshold: z.number().min(0).optional(),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  item?: Item;
  mode: "create" | "edit";
}

export function ItemForm({ item, mode }: ItemFormProps) {
  const router = useRouter();
  const { categories, fetchCategories } = useCategoryStore();
  const { createItem, updateItem, uploadImage, generateImage } = useItemStore();

  const [imageUrl, setImageUrl] = useState<string | null>(
    item?.image?.url || null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showCategorySelector, setShowCategorySelector] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: item?.name || "",
      description: item?.description || "",
      price: item?.price || 0,
      category:
        typeof item?.category === "string"
          ? item.category
          : item?.category?.id || "",
      tax: {
        enabled: item?.tax?.isApplicable || false,
        rate: item?.tax?.rate || 5,
        type: "CGST_SGST",
      },
      isFavourite: item?.isFavourite || false,
      isAvailable: item?.isAvailable ?? true,
      trackInventory: item?.inventory?.trackInventory || false,
      stock: item?.inventory?.currentStock || 0,
      lowStockThreshold: item?.inventory?.lowStockAlert || 10,
    },
  });

  const taxEnabled = watch("tax.enabled");
  const trackInventory = watch("trackInventory");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size must be less than 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageUrl(null);
    setImageFile(null);
  };

  const onSubmit = async (data: ItemFormData) => {
    try {
      setIsSubmitting(true);

      const itemData = {
        ...data,
        image: imageUrl || undefined,
        tax: data.tax.enabled
          ? {
              enabled: true,
              rate: data.tax.rate || 5,
              type: data.tax.type || "CGST_SGST",
            }
          : { enabled: false },
        stock: data.trackInventory ? data.stock : undefined,
        lowStockThreshold: data.trackInventory
          ? data.lowStockThreshold
          : undefined,
      };

      let savedItem: Item;

      if (mode === "create") {
        savedItem = await createItem(itemData as any);
        toast.success("Item created successfully");
      } else {
        savedItem = await updateItem(item!.id, itemData as any);
        toast.success("Item updated successfully");
      }

      // Upload image if there's a new file
      if (imageFile && savedItem.id) {
        setIsUploading(true);
        try {
          await uploadImage(savedItem.id, imageFile);
          toast.success("Image uploaded successfully");
        } catch (error) {
          toast.error("Failed to upload image");
        }
        setIsUploading(false);
      }

      router.push("/items");
    } catch (error: any) {
      toast.error(error.message || `Failed to ${mode} item`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pb-32">
      {/* Image Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {imageUrl ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
              {imageUrl.startsWith("data:") ? (
                <img
                  src={imageUrl}
                  alt="Item preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  src={getFullImageUrl(imageUrl) || imageUrl}
                  alt="Item preview"
                  fill
                  sizes="(max-width: 768px) 100vw, 512px"
                  className="object-cover"
                />
              )}
              <button
                type="button"
                onClick={removeImage}
                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-4">
                Upload an image from your gallery or camera
              </p>
            </div>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => document.getElementById("image-upload")?.click()}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload Image
          </Button>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Item Name *</Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="Enter item name"
              className="mt-1"
            />
            {errors.name && (
              <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Enter item description (optional)"
              className="mt-1"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="category">Category *</Label>
            <button
              type="button"
              onClick={() => setShowCategorySelector(true)}
              className="mt-1 w-full h-10 px-3 py-2 text-left border border-gray-300 rounded-md hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center justify-between bg-white"
            >
              <span
                className={
                  watch("category") ? "text-gray-900" : "text-gray-500"
                }
              >
                {watch("category")
                  ? categories.find((c) => c.id === watch("category"))?.name ||
                    "Select category"
                  : "Select category"}
              </span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </button>
            {errors.category && (
              <p className="text-sm text-red-500 mt-1">
                {errors.category.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="price">Price (₹) *</Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              {...register("price", { valueAsNumber: true })}
              placeholder="0.00"
              className="mt-1"
            />
            {errors.price && (
              <p className="text-sm text-red-500 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tax Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Tax Configuration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="tax-enabled">Enable Tax</Label>
            <Switch
              id="tax-enabled"
              checked={taxEnabled}
              onCheckedChange={(checked) => setValue("tax.enabled", checked)}
            />
          </div>

          {taxEnabled && (
            <>
              <div>
                <Label htmlFor="tax-rate">Tax Rate (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  step="0.01"
                  {...register("tax.rate", { valueAsNumber: true })}
                  placeholder="5.00"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="tax-type">Tax Type</Label>
                <Select
                  value={watch("tax.type")}
                  onValueChange={(value: "CGST_SGST" | "IGST") =>
                    setValue("tax.type", value)
                  }
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CGST_SGST">CGST + SGST</SelectItem>
                    <SelectItem value="IGST">IGST</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Inventory Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Inventory Management</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="track-inventory">Track Inventory</Label>
            <Switch
              id="track-inventory"
              checked={trackInventory}
              onCheckedChange={(checked) => setValue("trackInventory", checked)}
            />
          </div>

          {trackInventory && (
            <>
              <div>
                <Label htmlFor="stock">Current Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  {...register("stock", { valueAsNumber: true })}
                  placeholder="0"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="low-stock">Low Stock Threshold</Label>
                <Input
                  id="low-stock"
                  type="number"
                  {...register("lowStockThreshold", { valueAsNumber: true })}
                  placeholder="10"
                  className="mt-1"
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Item Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Item Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="is-favourite">Mark as Favourite</Label>
            <Switch
              id="is-favourite"
              checked={watch("isFavourite")}
              onCheckedChange={(checked) => setValue("isFavourite", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is-available">Available for Sale</Label>
            <Switch
              id="is-available"
              checked={watch("isAvailable")}
              onCheckedChange={(checked) => setValue("isAvailable", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex gap-3 fixed bottom-20 left-0 right-0 bg-white pt-4 pb-4 border-t px-4 shadow-lg z-10">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
          disabled={isSubmitting || isUploading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={isSubmitting || isUploading}
        >
          {isSubmitting || isUploading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isUploading ? "Uploading..." : "Saving..."}
            </>
          ) : mode === "create" ? (
            "Create Item"
          ) : (
            "Update Item"
          )}
        </Button>
      </div>

      {/* Category Selector Modal */}
      <CategorySelector
        isOpen={showCategorySelector}
        onClose={() => setShowCategorySelector(false)}
        onSelect={(categoryId) => setValue("category", categoryId)}
        selectedCategory={watch("category")}
      />
    </form>
  );
}

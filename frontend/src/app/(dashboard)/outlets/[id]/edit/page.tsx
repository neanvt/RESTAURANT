"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Upload,
  X,
  Building2,
  MapPin,
  Phone,
  FileText,
  CreditCard,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOutletStore } from "@/store/outletStore";
import { toast } from "sonner";
// use a standard img tag for logo previews so we can preserve aspect ratio (object-contain)
import * as outletApi from "@/lib/api/outlets";

export default function EditOutletPage() {
  const router = useRouter();
  const params = useParams();
  const outletId = params.id as string;
  const { updateOutlet, uploadLogo, deleteLogo, deleteOutlet } =
    useOutletStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");
  const [currentLogo, setCurrentLogo] = useState<string>("");
  const [logoMode, setLogoMode] = useState<"fit" | "fill">("fit");
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [formData, setFormData] = useState({
    businessName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    email: "",
    gstin: "",
    isGstEnabled: false,
    upiId: "",
  });

  useEffect(() => {
    const loadOutlet = async () => {
      try {
        const outlet = await outletApi.getOutletById(outletId);
        setFormData({
          businessName: outlet.businessName,
          street: outlet.address.street,
          city: outlet.address.city,
          state: outlet.address.state,
          pincode: outlet.address.pincode,
          country: outlet.address.country,
          phone: outlet.contact.phone,
          email: outlet.contact.email || "",
          gstin: outlet.gstDetails.gstin || "",
          isGstEnabled: outlet.gstDetails.isGstEnabled,
          upiId: outlet.upiDetails.upiId || "",
        });
        if (outlet.logo) {
          setCurrentLogo(outlet.logo);
        }
      } catch (error: any) {
        toast.error("Failed to load outlet details");
        router.push("/outlets");
      } finally {
        setIsLoading(false);
      }
    };

    if (outletId) {
      loadOutlet();
    }
  }, [outletId, router]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const cropImageToSize = async (
    src: string,
    targetW: number,
    targetH: number
  ) => {
    return new Promise<{ preview: string; file: File }>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const sw = img.naturalWidth;
          const sh = img.naturalHeight;
          const srcAspect = sw / sh;
          const targetAspect = targetW / targetH;

          let sx = 0;
          let sy = 0;
          let sWidth = sw;
          let sHeight = sh;

          if (srcAspect > targetAspect) {
            sWidth = Math.round(sh * targetAspect);
            sx = Math.round((sw - sWidth) / 2);
          } else {
            sHeight = Math.round(sw / targetAspect);
            sy = Math.round((sh - sHeight) / 2);
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d");
          if (!ctx) throw new Error("Canvas not supported");

          ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, targetW, targetH);

          canvas.toBlob((blob) => {
            if (!blob) return reject(new Error("Failed to create blob"));
            const preview = URL.createObjectURL(blob);
            const file = new File([blob], "cropped-logo.png", {
              type: "image/png",
            });
            resolve({ preview, file });
          }, "image/png");
        } catch (e) {
          reject(e);
        }
      };
      img.onerror = (e) => reject(e);
      img.src = src;
    });
  };

  const handleDeleteLogo = async () => {
    if (!confirm("Are you sure you want to delete the logo?")) return;

    try {
      await deleteLogo(outletId);
      setCurrentLogo("");
      setLogoPreview("");
      setLogoFile(null);
      toast.success("Logo deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete logo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName.trim()) {
      toast.error("Business name is required");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required");
      return;
    }

    setIsSubmitting(true);

    try {
      const outletData = {
        businessName: formData.businessName,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        contact: {
          phone: formData.phone,
          email: formData.email || undefined,
        },
        gstDetails: {
          gstin: formData.gstin || undefined,
          isGstEnabled: formData.isGstEnabled,
        },
        upiDetails: {
          upiId: formData.upiId || undefined,
        },
      };

      await updateOutlet(outletId, outletData);

      // Upload new logo if provided
      if (logoFile) {
        await uploadLogo(outletId, logoFile);
      }

      toast.success("Outlet updated successfully!");
      router.push("/outlets");
    } catch (error: any) {
      toast.error(error.message || "Failed to update outlet");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "Are you sure you want to delete this outlet? This action cannot be undone."
      )
    ) {
      return;
    }

    if (
      !confirm(
        "This will permanently delete all data associated with this outlet. Continue?"
      )
    ) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteOutlet(outletId);
      toast.success("Outlet deleted successfully");
      router.push("/outlets");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete outlet");
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading outlet details...</p>
        </div>
      </div>
    );
  }

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
              <h1 className="text-xl font-bold text-gray-900">Edit Outlet</h1>
              <p className="text-sm text-gray-600">Update outlet details</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Business Logo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {logoPreview || currentLogo ? (
                <div
                  className="relative w-full max-w-[512px] rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-white"
                  style={{ aspectRatio: "2 / 1" }}
                >
                  <img
                    ref={imgRef}
                    src={
                      logoPreview ||
                      `${process.env.NEXT_PUBLIC_API_URL}${currentLogo}`
                    }
                    alt="Logo preview"
                    className={
                      logoMode === "fit"
                        ? "max-w-full max-h-full object-contain"
                        : "w-full h-full object-cover"
                    }
                  />
                  <div className="absolute left-2 top-2 flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={logoMode === "fit" ? undefined : "outline"}
                      onClick={() => setLogoMode("fit")}
                    >
                      Fit
                    </Button>
                    <Button
                      size="sm"
                      variant={logoMode === "fill" ? undefined : "outline"}
                      onClick={() => setLogoMode("fill")}
                    >
                      Fill
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        try {
                          const src =
                            logoPreview ||
                            `${process.env.NEXT_PUBLIC_API_URL}${currentLogo}`;
                          const cropped = await cropImageToSize(src, 512, 256);
                          setLogoPreview(cropped.preview);
                          setLogoFile(cropped.file);
                          setLogoMode("fit");
                          toast.success("Logo cropped to recommended size");
                        } catch (e) {
                          toast.error("Failed to crop image");
                        }
                      }}
                    >
                      Crop
                    </Button>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (logoPreview) {
                        setLogoFile(null);
                        setLogoPreview("");
                      } else {
                        handleDeleteLogo();
                      }
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <div
                  className="w-full max-w-[512px] rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50"
                  style={{ aspectRatio: "2 / 1" }}
                >
                  <Upload className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
                <Button type="button" variant="outline" size="sm" asChild>
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    {logoPreview || currentLogo ? "Change Logo" : "Upload Logo"}
                  </span>
                </Button>
              </label>
              <p className="text-xs text-gray-500 text-center">
                Max size: 5MB. Recommended: 512x256px
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Business Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="businessName">
                Business Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="businessName"
                value={formData.businessName}
                onChange={(e) =>
                  setFormData({ ...formData, businessName: e.target.value })
                }
                placeholder="e.g., Tasty Bites Restaurant"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              Address
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="street">Street Address</Label>
              <Input
                id="street"
                value={formData.street}
                onChange={(e) =>
                  setFormData({ ...formData, street: e.target.value })
                }
                placeholder="Street address, building number"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  placeholder="State"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  placeholder="000000"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) =>
                    setFormData({ ...formData, country: e.target.value })
                  }
                  placeholder="India"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-600" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">
                Phone Number <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                placeholder="+91 9876543210"
                required
              />
            </div>
            <div>
              <Label htmlFor="email">Email (Optional)</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                placeholder="restaurant@example.com"
              />
            </div>
          </CardContent>
        </Card>

        {/* GST Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              GST Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isGstEnabled"
                checked={formData.isGstEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, isGstEnabled: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <Label htmlFor="isGstEnabled" className="cursor-pointer">
                GST Registered Business
              </Label>
            </div>
            {formData.isGstEnabled && (
              <div>
                <Label htmlFor="gstin">GSTIN</Label>
                <Input
                  id="gstin"
                  value={formData.gstin}
                  onChange={(e) =>
                    setFormData({ ...formData, gstin: e.target.value })
                  }
                  placeholder="22AAAAA0000A1Z5"
                  className="uppercase"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* UPI Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              Payment Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="upiId">UPI ID (Optional)</Label>
              <Input
                id="upiId"
                value={formData.upiId}
                onChange={(e) =>
                  setFormData({ ...formData, upiId: e.target.value })
                }
                placeholder="yourname@upi"
              />
              <p className="text-xs text-gray-500 mt-1">
                For displaying QR code on invoices
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-red-600">
              <Trash2 className="h-5 w-5" />
              Danger Zone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-3">
              Once you delete an outlet, there is no going back. Please be
              certain.
            </p>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="w-full"
            >
              {isDeleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Outlet
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Submit Buttons */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4 space-y-2">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Updating...
              </>
            ) : (
              "Save Changes"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}

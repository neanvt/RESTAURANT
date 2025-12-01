"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, X, Building2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOutletStore } from "@/store/outletStore";
import { toast } from "sonner";
import { getFullImageUrl } from "@/lib/imageUtils";
// use an img tag for logo previews so we can preserve aspect ratio (object-contain)

export default function BusinessSettingsPage() {
  const router = useRouter();
  const {
    currentOutlet,
    updateOutlet,
    uploadLogo,
    deleteLogo,
    fetchCurrentOutlet,
  } = useOutletStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    businessName: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    phone: "",
    email: "",
    whatsapp: "",
    gstin: "",
    isGstEnabled: false,
    upiId: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchCurrentOutlet();
      } catch (error) {
        toast.error("Failed to load business details");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [fetchCurrentOutlet]);

  // Update form when currentOutlet changes
  useEffect(() => {
    if (currentOutlet) {
      setFormData({
        businessName: currentOutlet.businessName,
        street: currentOutlet.address.street,
        city: currentOutlet.address.city,
        state: currentOutlet.address.state,
        pincode: currentOutlet.address.pincode,
        country: currentOutlet.address.country,
        phone: currentOutlet.contact.phone,
        email: currentOutlet.contact.email || "",
        whatsapp: currentOutlet.contact.whatsapp || "",
        gstin: currentOutlet.gstDetails.gstin || "",
        isGstEnabled: currentOutlet.gstDetails.isGstEnabled,
        upiId: currentOutlet.upiDetails.upiId || "",
      });
    }
  }, [currentOutlet]);

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
    if (!currentOutlet?._id) return;
    if (!confirm("Are you sure you want to delete the logo?")) return;

    try {
      await deleteLogo(currentOutlet._id);
      setLogoPreview("");
      setLogoFile(null);
      toast.success("Logo deleted successfully");
    } catch (error: any) {
      toast.error("Failed to delete logo");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOutlet?._id) {
      toast.error("No outlet selected");
      return;
    }

    if (!formData.businessName.trim()) {
      toast.error("Business name is required");
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
          whatsapp: formData.whatsapp || undefined,
        },
        gstDetails: {
          gstin: formData.gstin || undefined,
          isGstEnabled: formData.isGstEnabled,
        },
        upiDetails: {
          upiId: formData.upiId || undefined,
        },
      };

      await updateOutlet(currentOutlet._id, outletData);

      // Upload new logo if provided
      if (logoFile) {
        await uploadLogo(currentOutlet._id, logoFile);
      }

      toast.success("Business details updated successfully!");
      router.push("/settings");
    } catch (error: any) {
      toast.error(error.message || "Failed to update business details");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading business details...</p>
        </div>
      </div>
    );
  }

  if (!currentOutlet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Building2 className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Outlet Selected
          </h3>
          <p className="text-gray-600 mb-4">
            Please select or create an outlet first
          </p>
          <Button onClick={() => router.push("/outlets")}>Go to Outlets</Button>
        </div>
      </div>
    );
  }

  const displayLogo =
    logoPreview ||
    (currentOutlet.logo ? getFullImageUrl(currentOutlet.logo) : null);

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
                Business Information
              </h1>
              <p className="text-sm text-gray-600">
                Update your business details
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        {/* Logo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Logo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center gap-4">
              {displayLogo ? (
                <div
                  className="relative w-full max-w-[512px] rounded-lg overflow-hidden border-2 border-gray-200 flex items-center justify-center bg-white"
                  style={{ aspectRatio: "2 / 1" }}
                >
                  <img
                    src={displayLogo}
                    alt="Logo preview"
                    className="max-w-full max-h-full object-contain p-2"
                  />
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
                    {displayLogo ? "Change Logo" : "Upload Logo"}
                  </span>
                </Button>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Business Name */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Business Name</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.businessName}
              onChange={(e) =>
                setFormData({ ...formData, businessName: e.target.value })
              }
              placeholder="Restaurant name"
              required
            />
          </CardContent>
        </Card>

        {/* Address */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Address</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input
              value={formData.street}
              onChange={(e) =>
                setFormData({ ...formData, street: e.target.value })
              }
              placeholder="Street address"
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData({ ...formData, city: e.target.value })
                }
                placeholder="City"
              />
              <Input
                value={formData.state}
                onChange={(e) =>
                  setFormData({ ...formData, state: e.target.value })
                }
                placeholder="State"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                value={formData.pincode}
                onChange={(e) =>
                  setFormData({ ...formData, pincode: e.target.value })
                }
                placeholder="Pincode"
              />
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData({ ...formData, country: e.target.value })
                }
                placeholder="Country"
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="phone">Phone Number</Label>
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
              <Label htmlFor="whatsapp">WhatsApp Number (Optional)</Label>
              <Input
                id="whatsapp"
                type="tel"
                value={formData.whatsapp}
                onChange={(e) =>
                  setFormData({ ...formData, whatsapp: e.target.value })
                }
                placeholder="+91 9876543210"
              />
              <p className="text-xs text-gray-500 mt-1">
                Used for WhatsApp QR code on menu
              </p>
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

        {/* GST */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">GST Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isGstEnabled"
                checked={formData.isGstEnabled}
                onChange={(e) =>
                  setFormData({ ...formData, isGstEnabled: e.target.checked })
                }
                className="w-4 h-4 text-blue-600 rounded"
              />
              <Label htmlFor="isGstEnabled" className="cursor-pointer">
                GST Registered
              </Label>
            </div>
            {formData.isGstEnabled && (
              <Input
                value={formData.gstin}
                onChange={(e) =>
                  setFormData({ ...formData, gstin: e.target.value })
                }
                placeholder="GSTIN"
                className="uppercase"
              />
            )}
          </CardContent>
        </Card>

        {/* UPI */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">UPI Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              value={formData.upiId}
              onChange={(e) =>
                setFormData({ ...formData, upiId: e.target.value })
              }
              placeholder="yourname@upi"
            />
            <p className="text-xs text-gray-500 mt-1">
              For QR code on invoices
            </p>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="sticky bottom-0 bg-white border-t p-4 -mx-4">
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

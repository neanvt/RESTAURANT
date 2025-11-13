"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Globe,
  Mail,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOutletStore } from "@/store/outletStore";
import { toast } from "sonner";

export default function SocialMediaPage() {
  const router = useRouter();
  const { currentOutlet, updateOutlet } = useOutletStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    website: "",
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
    email: "",
  });

  useEffect(() => {
    // Load social media links from outlet settings if available
    // This would come from the backend in a real implementation
  }, [currentOutlet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentOutlet) {
      toast.error("No outlet selected");
      return;
    }

    setIsSubmitting(true);

    try {
      // In a real implementation, this would save to backend
      await new Promise((resolve) => setTimeout(resolve, 500));

      toast.success("Social media links updated successfully!");
      router.push("/settings");
    } catch (error: any) {
      toast.error(error.message || "Failed to update social media links");
    } finally {
      setIsSubmitting(false);
    }
  };

  const socialPlatforms = [
    {
      icon: Globe,
      label: "Website",
      field: "website" as keyof typeof formData,
      placeholder: "https://yourrestaurant.com",
      color: "bg-gray-100 text-gray-600",
    },
    {
      icon: Facebook,
      label: "Facebook",
      field: "facebook" as keyof typeof formData,
      placeholder: "https://facebook.com/yourpage",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Instagram,
      label: "Instagram",
      field: "instagram" as keyof typeof formData,
      placeholder: "https://instagram.com/yourpage",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Twitter,
      label: "Twitter",
      field: "twitter" as keyof typeof formData,
      placeholder: "https://twitter.com/yourpage",
      color: "bg-sky-100 text-sky-600",
    },
    {
      icon: Youtube,
      label: "YouTube",
      field: "youtube" as keyof typeof formData,
      placeholder: "https://youtube.com/@yourchannel",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Mail,
      label: "Email",
      field: "email" as keyof typeof formData,
      placeholder: "contact@yourrestaurant.com",
      color: "bg-gray-100 text-gray-600",
    },
  ];

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
              <h1 className="text-xl font-bold text-gray-900">Social Media</h1>
              <p className="text-sm text-gray-600">
                Connect your social media accounts
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social Links</CardTitle>
            <p className="text-sm text-gray-600">
              Add links to your social media profiles. These will be displayed
              on your invoices and marketing materials.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {socialPlatforms.map((platform) => {
              const Icon = platform.icon;
              return (
                <div key={platform.field}>
                  <Label
                    htmlFor={platform.field}
                    className="flex items-center gap-2 mb-2"
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${platform.color}`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    {platform.label}
                  </Label>
                  <Input
                    id={platform.field}
                    type={platform.field === "email" ? "email" : "url"}
                    value={formData[platform.field]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        [platform.field]: e.target.value,
                      })
                    }
                    placeholder={platform.placeholder}
                  />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Pro Tip</h3>
            <p className="text-sm text-blue-800">
              Social media links help customers connect with your restaurant
              online. They appear on digital invoices and can boost your online
              presence.
            </p>
          </CardContent>
        </Card>

        {/* Submit Button */}
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
                Save Social Links
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

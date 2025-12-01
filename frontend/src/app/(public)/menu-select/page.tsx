"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Star, Menu, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

function MenuSelectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [outletId, setOutletId] = useState<string | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [rating, setRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    feedback: "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Get outlet ID from URL params or localStorage
    const urlOutletId = searchParams.get("outletId");
    const storedOutletId = localStorage.getItem("publicOutletId");

    // Development mode: Use Swadika outlet ID as fallback for testing
    const devOutletId =
      process.env.NODE_ENV === "development"
        ? "6911dfeda7eaf9ad178c1a03"
        : null;

    if (urlOutletId) {
      setOutletId(urlOutletId);
      localStorage.setItem("publicOutletId", urlOutletId);

      // Clean URL - remove outlet ID from address bar for cleaner UX
      window.history.replaceState({}, "", "/menu-select");
    } else if (storedOutletId) {
      setOutletId(storedOutletId);
    } else if (devOutletId) {
      setOutletId(devOutletId);
      console.log("Using development outlet ID:", devOutletId);
    }
  }, [searchParams]);

  const handleMenuSelection = (menuType: "current" | "full") => {
    router.push(`/menu-${menuType}`);
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.phone) {
      toast.error("Please fill in your name and phone number");
      return;
    }

    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    if (!outletId) {
      toast.error("Unable to submit feedback. Please scan the QR code again.");
      return;
    }

    try {
      setSubmitting(true);

      const API_URL =
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";

      const payload = {
        name: formData.name,
        phone: formData.phone,
        feedback: formData.feedback || "",
        rating,
        outletId,
      };

      console.log("Submitting feedback:", payload);

      const response = await fetch(`${API_URL}/api/feedback/public`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Feedback error:", data);
        throw new Error(data.error?.message || "Failed to submit feedback");
      }

      toast.success("Thank you for your feedback!");
      setFormData({ name: "", phone: "", feedback: "" });
      setRating(0);
      setShowFeedbackForm(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-8 text-white text-center">
          <h1 className="text-4xl font-bold mb-2">Welcome!</h1>
          <p className="text-orange-100 text-lg">Choose your menu preference</p>
        </div>

        <div className="p-8">
          {!showFeedbackForm ? (
            <>
              {/* Menu Selection Buttons */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => handleMenuSelection("current")}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Calendar className="h-8 w-8" />
                    <div className="text-left">
                      <h2 className="text-2xl font-bold">Current Menu</h2>
                      <p className="text-green-100 text-sm">
                        See what's available today
                      </p>
                    </div>
                  </div>
                  <div className="text-3xl group-hover:translate-x-2 transition-transform">
                    →
                  </div>
                </button>

                <button
                  onClick={() => handleMenuSelection("full")}
                  className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all transform hover:scale-105 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-4">
                    <Menu className="h-8 w-8" />
                    <div className="text-left">
                      <h2 className="text-2xl font-bold">Full Menu</h2>
                      <p className="text-blue-100 text-sm">
                        Browse all our items
                      </p>
                    </div>
                  </div>
                  <div className="text-3xl group-hover:translate-x-2 transition-transform">
                    →
                  </div>
                </button>
              </div>

              {/* Feedback Button */}
              <div className="text-center pt-6 border-t">
                <button
                  onClick={() => setShowFeedbackForm(true)}
                  className="text-orange-600 hover:text-orange-700 font-semibold text-lg underline decoration-2 underline-offset-4 transition-colors"
                >
                  Share Your Feedback
                </button>
                {!outletId && (
                  <p className="text-xs text-gray-500 mt-2">
                    Note: Please scan QR code from menu to enable feedback
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Feedback Form */}
              <form onSubmit={handleSubmitFeedback} className="space-y-6">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    We'd Love Your Feedback
                  </h2>
                  <p className="text-gray-600">Help us serve you better</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Name *
                  </label>
                  <Input
                    type="text"
                    placeholder="Enter your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Rating *
                  </label>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`h-10 w-10 ${
                            star <= rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  {rating > 0 && (
                    <p className="text-center text-sm text-gray-600 mt-2">
                      You rated: {rating} star{rating > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Your Feedback
                  </label>
                  <Textarea
                    placeholder="Tell us about your experience..."
                    value={formData.feedback}
                    onChange={(e) =>
                      setFormData({ ...formData, feedback: e.target.value })
                    }
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowFeedbackForm(false)}
                    className="flex-1"
                    disabled={submitting}
                  >
                    Back to Menu
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 bg-orange-500 hover:bg-orange-600"
                    disabled={submitting}
                  >
                    {submitting ? "Submitting..." : "Submit Feedback"}
                  </Button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MenuSelectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <MenuSelectContent />
    </Suspense>
  );
}

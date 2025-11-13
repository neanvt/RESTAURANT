"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Edit, Trash2, Plus, Award } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Tier {
  id: string;
  name: string;
  color: string;
  minPoints: number;
  maxPoints: number | null;
  benefits: string[];
  memberCount: number;
  discount: number;
}

export default function TierManagementPage() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [editingTier, setEditingTier] = useState<Tier | null>(null);

  const [tiers, setTiers] = useState<Tier[]>([
    {
      id: "1",
      name: "Bronze",
      color: "#CD7F32",
      minPoints: 0,
      maxPoints: 500,
      benefits: ["1% cashback", "Birthday bonus"],
      memberCount: 687,
      discount: 1,
    },
    {
      id: "2",
      name: "Silver",
      color: "#C0C0C0",
      minPoints: 501,
      maxPoints: 1500,
      benefits: ["3% cashback", "Birthday bonus", "Priority support"],
      memberCount: 398,
      discount: 3,
    },
    {
      id: "3",
      name: "Gold",
      color: "#FFD700",
      minPoints: 1501,
      maxPoints: 3000,
      benefits: [
        "5% cashback",
        "Birthday bonus",
        "Priority support",
        "Free delivery",
      ],
      memberCount: 124,
      discount: 5,
    },
    {
      id: "4",
      name: "Platinum",
      color: "#E5E4E2",
      minPoints: 3001,
      maxPoints: null,
      benefits: [
        "10% cashback",
        "Birthday bonus",
        "Priority support",
        "Free delivery",
        "Exclusive offers",
      ],
      memberCount: 38,
      discount: 10,
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    color: "#000000",
    minPoints: 0,
    maxPoints: "",
    discount: 0,
    benefits: [""],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTier) {
      // Update existing tier
      setTiers(
        tiers.map((t) =>
          t.id === editingTier.id
            ? {
                ...t,
                name: formData.name,
                color: formData.color,
                minPoints: formData.minPoints,
                maxPoints: formData.maxPoints
                  ? parseInt(formData.maxPoints)
                  : null,
                discount: formData.discount,
                benefits: formData.benefits.filter((b) => b.trim() !== ""),
              }
            : t
        )
      );
    } else {
      // Create new tier
      const newTier: Tier = {
        id: Date.now().toString(),
        name: formData.name,
        color: formData.color,
        minPoints: formData.minPoints,
        maxPoints: formData.maxPoints ? parseInt(formData.maxPoints) : null,
        benefits: formData.benefits.filter((b) => b.trim() !== ""),
        memberCount: 0,
        discount: formData.discount,
      };
      setTiers([...tiers, newTier]);
    }

    // Reset form
    setFormData({
      name: "",
      color: "#000000",
      minPoints: 0,
      maxPoints: "",
      discount: 0,
      benefits: [""],
    });
    setEditingTier(null);
    setShowDialog(false);
  };

  const handleEdit = (tier: Tier) => {
    setEditingTier(tier);
    setFormData({
      name: tier.name,
      color: tier.color,
      minPoints: tier.minPoints,
      maxPoints: tier.maxPoints?.toString() || "",
      discount: tier.discount,
      benefits: tier.benefits.length > 0 ? tier.benefits : [""],
    });
    setShowDialog(true);
  };

  const handleDelete = (tierId: string) => {
    if (confirm("Are you sure you want to delete this tier?")) {
      setTiers(tiers.filter((t) => t.id !== tierId));
    }
  };

  const addBenefitField = () => {
    setFormData({
      ...formData,
      benefits: [...formData.benefits, ""],
    });
  };

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...formData.benefits];
    newBenefits[index] = value;
    setFormData({ ...formData, benefits: newBenefits });
  };

  const removeBenefit = (index: number) => {
    setFormData({
      ...formData,
      benefits: formData.benefits.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Loyalty Tiers
                </h1>
                <p className="text-sm text-gray-600">
                  Manage membership levels
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingTier(null);
                setFormData({
                  name: "",
                  color: "#000000",
                  minPoints: 0,
                  maxPoints: "",
                  discount: 0,
                  benefits: [""],
                });
                setShowDialog(true);
              }}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Tier
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Tiers List */}
        {tiers.map((tier) => (
          <Card key={tier.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: tier.color + "20" }}
                  >
                    <Award className="h-6 w-6" style={{ color: tier.color }} />
                  </div>
                  <div>
                    <CardTitle className="text-base flex items-center gap-2">
                      {tier.name}
                      <Badge variant="secondary" className="text-xs">
                        {tier.memberCount} members
                      </Badge>
                    </CardTitle>
                    <p className="text-sm text-gray-600 mt-1">
                      {tier.minPoints} - {tier.maxPoints || "∞"} points
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(tier)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                  <button
                    onClick={() => handleDelete(tier.id)}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Discount:</span>
                  <span className="font-semibold">{tier.discount}%</span>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-2">Benefits:</div>
                  <div className="space-y-1">
                    {tier.benefits.map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 text-sm"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                        <span>{benefit}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold">
                {editingTier ? "Edit Tier" : "Add New Tier"}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tier Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color
                </label>
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData({ ...formData, color: e.target.value })
                  }
                  className="w-full h-12 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Min Points
                  </label>
                  <input
                    type="number"
                    value={formData.minPoints}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        minPoints: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Max Points
                  </label>
                  <input
                    type="number"
                    value={formData.maxPoints}
                    onChange={(e) =>
                      setFormData({ ...formData, maxPoints: e.target.value })
                    }
                    placeholder="Unlimited"
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount (%)
                </label>
                <input
                  type="number"
                  value={formData.discount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Benefits
                  </label>
                  <button
                    type="button"
                    onClick={addBenefitField}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    + Add Benefit
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.benefits.map((benefit, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={benefit}
                        onChange={(e) => updateBenefit(index, e.target.value)}
                        placeholder="Enter benefit"
                        className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {formData.benefits.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBenefit(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1">
                  {editingTier ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

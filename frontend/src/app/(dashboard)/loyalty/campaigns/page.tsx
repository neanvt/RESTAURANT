"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Plus,
  Send,
  Users,
  Calendar,
  TrendingUp,
  Edit,
  Trash2,
  Play,
  Pause,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "push";
  status: "active" | "paused" | "completed" | "draft";
  targetTier: string[];
  targetCustomers: number;
  sent: number;
  opened: number;
  clicked: number;
  startDate: string;
  endDate: string;
  message: string;
}

export default function MarketingCampaignsPage() {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "draft">("all");

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: "1",
      name: "Diwali Special Offer",
      type: "sms",
      status: "active",
      targetTier: ["Gold", "Platinum"],
      targetCustomers: 162,
      sent: 162,
      opened: 145,
      clicked: 87,
      startDate: "2024-11-01",
      endDate: "2024-11-15",
      message:
        "🎉 Diwali Special! Get 20% off on your next order. Use code DIWALI20",
    },
    {
      id: "2",
      name: "Birthday Rewards",
      type: "email",
      status: "active",
      targetTier: ["All"],
      targetCustomers: 1247,
      sent: 89,
      opened: 67,
      clicked: 42,
      startDate: "2024-11-01",
      endDate: "2024-11-30",
      message:
        "Happy Birthday! 🎂 Enjoy a special gift from us on your special day!",
    },
    {
      id: "3",
      name: "Weekend Rush Hour",
      type: "push",
      status: "draft",
      targetTier: ["Bronze", "Silver"],
      targetCustomers: 1085,
      sent: 0,
      opened: 0,
      clicked: 0,
      startDate: "2024-11-10",
      endDate: "2024-11-11",
      message: "Weekend Special! Extra points on orders above ₹500. Order now!",
    },
  ]);

  const [formData, setFormData] = useState({
    name: "",
    type: "sms" as "email" | "sms" | "push",
    targetTier: [] as string[],
    startDate: "",
    endDate: "",
    message: "",
  });

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return campaign.status === "active";
    if (activeTab === "draft") return campaign.status === "draft";
    return true;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "email":
        return "📧";
      case "sms":
        return "💬";
      case "push":
        return "🔔";
      default:
        return "📱";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "paused":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      name: formData.name,
      type: formData.type,
      status: "draft",
      targetTier: formData.targetTier,
      targetCustomers: 0,
      sent: 0,
      opened: 0,
      clicked: 0,
      startDate: formData.startDate,
      endDate: formData.endDate,
      message: formData.message,
    };

    setCampaigns([...campaigns, newCampaign]);
    setFormData({
      name: "",
      type: "sms",
      targetTier: [],
      startDate: "",
      endDate: "",
      message: "",
    });
    setShowDialog(false);
  };

  const toggleCampaignStatus = (campaignId: string) => {
    setCampaigns(
      campaigns.map((c) => {
        if (c.id === campaignId) {
          return {
            ...c,
            status: c.status === "active" ? "paused" : ("active" as any),
          };
        }
        return c;
      })
    );
  };

  const deleteCampaign = (campaignId: string) => {
    if (confirm("Are you sure you want to delete this campaign?")) {
      setCampaigns(campaigns.filter((c) => c.id !== campaignId));
    }
  };

  const tiers = ["Bronze", "Silver", "Gold", "Platinum", "All"];

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
                  Marketing Campaigns
                </h1>
                <p className="text-sm text-gray-600">Engage your customers</p>
              </div>
            </div>
            <Button size="sm" onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t">
          {[
            { key: "all", label: "All" },
            { key: "active", label: "Active" },
            { key: "draft", label: "Draft" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === tab.key
                  ? "text-blue-600 border-b-2 border-blue-600"
                  : "text-gray-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4 space-y-4">
        {filteredCampaigns.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Send className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No campaigns found</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                Create Your First Campaign
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredCampaigns.map((campaign) => (
            <Card key={campaign.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {getTypeIcon(campaign.type)}
                      </span>
                      <CardTitle className="text-base">
                        {campaign.name}
                      </CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(campaign.status)}>
                        {campaign.status}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {campaign.type.toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {campaign.status === "draft" ? (
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className="p-2 hover:bg-green-50 rounded-full transition-colors"
                      >
                        <Play className="h-4 w-4 text-green-600" />
                      </button>
                    ) : campaign.status === "active" ? (
                      <button
                        onClick={() => toggleCampaignStatus(campaign.id)}
                        className="p-2 hover:bg-yellow-50 rounded-full transition-colors"
                      >
                        <Pause className="h-4 w-4 text-yellow-600" />
                      </button>
                    ) : null}
                    <button
                      onClick={() => deleteCampaign(campaign.id)}
                      className="p-2 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Target Info */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" />
                    <span>
                      {campaign.targetTier.join(", ")} •{" "}
                      {campaign.targetCustomers} customers
                    </span>
                  </div>

                  {/* Date Range */}
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(campaign.startDate).toLocaleDateString()} -{" "}
                      {new Date(campaign.endDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* Message Preview */}
                  <div className="p-3 bg-gray-50 rounded-lg text-sm">
                    {campaign.message}
                  </div>

                  {/* Performance Stats */}
                  {campaign.status !== "draft" && (
                    <div className="grid grid-cols-3 gap-3 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-gray-900">
                          {campaign.sent}
                        </div>
                        <div className="text-xs text-gray-600">Sent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {campaign.opened}
                        </div>
                        <div className="text-xs text-gray-600">Opened</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {campaign.clicked}
                        </div>
                        <div className="text-xs text-gray-600">Clicked</div>
                      </div>
                    </div>
                  )}

                  {/* Engagement Rate */}
                  {campaign.sent > 0 && (
                    <div className="flex items-center gap-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-gray-600">
                        Engagement:{" "}
                        {((campaign.clicked / campaign.sent) * 100).toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Campaign Dialog */}
      {showDialog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
          <div className="bg-white w-full rounded-t-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b sticky top-0 bg-white">
              <h2 className="text-lg font-bold">New Campaign</h2>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                  placeholder="e.g., Weekend Special Offer"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Campaign Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="push">Push Notification</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Tiers
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {tiers.map((tier) => (
                    <label
                      key={tier}
                      className="flex items-center gap-2 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <input
                        type="checkbox"
                        checked={formData.targetTier.includes(tier)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({
                              ...formData,
                              targetTier: [...formData.targetTier, tier],
                            });
                          } else {
                            setFormData({
                              ...formData,
                              targetTier: formData.targetTier.filter(
                                (t) => t !== tier
                              ),
                            });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">{tier}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                  placeholder="Enter your campaign message..."
                />
                <p className="text-xs text-gray-600 mt-1">
                  {formData.message.length} characters
                </p>
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
                  Create Campaign
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

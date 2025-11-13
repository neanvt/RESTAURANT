"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Users,
  Gift,
  TrendingUp,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function LoyaltyDashboardPage() {
  const router = useRouter();

  const stats = {
    totalMembers: 1247,
    activeMembers: 892,
    rewardsIssued: 356,
    rewardsRedeemed: 234,
  };

  const tierDistribution = [
    { tier: "Bronze", count: 687, percentage: 55, color: "bg-orange-500" },
    { tier: "Silver", count: 398, percentage: 32, color: "bg-gray-400" },
    { tier: "Gold", count: 124, percentage: 10, color: "bg-yellow-500" },
    { tier: "Platinum", count: 38, percentage: 3, color: "bg-purple-500" },
  ];

  const recentActivity = [
    {
      customer: "Rahul Sharma",
      action: "Earned 50 points",
      time: "2 hours ago",
      tier: "Gold",
    },
    {
      customer: "Priya Patel",
      action: "Redeemed reward",
      time: "5 hours ago",
      tier: "Silver",
    },
    {
      customer: "Amit Kumar",
      action: "Upgraded to Silver",
      time: "1 day ago",
      tier: "Silver",
    },
  ];

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
                  Loyalty Program
                </h1>
                <p className="text-sm text-gray-600">Manage customer rewards</p>
              </div>
            </div>
            <button
              onClick={() => router.push("/loyalty/tiers")}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.totalMembers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Total Members</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.activeMembers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-600">Active Members</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Gift className="h-5 w-5 text-purple-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.rewardsIssued}
              </div>
              <div className="text-xs text-gray-600">Rewards Issued</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Award className="h-5 w-5 text-yellow-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {stats.rewardsRedeemed}
              </div>
              <div className="text-xs text-gray-600">Redeemed</div>
            </CardContent>
          </Card>
        </div>

        {/* Tier Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tier Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tierDistribution.map((tier) => (
                <div key={tier.tier} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-3 h-3 rounded-full ${tier.color}`}
                      ></div>
                      <span className="font-medium">{tier.tier}</span>
                    </div>
                    <span className="text-gray-600">
                      {tier.count} ({tier.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${tier.color}`}
                      style={{ width: `${tier.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {activity.customer
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900">
                      {activity.customer}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activity.action}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {activity.time}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {activity.tier}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/loyalty/tiers")}
          >
            <Award className="h-4 w-4 mr-2" />
            Manage Tiers
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => router.push("/loyalty/campaigns")}
          >
            <Gift className="h-4 w-4 mr-2" />
            Campaigns
          </Button>
        </div>
      </div>
    </div>
  );
}

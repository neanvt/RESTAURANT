"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Crown, Zap, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Plan {
  id: string;
  name: string;
  price: number;
  billingCycle: "monthly" | "yearly";
  icon: "basic" | "professional" | "enterprise";
  popular?: boolean;
  features: {
    orders: number;
    outlets: number;
    staff: number;
    items: number;
    storage: number;
    analytics: boolean;
    aiFeatures: boolean;
    loyalty: boolean;
    support: string;
    customBranding: boolean;
    api: boolean;
  };
}

export default function SubscriptionUpgradePage() {
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const currentPlan = "Professional";

  const plans: Plan[] = [
    {
      id: "basic",
      name: "Basic",
      price: billingCycle === "monthly" ? 999 : 9990,
      billingCycle,
      icon: "basic",
      features: {
        orders: 1000,
        outlets: 1,
        staff: 5,
        items: 200,
        storage: 2,
        analytics: false,
        aiFeatures: false,
        loyalty: false,
        support: "Email",
        customBranding: false,
        api: false,
      },
    },
    {
      id: "professional",
      name: "Professional",
      price: billingCycle === "monthly" ? 2999 : 29990,
      billingCycle,
      icon: "professional",
      popular: true,
      features: {
        orders: 5000,
        outlets: 5,
        staff: 25,
        items: 1000,
        storage: 10,
        analytics: true,
        aiFeatures: true,
        loyalty: true,
        support: "Priority Email",
        customBranding: true,
        api: false,
      },
    },
    {
      id: "enterprise",
      name: "Enterprise",
      price: billingCycle === "monthly" ? 7999 : 79990,
      billingCycle,
      icon: "enterprise",
      features: {
        orders: 99999,
        outlets: 99,
        staff: 999,
        items: 9999,
        storage: 100,
        analytics: true,
        aiFeatures: true,
        loyalty: true,
        support: "24/7 Phone + Email",
        customBranding: true,
        api: true,
      },
    },
  ];

  const getIcon = (icon: string) => {
    switch (icon) {
      case "basic":
        return <Zap className="h-6 w-6" />;
      case "professional":
        return <Crown className="h-6 w-6" />;
      case "enterprise":
        return <Star className="h-6 w-6" />;
      default:
        return <Zap className="h-6 w-6" />;
    }
  };

  const handleUpgrade = (planId: string, planName: string) => {
    if (planName === currentPlan) {
      return;
    }
    if (confirm(`Upgrade to ${planName} plan?`)) {
      // In a real app, this would trigger payment flow
      alert("Payment integration would be triggered here");
    }
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
              <h1 className="text-xl font-bold text-gray-900">Upgrade Plan</h1>
              <p className="text-sm text-gray-600">
                Choose the perfect plan for your business
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-3 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "monthly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle("yearly")}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "yearly"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-600"
            }`}
          >
            Yearly
            <span className="ml-1 text-xs text-green-600">Save 17%</span>
          </button>
        </div>

        {/* Plans */}
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`${
              plan.popular
                ? "border-blue-500 border-2 shadow-lg"
                : "border-gray-200"
            } ${plan.name === currentPlan ? "bg-blue-50" : ""}`}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      plan.popular
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {getIcon(plan.icon)}
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {plan.name}
                      {plan.name === currentPlan && (
                        <Badge className="bg-blue-600">Current</Badge>
                      )}
                      {plan.popular && plan.name !== currentPlan && (
                        <Badge className="bg-green-600">Popular</Badge>
                      )}
                    </CardTitle>
                  </div>
                </div>
              </div>
              <div className="mt-3">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold">
                    ₹{plan.price.toLocaleString()}
                  </span>
                  <span className="text-sm text-gray-600">
                    /{plan.billingCycle === "monthly" ? "month" : "year"}
                  </span>
                </div>
                {plan.billingCycle === "yearly" && (
                  <p className="text-sm text-green-600 mt-1">
                    ₹{Math.round(plan.price / 12).toLocaleString()}/month billed
                    annually
                  </p>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    {plan.features.orders.toLocaleString()} orders/month
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>
                    {plan.features.outlets} outlet
                    {plan.features.outlets > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.features.staff} staff members</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.features.items.toLocaleString()} items</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.features.storage}GB storage</span>
                </div>
                {plan.features.analytics && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Advanced analytics</span>
                  </div>
                )}
                {plan.features.aiFeatures && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>AI-powered features</span>
                  </div>
                )}
                {plan.features.loyalty && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Loyalty program</span>
                  </div>
                )}
                {plan.features.customBranding && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>Custom branding</span>
                  </div>
                )}
                {plan.features.api && (
                  <div className="flex items-center gap-2 text-sm">
                    <Check className="h-4 w-4 text-green-600" />
                    <span>API access</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>{plan.features.support} support</span>
                </div>
              </div>

              <Button
                className="w-full"
                variant={plan.name === currentPlan ? "outline" : "default"}
                disabled={plan.name === currentPlan}
                onClick={() => handleUpgrade(plan.id, plan.name)}
              >
                {plan.name === currentPlan
                  ? "Current Plan"
                  : `Upgrade to ${plan.name}`}
              </Button>
            </CardContent>
          </Card>
        ))}

        {/* Need Help */}
        <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
          <CardContent className="p-6 text-center">
            <h3 className="font-bold text-gray-900 mb-2">
              Need a Custom Plan?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Contact our sales team for enterprise solutions tailored to your
              business
            </p>
            <Button variant="outline">Contact Sales</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

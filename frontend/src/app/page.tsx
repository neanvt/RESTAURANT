"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/authStore";
import {
  ShoppingBag,
  Printer,
  BarChart3,
  Users,
  Receipt,
  Wifi,
  WifiOff,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const router = useRouter();
  const { user } = useAuthStore();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const features = [
    {
      icon: ShoppingBag,
      title: "Smart Order Management",
      description:
        "Create, track, and manage orders with ease. Real-time order status updates.",
    },
    {
      icon: Printer,
      title: "Bluetooth Printing",
      description:
        "Connect to Bluetooth thermal printers for instant receipt printing.",
    },
    {
      icon: WifiOff,
      title: "Offline Support",
      description:
        "Work without internet. Orders sync automatically when you're back online.",
    },
    {
      icon: BarChart3,
      title: "Analytics & Reports",
      description:
        "Track sales, expenses, and profits with detailed reports and insights.",
    },
    {
      icon: Receipt,
      title: "Expense Tracking",
      description:
        "Record and categorize all business expenses for better financial management.",
    },
    {
      icon: Users,
      title: "Multi-outlet Management",
      description:
        "Manage multiple restaurant locations with role-based access control.",
    },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-12 md:py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Wifi className="h-4 w-4" />
            <span>Works Online & Offline</span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Restaurant POS System
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A complete mobile-first PWA solution for restaurant management.
            Handle orders, inventory, expenses, and printing - even offline.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/login">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8"
              >
                Login
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

            <Link href="/auth/signup">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8"
              >
                Create Account
              </Button>
            </Link>
          </div>

          {/* Quick Benefits */}
          <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Free to start</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>No credit card required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span>Install as app</span>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Everything you need to run your restaurant
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Powerful features designed for modern restaurants, cafes, and food
            businesses
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to streamline your restaurant?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurants using our POS system. Start managing
            your business better today.
          </p>
          <Link href="/auth/signup">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

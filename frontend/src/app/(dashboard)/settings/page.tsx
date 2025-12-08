"use client";

import { useRouter } from "next/navigation";
import {
  Building2,
  Clock,
  Share2,
  Bell,
  User,
  Printer,
  ChevronRight,
  Settings as SettingsIcon,
  ChevronLeft,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  const router = useRouter();

  const settingsSections = [
    {
      icon: Building2,
      label: "Business Information",
      description: "Name, logo, address, GST, UPI details",
      path: "/settings/business",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Printer,
      label: "Printer Settings",
      description: "Configure thermal printer connection",
      path: "/settings/printer",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Clock,
      label: "Operating Hours",
      description: "Set your restaurant's business hours",
      path: "/settings/hours",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: SettingsIcon,
      label: "Menu Display Settings",
      description: "Timing text and delivery info for printed menu",
      path: "/settings/menu-display",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Share2,
      label: "Social Media",
      description: "Connect your social media accounts",
      path: "/settings/social",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: Bell,
      label: "Notifications",
      description: "Manage notification preferences",
      path: "/settings/notifications",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: User,
      label: "Account Settings",
      description: "Update your profile and security",
      path: "/settings/account",
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
              aria-label="Go back"
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <ChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <div className="p-2 bg-blue-100 rounded-lg">
              <SettingsIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Settings</h1>
              <p className="text-sm text-gray-600">
                Manage your app preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <Card
              key={section.path}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(section.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center ${section.color}`}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {section.label}
                      </div>
                      <div className="text-sm text-gray-600">
                        {section.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

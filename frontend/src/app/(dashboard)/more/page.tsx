"use client";

import { useRouter } from "next/navigation";
import {
  Settings,
  Users,
  Package,
  Receipt,
  FileText,
  Store,
  CreditCard,
  LogOut,
  ChefHat,
  TrendingUp,
  ChevronRight,
  Wallet,
  Box,
  Printer,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";

export default function MorePage() {
  const router = useRouter();
  const { logout } = useAuth();

  const menuItems = [
    {
      icon: Store,
      label: "Outlets",
      description: "Manage your outlets",
      path: "/outlets",
      color: "bg-blue-100 text-blue-600",
    },
    {
      icon: Users,
      label: "Manage Staff",
      description: "Staff members & roles",
      path: "/staff",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: Users,
      label: "Customers",
      description: "Customer database",
      path: "/customers",
      color: "bg-purple-100 text-purple-600",
    },
    {
      icon: FileText,
      label: "Orders",
      description: "View all orders",
      path: "/orders",
      color: "bg-green-100 text-green-600",
    },
    {
      icon: ChefHat,
      label: "Kitchen (KOT)",
      description: "Kitchen order tickets",
      path: "/kots",
      color: "bg-orange-100 text-orange-600",
    },
    {
      icon: Receipt,
      label: "Invoices",
      description: "Billing & payments",
      path: "/invoices",
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      icon: Wallet,
      label: "Expenses",
      description: "Track expenses",
      path: "/expenses",
      color: "bg-red-100 text-red-600",
    },
    {
      icon: Box,
      label: "Inventory",
      description: "Stock management",
      path: "/inventory",
      color: "bg-teal-100 text-teal-600",
    },
    {
      icon: Printer,
      label: "Printers",
      description: "Printer management",
      path: "/printers",
      color: "bg-cyan-100 text-cyan-600",
    },
    {
      icon: TrendingUp,
      label: "Analytics",
      description: "Reports & insights",
      path: "/reports",
      color: "bg-pink-100 text-pink-600",
    },
    {
      icon: Package,
      label: "Categories",
      description: "Manage categories",
      path: "/categories",
      color: "bg-indigo-100 text-indigo-600",
    },
    {
      icon: Settings,
      label: "Settings",
      description: "App preferences",
      path: "/settings",
      color: "bg-gray-100 text-gray-600",
    },
  ];

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      await logout();
      router.push("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900">More</h1>
        <p className="text-sm text-gray-600">Manage your restaurant</p>
      </div>

      <div className="p-4 space-y-3">
        {/* Menu Items */}
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card
              key={item.path}
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => router.push(item.path)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600">
                        {item.description}
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Logout Button */}
        <Card
          className="cursor-pointer hover:shadow-md transition-shadow border-red-200"
          onClick={handleLogout}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <LogOut className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <div className="font-semibold text-red-600">Logout</div>
                  <div className="text-xs text-gray-600">
                    Sign out of your account
                  </div>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

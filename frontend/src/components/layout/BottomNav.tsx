"use client";

import { usePathname, useRouter } from "next/navigation";
import { Home, UtensilsCrossed, Plus, BarChart3, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export default function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Hide bottom nav on certain pages
  if (pathname === "/orders/create" || pathname === "/kots") {
    return null;
  }

  const navItems = [
    {
      label: "Home",
      icon: Home,
      path: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Items",
      icon: UtensilsCrossed,
      path: "/items",
      active: pathname?.startsWith("/items"),
    },
    {
      label: "Add",
      icon: Plus,
      path: "/orders/create",
      isCenter: true,
      active: pathname === "/orders/create",
    },
    {
      label: "Reports",
      icon: BarChart3,
      path: "/reports",
      active: pathname?.startsWith("/reports"),
    },
    {
      label: "More",
      icon: Menu,
      path: "/more",
      active: pathname === "/more",
    },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isCenter) {
            return (
              <button
                key={item.path}
                onClick={() => router.push(item.path)}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-xs mt-1 text-gray-700 font-medium">
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.path}
              onClick={() => router.push(item.path)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-colors",
                item.active
                  ? "text-blue-600"
                  : "text-gray-600 hover:text-gray-900"
              )}
            >
              <Icon className="h-6 w-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

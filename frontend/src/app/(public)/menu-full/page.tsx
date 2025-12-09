"use client";

import { useEffect, useState, Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api/reports";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  isAvailable?: boolean;
}

interface MenuCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  items: MenuItem[];
}

interface MenuData {
  outlet: {
    name: string;
    logo?: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
    contact: {
      phone: string;
    };
  };
  categories: MenuCategory[];
  totalItems: number;
}

function MenuFullContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuData | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, [searchParams]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      // Get outletId from URL params or localStorage
      const urlOutletId = searchParams.get("outletId");
      const storedOutletId = localStorage.getItem("publicOutletId");
      const outletId = urlOutletId || storedOutletId;
      
      if (!outletId) {
        toast.error("Outlet not found. Please scan the QR code again.");
        router.push("/menu-select");
        return;
      }
      
      // Store in localStorage for future use
      if (urlOutletId) {
        localStorage.setItem("publicOutletId", urlOutletId);
      }
      
      const data = await reportsApi.getPublicMenuData(outletId);
      setMenuData(data);
    } catch (error: any) {
      console.error("Failed to fetch menu data:", error);
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-orange-500" />
          <p className="text-gray-600">Loading full menu...</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <p className="text-gray-600">No menu data available</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      {/* Header */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Full Menu</h1>
              <p className="text-sm text-gray-600">
                {menuData.totalItems} total items
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Outlet Info */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
          {menuData.outlet.logo && (
            <div className=" flex justify-center">
              <div className="relative w-64 h-40">
                <Image
                  src={menuData.outlet.logo}
                  alt={menuData.outlet.name}
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          )}
          <h2 className="text-4xl font-bold text-gray-900 mb-2">
            {menuData.outlet.name}
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              {menuData.outlet.address.street}, {menuData.outlet.address.city}
            </p>
            <p>
              {menuData.outlet.address.state} -{" "}
              {menuData.outlet.address.pincode}
            </p>
            <p className="font-semibold text-blue-600 mt-2">
              📞 {menuData.outlet.contact.phone}
            </p>
          </div>
        </div>

        {/* Menu Categories */}
        {menuData.categories.map((category) => (
          <div key={category.categoryId} className="mb-8">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-t-xl">
              <h3 className="text-2xl font-bold flex items-center gap-2">
                <span>{category.categoryIcon}</span>
                <span>{category.categoryName}</span>
              </h3>
            </div>
            <div className="bg-white rounded-b-xl shadow-lg overflow-hidden">
              <div className="divide-y divide-gray-200">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className={`p-4 transition-colors ${
                      item.isAvailable
                        ? "hover:bg-blue-50"
                        : "bg-gray-50 opacity-60"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900 text-lg">
                            {item.name}
                          </h4>
                          {!item.isAvailable && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Unavailable
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="text-right shrink-0">
                        <p
                          className={`text-xl font-bold ${
                            item.isAvailable ? "text-blue-600" : "text-gray-500"
                          }`}
                        >
                          ₹{item.price}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="bg-white rounded-xl shadow-lg p-6 text-center mt-8">
          <p className="text-gray-600 mb-2">
            For orders and inquiries, contact us:
          </p>
          <p className="text-xl font-bold text-blue-600">
            📞 {menuData.outlet.contact.phone}
          </p>
          <p className="text-sm text-gray-500 mt-3">
            * Unavailable items are currently not in stock
          </p>
        </div>
      </div>
    </div>
  );
}

export default function MenuFullPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
            <p className="text-gray-600">Loading full menu...</p>
          </div>
        </div>
      }
    >
      <MenuFullContent />
    </Suspense>
  );
}

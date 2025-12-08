"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
}

interface MenuCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  items: MenuItem[];
}

interface MenuPrintData {
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
      whatsapp?: string;
    };
    operatingHours?: any;
    deliveryConfig?: {
      enabled: boolean;
      minimumOrder: number;
      deliveryCharge: number;
      freeDeliveryAbove: number;
    };
    menuDisplaySettings?: {
      timingText?: string;
      closedDay?: string;
    };
  };
  categories: MenuCategory[];
  totalItems: number;
}

export default function PrintMenuPage() {
  const searchParams = useSearchParams();
  const outletId = searchParams.get("outletId");
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuPrintData | null>(null);

  useEffect(() => {
    if (outletId) {
      fetchMenuData();
    } else {
      toast.error("Outlet ID is required");
      setLoading(false);
    }
  }, [outletId]);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/reports/menu-current?outletId=${outletId}`,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch menu data");
      }

      const result = await response.json();
      // API returns { success: true, data: {...} }
      if (result.success && result.data) {
        setMenuData(result.data);
      } else {
        throw new Error(result.error?.message || "Failed to fetch menu data");
      }
    } catch (error: any) {
      console.error("Failed to fetch menu data:", error);
      toast.error(error.message || "Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getShareableUrl = () => {
    if (typeof window !== "undefined") {
      return window.location.href;
    }
    return "";
  };

  const handleCopyUrl = () => {
    const url = getShareableUrl();
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard!");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p className="text-gray-600">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (!menuData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No menu data available</p>
          {!outletId && (
            <p className="text-sm text-gray-500">
              Please provide an outlet ID in the URL
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50 flex gap-2">
        <Button
          onClick={handleCopyUrl}
          variant="outline"
          className="gap-2 bg-white shadow-lg"
          size="sm"
        >
          Copy URL
        </Button>
        <Button onClick={handlePrint} className="gap-2 shadow-lg">
          <Printer className="h-4 w-4" />
          Print
        </Button>
      </div>

      {/* Printable Menu */}
      <div className="print-menu-container bg-white min-h-screen print:p-0 flex flex-col px-[50px]">
        <div className="w-full mx-auto bg-white flex-1 flex flex-col">
          {/* Header Section - 3 Column Layout */}
          <div className="menu-header p-4 print:p-3 border-b-2 print:border-b border-orange-500 px-[200px]">
            <div className="grid grid-cols-3 gap-3 print:gap-2 items-center">
              {/* Left Section - Menu Selection QR Code */}
              <div className="text-center">
                <div className="mb-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `${
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "http://localhost:3000"
                      }/menu-select?outletId=${outletId}`
                    )}`}
                    alt="Menu QR"
                    width={150}
                    height={150}
                    className="mx-auto border print:border border-gray-300 print:w-32 print:h-32"
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-[10px] print:text-[8px] font-semibold text-gray-900">
                  Scan for Menu
                </p>
                <p className="text-[9px] print:text-[7px] text-gray-600">
                  View & Feedback
                </p>
              </div>

              {/* Middle Section - Logo, Name, Address */}
              <div className="text-center">
                {menuData.outlet.logo && (
                  <div className="mb-2 print:mb-1 flex justify-center">
                    <img
                      src={menuData.outlet.logo}
                      alt={menuData.outlet.name}
                      className="w-80 h-28 print:w-72 print:h-24 object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                <h1 className="text-3xl print:text-2xl font-bold text-gray-900 mb-2 print:mb-1">
                  {menuData.outlet.name}
                </h1>
                <div className="text-xs print:text-[10px] text-gray-700 space-y-0.5">
                  <p>
                    {menuData.outlet.address.street},{" "}
                    {menuData.outlet.address.city}
                  </p>
                  <p>
                    {menuData.outlet.address.state} -{" "}
                    {menuData.outlet.address.pincode}
                  </p>
                  <p className="font-semibold mt-1">
                    Ph: +91 {menuData.outlet.contact.phone}
                  </p>
                </div>
              </div>

              {/* Right Section - WhatsApp QR Code */}
              <div className="text-center">
                <div className="mb-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `https://wa.me/${menuData.outlet.contact.whatsapp?.replace(
                        /\+/g,
                        ""
                      )}?text=Please send me Current Menu Items`
                    )}`}
                    alt="WhatsApp QR"
                    width={150}
                    height={150}
                    className="mx-auto border print:border border-gray-300 print:w-32 print:h-32"
                    crossOrigin="anonymous"
                  />
                </div>
                <p className="text-[10px] print:text-[8px] font-semibold text-gray-900">
                  Scan for WhatsApp
                </p>
                <p className="text-[9px] print:text-[7px] text-gray-600">
                  {menuData.outlet.contact.whatsapp}
                </p>
              </div>
            </div>
          </div>

          {/* Menu Title */}
          <div className="text-center py-1.5 print:py-1 bg-orange-50">
            <div className="px-[200px]">
              <h2 className="text-lg print:text-base font-bold text-gray-900 leading-tight">
                MENU ITEMS
              </h2>
            </div>
          </div>

          {/* Menu Items Grid */}
          <div className="p-3 print:p-2 flex-1 px-[200px]">
            {menuData.categories.map((category, index) => (
              <div
                key={category.categoryId}
                className={`${
                  index === menuData.categories.length - 1
                    ? "mb-0"
                    : "mb-2 print:mb-1.5"
                }`}
              >
                <h3 className="text-base print:text-sm font-bold text-gray-900 mb-1 print:mb-0.5 pb-0.5 border-b border-orange-300 leading-tight">
                  {category.categoryIcon} {category.categoryName}
                </h3>
                <div className="grid grid-cols-2 gap-x-8 print:gap-x-6 gap-y-1 print:gap-y-0.5">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-1.5 print:py-1 border-b border-gray-200 print:border-gray-300"
                    >
                      <span className="text-lg print:text-[15px] font-medium text-gray-900 flex-1 pr-4 leading-relaxed">
                        {item.name}
                      </span>
                      <span className="text-lg print:text-[15px] font-bold text-gray-900 shrink-0 ml-auto leading-relaxed">
                        ₹{item.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="py-2 print:py-1.5 border-t-2 print:border-t border-orange-500 bg-orange-50 mt-auto">
            <div>
              <div className="flex items-start justify-between gap-4 print:gap-2 text-xs print:text-[10px]">
                <div className="text-left space-y-0.5 flex-shrink-0 min-w-[120px] print:min-w-[100px]">
                  <p className="font-bold text-gray-900 whitespace-nowrap">
                    Ph.: {menuData.outlet.contact.phone}
                  </p>
                  {menuData.outlet.contact.whatsapp && (
                    <p className="font-bold text-gray-900 whitespace-nowrap">
                      WA: {menuData.outlet.contact.whatsapp}
                    </p>
                  )}
                </div>

                <div className="text-center flex-1 px-2 print:px-1">
                  <p className="text-xs print:text-[10px] font-bold text-gray-900 mb-0.5 whitespace-nowrap">
                    Timing:{" "}
                    {menuData.outlet.menuDisplaySettings?.timingText ||
                      "4:00PM to 8:30PM"}{" "}
                    (
                    {menuData.outlet.menuDisplaySettings?.closedDay || "Monday"}{" "}
                    Off)
                  </p>
                  <h3 className="text-base print:text-sm font-bold text-gray-900">
                    {menuData.outlet.name.toUpperCase()}
                  </h3>
                  <p className="text-[10px] print:text-[9px] text-gray-700">
                    {menuData.outlet.address.street}
                  </p>
                </div>

                <div className="text-right space-y-0.5 flex-shrink-0 min-w-[130px] print:min-w-[110px]">
                  {menuData.outlet.deliveryConfig?.enabled !== false && (
                    <>
                      <p className="font-bold text-gray-900 print:text-[15px] whitespace-nowrap">
                        Home Delivery
                      </p>
                      <p className="text-[10px] print:text-[12px] text-gray-700 whitespace-nowrap">
                        Min: ₹
                        {menuData.outlet.deliveryConfig?.minimumOrder || 150} (₹
                        {menuData.outlet.deliveryConfig?.deliveryCharge ||
                          30}{" "}
                        charge)
                      </p>
                      <p className="text-[10px] print:text-[9px] text-gray-700 whitespace-nowrap">
                        Above ₹
                        {menuData.outlet.deliveryConfig?.freeDeliveryAbove ||
                          500}{" "}
                        (Free)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0.5cm 1cm;
          }

          /* Hide everything except the menu content */
          body * {
            visibility: hidden;
          }

          .print-menu-container,
          .print-menu-container * {
            visibility: visible;
          }

          .print-menu-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 1cm !important;
            background: white !important;
            margin: 0 !important;
            min-height: 100vh !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box;
          }

          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
            margin: 0;
            padding: 0;
          }

          .menu-header,
          .print-menu-container > div {
            page-break-inside: avoid;
          }

          /* Keep category with its items together */
          .print-menu-container > div > div > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          button,
          .print\\:hidden {
            display: none !important;
          }

          input[type="checkbox"] {
            -webkit-appearance: checkbox;
            appearance: checkbox;
            width: 12px;
            height: 12px;
            border: 1px solid #000;
            margin-top: 2px;
          }

          /* Compress spacing for A4 fit */
          * {
            line-height: 1.2 !important;
          }

          img {
            image-rendering: -webkit-optimize-contrast;
          }

          /* Remove shadows and unnecessary spacing in print */
          .shadow-lg {
            box-shadow: none !important;
          }
        }

        @media screen {
          .print-menu-container {
            zoom: 0.9;
          }
        }
      `}</style>
    </>
  );
}

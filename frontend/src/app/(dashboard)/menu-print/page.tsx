"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api/reports";
import { toast } from "sonner";
import Image from "next/image";
import { useOutletStore } from "@/store/outletStore";

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
  };
  categories: MenuCategory[];
  totalItems: number;
}

export default function MenuPrintPage() {
  const router = useRouter();
  const { currentOutlet } = useOutletStore();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuPrintData | null>(null);

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getMenuPrintData();
      setMenuData(data);
    } catch (error: any) {
      console.error("Failed to fetch menu data:", error);
      toast.error("Failed to load menu data");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
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
        <p className="text-gray-600">No menu data available</p>
      </div>
    );
  }

  return (
    <>
      {/* Print Controls - Hidden when printing */}
      <div className="print:hidden sticky top-0 z-10 bg-white border-b px-4 py-3">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="shrink-0"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-bold">Print Menu</h1>
              <p className="text-sm text-gray-600">
                {menuData.totalItems} items available
              </p>
            </div>
          </div>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Print Menu
          </Button>
        </div>
      </div>

      {/* Printable Menu */}
      <div className="print-menu-container bg-gray-50 print:bg-white min-h-screen p-4 print:p-0 pb-24">
        <div className="max-w-4xl mx-auto bg-white print:shadow-none shadow-lg print:max-w-full">
          {/* Header Section - 3 Column Layout */}
          <div className="menu-header p-4 print:p-3 border-b-2 print:border-b border-orange-500">
            <div className="grid grid-cols-3 gap-3 print:gap-2 items-center">
              {/* Left Section - Menu Selection QR Code */}
              <div className="text-center">
                <div className="mb-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      `${
                        process.env.NEXT_PUBLIC_APP_URL ||
                        "http://localhost:3000"
                      }/menu-select?outletId=${currentOutlet?._id || ""}`
                    )}`}
                    alt="Menu QR"
                    width={150}
                    height={150}
                    className="mx-auto border print:border border-gray-300 print:w-20 print:h-20"
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
                    <div className="relative w-80 h-28 print:w-72 print:h-24">
                      <Image
                        src={menuData.outlet.logo}
                        alt={menuData.outlet.name}
                        fill
                        className="object-contain"
                      />
                    </div>
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
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(
                      `https://wa.me/${menuData.outlet.contact.whatsapp?.replace(
                        /\+/g,
                        ""
                      )}?text=Please send me Current Menu Items`
                    )}`}
                    alt="WhatsApp QR"
                    width={150}
                    height={150}
                    className="mx-auto border print:border border-gray-300 print:w-20 print:h-20"
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
          <div className="text-center py-2 print:py-1 bg-orange-50">
            <h2 className="text-xl print:text-lg font-bold text-gray-900">
              MENU ITEMS
            </h2>
          </div>

          {/* Menu Items Grid */}
          <div className="p-4 print:p-2">
            {menuData.categories.map((category) => (
              <div key={category.categoryId} className="mb-3 print:mb-2">
                <h3 className="text-lg print:text-sm font-bold text-gray-900 mb-2 print:mb-1 pb-1 border-b border-orange-300">
                  {category.categoryIcon} {category.categoryName}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 print:gap-x-2 gap-y-1 print:gap-y-0">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-start justify-between py-1 print:py-0.5 border-b border-gray-200 print:border-gray-300"
                    >
                      <div className="flex-1 pr-2">
                        <div className="flex items-start gap-1.5 print:gap-1">
                          <input
                            type="checkbox"
                            className="mt-0.5 print:opacity-100 print:w-3 print:h-3"
                            readOnly
                          />
                          <span className="text-sm print:text-[11px] font-medium text-gray-900">
                            {item.name}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <span className="text-sm print:text-[11px] font-bold text-gray-900">
                          ₹{item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="py-2 print:py-1.5 px-4 print:px-2 border-t-2 print:border-t border-orange-500 bg-orange-50">
            <div className="flex items-center justify-between text-xs print:text-[10px]">
              <div className="text-left space-y-0.5">
                <p className="font-bold text-gray-900">
                  Ph.: {menuData.outlet.contact.phone}
                </p>
                {menuData.outlet.contact.whatsapp && (
                  <p className="font-bold text-gray-900">
                    WA: {menuData.outlet.contact.whatsapp}
                  </p>
                )}
              </div>

              <div className="text-center flex-1 px-2">
                <p className="text-xs print:text-[10px] font-bold text-gray-900 mb-0.5">
                  Timing: 4:00PM to 8:30PM (Monday Off)
                </p>
                <h3 className="text-base print:text-sm font-bold text-gray-900">
                  {menuData.outlet.name.toUpperCase()}
                </h3>
                <p className="text-[10px] print:text-[9px] text-gray-700">
                  {menuData.outlet.address.street}
                </p>
              </div>

              <div className="text-right space-y-0.5">
                <p className="font-bold text-gray-900">Home Delivery</p>
                <p className="text-[10px] print:text-[9px] text-gray-700">
                  Min: ₹300 (₹30 charge)
                </p>
                <p className="text-[10px] print:text-[9px] text-gray-700">
                  Above ₹500 (Free)
                </p>
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
            min-height: auto !important;
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

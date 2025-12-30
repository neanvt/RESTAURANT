"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Printer, Loader2, FileDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { reportsApi } from "@/lib/api/reports";
import { toast } from "sonner";
import { useOutletStore } from "@/store/outletStore";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  todaysSpecial?: boolean;
}

interface TodaysSpecialItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  categoryName?: string;
}

interface MenuCategory {
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  items: MenuItem[];
}

interface MenuPrintData {
  outlet: {
    _id?: string;
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
    onlinePresence?: {
      name: string;
      logo: string;
    }[];
  };
  categories: MenuCategory[];
  todaysSpecial: TodaysSpecialItem[];
  totalItems: number;
}

export default function MenuPrintPage() {
  const router = useRouter();
  const { currentOutlet } = useOutletStore();
  const [loading, setLoading] = useState(true);
  const [menuData, setMenuData] = useState<MenuPrintData | null>(null);
  const [outletId, setOutletId] = useState<string>("");

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getMenuPrintData();
      console.log("Menu data fetched:", data);
      console.log("Outlet from data:", data?.outlet);
      console.log("Current outlet from store:", currentOutlet);
      setMenuData(data);
      // Get outlet ID from the fetched data or from currentOutlet
      const id = data?.outlet?._id || currentOutlet?._id;
      console.log("Setting outlet ID:", id);
      if (id) {
        setOutletId(id);
      } else {
        console.error("No outlet ID found in data or store!");
      }
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

  const handleViewPublicUrl = () => {
    const publicUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    }/print-menu?outletId=${outletId || currentOutlet?._id}`;
    window.open(publicUrl, "_blank");
  };

  const handleCopyPublicUrl = () => {
    const publicUrl = `${
      process.env.NEXT_PUBLIC_APP_URL || window.location.origin
    }/print-menu?outletId=${outletId || currentOutlet?._id}`;
    navigator.clipboard.writeText(publicUrl);
    toast.success("Public URL copied to clipboard!");
  };

  const handleExportPDF = () => {
    // Open print dialog - user can select "Save as PDF"
    // This uses browser's native print rendering which handles:
    // - Proper text rendering without overlap
    // - Page breaks that keep categories together with their items
    // - Consistent formatting matching the print preview
    window.print();
  };

  const getAllItemsSorted = () => {
    if (!menuData) return [];
    const allItems: MenuItem[] = [];
    menuData.categories.forEach((category) => {
      allItems.push(...category.items);
    });
    return allItems.sort((a, b) => a.name.localeCompare(b.name));
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
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between max-w-7xl mx-auto gap-3">
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
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <Button
              onClick={handleCopyPublicUrl}
              variant="outline"
              className="gap-2 text-xs md:text-sm flex-1 md:flex-initial"
              size="sm"
            >
              Copy URL
            </Button>
            <Button
              onClick={handleViewPublicUrl}
              variant="outline"
              className="gap-2 text-xs md:text-sm flex-1 md:flex-initial"
              size="sm"
            >
              View Public
            </Button>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="gap-2 text-xs md:text-sm flex-1 md:flex-initial"
            >
              <FileDown className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Export PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              onClick={handlePrint}
              className="gap-2 text-xs md:text-sm flex-1 md:flex-initial"
            >
              <Printer className="h-3 w-3 md:h-4 md:w-4" />
              <span className="hidden sm:inline">Print Menu</span>
              <span className="sm:hidden">Print</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Printable Menu */}
      <div className="print-menu-container bg-gray-50 print:bg-white min-h-screen p-2 md:p-4 print:p-0 pb-24 print:pb-0 flex flex-col px-4 md:px-[50px]">
        <div className="w-full mx-auto bg-white print:shadow-none shadow-lg flex-1 flex flex-col">
          {/* Header Section - 3 Column Layout */}
          <div className="menu-header p-3 md:p-4 print:p-3 border-b-2 print:border-b border-orange-500 px-4 md:px-[200px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 print:gap-2 items-center">
              {/* Left Section - Menu Selection QR Code */}
              <div className="text-center hidden md:block">
                <div className="mb-1">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(
                      `${
                        typeof window !== "undefined"
                          ? window.location.origin
                          : "https://swadika.foodstall.in"
                      }/menu-select?outletId=${
                        outletId || currentOutlet?._id || ""
                      }`
                    )}`}
                    alt="Menu QR"
                    width={150}
                    height={150}
                    className="mx-auto border print:border border-gray-300 print:w-32 print:h-32"
                  />
                </div>
                <p className="text-[10px] print:text-[8px] font-semibold text-gray-900">
                  Scan for Menu
                </p>
                <p className="text-[9px] print:text-[7px] text-gray-600">
                  View & Feedback
                </p>
                {menuData.outlet.onlinePresence &&
                  menuData.outlet.onlinePresence.length > 0 && (
                    <div className="mt-2 print:mt-1.5 flex items-center justify-center gap-1.5 print:gap-1">
                      <span className="text-[9px] print:text-[7px] font-semibold text-gray-900">
                        Available at
                      </span>
                      {menuData.outlet.onlinePresence
                        .slice(0, 4)
                        .map((platform, index) => (
                          <img
                            key={index}
                            src={platform.logo}
                            alt={platform.name}
                            title={platform.name}
                            className="h-12 w-12 print:h-8 print:w-8 object-contain"
                            crossOrigin="anonymous"
                          />
                        ))}
                    </div>
                  )}
              </div>

              {/* Middle Section - Logo, Name, Address */}
              <div className="text-center">
                {menuData.outlet.logo && (
                  <div className="mb-2 print:mb-1 flex justify-center">
                    <img
                      src={menuData.outlet.logo}
                      alt={menuData.outlet.name}
                      className="w-48 h-20 md:w-80 md:h-28 print:w-72 print:h-24 object-contain"
                      crossOrigin="anonymous"
                    />
                  </div>
                )}
                <h1 className="text-xl md:text-3xl print:text-2xl font-bold text-gray-900 mb-2 print:mb-1">
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
              <div className="text-center hidden md:block">
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
                  />
                </div>
                <p className="text-[10px] print:text-[8px] font-semibold text-gray-900">
                  Scan for WhatsApp
                </p>
                <p className="text-[9px] print:text-[7px] text-gray-600">
                  {menuData.outlet.contact.whatsapp}
                </p>
                {menuData.outlet.onlinePresence &&
                  menuData.outlet.onlinePresence.length > 0 && (
                    <div className="mt-2 print:mt-1.5 flex items-center justify-center gap-1.5 print:gap-1">
                      <span className="text-[9px] print:text-[7px] font-semibold text-gray-900">
                        Available at
                      </span>
                      {menuData.outlet.onlinePresence
                        .slice(0, 4)
                        .map((platform, index) => (
                          <img
                            key={index}
                            src={platform.logo}
                            alt={platform.name}
                            title={platform.name}
                            className="h-12 w-12 print:h-8 print:w-8 object-contain"
                            crossOrigin="anonymous"
                          />
                        ))}
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Menu Title */}
          <div className="text-center py-1.5 print:py-1 bg-orange-50">
            <div className="px-4 md:px-[200px]">
              <h2 className="text-base md:text-lg print:text-base font-bold text-gray-900 leading-tight">
                MENU ITEMS
              </h2>
            </div>
          </div>

          {/* Today's Special Section */}
          {menuData.todaysSpecial && menuData.todaysSpecial.length > 0 && (
            <div className="bg-gradient-to-br from-amber-50 via-orange-50 to-amber-50 border-y-4 border-orange-400 py-4 print:py-3 px-4 md:px-[200px]">
              <div className="text-center mb-3 print:mb-2">
                <div className="inline-flex items-center gap-2 bg-orange-500 text-white px-6 py-2 rounded-full shadow-lg">
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300 animate-pulse" />
                  <h3 className="text-3xl md:text-4xl print:text-3xl font-black tracking-wide">
                    TODAY&apos;S SPECIAL
                  </h3>
                  <Star className="w-6 h-6 fill-yellow-300 text-yellow-300 animate-pulse" />
                </div>
              </div>

              <div
                className={`grid gap-4 print:gap-3 ${
                  menuData.todaysSpecial.length === 1
                    ? "grid-cols-1 max-w-2xl mx-auto"
                    : "grid-cols-1 md:grid-cols-2"
                }`}
              >
                {menuData.todaysSpecial.map((item) => (
                  <div
                    key={item.id}
                    className="bg-white rounded-xl shadow-xl border-2 border-orange-300 overflow-hidden transform hover:scale-105 transition-transform print:hover:scale-100"
                  >
                    <div className="relative p-2">
                      <div className="absolute top-4 right-4 bg-orange-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg z-10">
                        ⭐ SPECIAL
                      </div>
                      {item.image && (
                        <div className="w-full h-48 print:h-40 bg-gray-100 rounded-lg overflow-hidden">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-cover"
                            crossOrigin="anonymous"
                          />
                        </div>
                      )}
                    </div>
                    <div className="p-4 print:p-3 bg-gradient-to-b from-white to-orange-50">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h4 className="text-3xl md:text-4xl print:text-3xl font-black text-gray-900 leading-tight flex-1 uppercase">
                          {item.name}
                        </h4>
                        <span className="text-2xl md:text-3xl print:text-2xl font-extrabold text-orange-600 bg-orange-100 px-4 py-2 rounded-lg shadow-sm shrink-0">
                          ₹{item.price}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-base md:text-lg print:text-base text-gray-700 leading-relaxed">
                          {item.description}
                        </p>
                      )}
                      {item.categoryName && (
                        <p className="text-sm md:text-base print:text-sm text-orange-600 font-semibold mt-2">
                          {item.categoryName}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Menu Items Grid */}
          <div className="p-3 print:p-2 flex-1 px-4 md:px-[200px]">
            {/* Screen view - by category */}
            <div className="print:hidden">
              {(() => {
                const colors = [
                  "text-gray-900",
                  "text-orange-700",
                  "text-red-700",
                  "text-amber-700",
                  "text-yellow-700",
                  "text-green-700",
                  "text-teal-700",
                  "text-blue-700",
                  "text-purple-700",
                  "text-pink-700",
                ];
                let globalIndex = 0;
                return menuData.categories.map((category, index) => (
                  <div
                    key={category.categoryId}
                    className={`${
                      index === menuData.categories.length - 1 ? "mb-0" : "mb-2"
                    }`}
                  >
                    <h3 className="text-base md:text-xl font-bold text-gray-900 mb-1.5 md:mb-1 pb-0.5 border-b border-orange-300 leading-tight">
                      {category.categoryIcon} {category.categoryName}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 md:gap-x-8 gap-y-1">
                      {category.items.map((item) => {
                        const currentIndex = globalIndex++;
                        const colorClass =
                          colors[Math.floor(Math.random() * colors.length)];
                        const isSpecial = item.todaysSpecial;
                        return (
                          <div
                            key={item.id}
                            className={`flex items-center justify-between py-1.5 border-b border-gray-200 ${
                              currentIndex % 2 === 0
                                ? "bg-orange-50/30"
                                : "bg-white"
                            }`}
                          >
                            <span
                              className={`text-base md:text-xl flex-1 pr-3 md:pr-4 leading-relaxed ${
                                isSpecial
                                  ? "font-black text-red-600 uppercase"
                                  : `font-medium ${colorClass}`
                              }`}
                            >
                              {item.name}
                            </span>
                            <span className="text-base md:text-xl font-bold text-orange-600 shrink-0 ml-auto leading-relaxed">
                              ₹{item.price}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
            {/* Print view - alphabetically sorted */}
            <div className="hidden print:block">
              {(() => {
                const colors = [
                  "text-gray-900",
                  "text-orange-700",
                  "text-red-700",
                  "text-amber-700",
                  "text-yellow-700",
                  "text-green-700",
                  "text-teal-700",
                  "text-blue-700",
                  "text-purple-700",
                  "text-pink-700",
                ];
                return (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-0.5">
                    {getAllItemsSorted().map((item, idx) => {
                      const colorClass =
                        colors[Math.floor(Math.random() * colors.length)];
                      const isSpecial = item.todaysSpecial;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between py-1 border-b border-gray-300 ${
                            idx % 2 === 0 ? "bg-orange-50/30" : "bg-white"
                          }`}
                        >
                          <span
                            className={`text-lg flex-1 pr-4 leading-relaxed ${
                              isSpecial
                                ? "font-black text-red-600 uppercase"
                                : `font-medium ${colorClass}`
                            }`}
                          >
                            {item.name}
                          </span>
                          <span className="text-lg font-bold text-orange-600 shrink-0 ml-auto leading-relaxed">
                            ₹{item.price}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Footer */}
          <div className="py-2 print:py-1.5 border-t-2 print:border-t border-orange-500 bg-orange-50 mt-auto">
            <div className="px-4 md:px-[50px]">
              <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-3 md:gap-4 print:gap-2 text-xs print:text-[10px]">
                <div className="text-center md:text-left space-y-0.5 w-full md:w-auto md:flex-shrink-0 md:min-w-[120px] print:min-w-[100px]">
                  <p className="font-bold text-gray-900">
                    Ph.: {menuData.outlet.contact.phone}
                  </p>
                  {menuData.outlet.contact.whatsapp && (
                    <p className="font-bold text-gray-900">
                      WA: {menuData.outlet.contact.whatsapp}
                    </p>
                  )}
                </div>

                <div className="text-center flex-1 px-2 print:px-1">
                  <p className="text-[10px] md:text-xs print:text-[10px] font-bold text-gray-900 mb-0.5">
                    Timing:{" "}
                    {menuData.outlet.menuDisplaySettings?.timingText ||
                      "4:00PM to 8:30PM"}{" "}
                    (
                    {menuData.outlet.menuDisplaySettings?.closedDay || "Monday"}{" "}
                    Off)
                  </p>
                  <h3 className="text-sm md:text-base print:text-sm font-bold text-gray-900">
                    {menuData.outlet.name.toUpperCase()}
                  </h3>
                  <p className="text-[9px] md:text-[10px] print:text-[9px] text-gray-700">
                    {menuData.outlet.address.street}
                  </p>
                </div>

                <div className="text-center md:text-right space-y-0.5 w-full md:w-auto md:flex-shrink-0 md:min-w-[130px] print:min-w-[110px]">
                  {menuData.outlet.deliveryConfig?.enabled !== false && (
                    <>
                      <p className="font-bold text-gray-900">Home Delivery</p>
                      <p className="text-[10px] print:text-[9px] text-gray-700">
                        Min: ₹
                        {menuData.outlet.deliveryConfig?.minimumOrder || 300} (₹
                        {menuData.outlet.deliveryConfig?.deliveryCharge ||
                          30}{" "}
                        charge)
                      </p>
                      <p className="text-[10px] print:text-[9px] text-gray-700">
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

          /* Keep Today's Special section together */
          .print-menu-container > div > div:has(.bg-gradient-to-br) {
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

          /* Preserve Today's Special section styling */
          .bg-gradient-to-br.from-amber-50 {
            padding: 0.75rem !important;
          }

          /* Make Today's Special cards horizontal/inline layout for print */
          .bg-gradient-to-br .rounded-xl {
            border: 2px solid #fb923c !important;
            padding: 0.5rem !important;
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            gap: 0.75rem !important;
            background: white !important;
            min-height: 96px !important;
          }

          .bg-gradient-to-br .rounded-xl > div:first-child {
            width: 80px !important;
            height: 80px !important;
            flex-shrink: 0 !important;
            overflow: hidden !important;
            border-radius: 8px !important;
          }

          .bg-gradient-to-br .rounded-xl .relative {
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
            height: 100% !important;
          }

          .bg-gradient-to-br img {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
            border-radius: 8px !important;
            display: block !important;
          }

          .bg-gradient-to-br .rounded-xl > div:last-child {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            padding: 0 !important;
            min-width: 0 !important;
          }

          .bg-gradient-to-br .rounded-xl h4 {
            font-size: 1.125rem !important;
            line-height: 1.3 !important;
            margin-bottom: 0.25rem !important;
            font-weight: 700 !important;
            word-wrap: break-word !important;
            overflow-wrap: break-word !important;
          }

          .bg-gradient-to-br .rounded-xl .flex.items-start {
            display: flex !important;
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: flex-start !important;
            gap: 0.5rem !important;
          }

          .bg-gradient-to-br .rounded-xl .flex.items-start > div {
            flex: 1 !important;
            min-width: 0 !important;
          }

          .bg-gradient-to-br .rounded-xl span {
            display: inline-block !important;
            font-size: 1rem !important;
            margin-top: 0 !important;
            font-weight: 700 !important;
            text-align: right !important;
            background: none !important;
            padding: 0 !important;
            border-radius: 0 !important;
            box-shadow: none !important;
            color: #ea580c !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }

          .bg-gradient-to-br .rounded-xl p {
            display: none !important;
          }

          /* Hide category name in Today's Special for print */
          .bg-gradient-to-br .text-sm.text-orange-600,
          .bg-gradient-to-br .text-base.text-orange-600 {
            display: none !important;
          }

          /* Hide description in Today's Special */
          .bg-gradient-to-br .text-base.text-gray-700,
          .bg-gradient-to-br .text-lg.text-gray-700 {
            display: none !important;
          }

          .bg-gradient-to-br .p-4,
          .bg-gradient-to-br .print\\:p-3 {
            padding: 0 !important;
          }

          /* Hide the badge overlays in print */
          .bg-gradient-to-br .absolute {
            display: none !important;
          }

          img {
            image-rendering: -webkit-optimize-contrast;
            page-break-inside: avoid;
          }

          /* Remove shadows and unnecessary spacing in print */
          .shadow-lg,
          .shadow-xl {
            box-shadow: none !important;
          }

          /* Ensure borders and backgrounds print correctly */
          .border,
          .border-2,
          .border-4 {
            border-color: #000 !important;
          }

          .bg-gradient-to-br,
          .bg-orange-50,
          .bg-orange-100 {
            background: #fff5e6 !important;
          }

          .bg-orange-500 {
            background: #f97316 !important;
            color: white !important;
          }

          .text-orange-600,
          .text-orange-500 {
            color: #ea580c !important;
          }

          /* Fix Today's Special cards in print */
          .rounded-xl,
          .rounded-lg,
          .rounded-full {
            border-radius: 8px !important;
          }

          /* Ensure proper spacing in print */
          .gap-4 {
            gap: 1rem !important;
          }

          .gap-3 {
            gap: 0.75rem !important;
          }
        }

        @media screen and (min-width: 768px) {
          .print-menu-container {
            zoom: 0.9;
          }
        }

        @media screen and (max-width: 767px) {
          .print-menu-container {
            zoom: 1;
          }
        }
      `}</style>
    </>
  );
}

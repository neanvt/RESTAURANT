"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Minus,
  ShoppingCart,
  User,
  Printer,
  Save,
  Search,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Receipt,
  X,
  ArrowLeft,
  Bluetooth,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryFilter } from "@/components/items/CategoryFilter";
import { useItemStore } from "@/store/itemStore";
import { useOrderStore } from "@/store/orderStore";
import { useCategoryStore } from "@/store/categoryStore";
import { useOutletStore } from "@/store/outletStore";
import { Item } from "@/types/item";
import { toast } from "sonner";
import Image from "next/image";
import { getFullImageUrl } from "@/lib/imageUtils";
import { useBluetoothPrinter } from "@/hooks/useBluetoothPrinter";
import KOTPreview from "@/components/orders/KOTPreview";
import InvoicePreview from "@/components/orders/InvoicePreview";
import api from "@/lib/api/axios-config";

interface CartItem extends Item {
  cartQuantity: number;
  notes?: string;
}

export default function CreateOrderPage() {
  const router = useRouter();
  const { items, filters, fetchItems, setFilters } = useItemStore();
  const { createOrder, generateKOT, holdOrder } = useOrderStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { currentOutlet, fetchCurrentOutlet } = useOutletStore();
  
  // Bluetooth printer hook
  const { 
    isSupported: isPrinterSupported,
    isConnected: isPrinterConnected,
    printInvoice: printBluetoothInvoice,
    printKOT: printBluetoothKOT,
    connect: connectPrinter 
  } = useBluetoothPrinter();

  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [tableNumber, setTableNumber] = useState("");
  const [orderNotes, setOrderNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCustomerDetails, setShowCustomerDetails] = useState(false);
  const [showFavourite, setShowFavourite] = useState(false);
  const [showBillSummary, setShowBillSummary] = useState(false);

  // Preview states
  const [showKOTPreview, setShowKOTPreview] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentKOT, setCurrentKOT] = useState<any>(null);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [currentQRCode, setCurrentQRCode] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchItems();
      await fetchCurrentOutlet();
    };
    loadData();
    
    // Check for Bluetooth printer on page load (mobile only)
    if (isPrinterSupported && !isPrinterConnected) {
      // Show a subtle reminder to connect printer
      const timer = setTimeout(() => {
        toast.info("Tip: Connect Bluetooth printer for direct printing", {
          duration: 5000,
          action: {
            label: "Connect",
            onClick: () => connectPrinter(),
          },
        });
      }, 2000); // Show after 2 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isPrinterSupported, isPrinterConnected]);

  const handleCategorySelect = (categoryId: string | null) => {
    setShowFavourite(false);
    setFilters({
      ...filters,
      category: categoryId || undefined,
      isAvailable: true,
    });
  };

  const handleFavouriteSelect = () => {
    setShowFavourite(!showFavourite);
    setFilters({
      ...filters,
      category: undefined,
      isAvailable: true,
    });
  };

  const addToCart = (item: Item) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, cartQuantity: i.cartQuantity + 1 } : i
        );
      }
      return [...prev, { ...item, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((i) => {
          if (i.id === itemId) {
            const newQuantity = i.cartQuantity + delta;
            return { ...i, cartQuantity: newQuantity };
          }
          return i;
        })
        .filter((i) => i.cartQuantity > 0);
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId));
  };

  const calculateTotals = () => {
    let subtotal = 0;
    let taxAmount = 0;

    cart.forEach((item) => {
      const itemSubtotal = item.price * item.cartQuantity;
      subtotal += itemSubtotal;

      if (item.tax?.isApplicable) {
        taxAmount += (itemSubtotal * item.tax.rate) / 100;
      }
    });

    return {
      subtotal: subtotal.toFixed(2),
      tax: taxAmount.toFixed(2),
      total: (subtotal + taxAmount).toFixed(2),
    };
  };

  const handleCreateOrder = async (action: "kot" | "hold" | "bill") => {
    if (cart.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    try {
      setIsProcessing(true);

      const orderData = {
        items: cart.map((item) => ({
          item: item.id,
          quantity: item.cartQuantity,
          notes: item.notes,
        })),
        customer:
          customerName || customerPhone
            ? {
                name: customerName || undefined,
                phone: customerPhone || undefined,
              }
            : undefined,
        tableNumber: tableNumber || undefined,
        notes: orderNotes || undefined,
      };

      // Create the order
      const order: any = await createOrder(orderData);

      console.log("Order created - full response:", order);
      console.log("Order ID:", order?.id);
      console.log("Order _id:", order?._id);

      // Check if order was created successfully
      const orderId = order?.id || order?._id;
      if (!order || !orderId) {
        console.error("Order object:", order);
        throw new Error("Order created but ID is missing");
      }

      if (action === "kot") {
        // Generate KOT and trigger printing
        const result = await generateKOT(orderId);
        console.log("KOT generated:", result);

        const kotId = result.kot?.id || result.kot?._id;

        if (!kotId) {
          toast.warning("KOT generated but ID is missing");
          router.push("/orders");
          return;
        }

        // Format date for printing
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        
        // Prepare KOT data
        const kotData = {
          outletName: currentOutlet?.businessName || "Restaurant",
          orderNumber: order.orderNumber || orderId,
          tableNumber: tableNumber || order.table || "",
          date: formattedDate,
          items: cart.map((item) => ({
            name: item.name,
            quantity: item.cartQuantity,
            notes: item.notes,
          })),
        };
        
        // Try Bluetooth printing first if supported and connected
        if (isPrinterSupported && isPrinterConnected) {
          try {
            await printBluetoothKOT(kotData);
            console.log("✅ KOT printed via Bluetooth");
            toast.success("KOT sent to Bluetooth printer!");
          } catch (err) {
            console.error("Bluetooth print error:", err);
            toast.error("Bluetooth print failed. Check connection.");
            // Fallback to server printing
            api.post(`/kots/${kotId}/print`).catch((e: unknown) => {
              console.error("Server print error:", e);
            });
          }
        } else {
          // Fallback to server-side printing
          api
            .post(`/kots/${kotId}/print`)
            .then(() => {
              console.log("KOT sent to server printer");
            })
            .catch((err: unknown) => {
              console.error("Print error:", err);
            });
        }

        // Show KOT preview
        setCurrentOrder(order);
        setCurrentKOT(result.kot);
        setShowKOTPreview(true);
        toast.success("KOT generated and sent to printer!");
      } else if (action === "hold") {
        await holdOrder(orderId);
        toast.success("Order held successfully");
        router.push("/orders");
      } else if (action === "bill") {
        // Generate both KOT and Invoice
        const result = await generateKOT(orderId);
        console.log("KOT generated for bill:", result);
        toast.success("Order created and ready for billing!");
        router.push(`/orders/${orderId}/invoice`);
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintBill = async () => {
    if (!currentOrder) {
      toast.error("No order found");
      return;
    }

    try {
      setIsProcessing(true);
      const orderId = currentOrder.id || currentOrder._id;

      if (!orderId) {
        throw new Error("Order ID is missing from the order object");
      }

      // First, try to fetch existing invoice for this order
      try {
        const existingInvoiceResponse = await api.get(
          `/invoices/order/${orderId}`
        );
        if (
          existingInvoiceResponse.data.success &&
          existingInvoiceResponse.data.data
        ) {
          console.log(
            "Using existing invoice:",
            existingInvoiceResponse.data.data
          );
          setCurrentInvoice(
            existingInvoiceResponse.data.data.invoice ||
              existingInvoiceResponse.data.data
          );
          setCurrentQRCode(existingInvoiceResponse.data.qrCode || "");
          setShowKOTPreview(false);
          setShowInvoicePreview(true);
          return;
        }
      } catch (fetchError: any) {
        // Invoice doesn't exist, create a new one
        console.log("No existing invoice found, creating new one");
      }

      // Create new invoice
      const response = await api.post("/invoices", {
        orderId: orderId,
        paymentMethod: "cash",
      });

      console.log("Invoice created:", response.data);
      setCurrentInvoice(response.data.data.invoice || response.data.data);
      setCurrentQRCode(response.data.data.qrCode || "");
      setShowKOTPreview(false);
      setShowInvoicePreview(true);
      toast.success("Invoice generated!");
    } catch (error: any) {
      console.error("Invoice creation error:", error);
      console.error("Error response:", error.response?.data);
      const errorMessage =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to create invoice";
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePrintInvoice = async () => {
    if (!currentInvoice) return;

    try {
      const invoiceId = currentInvoice.id || currentInvoice._id;

      // Check if Bluetooth printer is available on mobile
      if (isPrinterSupported) {
        // Format date for printing
        const invoiceDate = new Date(currentInvoice.createdAt || Date.now());
        const formattedDate = `${invoiceDate.getDate().toString().padStart(2, '0')}/${(invoiceDate.getMonth() + 1).toString().padStart(2, '0')}/${invoiceDate.getFullYear()} ${invoiceDate.getHours().toString().padStart(2, '0')}:${invoiceDate.getMinutes().toString().padStart(2, '0')}`;
        
        // Format invoice data for Bluetooth printer
        const invoiceData = {
          outletName: currentOutlet?.businessName || "Restaurant",
          outletAddress: currentOutlet?.fullAddress || 
                         `${currentOutlet?.address?.street}, ${currentOutlet?.address?.city}`,
          outletPhone: currentOutlet?.contact?.phone,
          invoiceNumber: currentInvoice.invoiceNumber || invoiceId,
          date: formattedDate,
          items: currentInvoice.items?.map((item: any) => ({
            name: item.item?.name || item.name || "Item",
            quantity: item.quantity || 1,
            price: item.price || 0,
            total: item.total || (item.quantity * item.price) || 0,
          })) || [],
          subtotal: currentInvoice.subtotal || 0,
          tax: currentInvoice.tax || 0,
          discount: currentInvoice.discount || 0,
          total: currentInvoice.totalAmount || currentInvoice.total || 0,
          paymentMethod: currentInvoice.paymentMethod || "Cash",
          customerName: currentInvoice.customer?.name || customerName,
        };

        await printBluetoothInvoice(invoiceData);
        return;
      }

      // Fallback to server-side printing
      await api.post(`/invoices/${invoiceId}/print`);
      toast.success("Invoice sent to printer!");
    } catch (error) {
      console.error("Print error:", error);
      toast.warning("Invoice printing failed. Check printer connection.");
    }
  };

  const handleCloseKOTPreview = () => {
    setShowKOTPreview(false);
    // Reset cart and form to start fresh order
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setTableNumber("");
    setOrderNotes("");
    setShowCustomerDetails(false);
    setShowBillSummary(false);
  };

  const handleCloseInvoicePreview = () => {
    setShowInvoicePreview(false);
    // Reset form and stay on page to create new order
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setTableNumber("");
    setOrderNotes("");
    setShowCustomerDetails(false);
    setShowBillSummary(false);
  };

  const totals = calculateTotals();

  // Filter items based on search query and favourite
  const filteredItems = items.filter((item) => {
    if (!item.isAvailable) return false;
    if (showFavourite && !item.isFavourite) return false;
    if (!searchQuery) return true;
    return item.name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Get the current category name for heading
  const getCurrentCategoryName = () => {
    if (showFavourite) return "Favourite";
    if (!filters.category) return "All Items";
    const category = categories.find((c) => c.id === filters.category);
    return category?.name || "All Items";
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      {/* Header - Fixed */}
      <div className="bg-white border-b z-10 flex-shrink-0">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">New Order</h1>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-sm text-gray-600">{cart.length} items</div>
              <ShoppingCart className="h-5 w-5 text-blue-600" />
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="px-4 pb-3">
          <CategoryFilter
            selectedCategory={filters.category || null}
            onCategorySelect={handleCategorySelect}
            onFavouriteSelect={handleFavouriteSelect}
            showFavourite={showFavourite}
          />
        </div>
      </div>

      {/* Scrollable Items Section */}
      <div
        className="flex-1 overflow-y-auto"
        style={{ paddingBottom: cart.length > 0 ? "80px" : "0" }}
      >
        {/* Category Heading */}
        {filteredItems.length > 0 && (
          <div className="px-4 pt-4 pb-2">
            <h2 className="text-lg font-semibold text-gray-700">
              {getCurrentCategoryName()}
            </h2>
          </div>
        )}

        {/* Items Grid */}
        <div className="px-4 pb-4">
          <div className="grid grid-cols-2 gap-3">
            {filteredItems.map((item) => {
              const inCart = cart.find((i) => i.id === item.id);

              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  {/* Image with Overlay Controls */}
                  <div className="relative h-40 bg-gray-100">
                    {item.image?.url && getFullImageUrl(item.image.url) ? (
                      <Image
                        src={getFullImageUrl(item.image.url)!}
                        alt={item.name}
                        fill
                        sizes="50vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-4xl">🍽️</span>
                      </div>
                    )}

                    {/* Price Badge - Top Left */}
                    <div className="absolute top-2 left-2 bg-white/95 backdrop-blur-sm px-2 py-1 rounded-md shadow-md">
                      <span className="text-sm font-bold text-blue-600">
                        ₹{item.price.toFixed(2)}
                      </span>
                    </div>

                    {/* Quantity Controls Overlay */}
                    {inCart ? (
                      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
                        <div className="flex items-center bg-blue-600 rounded-full shadow-lg overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.id, -1)}
                            className="w-10 h-10 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                          >
                            <Minus className="h-5 w-5" />
                          </button>
                          <span className="px-4 font-bold text-white min-w-[40px] text-center">
                            {inCart.cartQuantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, 1)}
                            className="w-10 h-10 flex items-center justify-center text-white hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="absolute bottom-2 right-2">
                        <button
                          onClick={() => addToCart(item)}
                          className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 shadow-lg flex items-center justify-center text-white transition-colors"
                        >
                          <Plus className="h-6 w-6" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-3">
                    <h3 className="font-medium text-sm text-gray-900 truncate">
                      {item.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Customer Details Card - Floating */}
      {cart.length > 0 && showCustomerDetails && (
        <div className="fixed bottom-56 right-4 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border z-40 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Customer Details</h3>
            </div>
            <button
              onClick={() => setShowCustomerDetails(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div>
              <Label className="text-xs text-gray-600 mb-1">
                Customer Name
              </Label>
              <Input
                placeholder="Enter name"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">Phone Number</Label>
              <Input
                placeholder="Enter phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">Table Number</Label>
              <Input
                placeholder="Enter table"
                value={tableNumber}
                onChange={(e) => setTableNumber(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs text-gray-600 mb-1">Order Notes</Label>
              <Input
                placeholder="Special instructions"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Bill Summary Card - Floating */}
      {cart.length > 0 && showBillSummary && (
        <div className="fixed bottom-56 right-4 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border z-40 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-blue-600" />
              <h3 className="font-semibold text-gray-900">Bill Summary</h3>
            </div>
            <button
              onClick={() => setShowBillSummary(false)}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span className="font-medium">₹{totals.subtotal}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Tax</span>
              <span className="font-medium">₹{totals.tax}</span>
            </div>
            <div className="pt-3 border-t">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <span className="text-xl font-bold text-blue-600">
                  ₹{totals.total}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Buttons - Right Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-32 right-4 flex flex-col gap-3 z-50">
          {/* Bluetooth Printer Button - Show only on mobile */}
          {isPrinterSupported && (
            <button
              onClick={connectPrinter}
              className={`w-14 h-14 rounded-full shadow-2xl border-2 flex items-center justify-center transition-all ${
                isPrinterConnected
                  ? "bg-green-600 text-white border-green-600 animate-pulse"
                  : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
              }`}
              title={isPrinterConnected ? "Printer Connected" : "Connect Bluetooth Printer"}
            >
              <Bluetooth className="h-6 w-6" />
            </button>
          )}
          
          {/* Customer Details Button */}
          <button
            onClick={() => {
              setShowCustomerDetails(!showCustomerDetails);
              if (!showCustomerDetails) setShowBillSummary(false);
            }}
            className={`w-14 h-14 rounded-full shadow-2xl border-2 flex items-center justify-center transition-all ${
              showCustomerDetails
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <User className="h-6 w-6" />
          </button>

          {/* Bill Summary Button */}
          <button
            onClick={() => {
              setShowBillSummary(!showBillSummary);
              if (!showBillSummary) setShowCustomerDetails(false);
            }}
            className={`w-14 h-14 rounded-full shadow-2xl border-2 flex items-center justify-center transition-all ${
              showBillSummary
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            <Receipt className="h-6 w-6" />
          </button>
        </div>
      )}

      {/* Cart Summary - Fixed at Bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50">
          <div className="max-w-7xl mx-auto px-3 py-2">
            {/* Total Amount */}
            <div className="flex justify-between items-center mb-2">
              <div>
                <div className="text-xs text-gray-600">Total Amount</div>
                <div className="text-lg font-bold text-blue-600">
                  ₹{totals.total}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {cart.reduce((sum, item) => sum + item.cartQuantity, 0)} items
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant="outline"
                onClick={() => handleCreateOrder("kot")}
                disabled={isProcessing}
                className="h-9 text-xs font-semibold"
                title="Print KOT for kitchen"
              >
                {isProcessing ? "..." : "KOT"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateOrder("hold")}
                disabled={isProcessing}
                className="h-9 text-xs font-semibold"
                title="Hold order for later"
              >
                {isProcessing ? "..." : "HOLD"}
              </Button>
              <Button
                onClick={() => handleCreateOrder("bill")}
                disabled={isProcessing}
                className="h-9 text-xs bg-blue-600 hover:bg-blue-700 font-semibold"
                title="Generate bill and invoice"
              >
                {isProcessing ? "..." : "BILL"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* KOT Preview Modal */}
      {showKOTPreview && currentOrder && currentKOT && currentOutlet && (
        <KOTPreview
          order={currentOrder}
          kot={currentKOT}
          outlet={currentOutlet}
          onClose={handleCloseKOTPreview}
          onPrintBill={handlePrintBill}
        />
      )}

      {/* Invoice Preview Modal */}
      {showInvoicePreview &&
        currentOrder &&
        currentInvoice &&
        currentOutlet && (
          <InvoicePreview
            order={currentOrder}
            invoice={currentInvoice}
            outlet={currentOutlet}
            qrCode={currentQRCode}
            onClose={handleCloseInvoicePreview}
            onPrintInvoice={handlePrintInvoice}
          />
        )}
    </div>
  );
}

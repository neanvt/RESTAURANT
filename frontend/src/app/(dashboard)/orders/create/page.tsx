"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { invoiceAPI } from "@/lib/api/invoices";

interface CartItem extends Item {
  cartQuantity: number;
  notes?: string;
}

function CreateOrderPageComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { items, filters, fetchItemsWithPopularity, setFilters } =
    useItemStore();
  const { createOrder, generateKOT, holdOrder, getOrderById, resumeOrder } =
    useOrderStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { currentOutlet, fetchCurrentOutlet } = useOutletStore();

  // Bluetooth printer hook
  const {
    isSupported: isPrinterSupported,
    isConnected: isPrinterConnected,
    isConnecting,
    printInvoice: printBluetoothInvoice,
    printKOT: printBluetoothKOT,
    connect: connectPrinter,
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
  const [hasLoadedHeldOrder, setHasLoadedHeldOrder] = useState(false);
  const [showKOTPreview, setShowKOTPreview] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(false);
  const [currentOrder, setCurrentOrder] = useState<any>(null);
  const [currentKOT, setCurrentKOT] = useState<any>(null);
  const [currentInvoice, setCurrentInvoice] = useState<any>(null);
  const [currentQRCode, setCurrentQRCode] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      await fetchCategories();
      await fetchItemsWithPopularity();
      await fetchCurrentOutlet();
    };
    loadData();
  }, []);

  // Handle order resume logic
  useEffect(() => {
    const resumeOrderId = searchParams.get("resumeOrderId");

    if (resumeOrderId && items.length > 0 && !hasLoadedHeldOrder) {
      const loadHeldOrder = async () => {
        try {
          setHasLoadedHeldOrder(true);
          const heldOrder = await getOrderById(resumeOrderId);
          console.log("Loading held order:", heldOrder);

          // Populate form with held order data
          if (heldOrder.customer?.name) {
            setCustomerName(heldOrder.customer.name);
          }
          if (heldOrder.customer?.phone) {
            setCustomerPhone(heldOrder.customer.phone);
          }
          if (heldOrder.tableNumber) {
            setTableNumber(heldOrder.tableNumber);
          }
          if (heldOrder.notes) {
            setOrderNotes(heldOrder.notes);
          }

          // Populate cart with order items
          if (heldOrder.items && heldOrder.items.length > 0) {
            const cartItems: CartItem[] = [];

            for (const orderItem of heldOrder.items) {
              // Find the corresponding menu item by ID
              const menuItem = items.find((item) => item.id === orderItem.item);

              if (menuItem) {
                cartItems.push({
                  ...menuItem,
                  cartQuantity: orderItem.quantity,
                  notes: orderItem.notes,
                });
              } else {
                // Create temporary item if not found
                const tempItem = {
                  id: orderItem.item || `temp-${Date.now()}`,
                  outletId: currentOutlet?._id || "",
                  name: orderItem.name || "Unknown Item",
                  price: orderItem.price || 0,
                  category: "",
                  description: "",
                  image: { isAiGenerated: false },
                  tax: {
                    isApplicable: false,
                    rate: 0,
                    type: "percentage" as const,
                  },
                  isFavourite: false,
                  isAvailable: true,
                  isActive: true,
                  inventory: {
                    trackInventory: false,
                    currentStock: 0,
                    lowStockAlert: 0,
                  },
                  cartQuantity: orderItem.quantity,
                  notes: orderItem.notes,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                } as CartItem;
                cartItems.push(tempItem);
              }
            }

            setCart(cartItems);
            toast.success(`Loaded held order with ${cartItems.length} items`);
          }
        } catch (error: any) {
          console.error("Failed to load held order:", error);
          toast.error("Failed to load held order: " + error.message);
        }
      };

      loadHeldOrder();
    }
  }, [searchParams, getOrderById, currentOutlet, hasLoadedHeldOrder]);

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

  // Check printer connection before KOT printing
  const checkPrinterAndPrintKOT = async (kotData: any) => {
    console.log("🔍 Checking printer connection before KOT printing...");
    console.log("Printer status:", {
      isPrinterSupported,
      isPrinterConnected,
      bluetoothAvailable:
        typeof navigator !== "undefined" && "bluetooth" in navigator,
    });

    // If printer is not supported, fallback to server printing
    if (!isPrinterSupported) {
      console.log("📱 Bluetooth not supported, using server printing");
      return await fallbackToServerPrinting();
    }

    // If printer is connected, proceed with Bluetooth printing
    if (isPrinterConnected) {
      console.log("✅ Printer connected, proceeding with Bluetooth printing");
      try {
        console.log("🖨️ Sending KOT to Bluetooth printer:", kotData);
        await printBluetoothKOT(kotData);
        console.log("✅ KOT printed successfully via Bluetooth");
        toast.success("KOT sent to kitchen via Bluetooth!");
        return true;
      } catch (error) {
        console.error("❌ Bluetooth printing failed:", error);
        toast.error("Bluetooth printing failed, falling back to server");
        return await fallbackToServerPrinting();
      }
    }

    // Printer not connected - try to connect first
    console.log("🔌 Printer not connected, attempting connection...");
    try {
      const connected = await connectPrinter();
      if (connected) {
        console.log("✅ Connected successfully, printing KOT");
        await printBluetoothKOT(kotData);
        toast.success("Connected and printed KOT via Bluetooth!");
        return true;
      } else {
        console.log("❌ Connection failed, falling back to server");
        toast.info("Printer not available, using server printing");
        return await fallbackToServerPrinting();
      }
    } catch (error) {
      console.error("❌ Connection attempt failed:", error);
      toast.info("Bluetooth unavailable, using server printing");
      return await fallbackToServerPrinting();
    }
  };

  // Fallback to server printing
  const fallbackToServerPrinting = async () => {
    // Try multiple sources for kotId
    const kotId = currentKOT?.id || currentKOT?._id;

    if (kotId) {
      try {
        console.log("📤 Sending KOT to server printer, ID:", kotId);
        await api.post(`/kots/${kotId}/print`);
        console.log("✅ KOT sent to server printer successfully");
        toast.success("KOT sent to kitchen!");
        return true;
      } catch (error) {
        console.error("❌ Server printing failed:", error);
        toast.error("Failed to send KOT to kitchen");
        return false;
      }
    } else {
      console.error("❌ No KOT ID available for server printing");
      toast.error("KOT ID missing, cannot print");
      return false;
    }
  };

  const handleCreateOrder = async (action: "kot" | "hold") => {
    if (cart.length === 0) {
      toast.error("Please add items to the order");
      return;
    }

    try {
      setIsProcessing(true);

      // Check if we're resuming a held order
      const resumeOrderId = searchParams.get("resumeOrderId");
      let orderId: string;
      let order: any;

      if (resumeOrderId) {
        // Resume the held order
        order = await resumeOrder(resumeOrderId);
        orderId = order.id || order._id;
        console.log("Order resumed:", order);
      } else {
        // Create new order
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

        order = await createOrder(orderData);
        orderId = order?.id || order?._id;

        console.log("Order created - full response:", order);
        console.log("Order ID:", order?.id);
        console.log("Order _id:", order?._id);

        // Check if order was created successfully
        if (!order || !orderId) {
          console.error("Order object:", order);
          throw new Error("Order created but ID is missing");
        }
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

        // Create invoice and mark as paid immediately
        try {
          const invoiceData = {
            orderId: orderId,
            paymentMethod: "cash" as const, // Default to cash with proper typing
          };
          const invoice = await invoiceAPI.createInvoice(invoiceData);
          console.log("Invoice created:", invoice);

          // Mark invoice as paid - use invoice._id
          const invoiceId = invoice._id || (invoice as any).id;
          if (!invoiceId) {
            console.warn(
              "Invoice created but ID is missing, skipping payment update"
            );
            // Don't throw error, just log and continue
          } else {
            await invoiceAPI.updatePaymentStatus(invoiceId, {
              paymentStatus: "paid" as const,
            });
            console.log("✅ Invoice marked as paid");
          }

          console.log("Invoice marked as paid");
        } catch (invoiceError: any) {
          console.error("Invoice creation/payment error:", invoiceError);
          toast.warning("Order created but failed to auto-complete payment");
        }

        // Format date for printing
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${now.getFullYear()} ${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

        // Prepare KOT data
        const kotData = {
          kotId, // Add kotId for fallback printing
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

        // Show KOT preview immediately - let user manually print if needed
        setCurrentOrder(order);
        setCurrentKOT(result.kot);
        setShowKOTPreview(true);

        // Success message
        const message = resumeOrderId
          ? "Order resumed and completed! KOT generated successfully."
          : "Order completed! KOT generated successfully.";
        toast.success(message);

        // Clear cart and reset form after successful order completion
        setCart([]);
        setCustomerName("");
        setCustomerPhone("");
        setTableNumber("");
        setOrderNotes("");
      } else if (action === "hold") {
        // Generate KOT first, then hold the order
        const result = await generateKOT(orderId);
        console.log("KOT generated for held order:", result);

        const kotId = result.kot?.id || result.kot?._id;

        // Print KOT for kitchen reference with HOLD status
        const now = new Date();
        const formattedDate = `${now.getDate().toString().padStart(2, "0")}/${(
          now.getMonth() + 1
        )
          .toString()
          .padStart(2, "0")}/${now.getFullYear()} ${now
          .getHours()
          .toString()
          .padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

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
          isHold: true, // Flag to indicate this is a held order
        };

        // Print KOT with HOLD status
        if (isPrinterSupported && isPrinterConnected) {
          try {
            await printBluetoothKOT(kotData);
            console.log("✅ HOLD KOT printed via Bluetooth");
          } catch (err) {
            console.error("Bluetooth print error:", err);
            // Fallback to server printing
            if (kotId) {
              api.post(`/kots/${kotId}/print`).catch((e: unknown) => {
                console.error("Server print error:", e);
              });
            }
          }
        } else {
          // Fallback to server-side printing
          if (kotId) {
            api
              .post(`/kots/${kotId}/print`)
              .then(() => {
                console.log("HOLD KOT sent to server printer");
              })
              .catch((err: unknown) => {
                console.error("Print error:", err);
              });
          }
        }

        // Now hold the order
        await holdOrder(orderId);
        const message = resumeOrderId
          ? "Resumed order held again successfully. KOT printed for kitchen reference."
          : "Order held successfully. KOT printed for kitchen reference.";
        toast.success(message);
        router.push("/orders");
      }
    } catch (error: any) {
      console.error("Order creation error:", error);
      toast.error(error.message || "Failed to create order");
    } finally {
      setIsProcessing(false);
    }
  };

  // Test KOT printing function for debugging
  const testKOTPrint = async () => {
    console.log("🧪 Testing KOT print functionality");
    console.log("Printer status:", {
      isPrinterSupported,
      isPrinterConnected,
      bluetoothAvailable:
        typeof navigator !== "undefined" && "bluetooth" in navigator,
    });

    const testKOTData = {
      outletName: "Test Restaurant",
      orderNumber: "TEST-001",
      tableNumber: "5",
      date: new Date().toLocaleString(),
      items: [
        { name: "Test Item 1", quantity: 2, notes: "Extra spicy" },
        { name: "Test Item 2", quantity: 1, notes: "" },
      ],
    };

    try {
      console.log("🖨️ Sending test KOT to printer:", testKOTData);
      await printBluetoothKOT(testKOTData);
      console.log("✅ Test KOT printed successfully");
      toast.success("Test KOT printed!");
    } catch (error) {
      console.error("❌ Test KOT print failed:", error);
      toast.error(`Test KOT failed: ${error}`);
    }
  };

  // Force connection function for manual testing
  const forceConnect = async () => {
    console.log("🔌 Force connecting to Bluetooth printer...");
    try {
      const success = await connectPrinter();
      if (success) {
        console.log("✅ Force connection successful");
        toast.success("Printer connected!");
      } else {
        console.log("❌ Force connection failed");
        toast.error("Failed to connect printer");
      }
    } catch (error) {
      console.error("❌ Force connection error:", error);
      toast.error("Connection error");
    }
  };

  // Handle KOT printing from preview
  const handlePrintKOTFromPreview = async () => {
    if (!currentKOT || !currentOrder) return;

    const kotData = {
      kotId: currentKOT.id || currentKOT._id,
      outletName: currentOutlet?.businessName || "Restaurant",
      orderNumber: currentOrder.orderNumber,
      tableNumber: currentOrder.table || "",
      date: new Date().toLocaleString(),
      items:
        currentOrder.items?.map((item: any) => ({
          name: item.item?.name || item.name,
          quantity: item.quantity,
          notes: item.notes || "",
        })) || [],
    };

    await checkPrinterAndPrintKOT(kotData);
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
        const formattedDate = `${invoiceDate
          .getDate()
          .toString()
          .padStart(2, "0")}/${(invoiceDate.getMonth() + 1)
          .toString()
          .padStart(2, "0")}/${invoiceDate.getFullYear()} ${invoiceDate
          .getHours()
          .toString()
          .padStart(2, "0")}:${invoiceDate
          .getMinutes()
          .toString()
          .padStart(2, "0")}`;

        // Format invoice data for Bluetooth printer
        const invoiceData = {
          outletName: currentOutlet?.businessName || "Restaurant",
          outletAddress:
            currentOutlet?.fullAddress ||
            `${currentOutlet?.address?.street}, ${currentOutlet?.address?.city}`,
          outletPhone: currentOutlet?.contact?.phone,
          invoiceNumber: currentInvoice.invoiceNumber || invoiceId,
          date: formattedDate,
          items:
            currentInvoice.items?.map((item: any) => ({
              name: item.item?.name || item.name || "Item",
              quantity: item.quantity || 1,
              price: item.price || 0,
              total: item.total || item.quantity * item.price || 0,
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
            {filteredItems.map((item, index) => {
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
                        priority={index === 0} // Add priority to first image for LCP optimization
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
            <>
              <button
                onClick={forceConnect}
                className={`w-14 h-14 rounded-full shadow-2xl border-2 flex items-center justify-center transition-all ${
                  isPrinterConnected
                    ? "bg-green-600 text-white border-green-600 animate-pulse"
                    : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
                }`}
                title={
                  isPrinterConnected
                    ? "Printer Connected - Click to reconnect"
                    : "Connect Bluetooth Printer"
                }
              >
                <Bluetooth className="h-6 w-6" />
              </button>

              {/* Test KOT Print Button - For Debugging */}
              <button
                onClick={testKOTPrint}
                className="w-14 h-14 rounded-full shadow-2xl border-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 flex items-center justify-center transition-all"
                title="Test KOT Print"
              >
                <Receipt className="h-6 w-6" />
              </button>
            </>
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
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => handleCreateOrder("kot")}
                disabled={isProcessing}
                className="h-10 text-sm font-semibold w-full"
                title="Print KOT for kitchen"
              >
                {isProcessing ? "..." : "KOT"}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleCreateOrder("hold")}
                disabled={isProcessing}
                className="h-10 text-sm font-semibold w-full"
                title="Hold order for later"
              >
                {isProcessing ? "..." : "HOLD"}
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
          onPrintKOT={handlePrintKOTFromPreview}
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

// Loading component for Suspense
function OrderPageLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Loading order page...</p>
      </div>
    </div>
  );
}

// Main component wrapped in Suspense
export default function CreateOrderPage() {
  return (
    <Suspense fallback={<OrderPageLoading />}>
      <CreateOrderPageComponent />
    </Suspense>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrderStore } from "@/store/orderStore";
import { useInvoiceStore } from "@/store/invoiceStore";
import { CreateInvoiceDTO } from "@/types/invoice";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CreateInvoicePage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;
  const { currentOrder, getOrderById } = useOrderStore();
  const { createInvoice, isLoading } = useInvoiceStore();

  const [formData, setFormData] = useState<CreateInvoiceDTO>({
    orderId,
    paymentMethod: "cash",
    customer: {
      name: "",
      phone: "",
      address: "",
    },
    discount: {
      type: "percentage",
      value: 0,
    },
    notes: "",
  });

  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    getOrderById(orderId).catch(() => {
      toast.error("Order not found");
      router.push("/orders");
    });
  }, [orderId, getOrderById, router]);

  useEffect(() => {
    if (currentOrder?.customer) {
      setFormData((prev) => ({
        ...prev,
        customer: {
          name: currentOrder.customer?.name || "",
          phone: currentOrder.customer?.phone || "",
          address: currentOrder.customer?.address || "",
        },
      }));
    }
  }, [currentOrder]);

  useEffect(() => {
    if (currentOrder) {
      const subtotal = currentOrder.subtotal;
      let discount = 0;
      if (formData.discount) {
        if (formData.discount.type === "percentage") {
          discount = (subtotal * formData.discount.value) / 100;
        } else {
          discount = formData.discount.value;
        }
      }
      setDiscountAmount(discount);
    }
  }, [currentOrder, formData.discount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const invoice = await createInvoice(formData);
      toast.success("Invoice created successfully");
      router.push(`/invoices/${invoice._id}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to create invoice");
    }
  };

  const calculateTotal = () => {
    if (!currentOrder) return 0;
    return currentOrder.total - discountAmount;
  };

  if (!currentOrder) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Create Invoice
              </h1>
              <p className="text-sm text-gray-600">
                Order: {currentOrder.orderNumber}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 max-w-2xl mx-auto">
        {/* Order Summary */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Order Summary</h2>
          <div className="space-y-2 text-sm">
            {currentOrder.items.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-gray-600">
                  {item.name} × {item.quantity}
                </span>
                <span className="font-medium">₹{item.total.toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium">
                  ₹{currentOrder.subtotal.toFixed(2)}
                </span>
              </div>
              {currentOrder.taxAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">
                    ₹{currentOrder.taxAmount.toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold mt-2">
                <span>Order Total</span>
                <span className="text-blue-600">
                  ₹{currentOrder.total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">
            Customer Information (Optional)
          </h2>
          <div className="space-y-3">
            <div>
              <Label htmlFor="customerName">Name</Label>
              <Input
                id="customerName"
                value={formData.customer?.name || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer: { ...formData.customer, name: e.target.value },
                  })
                }
                placeholder="Customer name"
              />
            </div>
            <div>
              <Label htmlFor="customerPhone">Phone</Label>
              <Input
                id="customerPhone"
                value={formData.customer?.phone || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer: {
                      name: formData.customer?.name || "",
                      phone: e.target.value,
                      address: formData.customer?.address,
                    },
                  })
                }
                placeholder="Phone number"
              />
            </div>
            <div>
              <Label htmlFor="customerAddress">Address</Label>
              <Textarea
                id="customerAddress"
                value={formData.customer?.address || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    customer: {
                      name: formData.customer?.name || "",
                      phone: formData.customer?.phone,
                      address: e.target.value,
                    },
                  })
                }
                placeholder="Customer address"
                rows={2}
              />
            </div>
          </div>
        </div>

        {/* Discount */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Discount</h2>
          <div className="space-y-3">
            <div className="flex gap-2">
              <div className="flex-1">
                <Label htmlFor="discountType">Type</Label>
                <Select
                  value={formData.discount?.type || "percentage"}
                  onValueChange={(value: "percentage" | "fixed") =>
                    setFormData({
                      ...formData,
                      discount: {
                        ...formData.discount!,
                        type: value,
                      },
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage (%)</SelectItem>
                    <SelectItem value="fixed">Fixed Amount (₹)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex-1">
                <Label htmlFor="discountValue">Value</Label>
                <Input
                  id="discountValue"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.discount?.value || 0}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      discount: {
                        ...formData.discount!,
                        value: parseFloat(e.target.value) || 0,
                      },
                    })
                  }
                  placeholder="0"
                />
              </div>
            </div>
            {discountAmount > 0 && (
              <div className="text-sm text-green-600 font-medium">
                Discount applied: ₹{discountAmount.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Payment Method</h2>
          <Select
            value={formData.paymentMethod}
            onValueChange={(value: any) =>
              setFormData({ ...formData, paymentMethod: value })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="upi">UPI</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="phonepe">PhonePe</SelectItem>
              <SelectItem value="googlepay">Google Pay</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-lg border p-4 mb-4">
          <h2 className="font-semibold text-gray-900 mb-3">Notes (Optional)</h2>
          <Textarea
            value={formData.notes || ""}
            onChange={(e) =>
              setFormData({ ...formData, notes: e.target.value })
            }
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        {/* Invoice Total */}
        <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">
              Invoice Total
            </span>
            <span className="text-2xl font-bold text-blue-600">
              ₹{calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              <>
                <Receipt className="h-4 w-4 mr-2" />
                Create Invoice
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

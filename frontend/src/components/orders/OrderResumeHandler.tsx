"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useOrderStore } from "@/store/orderStore";
import { useItemStore } from "@/store/itemStore";
import { useOutletStore } from "@/store/outletStore";
import { Item } from "@/types/item";
import { toast } from "sonner";

interface CartItem extends Item {
  cartQuantity: number;
  notes?: string;
}

interface OrderResumeHandlerProps {
  items: Item[];
  setCart: (cart: CartItem[]) => void;
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setTableNumber: (table: string) => void;
  setOrderNotes: (notes: string) => void;
}

export function OrderResumeHandler({
  items,
  setCart,
  setCustomerName,
  setCustomerPhone,
  setTableNumber,
  setOrderNotes,
}: OrderResumeHandlerProps) {
  const searchParams = useSearchParams();
  const { getOrderById } = useOrderStore();
  const { currentOutlet } = useOutletStore();

  useEffect(() => {
    const resumeOrderId = searchParams.get('resumeOrderId');
    
    if (resumeOrderId && items.length > 0) {
      const loadHeldOrder = async () => {
        try {
          const heldOrder = await getOrderById(resumeOrderId);
          console.log('Loading held order:', heldOrder);

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
              const menuItem = items.find(item => 
                item.id === orderItem.item || 
                (item as any)._id === orderItem.item
              );
              
              if (menuItem) {
                cartItems.push({
                  ...menuItem,
                  cartQuantity: orderItem.quantity,
                  notes: orderItem.notes,
                });
              } else {
                // If menu item not found, create a temporary item from order data
                const tempItem = {
                  id: orderItem.item || `temp-${Date.now()}`,
                  outletId: currentOutlet?._id || '',
                  name: orderItem.name || 'Unknown Item',
                  price: orderItem.price || 0,
                  category: '',
                  description: '',
                  image: { isAiGenerated: false },
                  tax: { isApplicable: false, rate: 0, type: "percentage" as const },
                  isFavourite: false,
                  isAvailable: true,
                  isActive: true,
                  inventory: { trackInventory: false, currentStock: 0, lowStockAlert: 0 },
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
          console.error('Failed to load held order:', error);
          toast.error('Failed to load held order: ' + error.message);
        }
      };
      
      loadHeldOrder();
    }
  }, [searchParams, items, getOrderById, currentOutlet, setCart, setCustomerName, setCustomerPhone, setTableNumber, setOrderNotes]);

  return null; // This component doesn't render anything
}
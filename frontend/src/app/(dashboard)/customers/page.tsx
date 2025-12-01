"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  DollarSign,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCustomerStore } from "@/store/customerStore";
import { Customer } from "@/types/customer";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CustomersPage() {
  const router = useRouter();
  const {
    customers,
    filters,
    pagination,
    isLoading,
    fetchCustomers,
    deleteCustomer,
    setFilters,
  } = useCustomerStore();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    // Only filter when search has 3+ characters
    setFilters({ ...filters, search: value.length >= 3 ? value : undefined });
  };

  const handleStatusFilter = (status: string) => {
    setFilters({
      ...filters,
      isActive: status === "all" ? undefined : status === "active",
    });
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete customer "${name}"?`)) {
      try {
        await deleteCustomer(id);
        toast.success("Customer deleted successfully");
      } catch (error: any) {
        toast.error(error.message || "Failed to delete customer");
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.back()}
                aria-label="Go back"
                className="p-2 rounded-lg hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Customers</h1>
            </div>
            <Button
              onClick={() => router.push("/customers/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Customer
            </Button>
          </div>

          {/* Search and Filters */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={
                filters.isActive === undefined
                  ? "all"
                  : filters.isActive
                  ? "active"
                  : "inactive"
              }
              onValueChange={handleStatusFilter}
            >
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Customers</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Customers List */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading customers...</p>
            </div>
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">👥</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No customers found
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your customer database
            </p>
            <Button
              onClick={() => router.push("/customers/create")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add First Customer
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-3">
              {customers.map((customer) => (
                <div
                  key={customer._id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  {/* Customer Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900">
                          {customer.name}
                        </h3>
                        {!customer.isActive && (
                          <Badge variant="outline" className="text-gray-600">
                            Inactive
                          </Badge>
                        )}
                        {customer.tags && customer.tags.length > 0 && (
                          <div className="flex gap-1">
                            {customer.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="text-xs"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone className="h-3 w-3" />
                          {customer.phone}
                        </div>
                        {customer.email && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3 w-3" />
                            {customer.email}
                          </div>
                        )}
                        {customer.address && (
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <MapPin className="h-3 w-3" />
                            {customer.address}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        Joined{" "}
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Customer Stats */}
                  <div className="flex items-center gap-4 mb-3 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <ShoppingBag className="h-4 w-4" />
                      <span>{customer.totalOrders} orders</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <DollarSign className="h-4 w-4" />
                      <span>₹{customer.totalSpent.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/customers/${customer._id}`)}
                    >
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        router.push(`/customers/${customer._id}/edit`)
                      }
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(customer._id, customer.name)}
                      className="text-red-600 border-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === 1}
                  onClick={() => fetchCustomers(filters, pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {pagination.page} of {pagination.pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => fetchCustomers(filters, pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

using System;
using System.Collections.Generic;

namespace API.Models.Entities
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string Phone { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? PasswordSalt { get; set; }
        public string? PasswordHash { get; set; }
        public string Role { get; set; } = "staff";
        public string? Permissions { get; set; }
        public Guid? InvitedBy { get; set; }
        public string Status { get; set; } = "joined";
        public DateTime? LastActive { get; set; }
        public Guid? CurrentOutlet { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User? Inviter { get; set; }
        public Outlet? CurrentOutletNavigation { get; set; }
        public ICollection<Outlet> OwnedOutlets { get; set; } = new List<Outlet>();
        public ICollection<UserOutlet> UserOutlets { get; set; } = new List<UserOutlet>();
        public ICollection<RefreshToken> RefreshTokens { get; set; } = new List<RefreshToken>();
    }

    public class UserOutlet
    {
        public Guid UserId { get; set; }
        public Guid OutletId { get; set; }
        public string Role { get; set; } = "staff";
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User User { get; set; } = null!;
        public Outlet Outlet { get; set; } = null!;
    }

    public class Outlet
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OwnerId { get; set; }
        public string BusinessName { get; set; } = string.Empty;
        public string? Logo { get; set; }
        public string? BusinessType { get; set; }
        public string? CuisineType { get; set; }
        public string Street { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string State { get; set; } = string.Empty;
        public string Pincode { get; set; } = string.Empty;
        public string Country { get; set; } = "India";
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Whatsapp { get; set; }
        public string? GSTIN { get; set; }
        public bool IsGSTEnabled { get; set; } = false;
        public string? UPIId { get; set; }
        public string? QRCodeUrl { get; set; }
        public string? OperatingHours { get; set; }
        public bool TableManagementEnabled { get; set; } = false;
        public int TotalTables { get; set; } = 0;
        public string TablePrefix { get; set; } = "T";
        public string Currency { get; set; } = "INR";
        public string Language { get; set; } = "en";
        public string Timezone { get; set; } = "Asia/Kolkata";
        public decimal TaxRate { get; set; } = 0;
        public string? TaxType { get; set; }
        public bool ServiceChargeEnabled { get; set; } = false;
        public decimal ServiceChargeRate { get; set; } = 0;
        public bool KOTPrinterEnabled { get; set; } = false;
        public bool BillPrinterEnabled { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public User Owner { get; set; } = null!;
        public ICollection<UserOutlet> UserOutlets { get; set; } = new List<UserOutlet>();
        public ICollection<Category> Categories { get; set; } = new List<Category>();
        public ICollection<Item> Items { get; set; } = new List<Item>();
        public ICollection<Order> Orders { get; set; } = new List<Order>();
        public ICollection<Customer> Customers { get; set; } = new List<Customer>();
        public ICollection<Expense> Expenses { get; set; } = new List<Expense>();
        public ICollection<Inventory> Inventory { get; set; } = new List<Inventory>();
    }

    public class Category
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OutletId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int SortOrder { get; set; } = 0;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Outlet Outlet { get; set; } = null!;
        public ICollection<Item> Items { get; set; } = new List<Item>();
    }

    public class Item
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OutletId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public Guid CategoryId { get; set; }
        public decimal Price { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAiGenerated { get; set; } = false;
        public string? AiPrompt { get; set; }
        public bool TaxApplicable { get; set; } = false;
        public decimal TaxRate { get; set; } = 0;
        public string TaxType { get; set; } = "percentage";
        public bool IsFavourite { get; set; } = false;
        public bool IsAvailable { get; set; } = true;
        public bool TrackInventory { get; set; } = false;
        public int CurrentStock { get; set; } = 0;
        public int LowStockAlert { get; set; } = 10;
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Outlet Outlet { get; set; } = null!;
        public Category CategoryNavigation { get; set; } = null!;
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public class Order
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OutletId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public string Status { get; set; } = "draft";
        public string PaymentStatus { get; set; } = "pending";
        public string? PaymentMethod { get; set; }
        public string? CustomerName { get; set; }
        public string? CustomerPhone { get; set; }
        public string? CustomerAddress { get; set; }
        public Guid? CustomerId { get; set; }
        public string? TableNumber { get; set; }
        public string? Notes { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime? CompletedAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Outlet Outlet { get; set; } = null!;
        public User Creator { get; set; } = null!;
        public Customer? Customer { get; set; }
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        public ICollection<KOT> KOTs { get; set; } = new List<KOT>();
        public ICollection<Invoice> Invoices { get; set; } = new List<Invoice>();
    }

    public class OrderItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public Guid ItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public decimal UnitPrice { get; set; }
        public int Quantity { get; set; } = 1;
        public decimal TaxRate { get; set; } = 0;
        public decimal TaxAmount { get; set; } = 0;
        public decimal Subtotal { get; set; }
        public decimal Total { get; set; }
        public string? Notes { get; set; }

        // Navigation properties
        public Order Order { get; set; } = null!;
        public Item Item { get; set; } = null!;
    }

    public class Customer
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OutletId { get; set; }
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public string? Gender { get; set; }
        public decimal TotalSpent { get; set; } = 0;
        public int TotalOrders { get; set; } = 0;
        public DateTime? LastOrderDate { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Outlet Outlet { get; set; } = null!;
        public ICollection<Order> Orders { get; set; } = new List<Order>();
    }

    public class KOT
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public string KOTNumber { get; set; } = string.Empty;
        public string Status { get; set; } = "pending";
        public bool IsPrinted { get; set; } = false;
        public string? PrinterName { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Order Order { get; set; } = null!;
        public ICollection<KOTItem> KOTItems { get; set; } = new List<KOTItem>();
    }

    public class KOTItem
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid KOTId { get; set; }
        public Guid ItemId { get; set; }
        public string Name { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public string? Notes { get; set; }

        // Navigation properties
        public KOT KOT { get; set; } = null!;
        public Item Item { get; set; } = null!;
    }

    public class Invoice
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OrderId { get; set; }
        public Guid OutletId { get; set; }
        public Guid? CustomerId { get; set; }
        public string InvoiceNumber { get; set; } = string.Empty;
        public decimal Subtotal { get; set; }
        public decimal TaxAmount { get; set; }
        public decimal DiscountAmount { get; set; } = 0;
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = "unpaid";
        public string PaymentStatus { get; set; } = "pending";
        public string? PaymentMethod { get; set; }
        public DateTime? DueDate { get; set; }
        public string? QRCode { get; set; }
        public string? QRCodeUrl { get; set; }
        public bool IsPrinted { get; set; } = false;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Order Order { get; set; } = null!;
        public Outlet Outlet { get; set; } = null!;
        public Customer? Customer { get; set; }
    }

    public class Expense
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OutletId { get; set; }
        public string Category { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; } = DateTime.UtcNow;
        public string? ReceiptUrl { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Outlet Outlet { get; set; } = null!;
        public User Creator { get; set; } = null!;
    }

    public class Inventory
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid OutletId { get; set; }
        public Guid? ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string Type { get; set; } = "stock_in"; // stock_in, stock_out, adjustment
        public int Quantity { get; set; }
        public decimal? UnitCost { get; set; }
        public string? Reason { get; set; }
        public Guid CreatedBy { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public Outlet Outlet { get; set; } = null!;
        public Item? Item { get; set; }
        public User Creator { get; set; } = null!;
    }

    // Refresh token persisted in database for rotation and revocation
    public class RefreshToken
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public string Token { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RevokedAt { get; set; }
        public string? RevokedReason { get; set; }
        public string? ReplacedByToken { get; set; }

        // Navigation
        public User User { get; set; } = null!;
    }
}
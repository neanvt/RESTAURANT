using System.ComponentModel.DataAnnotations;

namespace API.Models.DTOs
{
    // Auth DTOs
    public class RefreshTokenRequest
    {
        [Required]
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class LoginRequest
    {
        [Required]
        public string Identifier { get; set; } = string.Empty; // phone or email

        [Required]
        public string Password { get; set; } = string.Empty;
    }

    public class DebugVerifyRequest
    {
        [Required]
        public string Identifier { get; set; } = string.Empty;

        public string? Password { get; set; }
    }

    public class SignupRequest
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        [Required]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;

        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        [Compare("Password", ErrorMessage = "Passwords do not match")]
        public string ConfirmPassword { get; set; } = string.Empty;
    }

    public class AuthResponse
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public AuthData? Data { get; set; }
        public ErrorInfo? Error { get; set; }
    }

    public class AuthData
    {
        public UserData User { get; set; } = null!;
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    public class UserData
    {
        public string Id { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Name { get; set; }
        public string? Email { get; set; }
        public string Role { get; set; } = string.Empty;
        public string[] Outlets { get; set; } = Array.Empty<string>();
        public string? CurrentOutlet { get; set; }
    }

    public class ErrorInfo
    {
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
    }

    // Order DTOs
    public class CreateOrderDto
    {
        [Required]
        public Guid OutletId { get; set; }

        public string? TableNumber { get; set; }

        [Required]
        public List<OrderItemDto> Items { get; set; } = new();

        public CustomerDto? Customer { get; set; }

        public string? Notes { get; set; }

        public decimal? DiscountAmount { get; set; }

        public string? DiscountType { get; set; } // percentage or fixed

        public string? PaymentMethod { get; set; }
    }

    public class OrderItemDto
    {
        [Required]
        public Guid ItemId { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; } = 1;

        public string? Notes { get; set; }
    }

    public class CustomerDto
    {
        public string? Name { get; set; }

        public string? Phone { get; set; }

        public string? Address { get; set; }
    }
    public class CreateItemDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string CategoryId { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public bool TaxApplicable { get; set; } = false;

        [Range(0, 100)]
        public decimal TaxRate { get; set; } = 0;

        public string TaxType { get; set; } = "percentage";

        public bool IsFavourite { get; set; } = false;

        public bool TrackInventory { get; set; } = false;

        [Range(0, int.MaxValue)]
        public int CurrentStock { get; set; } = 0;

        [Range(0, int.MaxValue)]
        public int LowStockAlert { get; set; } = 10;
    }

    public class UpdateItemDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        [Required]
        public string CategoryId { get; set; } = string.Empty;

        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        public string? ImageUrl { get; set; }

        public bool TaxApplicable { get; set; }

        [Range(0, 100)]
        public decimal TaxRate { get; set; }

        public string TaxType { get; set; } = "percentage";

        public bool IsFavourite { get; set; }

        public bool TrackInventory { get; set; }

        [Range(0, int.MaxValue)]
        public int CurrentStock { get; set; }

        [Range(0, int.MaxValue)]
        public int LowStockAlert { get; set; }
    }

    public class ItemFilterDto
    {
        public string? CategoryId { get; set; }
        public bool? IsAvailable { get; set; }
        public bool? IsFavourite { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    // Category DTOs
    public class CreateCategoryDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        [Range(0, int.MaxValue)]
        public int SortOrder { get; set; } = 0;
    }

    public class CategoryCreateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; } = true;

        public int? SortOrder { get; set; }

        [Required]
        public Guid OutletId { get; set; }
    }

    public class CategoryUpdateDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        public string? Description { get; set; }

        public string? ImageUrl { get; set; }

        public bool IsActive { get; set; }

        public int? SortOrder { get; set; }
    }

    // Customer DTOs
    public class CustomerCreateDto
    {
        [Required]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;

        public string? Name { get; set; }

        public string? Email { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Pincode { get; set; }

        public string? Notes { get; set; }

        public string? Gender { get; set; }

        public bool IsVIP { get; set; } = false;

        [Required]
        public Guid OutletId { get; set; }
    }

    public class CustomerUpdateDto
    {
        [Required]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;

        public string? Name { get; set; }

        public string? Email { get; set; }

        public DateTime? DateOfBirth { get; set; }

        public string? Address { get; set; }

        public string? City { get; set; }

        public string? State { get; set; }

        public string? Pincode { get; set; }

        public string? Notes { get; set; }

        public string? Gender { get; set; }

        public bool IsVIP { get; set; }
    }

    public class CustomerOrderHistoryDto
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public decimal TotalSpent { get; set; }
        public DateTime LastOrderDate { get; set; }
        public List<OrderSummaryDto> RecentOrders { get; set; } = new();
        public List<OrderSummaryDto> Orders { get; set; } = new();
    }

    public class OrderSummaryDto
    {
        public Guid Id { get; set; }
        public Guid OrderId { get; set; }
        public string OrderNumber { get; set; } = string.Empty;
        public DateTime OrderDate { get; set; }
        public DateTime CreatedAt { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public int ItemCount { get; set; }
    }

    // Report DTOs
    public class SalesReportDto
    {
        public string Period { get; set; } = string.Empty;
        public decimal TotalSales { get; set; }
        public int TotalOrders { get; set; }
        public decimal AverageOrderValue { get; set; }
        public List<DailySalesDto> DailySales { get; set; } = new();
        public List<PaymentMethodBreakdownDto> PaymentMethodBreakdown { get; set; } = new();
        public DateTime DateFrom { get; set; }
        public DateTime DateTo { get; set; }
        public string? GroupBy { get; set; } // day, week, month
    }

    public class InventoryReportDto
    {
        public int TotalItems { get; set; }
        public int LowStockItems { get; set; }
        public decimal TotalValue { get; set; }
        public List<InventoryItemDto> InventoryItems { get; set; } = new();
        public string? ItemId { get; set; }
        public bool? LowStockOnly { get; set; }
    }

    // Detailed Report DTOs
    public class ItemReportDto
    {
        public string Period { get; set; } = string.Empty;
        public int TotalItemsSold { get; set; }
        public decimal TotalRevenue { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public Guid? OutletId { get; set; }
        public List<ItemSalesDto> ItemSales { get; set; } = new();
    }

    public class ItemSalesDto
    {
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AveragePrice { get; set; }
        public int OrderCount { get; set; }
    }

    public class CategoryReportDto
    {
        public string Period { get; set; } = string.Empty;
        public int TotalCategories { get; set; }
        public decimal TotalRevenue { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public Guid? OutletId { get; set; }
        public List<CategorySalesDto> CategorySales { get; set; } = new();
    }

    public class CategorySalesDto
    {
        public Guid CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public int TotalQuantity { get; set; }
        public decimal TotalRevenue { get; set; }
        public int ItemCount { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class DashboardStatsDto
    {
        public Guid? OutletId { get; set; }
        public decimal TodaySales { get; set; }
        public int TodayOrders { get; set; }
        public decimal YesterdaySales { get; set; }
        public decimal WeeklySales { get; set; }
        public int WeeklyOrders { get; set; }
        public decimal MonthlySales { get; set; }
        public int MonthlyOrders { get; set; }
        public decimal SalesGrowth { get; set; }
        public int TotalItems { get; set; }
        public int TotalCategories { get; set; }
        public int TotalCustomers { get; set; }
        public int LowStockItems { get; set; }
        public List<TopItemDto> TopItems { get; set; } = new();
        public List<InventoryItemDto> LowStockAlerts { get; set; } = new();
    }

    public class CustomerReportDto
    {
        public string Period { get; set; } = string.Empty;
        public int TotalCustomers { get; set; }
        public int NewCustomers { get; set; }
        public int ReturningCustomers { get; set; }
        public decimal TotalRevenue { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public List<CustomerStatsDto> CustomerStats { get; set; } = new();
    }

    public class CustomerStatsDto
    {
        public Guid CustomerId { get; set; }
        public string CustomerName { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public int TotalOrders { get; set; }
        public int OrderCount { get; set; }
        public decimal TotalSpent { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageOrderValue { get; set; }
        public DateTime? LastOrderDate { get; set; }
    }

    public class ExpenseReportDto
    {
        public string Period { get; set; } = string.Empty;
        public int TotalTransactions { get; set; }
        public List<ExpenseCategoryDto> ExpensesByCategory { get; set; } = new();
        public List<DailyExpenseDto> DailyExpenses { get; set; } = new();
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public Guid? OutletId { get; set; }
        public decimal TotalExpenses { get; set; }
        public List<ExpenseDto> Expenses { get; set; } = new();
    }

    public class ExpenseDto
    {
        public Guid ExpenseId { get; set; }
        public string Description { get; set; } = string.Empty;
        public string Category { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
    }

    public class ProfitLossReportDto
    {
        public string Period { get; set; } = string.Empty;
        public decimal CostOfGoodsSold { get; set; }
        public decimal GrossProfit { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public Guid? OutletId { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal NetProfit { get; set; }
        public decimal ProfitMargin { get; set; }
    }

    // Invoice DTOs
    public class InvoiceUpdateDto
    {
        public string? Notes { get; set; }

        public decimal? DiscountAmount { get; set; }

        public string? DiscountType { get; set; }

        public decimal? TaxAmount { get; set; }

        public string? PaymentMethod { get; set; }

        public string? Status { get; set; }

        public DateTime? DueDate { get; set; }
    }

    public class InvoiceStatsDto
    {
        public int PaidInvoices { get; set; }
        public int UnpaidInvoices { get; set; }
        public int OverdueInvoices { get; set; }
        public decimal PendingAmount { get; set; }
        public DateTime From { get; set; }
        public DateTime To { get; set; }
        public int TotalInvoices { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageInvoiceValue { get; set; }
        public List<MonthlyInvoiceDto> MonthlyInvoices { get; set; } = new();
    }

    public class MonthlyInvoiceDto
    {
        public int Month { get; set; }
        public int Year { get; set; }
        public int InvoiceCount { get; set; }
        public decimal Revenue { get; set; }
    }

    // Additional Order DTOs
    public class OrderFilterDto
    {
        public string? Status { get; set; }
        public string? PaymentStatus { get; set; }
        public DateTime? DateFrom { get; set; }
        public DateTime? DateTo { get; set; }
        public string? Search { get; set; }
        public int Page { get; set; } = 1;
        public int PageSize { get; set; } = 20;
    }

    public class CompleteOrderDto
    {
        [Required]
        public string PaymentMethod { get; set; } = string.Empty;
    }

    // Outlet DTOs
    public class CreateOutletDto
    {
        [Required]
        public string BusinessName { get; set; } = string.Empty;

        public string? BusinessType { get; set; }

        public string? CuisineType { get; set; }

        [Required]
        public string Street { get; set; } = string.Empty;

        [Required]
        public string City { get; set; } = string.Empty;

        [Required]
        public string State { get; set; } = string.Empty;

        [Required]
        public string Pincode { get; set; } = string.Empty;

        public string Country { get; set; } = "India";

        [Required]
        [RegularExpression(@"^[6-9]\d{9}$", ErrorMessage = "Invalid phone number format")]
        public string Phone { get; set; } = string.Empty;

        public string? Email { get; set; }

        public string? Whatsapp { get; set; }

        public string? GSTIN { get; set; }

        public bool IsGSTEnabled { get; set; } = false;

        public string? UPIId { get; set; }

        public bool TableManagementEnabled { get; set; } = false;

        [Range(0, 100)]
        public int TotalTables { get; set; } = 0;

        public string TablePrefix { get; set; } = "T";

        public string Currency { get; set; } = "INR";

        public string Language { get; set; } = "en";

        public string Timezone { get; set; } = "Asia/Kolkata";

        [Range(0, 100)]
        public decimal TaxRate { get; set; } = 0;

        public string? TaxType { get; set; }

        public bool ServiceChargeEnabled { get; set; } = false;

        [Range(0, 100)]
        public decimal ServiceChargeRate { get; set; } = 0;

        public bool KOTPrinterEnabled { get; set; } = false;

        public bool BillPrinterEnabled { get; set; } = false;
    }

    // Generic Response DTOs
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; } = string.Empty;
        public T? Data { get; set; }
        public ErrorInfo? Error { get; set; }
        public PaginationInfo? Pagination { get; set; }
    }

    public class PaginationInfo
    {
        public int Page { get; set; }
        public int PageSize { get; set; }
        public int TotalCount { get; set; }
        public int TotalPages { get; set; }
    }

    // Missing Report DTOs
    public class DateRangeDto
    {
        public DateTime From { get; set; }
        public DateTime To { get; set; }
    }

    public class DailySalesDto
    {
        public DateTime Date { get; set; }
        public decimal TotalSales { get; set; }
        public int OrderCount { get; set; }
        public decimal AverageOrderValue { get; set; }
    }

    public class PaymentMethodBreakdownDto
    {
        public string PaymentMethod { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
    }

    public class InventoryItemDto
    {
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public string CategoryName { get; set; } = string.Empty;
        public int CurrentStock { get; set; }
        public int MinimumStock { get; set; }
        public bool IsLowStock { get; set; }
        public string Unit { get; set; } = string.Empty;
        public decimal UnitCost { get; set; }
        public decimal TotalValue { get; set; }
        public DateTime LastUpdated { get; set; }
    }

    public class TopItemDto
    {
        public Guid ItemId { get; set; }
        public string ItemName { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public decimal Revenue { get; set; }
    }

    public class ExpenseCategoryDto
    {
        public string Category { get; set; } = string.Empty;
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
    }

    public class DailyExpenseDto
    {
        public DateTime Date { get; set; }
        public decimal TotalAmount { get; set; }
        public int TransactionCount { get; set; }
    }

    // Update existing DTOs with missing properties
    // SalesReportDto is already updated above

    // ItemReportDto is already updated above

    // CategoryReportDto is already updated above

    // CustomerReportDto is already updated above

    // ExpenseReportDto is already updated above

    // InventoryReportDto is already updated above

    // ProfitLossReportDto is already updated above

    // DashboardStatsDto is already updated above

    // Update OrderSummaryDto
    // OrderSummaryDto is already updated above

    // Update CustomerStatsDto
    // CustomerStatsDto is already updated above
}

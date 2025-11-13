using API.Models.DTOs;

namespace API.Models.Interfaces
{
    public interface IReportService
    {
        Task<SalesReportDto> GetSalesReportAsync(DateTime from, DateTime to, Guid? outletId = null);
        Task<ItemReportDto> GetItemReportAsync(DateTime from, DateTime to, Guid? outletId = null);
        Task<CategoryReportDto> GetCategoryReportAsync(DateTime from, DateTime to, Guid? outletId = null);
        Task<InventoryReportDto> GetInventoryReportAsync(Guid? outletId = null);
        Task<DashboardStatsDto> GetDashboardStatsAsync(Guid? outletId = null);
        Task<CustomerReportDto> GetCustomerReportAsync(DateTime from, DateTime to);
        Task<ExpenseReportDto> GetExpenseReportAsync(DateTime from, DateTime to, Guid? outletId = null);
        Task<ProfitLossReportDto> GetProfitLossReportAsync(DateTime from, DateTime to, Guid? outletId = null);
    }
}
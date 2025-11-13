using API.Data;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ReportService : IReportService
    {
        private readonly ApplicationDbContext _context;

        public ReportService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<SalesReportDto> GetSalesReportAsync(DateTime from, DateTime to, Guid? outletId = null)
        {
            var query = _context.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status == "completed");

            if (outletId.HasValue)
            {
                query = query.Where(o => o.OutletId == outletId.Value);
            }

            var orders = await query
                .Include(o => o.OrderItems)
                .Include(o => o.Outlet)
                .ToListAsync();

            var dailySales = orders
                .GroupBy(o => o.CreatedAt.Date)
                .Select(g => new DailySalesDto
                {
                    Date = g.Key,
                    TotalSales = g.Sum(o => o.TotalAmount),
                    OrderCount = g.Count(),
                    AverageOrderValue = g.Average(o => o.TotalAmount)
                })
                .OrderBy(d => d.Date)
                .ToList();

            var paymentMethodBreakdown = orders
                .GroupBy(o => o.PaymentMethod ?? "cash")
                .Select(g => new PaymentMethodBreakdownDto
                {
                    PaymentMethod = g.Key,
                    TotalAmount = g.Sum(o => o.TotalAmount),
                    TransactionCount = g.Count()
                })
                .ToList();

            return new SalesReportDto
            {
                Period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}",
                TotalSales = orders.Sum(o => o.TotalAmount),
                TotalOrders = orders.Count,
                AverageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0,
                DailySales = dailySales,
                PaymentMethodBreakdown = paymentMethodBreakdown
            };
        }

        public async Task<ItemReportDto> GetItemReportAsync(DateTime from, DateTime to, Guid? outletId = null)
        {
            var baseQuery = _context.OrderItems
                .Where(oi => oi.Order.CreatedAt >= from &&
                            oi.Order.CreatedAt <= to &&
                            oi.Order.Status == "completed");

            var query = baseQuery
                .Include(oi => oi.Item)
                .Include(oi => oi.Order);

            if (outletId.HasValue)
            {
                query = baseQuery
                    .Where(oi => oi.Order.OutletId == outletId.Value)
                    .Include(oi => oi.Item)
                    .Include(oi => oi.Order);
            }

            var orderItems = await query.ToListAsync();

            var itemSales = orderItems
                .GroupBy(oi => oi.Item)
                .Select(g => new ItemSalesDto
                {
                    ItemId = g.Key.Id,
                    ItemName = g.Key.Name,
                    CategoryName = g.Key.CategoryNavigation?.Name ?? "Uncategorized",
                    TotalQuantity = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    OrderCount = g.Select(oi => oi.OrderId).Distinct().Count(),
                    AveragePrice = g.Average(oi => oi.UnitPrice)
                })
                .OrderByDescending(i => i.TotalRevenue)
                .ToList();

            return new ItemReportDto
            {
                Period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}",
                TotalItemsSold = itemSales.Sum(i => i.TotalQuantity),
                TotalRevenue = itemSales.Sum(i => i.TotalRevenue),
                ItemSales = itemSales
            };
        }

        public async Task<CategoryReportDto> GetCategoryReportAsync(DateTime from, DateTime to, Guid? outletId = null)
        {
            var baseQuery = _context.OrderItems
                .Where(oi => oi.Order.CreatedAt >= from &&
                            oi.Order.CreatedAt <= to &&
                            oi.Order.Status == "completed");

            var query = baseQuery
                .Include(oi => oi.Item.CategoryNavigation)
                .Include(oi => oi.Order);

            if (outletId.HasValue)
            {
                query = baseQuery
                    .Where(oi => oi.Order.OutletId == outletId.Value)
                    .Include(oi => oi.Item.CategoryNavigation)
                    .Include(oi => oi.Order);
            }

            var orderItems = await query.ToListAsync();

            var categorySales = orderItems
                .GroupBy(oi => oi.Item.CategoryNavigation)
                .Select(g => new CategorySalesDto
                {
                    CategoryId = g.Key?.Id ?? Guid.Empty,
                    CategoryName = g.Key?.Name ?? "Uncategorized",
                    TotalQuantity = g.Sum(oi => oi.Quantity),
                    TotalRevenue = g.Sum(oi => oi.Quantity * oi.UnitPrice),
                    ItemCount = g.Select(oi => oi.ItemId).Distinct().Count(),
                    AverageOrderValue = g.GroupBy(oi => oi.OrderId)
                                         .Average(orderGroup => orderGroup.Sum(oi => oi.Quantity * oi.UnitPrice))
                })
                .OrderByDescending(c => c.TotalRevenue)
                .ToList();

            return new CategoryReportDto
            {
                Period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}",
                TotalCategories = categorySales.Count,
                TotalRevenue = categorySales.Sum(c => c.TotalRevenue),
                CategorySales = categorySales
            };
        }

        public async Task<InventoryReportDto> GetInventoryReportAsync(Guid? outletId = null)
        {
            var query = _context.Items
                .Include(i => i.Outlet)
                .Include(i => i.CategoryNavigation)
                .Where(i => i.IsActive && i.TrackInventory);

            if (outletId.HasValue)
            {
                query = query.Where(i => i.OutletId == outletId.Value);
            }

            var items = await query.ToListAsync();

            var inventoryItems = items
                .Select(i => new InventoryItemDto
                {
                    ItemId = i.Id,
                    ItemName = i.Name,
                    CategoryName = i.CategoryNavigation?.Name ?? "Uncategorized",
                    CurrentStock = i.CurrentStock,
                    MinimumStock = i.LowStockAlert,
                    Unit = "pieces", // Default unit
                    UnitCost = 0, // Not tracked in current schema
                    TotalValue = 0, // Not tracked in current schema
                    IsLowStock = i.CurrentStock <= i.LowStockAlert,
                    LastUpdated = i.UpdatedAt
                })
                .OrderBy(i => i.IsLowStock ? 0 : 1)
                .ThenBy(i => i.ItemName)
                .ToList();

            var lowStockItems = inventoryItems.Where(i => i.IsLowStock).ToList();
            var totalValue = inventoryItems.Sum(i => i.TotalValue);

            return new InventoryReportDto
            {
                TotalItems = inventoryItems.Count,
                LowStockItems = lowStockItems.Count,
                TotalValue = totalValue,
                InventoryItems = inventoryItems
            };
        }

        public async Task<DashboardStatsDto> GetDashboardStatsAsync(Guid? outletId = null)
        {
            var today = DateTime.UtcNow.Date;
            var yesterday = today.AddDays(-1);
            var thisWeek = today.AddDays(-7);
            var thisMonth = today.AddMonths(-1);

            // Today's sales
            var todayQuery = _context.Orders
                .Where(o => o.CreatedAt.Date == today && o.Status == "completed");

            if (outletId.HasValue)
            {
                todayQuery = todayQuery.Where(o => o.OutletId == outletId.Value);
            }

            var todaySales = await todayQuery.SumAsync(o => o.TotalAmount);
            var todayOrders = await todayQuery.CountAsync();

            // Yesterday's sales for comparison
            var yesterdayQuery = _context.Orders
                .Where(o => o.CreatedAt.Date == yesterday && o.Status == "completed");

            if (outletId.HasValue)
            {
                yesterdayQuery = yesterdayQuery.Where(o => o.OutletId == outletId.Value);
            }

            var yesterdaySales = await yesterdayQuery.SumAsync(o => o.TotalAmount);

            // Weekly sales
            var weeklyQuery = _context.Orders
                .Where(o => o.CreatedAt >= thisWeek && o.Status == "completed");

            if (outletId.HasValue)
            {
                weeklyQuery = weeklyQuery.Where(o => o.OutletId == outletId.Value);
            }

            var weeklySales = await weeklyQuery.SumAsync(o => o.TotalAmount);
            var weeklyOrders = await weeklyQuery.CountAsync();

            // Monthly sales
            var monthlyQuery = _context.Orders
                .Where(o => o.CreatedAt >= thisMonth && o.Status == "completed");

            if (outletId.HasValue)
            {
                monthlyQuery = monthlyQuery.Where(o => o.OutletId == outletId.Value);
            }

            var monthlySales = await monthlyQuery.SumAsync(o => o.TotalAmount);
            var monthlyOrders = await monthlyQuery.CountAsync();

            // Top selling items today
            var baseTopItemsQuery = _context.OrderItems
                .Where(oi => oi.Order.CreatedAt.Date == today && oi.Order.Status == "completed");

            var topItemsQuery = baseTopItemsQuery.Include(oi => oi.Item);

            if (outletId.HasValue)
            {
                topItemsQuery = baseTopItemsQuery
                    .Where(oi => oi.Order.OutletId == outletId.Value)
                    .Include(oi => oi.Item);
            }

            var topItems = await topItemsQuery
                .GroupBy(oi => oi.Item)
                .Select(g => new TopItemDto
                {
                    ItemName = g.Key.Name,
                    Quantity = g.Sum(oi => oi.Quantity),
                    Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
                })
                .OrderByDescending(i => i.Quantity)
                .Take(5)
                .ToListAsync();

            // Low stock alerts
            var lowStockQuery = _context.Items
                .Where(i => i.IsActive && i.TrackInventory && i.CurrentStock <= i.LowStockAlert);

            if (outletId.HasValue)
            {
                lowStockQuery = lowStockQuery.Where(i => i.OutletId == outletId.Value);
            }

            var lowStockItems = await lowStockQuery
                .Select(i => new InventoryItemDto
                {
                    ItemId = i.Id,
                    ItemName = i.Name,
                    CategoryName = i.CategoryNavigation.Name,
                    CurrentStock = i.CurrentStock,
                    MinimumStock = i.LowStockAlert,
                    Unit = "pieces",
                    UnitCost = 0,
                    TotalValue = 0,
                    IsLowStock = true,
                    LastUpdated = i.UpdatedAt
                })
                .Take(10) // Limit to top 10 low stock items
                .ToListAsync();

            var lowStockCount = lowStockItems.Count;

            return new DashboardStatsDto
            {
                TodaySales = todaySales,
                TodayOrders = todayOrders,
                YesterdaySales = yesterdaySales,
                WeeklySales = weeklySales,
                WeeklyOrders = weeklyOrders,
                MonthlySales = monthlySales,
                MonthlyOrders = monthlyOrders,
                SalesGrowth = yesterdaySales > 0 ? ((todaySales - yesterdaySales) / yesterdaySales) * 100 : 0,
                TopItems = topItems,
                LowStockAlerts = lowStockItems
            };
        }

        public async Task<CustomerReportDto> GetCustomerReportAsync(DateTime from, DateTime to)
        {
            var customers = await _context.Customers
                .Include(c => c.Orders.Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status == "completed"))
                .ThenInclude(o => o.OrderItems)
                .ToListAsync();

            var customerStats = customers
                .Select(c => new CustomerStatsDto
                {
                    CustomerId = c.Id,
                    CustomerName = c.Name ?? "Cash Customer",
                    Phone = c.Phone ?? string.Empty,
                    TotalOrders = c.Orders.Count,
                    TotalSpent = c.Orders.Sum(o => o.TotalAmount),
                    AverageOrderValue = c.Orders.Any() ? c.Orders.Average(o => o.TotalAmount) : 0,
                    LastOrderDate = c.Orders.OrderByDescending(o => o.CreatedAt).FirstOrDefault()?.CreatedAt
                })
                .OrderByDescending(c => c.TotalSpent)
                .ToList();

            var newCustomers = customers.Count(c => c.CreatedAt >= from && c.CreatedAt <= to);
            var returningCustomers = customers.Count(c => c.Orders.Count(o => o.CreatedAt >= from && o.CreatedAt <= to) > 1);

            return new CustomerReportDto
            {
                Period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}",
                TotalCustomers = customers.Count,
                NewCustomers = newCustomers,
                ReturningCustomers = returningCustomers,
                TotalRevenue = customerStats.Sum(c => c.TotalSpent),
                CustomerStats = customerStats
            };
        }

        public async Task<ExpenseReportDto> GetExpenseReportAsync(DateTime from, DateTime to, Guid? outletId = null)
        {
            var baseQuery = _context.Expenses
                .Where(e => e.Date >= from && e.Date <= to);

            var query = baseQuery.Include(e => e.Outlet);

            if (outletId.HasValue)
            {
                query = baseQuery
                    .Where(e => e.OutletId == outletId.Value)
                    .Include(e => e.Outlet);
            }

            var expenses = await query.ToListAsync();

            var expensesByCategory = expenses
                .GroupBy(e => e.Category)
                .Select(g => new ExpenseCategoryDto
                {
                    Category = g.Key,
                    TotalAmount = g.Sum(e => e.Amount),
                    TransactionCount = g.Count()
                })
                .OrderByDescending(e => e.TotalAmount)
                .ToList();

            var dailyExpenses = expenses
                .GroupBy(e => e.Date.Date)
                .Select(g => new DailyExpenseDto
                {
                    Date = g.Key,
                    TotalAmount = g.Sum(e => e.Amount),
                    TransactionCount = g.Count()
                })
                .OrderBy(d => d.Date)
                .ToList();

            return new ExpenseReportDto
            {
                Period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}",
                TotalExpenses = expenses.Sum(e => e.Amount),
                TotalTransactions = expenses.Count,
                ExpensesByCategory = expensesByCategory,
                DailyExpenses = dailyExpenses
            };
        }

        public async Task<ProfitLossReportDto> GetProfitLossReportAsync(DateTime from, DateTime to, Guid? outletId = null)
        {
            // Get revenue (from completed orders)
            var revenueQuery = _context.Orders
                .Where(o => o.CreatedAt >= from && o.CreatedAt <= to && o.Status == "completed");

            if (outletId.HasValue)
            {
                revenueQuery = revenueQuery.Where(o => o.OutletId == outletId.Value);
            }

            var totalRevenue = await revenueQuery.SumAsync(o => o.TotalAmount);

            // Get expenses
            var expenseQuery = _context.Expenses
                .Where(e => e.Date >= from && e.Date <= to);

            if (outletId.HasValue)
            {
                expenseQuery = expenseQuery.Where(e => e.OutletId == outletId.Value);
            }

            var totalExpenses = await expenseQuery.SumAsync(e => e.Amount);

            // Calculate cost of goods sold (COGS) - this is simplified
            // In a real system, this would be calculated based on inventory usage
            var baseCogsQuery = _context.OrderItems
                .Where(oi => oi.Order.CreatedAt >= from &&
                            oi.Order.CreatedAt <= to &&
                            oi.Order.Status == "completed");

            var cogsQuery = baseCogsQuery.Include(oi => oi.Item);

            if (outletId.HasValue)
            {
                cogsQuery = baseCogsQuery
                    .Where(oi => oi.Order.OutletId == outletId.Value)
                    .Include(oi => oi.Item);
            }

            // Assuming cost is stored in inventory or we use a cost percentage
            // For simplicity, using 30% of revenue as COGS
            var totalCogs = totalRevenue * 0.3m;

            var grossProfit = totalRevenue - totalCogs;
            var netProfit = grossProfit - totalExpenses;

            return new ProfitLossReportDto
            {
                Period = $"{from:yyyy-MM-dd} to {to:yyyy-MM-dd}",
                TotalRevenue = totalRevenue,
                TotalExpenses = totalExpenses,
                CostOfGoodsSold = totalCogs,
                GrossProfit = grossProfit,
                NetProfit = netProfit,
                ProfitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
            };
        }
    }
}
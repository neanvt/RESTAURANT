using System.Security.Claims;
using API.Data;
using API.Models.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ReportController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("sales")]
        public async Task<IActionResult> GetSalesReport(
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? groupBy = "day")
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                dateFrom ??= DateTime.UtcNow.AddDays(-30);
                dateTo ??= DateTime.UtcNow;

                var orders = await _context.Orders
                    .Where(o => o.CreatedAt >= dateFrom && o.CreatedAt <= dateTo)
                    .ToListAsync();

                var salesData = new List<object>();

                if (groupBy == "day")
                {
                    salesData = orders
                        .GroupBy(o => o.CreatedAt.Date)
                        .Select(g => new
                        {
                            date = g.Key.ToString("yyyy-MM-dd"),
                            totalOrders = g.Count(),
                            totalRevenue = g.Sum(o => o.TotalAmount),
                            averageOrderValue = g.Average(o => o.TotalAmount)
                        })
                        .OrderBy(x => x.date)
                        .ToList<object>();
                }
                else if (groupBy == "month")
                {
                    salesData = orders
                        .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
                        .Select(g => new
                        {
                            date = $"{g.Key.Year}-{g.Key.Month:D2}",
                            totalOrders = g.Count(),
                            totalRevenue = g.Sum(o => o.TotalAmount),
                            averageOrderValue = g.Average(o => o.TotalAmount)
                        })
                        .OrderBy(x => x.date)
                        .ToList<object>();
                }

                var summary = new
                {
                    totalOrders = orders.Count,
                    totalRevenue = orders.Sum(o => o.TotalAmount),
                    averageOrderValue = orders.Any() ? orders.Average(o => o.TotalAmount) : 0,
                    dateFrom,
                    dateTo
                };

                return Ok(new { summary, data = salesData });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating sales report", error = ex.Message });
            }
        }

        [HttpGet("items")]
        public async Task<IActionResult> GetItemReport(
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] int limit = 20)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                dateFrom ??= DateTime.UtcNow.AddDays(-30);
                dateTo ??= DateTime.UtcNow;

                var itemSales = await _context.OrderItems
                    .Include(oi => oi.Item)
                    .Include(oi => oi.Order)
                    .Where(oi => oi.Order.CreatedAt >= dateFrom && oi.Order.CreatedAt <= dateTo)
                    .GroupBy(oi => oi.ItemId)
                    .Select(g => new
                    {
                        itemId = g.Key,
                        itemName = g.First().Item.Name,
                        category = g.First().Item.CategoryNavigation.Name,
                        totalQuantity = g.Sum(oi => oi.Quantity),
                        totalRevenue = g.Sum(oi => oi.Quantity * oi.Item.Price),
                        orderCount = g.Select(oi => oi.OrderId).Distinct().Count()
                    })
                    .OrderByDescending(x => x.totalRevenue)
                    .Take(limit)
                    .ToListAsync();

                return Ok(new
                {
                    dateFrom,
                    dateTo,
                    items = itemSales
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating item report", error = ex.Message });
            }
        }

        [HttpGet("categories")]
        public async Task<IActionResult> GetCategoryReport(
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                dateFrom ??= DateTime.UtcNow.AddDays(-30);
                dateTo ??= DateTime.UtcNow;

                var categorySales = await _context.OrderItems
                    .Include(oi => oi.Item)
                    .ThenInclude(i => i.CategoryNavigation)
                    .Include(oi => oi.Order)
                    .Where(oi => oi.Order.CreatedAt >= dateFrom && oi.Order.CreatedAt <= dateTo)
                    .GroupBy(oi => oi.Item.CategoryId)
                    .Select(g => new
                    {
                        categoryId = g.Key,
                        categoryName = g.First().Item.CategoryNavigation.Name,
                        totalOrders = g.Select(oi => oi.OrderId).Distinct().Count(),
                        totalQuantity = g.Sum(oi => oi.Quantity),
                        totalRevenue = g.Sum(oi => oi.Quantity * oi.Item.Price)
                    })
                    .OrderByDescending(x => x.totalRevenue)
                    .ToListAsync();

                return Ok(new
                {
                    dateFrom,
                    dateTo,
                    categories = categorySales
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating category report", error = ex.Message });
            }
        }

        [HttpGet("inventory")]
        public async Task<IActionResult> GetInventoryReport()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var inventoryItems = await _context.Items
                    .Include(i => i.CategoryNavigation)
                    .Where(i => i.IsActive && i.TrackInventory)
                    .Select(i => new
                    {
                        itemId = i.Id,
                        itemName = i.Name,
                        category = i.CategoryNavigation.Name,
                        currentStock = i.CurrentStock,
                        lowStockAlert = i.LowStockAlert,
                        isLowStock = i.CurrentStock <= i.LowStockAlert,
                        status = i.IsAvailable ? "Available" : "Unavailable"
                    })
                    .OrderBy(i => i.currentStock)
                    .ToListAsync();

                var summary = new
                {
                    totalItems = inventoryItems.Count,
                    lowStockItems = inventoryItems.Count(i => i.isLowStock),
                    outOfStockItems = inventoryItems.Count(i => i.currentStock == 0)
                };

                return Ok(new { summary, items = inventoryItems });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating inventory report", error = ex.Message });
            }
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardData()
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var today = DateTime.UtcNow.Date;
                var yesterday = today.AddDays(-1);

                // Today's metrics
                var todaysOrders = await _context.Orders
                    .Where(o => o.CreatedAt.Date == today)
                    .ToListAsync();

                var yesterdaysOrders = await _context.Orders
                    .Where(o => o.CreatedAt.Date == yesterday)
                    .ToListAsync();

                // Current month metrics
                var currentMonth = new DateTime(today.Year, today.Month, 1);
                var monthlyOrders = await _context.Orders
                    .Where(o => o.CreatedAt >= currentMonth)
                    .ToListAsync();

                var dashboardData = new
                {
                    todaysOrders = todaysOrders.Count,
                    todaysRevenue = todaysOrders.Sum(o => o.TotalAmount),
                    yesterdaysOrders = yesterdaysOrders.Count,
                    yesterdaysRevenue = yesterdaysOrders.Sum(o => o.TotalAmount),
                    monthlyOrders = monthlyOrders.Count,
                    monthlyRevenue = monthlyOrders.Sum(o => o.TotalAmount),
                    averageOrderValue = todaysOrders.Any() ? todaysOrders.Average(o => o.TotalAmount) : 0,
                    activeOrders = todaysOrders.Count(o => o.Status == "preparing" || o.Status == "ready")
                };

                return Ok(dashboardData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating dashboard data", error = ex.Message });
            }
        }
    }
}
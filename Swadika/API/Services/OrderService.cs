using API.Data;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ApplicationDbContext _context;

        public OrderService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Order> CreateOrderAsync(CreateOrderDto dto, Guid outletId, Guid userId)
        {
            var orderNumber = await GenerateOrderNumberAsync(outletId);

            var itemIds = dto.Items.Select(i => i.ItemId).Distinct().ToList();
            var items = await _context.Items
                .Where(i => itemIds.Contains(i.Id) && i.OutletId == outletId && i.IsActive)
                .ToDictionaryAsync(i => i.Id, i => i);

            decimal subtotal = 0;
            decimal taxAmount = 0;

            var orderItems = new List<OrderItem>();
            foreach (var itemDto in dto.Items)
            {
                var itemId = itemDto.ItemId;
                if (!items.TryGetValue(itemId, out var item))
                {
                    throw new Exception($"Item {itemId} not found");
                }

                var quantity = itemDto.Quantity;
                var itemSubtotal = item.Price * quantity;
                var itemTaxAmount = item.TaxApplicable ? (itemSubtotal * item.TaxRate / 100) : 0;
                var itemTotal = itemSubtotal + itemTaxAmount;

                subtotal += itemSubtotal;
                taxAmount += itemTaxAmount;

                orderItems.Add(new OrderItem
                {
                    ItemId = item.Id,
                    Name = item.Name,
                    UnitPrice = item.Price,
                    Quantity = quantity,
                    TaxRate = item.TaxApplicable ? item.TaxRate : 0,
                    TaxAmount = itemTaxAmount,
                    Subtotal = itemSubtotal,
                    Total = itemTotal,
                    Notes = itemDto.Notes
                });
            }

            var order = new Order
            {
                OutletId = outletId,
                OrderNumber = orderNumber,
                OrderItems = orderItems,
                Subtotal = subtotal,
                TaxAmount = taxAmount,
                TotalAmount = subtotal + taxAmount,
                Status = "draft",
                PaymentStatus = "pending",
                CustomerName = dto.Customer?.Name,
                CustomerPhone = dto.Customer?.Phone,
                CustomerAddress = dto.Customer?.Address,
                TableNumber = dto.TableNumber,
                Notes = dto.Notes,
                CreatedBy = userId
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order;
        }

        public async Task<Order> GetOrderByIdAsync(Guid orderId, Guid outletId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Creator)
                .FirstOrDefaultAsync(o => o.Id == orderId && o.OutletId == outletId);

            if (order == null)
            {
                throw new Exception("Order not found");
            }

            return order;
        }

        public async Task UpdateOrderStatusAsync(Guid orderId, string status)
        {
            var order = await _context.Orders.FindAsync(orderId);
            if (order == null)
            {
                throw new Exception("Order not found");
            }

            order.Status = status;
            order.UpdatedAt = DateTime.UtcNow;

            if (status == "completed")
            {
                order.CompletedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        public async Task<string> GenerateOrderNumberAsync(Guid outletId)
        {
            var today = DateTime.UtcNow.Date;
            var todayOrdersCount = await _context.Orders
                .CountAsync(o => o.OutletId == outletId && o.CreatedAt.Date == today);

            var datePart = DateTime.UtcNow.ToString("yyyyMMdd");
            var sequenceNumber = (todayOrdersCount + 1).ToString("D4");

            return $"{datePart}{sequenceNumber}";
        }
    }
}
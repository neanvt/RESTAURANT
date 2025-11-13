using API.Data;
using API.Models.DTOs;
using API.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class OrderController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IOrderService _orderService;
        private readonly IKOTService _kotService;
        private readonly IOutletService _outletService;

        public OrderController(
            ApplicationDbContext context,
            IOrderService orderService,
            IKOTService kotService,
            IOutletService outletService)
        {
            _context = context;
            _orderService = orderService;
            _kotService = kotService;
            _outletService = outletService;
        }

        [HttpGet]
        public async Task<IActionResult> GetOrders([FromQuery] OrderFilterDto filter)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var query = _context.Orders
                .Where(o => o.OutletId == currentOutlet.Id)
                .Include(o => o.OrderItems)
                .Include(o => o.Creator)
                .AsQueryable();

            if (!string.IsNullOrEmpty(filter.Status))
            {
                query = query.Where(o => o.Status == filter.Status);
            }

            if (!string.IsNullOrEmpty(filter.PaymentStatus))
            {
                query = query.Where(o => o.PaymentStatus == filter.PaymentStatus);
            }

            if (filter.DateFrom.HasValue)
            {
                query = query.Where(o => o.CreatedAt.Date >= filter.DateFrom.Value.Date);
            }

            if (filter.DateTo.HasValue)
            {
                query = query.Where(o => o.CreatedAt.Date <= filter.DateTo.Value.Date);
            }

            if (!string.IsNullOrEmpty(filter.Search))
            {
                query = query.Where(o =>
                    o.OrderNumber.Contains(filter.Search) ||
                    (o.CustomerName != null && o.CustomerName.Contains(filter.Search)) ||
                    (o.CustomerPhone != null && o.CustomerPhone.Contains(filter.Search)));
            }

            var orders = await query
                .OrderByDescending(o => o.CreatedAt)
                .Skip((filter.Page - 1) * filter.PageSize)
                .Take(filter.PageSize)
                .ToListAsync();

            var totalCount = await query.CountAsync();

            var result = orders.Select(o => new
            {
                id = o.Id,
                orderNumber = o.OrderNumber,
                items = o.OrderItems.Select(oi => new
                {
                    itemId = oi.ItemId,
                    name = oi.Name,
                    price = oi.UnitPrice,
                    quantity = oi.Quantity,
                    total = oi.Total,
                    notes = oi.Notes
                }),
                pricing = new
                {
                    subtotal = o.Subtotal,
                    taxAmount = o.TaxAmount,
                    total = o.TotalAmount
                },
                status = o.Status,
                paymentStatus = o.PaymentStatus,
                paymentMethod = o.PaymentMethod,
                customer = new
                {
                    name = o.CustomerName,
                    phone = o.CustomerPhone,
                    address = o.CustomerAddress
                },
                tableNumber = o.TableNumber,
                notes = o.Notes,
                createdBy = new
                {
                    id = o.Creator.Id,
                    name = o.Creator.Name ?? o.Creator.Phone
                },
                createdAt = o.CreatedAt,
                updatedAt = o.UpdatedAt,
                completedAt = o.CompletedAt
            });

            return Ok(new
            {
                success = true,
                data = result,
                pagination = new
                {
                    page = filter.Page,
                    pageSize = filter.PageSize,
                    totalCount,
                    totalPages = (int)Math.Ceiling(totalCount / (double)filter.PageSize)
                }
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderDto dto)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var userIdClaim = User.FindFirst("userId")?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            {
                return Unauthorized(new { success = false, error = new { code = "UNAUTHORIZED", message = "User not authenticated" } });
            }

            try
            {
                var order = await _orderService.CreateOrderAsync(dto, currentOutlet.Id, userId);
                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, new
                {
                    success = true,
                    data = new
                    {
                        id = order.Id,
                        orderNumber = order.OrderNumber,
                        items = order.OrderItems.Select(oi => new
                        {
                            itemId = oi.ItemId,
                            name = oi.Name,
                            price = oi.UnitPrice,
                            quantity = oi.Quantity,
                            tax = new { rate = oi.TaxRate, amount = oi.TaxAmount },
                            subtotal = oi.Subtotal,
                            total = oi.Total,
                            notes = oi.Notes
                        }),
                        pricing = new
                        {
                            subtotal = order.Subtotal,
                            taxAmount = order.TaxAmount,
                            total = order.TotalAmount
                        },
                        status = order.Status,
                        paymentStatus = order.PaymentStatus,
                        customer = new
                        {
                            name = order.CustomerName,
                            phone = order.CustomerPhone,
                            address = order.CustomerAddress
                        },
                        tableNumber = order.TableNumber,
                        notes = order.Notes,
                        createdAt = order.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = new { code = "ORDER_CREATION_FAILED", message = ex.Message } });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetOrder(Guid id)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .Include(o => o.Creator)
                .Include(o => o.KOTs)
                .FirstOrDefaultAsync(o => o.Id == id && o.OutletId == currentOutlet.Id);

            if (order == null)
            {
                return NotFound(new { success = false, error = new { code = "ORDER_NOT_FOUND", message = "Order not found" } });
            }

            return Ok(new
            {
                success = true,
                data = new
                {
                    id = order.Id,
                    orderNumber = order.OrderNumber,
                    items = order.OrderItems.Select(oi => new
                    {
                        itemId = oi.ItemId,
                        name = oi.Name,
                        price = oi.UnitPrice,
                        quantity = oi.Quantity,
                        tax = new { rate = oi.TaxRate, amount = oi.TaxAmount },
                        subtotal = oi.Subtotal,
                        total = oi.Total,
                        notes = oi.Notes
                    }),
                    pricing = new
                    {
                        subtotal = order.Subtotal,
                        taxAmount = order.TaxAmount,
                        total = order.TotalAmount
                    },
                    status = order.Status,
                    paymentStatus = order.PaymentStatus,
                    paymentMethod = order.PaymentMethod,
                    customer = new
                    {
                        name = order.CustomerName,
                        phone = order.CustomerPhone,
                        address = order.CustomerAddress
                    },
                    tableNumber = order.TableNumber,
                    kots = order.KOTs.Select(k => new
                    {
                        id = k.Id,
                        kotNumber = k.KOTNumber,
                        status = k.Status,
                        isPrinted = k.IsPrinted,
                        createdAt = k.CreatedAt
                    }),
                    notes = order.Notes,
                    createdBy = new
                    {
                        id = order.Creator.Id,
                        name = order.Creator.Name ?? order.Creator.Phone
                    },
                    createdAt = order.CreatedAt,
                    updatedAt = order.UpdatedAt,
                    completedAt = order.CompletedAt
                }
            });
        }

        [HttpPost("{id}/kot")]
        public async Task<IActionResult> GenerateKOT(Guid id)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            try
            {
                var result = await _kotService.GenerateKOTAsync(id, currentOutlet.Id);
                return Ok(new
                {
                    success = true,
                    message = "KOT generated successfully",
                    data = new
                    {
                        kot = new
                        {
                            id = result.KOT.Id,
                            kotNumber = result.KOT.KOTNumber,
                            status = result.KOT.Status,
                            isPrinted = result.KOT.IsPrinted,
                            createdAt = result.KOT.CreatedAt
                        },
                        order = new
                        {
                            id = result.Order.Id,
                            orderNumber = result.Order.OrderNumber,
                            status = result.Order.Status
                        }
                    }
                });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, error = new { code = "KOT_GENERATION_FAILED", message = ex.Message } });
            }
        }

        [HttpPost("{id}/hold")]
        public async Task<IActionResult> HoldOrder(Guid id)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.OutletId == currentOutlet.Id);

            if (order == null)
            {
                return NotFound(new { success = false, error = new { code = "ORDER_NOT_FOUND", message = "Order not found" } });
            }

            if (order.Status != "draft")
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_STATUS", message = "Order cannot be held" } });
            }

            order.Status = "on_hold";
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Order held successfully" });
        }

        [HttpPost("{id}/complete")]
        public async Task<IActionResult> CompleteOrder(Guid id, [FromBody] CompleteOrderDto dto)
        {
            var currentOutlet = await _outletService.GetCurrentOutletAsync(User);
            if (currentOutlet == null)
            {
                return BadRequest(new { success = false, error = new { code = "NO_OUTLET", message = "No outlet selected" } });
            }

            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.Id == id && o.OutletId == currentOutlet.Id);

            if (order == null)
            {
                return NotFound(new { success = false, error = new { code = "ORDER_NOT_FOUND", message = "Order not found" } });
            }

            if (order.Status != "kot_generated")
            {
                return BadRequest(new { success = false, error = new { code = "INVALID_STATUS", message = "Order must have KOT generated first" } });
            }

            order.Status = "completed";
            order.PaymentStatus = "paid";
            order.PaymentMethod = dto.PaymentMethod;
            order.CompletedAt = DateTime.UtcNow;
            order.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { success = true, message = "Order completed successfully" });
        }
    }
}
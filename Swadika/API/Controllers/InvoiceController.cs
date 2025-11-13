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
    public class InvoiceController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public InvoiceController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetInvoices(
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] string? paymentStatus = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var query = _context.Invoices
                    .Include(i => i.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .AsQueryable();

                if (dateFrom.HasValue)
                    query = query.Where(i => i.CreatedAt >= dateFrom.Value);

                if (dateTo.HasValue)
                    query = query.Where(i => i.CreatedAt <= dateTo.Value);

                if (!string.IsNullOrEmpty(paymentStatus))
                    query = query.Where(i => i.PaymentStatus == paymentStatus);

                var totalInvoices = await query.CountAsync();
                var invoices = await query
                    .OrderByDescending(i => i.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    invoices,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalInvoices,
                        totalPages = (int)Math.Ceiling(totalInvoices / (double)pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving invoices", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetInvoice(Guid id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (invoice == null)
                    return NotFound(new { message = "Invoice not found" });

                return Ok(invoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving invoice", error = ex.Message });
            }
        }

        [HttpPost("generate/{orderId}")]
        public async Task<IActionResult> GenerateInvoice(Guid orderId, [FromBody] GenerateInvoiceDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(o => o.Id == orderId);

                if (order == null)
                    return NotFound(new { message = "Order not found" });

                // Check if invoice already exists
                var existingInvoice = await _context.Invoices
                    .FirstOrDefaultAsync(i => i.OrderId == orderId);

                if (existingInvoice != null)
                    return BadRequest(new { message = "Invoice already exists for this order" });

                var invoice = new Invoice
                {
                    OrderId = orderId,
                    InvoiceNumber = await GenerateInvoiceNumberAsync(),
                    Subtotal = order.Subtotal,
                    TaxAmount = order.TaxAmount,
                    TotalAmount = order.TotalAmount,
                    PaymentMethod = dto.PaymentMethod,
                    PaymentStatus = "paid",
                    QRCodeUrl = GenerateQRCodeUrl(order.TotalAmount, order.OrderNumber),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Invoices.Add(invoice);
                await _context.SaveChangesAsync();

                return Ok(new { invoiceId = invoice.Id, message = "Invoice generated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating invoice", error = ex.Message });
            }
        }

        [HttpGet("print/{id}")]
        public async Task<IActionResult> PrintInvoice(Guid id)
        {
            try
            {
                var invoice = await _context.Invoices
                    .Include(i => i.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(i => i.Id == id);

                if (invoice == null)
                    return NotFound(new { message = "Invoice not found" });

                // Generate printable invoice format
                var printData = new
                {
                    invoiceId = invoice.Id,
                    invoiceNumber = invoice.InvoiceNumber,
                    orderNumber = invoice.Order?.OrderNumber,
                    customerName = invoice.Order?.CustomerName,
                    customerPhone = invoice.Order?.CustomerPhone,
                    items = invoice.Order?.OrderItems.Select(oi => new
                    {
                        name = oi.Item?.Name,
                        quantity = oi.Quantity,
                        price = oi.Item?.Price,
                        total = oi.Quantity * (oi.Item?.Price ?? 0)
                    }),
                    subtotal = invoice.Subtotal,
                    taxAmount = invoice.TaxAmount,
                    total = invoice.TotalAmount,
                    paymentMethod = invoice.PaymentMethod,
                    qrCodeUrl = invoice.QRCodeUrl,
                    createdAt = invoice.CreatedAt
                };

                return Ok(printData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating invoice print data", error = ex.Message });
            }
        }

        [HttpPut("{id}/payment-status")]
        public async Task<IActionResult> UpdatePaymentStatus(Guid id, [FromBody] UpdatePaymentStatusDto dto)
        {
            try
            {
                var invoice = await _context.Invoices.FindAsync(id);
                if (invoice == null)
                    return NotFound(new { message = "Invoice not found" });

                invoice.PaymentStatus = dto.PaymentStatus;
                invoice.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(invoice);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating payment status", error = ex.Message });
            }
        }

        private async Task<string> GenerateInvoiceNumberAsync()
        {
            var today = DateTime.UtcNow.Date;
            var datePart = today.ToString("yyyyMMdd");

            var lastInvoice = await _context.Invoices
                .Where(i => i.CreatedAt.Date == today)
                .OrderByDescending(i => i.InvoiceNumber)
                .FirstOrDefaultAsync();

            var sequenceNumber = 1;
            if (lastInvoice != null && lastInvoice.InvoiceNumber.StartsWith(datePart))
            {
                var lastSequence = lastInvoice.InvoiceNumber.Substring(datePart.Length);
                if (int.TryParse(lastSequence, out var seq))
                    sequenceNumber = seq + 1;
            }

            return $"{datePart}{sequenceNumber:D3}";
        }

        private string GenerateQRCodeUrl(decimal amount, string orderNumber)
        {
            // Generate UPI QR code URL
            // This is a simplified implementation
            return $"upi://pay?pa=merchant@upi&pn=Restaurant&am={amount}&cu=INR&tn=Order-{orderNumber}";
        }
    }

    public class GenerateInvoiceDto
    {
        public string PaymentMethod { get; set; } = string.Empty; // cash, card, upi, etc.
    }

    public class UpdatePaymentStatusDto
    {
        public string PaymentStatus { get; set; } = string.Empty; // pending, paid, refunded
    }
}
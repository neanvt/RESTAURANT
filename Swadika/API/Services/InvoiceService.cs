using System.Text;
using API.Data;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;

namespace API.Services
{
    public class InvoiceService : IInvoiceService
    {
        private readonly ApplicationDbContext _context;

        public InvoiceService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Invoice>> GetAllInvoicesAsync()
        {
            return await _context.Invoices
                .Include(i => i.Order)
                .ThenInclude(o => o.Customer)
                .Include(i => i.Order.OrderItems)
                .ThenInclude(oi => oi.Item)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<Invoice?> GetInvoiceByIdAsync(Guid id)
        {
            return await _context.Invoices
                .Include(i => i.Order)
                .ThenInclude(o => o.Customer)
                .Include(i => i.Order.OrderItems)
                .ThenInclude(oi => oi.Item)
                .FirstOrDefaultAsync(i => i.Id == id);
        }

        public async Task<Invoice?> GetInvoiceByNumberAsync(string invoiceNumber)
        {
            return await _context.Invoices
                .Include(i => i.Order)
                .ThenInclude(o => o.Customer)
                .Include(i => i.Order.OrderItems)
                .ThenInclude(oi => oi.Item)
                .FirstOrDefaultAsync(i => i.InvoiceNumber == invoiceNumber);
        }

        public async Task<Invoice> CreateInvoiceFromOrderAsync(Guid orderId)
        {
            var order = await _context.Orders
                .Include(o => o.Customer)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
                .Include(o => o.Outlet)
                .FirstOrDefaultAsync(o => o.Id == orderId);

            if (order == null)
            {
                throw new KeyNotFoundException("Order not found.");
            }

            if (order.Status != "completed")
            {
                throw new InvalidOperationException("Can only create invoice for completed orders.");
            }

            // Check if invoice already exists for this order
            var existingInvoice = await _context.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId);
            if (existingInvoice != null)
            {
                throw new InvalidOperationException("Invoice already exists for this order.");
            }

            // Generate invoice number
            var invoiceNumber = await GenerateInvoiceNumberAsync();

            var invoice = new Invoice
            {
                Id = Guid.NewGuid(),
                InvoiceNumber = invoiceNumber,
                OrderId = orderId,
                CustomerId = order.CustomerId,
                OutletId = order.OutletId,
                Subtotal = order.Subtotal,
                TaxAmount = order.TaxAmount,
                DiscountAmount = order.DiscountAmount,
                TotalAmount = order.TotalAmount,
                Status = "unpaid",
                DueDate = DateTime.UtcNow.AddDays(30),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Invoices.Add(invoice);
            await _context.SaveChangesAsync();

            return invoice;
        }

        public async Task<Invoice> UpdateInvoiceAsync(Guid id, InvoiceUpdateDto invoiceDto)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                throw new KeyNotFoundException("Invoice not found.");
            }

            invoice.Status = invoiceDto.Status ?? invoice.Status;
            invoice.DueDate = invoiceDto.DueDate;
            invoice.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<bool> DeleteInvoiceAsync(Guid id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                return false;
            }

            // Only allow deletion of unpaid invoices
            if (invoice.Status == "paid")
            {
                throw new InvalidOperationException("Cannot delete paid invoices.");
            }

            _context.Invoices.Remove(invoice);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _context.Invoices
                .Include(i => i.Order)
                .ThenInclude(o => o.Customer)
                .Where(i => i.CreatedAt >= from && i.CreatedAt <= to)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Invoice>> GetInvoicesByCustomerAsync(Guid customerId)
        {
            return await _context.Invoices
                .Include(i => i.Order)
                .ThenInclude(o => o.Customer)
                .Where(i => i.CustomerId == customerId)
                .OrderByDescending(i => i.CreatedAt)
                .ToListAsync();
        }

        public async Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId)
        {
            var invoice = await GetInvoiceByIdAsync(invoiceId);
            if (invoice == null)
            {
                throw new KeyNotFoundException("Invoice not found.");
            }
            // Render using QuestPDF
            var doc = new InvoiceDocument(invoice);
            await using var ms = new MemoryStream();
            doc.GeneratePdf(ms);
            return ms.ToArray();
        }

        public async Task<Invoice> MarkAsPaidAsync(Guid id)
        {
            var invoice = await _context.Invoices.FindAsync(id);
            if (invoice == null)
            {
                throw new KeyNotFoundException("Invoice not found.");
            }

            invoice.Status = "paid";
            invoice.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return invoice;
        }

        public async Task<decimal> GetTotalRevenueAsync(DateTime from, DateTime to)
        {
            return await _context.Invoices
                .Where(i => i.Status == "paid" && i.CreatedAt >= from && i.CreatedAt <= to)
                .SumAsync(i => i.TotalAmount);
        }

        public async Task<InvoiceStatsDto> GetInvoiceStatsAsync(DateTime from, DateTime to)
        {
            var invoices = await _context.Invoices
                .Where(i => i.CreatedAt >= from && i.CreatedAt <= to)
                .ToListAsync();

            return new InvoiceStatsDto
            {
                TotalInvoices = invoices.Count,
                PaidInvoices = invoices.Count(i => i.Status == "paid"),
                UnpaidInvoices = invoices.Count(i => i.Status == "unpaid"),
                OverdueInvoices = invoices.Count(i => i.Status == "unpaid" && i.DueDate < DateTime.UtcNow),
                TotalRevenue = invoices.Where(i => i.Status == "paid").Sum(i => i.TotalAmount),
                PendingAmount = invoices.Where(i => i.Status == "unpaid").Sum(i => i.TotalAmount)
            };
        }

        private async Task<string> GenerateInvoiceNumberAsync()
        {
            var today = DateTime.UtcNow;
            var datePrefix = today.ToString("yyyyMMdd");

            // Get the last invoice number for today
            var lastInvoice = await _context.Invoices
                .Where(i => i.InvoiceNumber.StartsWith($"INV-{datePrefix}"))
                .OrderByDescending(i => i.InvoiceNumber)
                .FirstOrDefaultAsync();

            int sequenceNumber = 1;
            if (lastInvoice != null)
            {
                var lastSequence = lastInvoice.InvoiceNumber.Split('-').Last();
                if (int.TryParse(lastSequence, out int seq))
                {
                    sequenceNumber = seq + 1;
                }
            }

            return $"INV-{datePrefix}-{sequenceNumber:D4}";
        }
    }
}
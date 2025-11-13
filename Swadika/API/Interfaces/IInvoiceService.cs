using API.Models.DTOs;
using API.Models.Entities;

namespace API.Models.Interfaces
{
    public interface IInvoiceService
    {
        Task<IEnumerable<Invoice>> GetAllInvoicesAsync();
        Task<Invoice?> GetInvoiceByIdAsync(Guid id);
        Task<Invoice?> GetInvoiceByNumberAsync(string invoiceNumber);
        Task<Invoice> CreateInvoiceFromOrderAsync(Guid orderId);
        Task<Invoice> UpdateInvoiceAsync(Guid id, InvoiceUpdateDto invoiceDto);
        Task<bool> DeleteInvoiceAsync(Guid id);
        Task<IEnumerable<Invoice>> GetInvoicesByDateRangeAsync(DateTime from, DateTime to);
        Task<IEnumerable<Invoice>> GetInvoicesByCustomerAsync(Guid customerId);
        Task<byte[]> GenerateInvoicePdfAsync(Guid invoiceId);
        Task<Invoice> MarkAsPaidAsync(Guid id);
        Task<decimal> GetTotalRevenueAsync(DateTime from, DateTime to);
        Task<InvoiceStatsDto> GetInvoiceStatsAsync(DateTime from, DateTime to);
    }
}
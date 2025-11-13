using API.Models.DTOs;
using API.Models.Entities;

namespace API.Models.Interfaces
{
    public interface ICustomerService
    {
        Task<IEnumerable<Customer>> GetAllCustomersAsync();
        Task<Customer?> GetCustomerByIdAsync(Guid id);
        Task<Customer?> GetCustomerByPhoneAsync(string phone);
        Task<Customer> CreateCustomerAsync(CustomerCreateDto customerDto);
        Task<Customer> UpdateCustomerAsync(Guid id, CustomerUpdateDto customerDto);
        Task<bool> DeleteCustomerAsync(Guid id);
        Task<IEnumerable<Customer>> SearchCustomersAsync(string searchTerm);
        Task<IEnumerable<Customer>> GetTopCustomersAsync(int count = 10);
        Task<CustomerOrderHistoryDto> GetCustomerOrderHistoryAsync(Guid customerId);
        Task<bool> CustomerExistsAsync(string phone, Guid? excludeId = null);
    }
}
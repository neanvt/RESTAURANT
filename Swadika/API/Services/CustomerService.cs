using API.Data;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.AspNetCore.Mvc.ModelBinding;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class CustomerService : ICustomerService
    {
        private readonly ApplicationDbContext _context;

        public CustomerService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Customer>> GetAllCustomersAsync()
        {
            return await _context.Customers
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<Customer?> GetCustomerByIdAsync(Guid id)
        {
            return await _context.Customers
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Customer?> GetCustomerByPhoneAsync(string phone)
        {
            return await _context.Customers
                .FirstOrDefaultAsync(c => c.Phone == phone);
        }

        public async Task<Customer> CreateCustomerAsync(CustomerCreateDto customerDto)
        {
            // Check if customer with this phone already exists
            if (await CustomerExistsAsync(customerDto.Phone))
            {
                throw new InvalidOperationException("A customer with this phone number already exists.");
            }

            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                Name = customerDto.Name,
                Phone = customerDto.Phone,
                Email = customerDto.Email,
                Address = customerDto.Address,
                DateOfBirth = customerDto.DateOfBirth,
                Gender = customerDto.Gender,
                IsActive = true,
                TotalOrders = 0,
                TotalSpent = 0,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Customers.Add(customer);
            await _context.SaveChangesAsync();

            return customer;
        }

        public async Task<Customer> UpdateCustomerAsync(Guid id, CustomerUpdateDto customerDto)
        {
            var customer = await _context.Customers.FindAsync(id);
            if (customer == null)
            {
                throw new KeyNotFoundException("Customer not found.");
            }

            // Check if phone number is being changed and if it already exists
            if (customer.Phone != customerDto.Phone && await CustomerExistsAsync(customerDto.Phone, id))
            {
                throw new InvalidOperationException("A customer with this phone number already exists.");
            }

            customer.Name = customerDto.Name;
            customer.Phone = customerDto.Phone;
            customer.Email = customerDto.Email;
            customer.Address = customerDto.Address;
            customer.DateOfBirth = customerDto.DateOfBirth;
            customer.Gender = customerDto.Gender;
            customer.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return customer;
        }

        public async Task<bool> DeleteCustomerAsync(Guid id)
        {
            var customer = await _context.Customers
                .Include(c => c.Orders)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (customer == null)
            {
                return false;
            }

            // Check if customer has orders
            if (customer.Orders.Any())
            {
                // Soft delete - just mark as inactive
                customer.IsActive = false;
                customer.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
                return true;
            }

            // Hard delete if no orders
            _context.Customers.Remove(customer);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Customer>> SearchCustomersAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllCustomersAsync();
            }

            return await _context.Customers
                .Where(c => c.IsActive &&
                           ((c.Name != null && c.Name.Contains(searchTerm)) ||
                            (c.Phone != null && c.Phone.Contains(searchTerm)) ||
                            (c.Email != null && c.Email.Contains(searchTerm))))
                .OrderByDescending(c => c.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Customer>> GetTopCustomersAsync(int count = 10)
        {
            return await _context.Customers
                .Where(c => c.IsActive)
                .OrderByDescending(c => c.TotalSpent)
                .Take(count)
                .ToListAsync();
        }

        public async Task<CustomerOrderHistoryDto> GetCustomerOrderHistoryAsync(Guid customerId)
        {
            var customer = await _context.Customers
                .Include(c => c.Orders)
                .ThenInclude(o => o.OrderItems)
                .ThenInclude(oi => oi.Item)
                .FirstOrDefaultAsync(c => c.Id == customerId);

            if (customer == null)
            {
                throw new KeyNotFoundException("Customer not found.");
            }

            var orders = customer.Orders
                .OrderByDescending(o => o.CreatedAt)
                .Select(o => new OrderSummaryDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    TotalAmount = o.TotalAmount,
                    Status = o.Status,
                    CreatedAt = o.CreatedAt,
                    ItemCount = o.OrderItems.Sum(oi => oi.Quantity)
                })
                .ToList();

            return new CustomerOrderHistoryDto
            {
                CustomerId = customer.Id,
                CustomerName = customer.Name ?? "Cash Customer",
                Phone = customer.Phone ?? string.Empty,
                TotalOrders = customer.TotalOrders,
                TotalSpent = customer.TotalSpent,
                LastOrderDate = orders.FirstOrDefault()?.CreatedAt ?? DateTime.MinValue,
                Orders = orders
            };
        }

        public async Task<bool> CustomerExistsAsync(string phone, Guid? excludeId = null)
        {
            var query = _context.Customers.Where(c => c.Phone == phone);

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
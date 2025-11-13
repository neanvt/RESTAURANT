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
    public class CustomerController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CustomerController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomers(
            [FromQuery] string? search = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var query = _context.Customers.Where(c => c.IsActive);

                if (!string.IsNullOrEmpty(search))
                {
                    query = query.Where(c =>
                        (c.Name != null && c.Name.Contains(search)) ||
                        (c.Phone != null && c.Phone.Contains(search)) ||
                        (c.Email != null && c.Email.Contains(search)));
                }

                var totalCustomers = await query.CountAsync();
                var customers = await query
                    .OrderByDescending(c => c.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    customers,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalCustomers,
                        totalPages = (int)Math.Ceiling(totalCustomers / (double)pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving customers", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetCustomer(Guid id)
        {
            try
            {
                var customer = await _context.Customers
                    .FirstOrDefaultAsync(c => c.Id == id && c.IsActive);

                if (customer == null)
                    return NotFound(new { message = "Customer not found" });

                return Ok(customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving customer", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateCustomer([FromBody] CreateCustomerDto dto)
        {
            try
            {
                var customer = new Customer
                {
                    Name = dto.Name,
                    Phone = dto.Phone,
                    Email = dto.Email,
                    Address = dto.Address,
                    IsActive = true,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Customers.Add(customer);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetCustomer), new { id = customer.Id }, customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating customer", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCustomer(Guid id, [FromBody] UpdateCustomerDto dto)
        {
            try
            {
                var customer = await _context.Customers.FindAsync(id);
                if (customer == null || !customer.IsActive)
                    return NotFound(new { message = "Customer not found" });

                customer.Name = dto.Name ?? customer.Name;
                customer.Phone = dto.Phone ?? customer.Phone;
                customer.Email = dto.Email ?? customer.Email;
                customer.Address = dto.Address ?? customer.Address;
                customer.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(customer);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating customer", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCustomer(Guid id)
        {
            try
            {
                var customer = await _context.Customers.FindAsync(id);
                if (customer == null)
                    return NotFound(new { message = "Customer not found" });

                customer.IsActive = false;
                customer.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Customer deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting customer", error = ex.Message });
            }
        }

        [HttpGet("search")]
        public async Task<IActionResult> SearchCustomers([FromQuery] string query)
        {
            try
            {
                if (string.IsNullOrEmpty(query))
                    return BadRequest(new { message = "Search query is required" });

                var customers = await _context.Customers
                    .Where(c => c.IsActive && (
                        (c.Name != null && c.Name.Contains(query)) ||
                        (c.Phone != null && c.Phone.Contains(query)) ||
                        (c.Email != null && c.Email.Contains(query))))
                    .OrderBy(c => c.Name)
                    .Take(10)
                    .ToListAsync();

                return Ok(customers);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error searching customers", error = ex.Message });
            }
        }
    }

    public class CreateCustomerDto
    {
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string? Email { get; set; }
        public string? Address { get; set; }
    }

    public class UpdateCustomerDto
    {
        public string? Name { get; set; }
        public string? Phone { get; set; }
        public string? Email { get; set; }
        public string? Address { get; set; }
    }
}
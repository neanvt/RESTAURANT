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
    public class KOTController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public KOTController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetKOTs(
            [FromQuery] string? status = null,
            [FromQuery] DateTime? dateFrom = null,
            [FromQuery] DateTime? dateTo = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var query = _context.KOTs
                    .Include(k => k.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .AsQueryable();

                if (!string.IsNullOrEmpty(status))
                    query = query.Where(k => k.Status == status);

                if (dateFrom.HasValue)
                    query = query.Where(k => k.CreatedAt >= dateFrom.Value);

                if (dateTo.HasValue)
                    query = query.Where(k => k.CreatedAt <= dateTo.Value);

                var totalKOTs = await query.CountAsync();
                var kots = await query
                    .OrderByDescending(k => k.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    kots,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalKOTs,
                        totalPages = (int)Math.Ceiling(totalKOTs / (double)pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving KOTs", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetKOT(Guid id)
        {
            try
            {
                var kot = await _context.KOTs
                    .Include(k => k.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(k => k.Id == id);

                if (kot == null)
                    return NotFound(new { message = "KOT not found" });

                return Ok(kot);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving KOT", error = ex.Message });
            }
        }

        [HttpPost("generate/{orderId}")]
        public async Task<IActionResult> GenerateKOT(Guid orderId)
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

                var kot = new KOT
                {
                    OrderId = orderId,
                    Status = "pending",
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.KOTs.Add(kot);
                await _context.SaveChangesAsync();

                return Ok(new { kotId = kot.Id, message = "KOT generated successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating KOT", error = ex.Message });
            }
        }

        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateKOTStatus(Guid id, [FromBody] UpdateKOTStatusDto dto)
        {
            try
            {
                var kot = await _context.KOTs.FindAsync(id);
                if (kot == null)
                    return NotFound(new { message = "KOT not found" });

                kot.Status = dto.Status;
                kot.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(kot);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating KOT status", error = ex.Message });
            }
        }

        [HttpGet("print/{id}")]
        public async Task<IActionResult> PrintKOT(Guid id)
        {
            try
            {
                var kot = await _context.KOTs
                    .Include(k => k.Order)
                    .ThenInclude(o => o.OrderItems)
                    .ThenInclude(oi => oi.Item)
                    .FirstOrDefaultAsync(k => k.Id == id);

                if (kot == null)
                    return NotFound(new { message = "KOT not found" });

                // Generate printable KOT format
                var printData = new
                {
                    kotId = kot.Id,
                    orderNumber = kot.Order?.OrderNumber,
                    items = kot.Order?.OrderItems.Select(oi => new
                    {
                        name = oi.Item?.Name,
                        quantity = oi.Quantity,
                        notes = oi.Notes
                    }),
                    createdAt = kot.CreatedAt,
                    status = kot.Status
                };

                return Ok(printData);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error generating KOT print data", error = ex.Message });
            }
        }
    }

    public class UpdateKOTStatusDto
    {
        public string Status { get; set; } = string.Empty; // pending, preparing, ready, completed
    }
}
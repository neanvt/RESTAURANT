using System.Security.Claims;
using API.Data;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ItemController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IItemService _itemService;

        public ItemController(ApplicationDbContext context, IItemService itemService)
        {
            _context = context;
            _itemService = itemService;
        }

        [HttpGet]
        public async Task<IActionResult> GetItems(
            [FromQuery] string? category = null,
            [FromQuery] string? search = null,
            [FromQuery] bool? available = null,
            [FromQuery] bool? favourite = null,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 20)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var query = _context.Items
                    .Include(i => i.CategoryNavigation)
                    .Where(i => i.IsActive);

                if (!string.IsNullOrEmpty(category))
                    query = query.Where(i => i.CategoryId == Guid.Parse(category));

                if (!string.IsNullOrEmpty(search))
                    query = query.Where(i => i.Name.Contains(search) || (i.Description != null && i.Description.Contains(search)));

                if (available.HasValue)
                    query = query.Where(i => i.IsAvailable == available.Value);

                if (favourite.HasValue && favourite.Value)
                    query = query.Where(i => i.IsFavourite);

                var totalItems = await query.CountAsync();
                var items = await query
                    .OrderBy(i => i.Name)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                return Ok(new
                {
                    items,
                    pagination = new
                    {
                        page,
                        pageSize,
                        totalItems,
                        totalPages = (int)Math.Ceiling(totalItems / (double)pageSize)
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving items", error = ex.Message });
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetItem(Guid id)
        {
            try
            {
                var item = await _context.Items
                    .Include(i => i.CategoryNavigation)
                    .FirstOrDefaultAsync(i => i.Id == id && i.IsActive);

                if (item == null)
                    return NotFound(new { message = "Item not found" });

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error retrieving item", error = ex.Message });
            }
        }

        [HttpPost]
        public async Task<IActionResult> CreateItem([FromBody] CreateItemDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                var item = new Item
                {
                    Name = dto.Name,
                    Description = dto.Description,
                    CategoryId = Guid.Parse(dto.CategoryId),
                    Price = dto.Price,
                    TaxApplicable = dto.TaxApplicable,
                    TaxRate = dto.TaxRate,
                    TaxType = dto.TaxType,
                    TrackInventory = dto.TrackInventory,
                    CurrentStock = dto.CurrentStock,
                    LowStockAlert = dto.LowStockAlert,
                    IsAvailable = dto.IsAvailable,
                    AiPrompt = dto.AiPrompt,
                    IsAiGenerated = !string.IsNullOrEmpty(dto.AiPrompt),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Items.Add(item);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetItem), new { id = item.Id }, item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error creating item", error = ex.Message });
            }
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateItem(Guid id, [FromBody] UpdateItemDto dto)
        {
            try
            {
                var item = await _context.Items.FindAsync(id);
                if (item == null || !item.IsActive)
                    return NotFound(new { message = "Item not found" });

                item.Name = dto.Name ?? item.Name;
                item.Description = dto.Description ?? item.Description;
                item.CategoryId = !string.IsNullOrEmpty(dto.CategoryId) ? Guid.Parse(dto.CategoryId) : item.CategoryId;
                item.Price = dto.Price ?? item.Price;
                item.TaxApplicable = dto.TaxApplicable ?? item.TaxApplicable;
                item.TaxRate = dto.TaxRate ?? item.TaxRate;
                item.TaxType = dto.TaxType ?? item.TaxType;
                item.TrackInventory = dto.TrackInventory ?? item.TrackInventory;
                item.CurrentStock = dto.CurrentStock ?? item.CurrentStock;
                item.LowStockAlert = dto.LowStockAlert ?? item.LowStockAlert;
                item.IsAvailable = dto.IsAvailable ?? item.IsAvailable;
                item.AiPrompt = dto.AiPrompt ?? item.AiPrompt;
                item.IsAiGenerated = !string.IsNullOrEmpty(dto.AiPrompt);
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating item", error = ex.Message });
            }
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteItem(Guid id)
        {
            try
            {
                var item = await _context.Items.FindAsync(id);
                if (item == null)
                    return NotFound(new { message = "Item not found" });

                item.IsActive = false;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(new { message = "Item deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error deleting item", error = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-favourite")]
        public async Task<IActionResult> ToggleFavourite(Guid id)
        {
            try
            {
                var item = await _context.Items.FindAsync(id);
                if (item == null || !item.IsActive)
                    return NotFound(new { message = "Item not found" });

                item.IsFavourite = !item.IsFavourite;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating item", error = ex.Message });
            }
        }

        [HttpPut("{id}/toggle-availability")]
        public async Task<IActionResult> ToggleAvailability(Guid id)
        {
            try
            {
                var item = await _context.Items.FindAsync(id);
                if (item == null || !item.IsActive)
                    return NotFound(new { message = "Item not found" });

                item.IsAvailable = !item.IsAvailable;
                item.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                return Ok(item);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error updating item", error = ex.Message });
            }
        }
    }

    public class CreateItemDto
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public string CategoryId { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public bool TaxApplicable { get; set; } = false;
        public decimal TaxRate { get; set; } = 0;
        public string TaxType { get; set; } = "percentage";
        public bool TrackInventory { get; set; } = false;
        public int CurrentStock { get; set; } = 0;
        public int LowStockAlert { get; set; } = 10;
        public bool IsAvailable { get; set; } = true;
        public string? AiPrompt { get; set; }
    }

    public class UpdateItemDto
    {
        public string? Name { get; set; }
        public string? Description { get; set; }
        public string? CategoryId { get; set; }
        public decimal? Price { get; set; }
        public bool? TaxApplicable { get; set; }
        public decimal? TaxRate { get; set; }
        public string? TaxType { get; set; }
        public bool? TrackInventory { get; set; }
        public int? CurrentStock { get; set; }
        public int? LowStockAlert { get; set; }
        public bool? IsAvailable { get; set; }
        public string? AiPrompt { get; set; }
    }
}
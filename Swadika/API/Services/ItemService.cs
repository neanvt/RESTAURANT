using API.Data;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class ItemService : IItemService
    {
        private readonly ApplicationDbContext _context;

        public ItemService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Item> CreateItemAsync(Item item)
        {
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            _context.Items.Add(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<Item?> GetItemByIdAsync(Guid id)
        {
            return await _context.Items
                .FirstOrDefaultAsync(i => i.Id == id && i.IsActive);
        }

        public async Task<IEnumerable<Item>> GetItemsAsync(string? category = null, string? search = null, bool? available = null)
        {
            var query = _context.Items.Where(i => i.IsActive);

            if (!string.IsNullOrEmpty(category))
                query = query.Where(i => i.CategoryId == Guid.Parse(category));

            if (!string.IsNullOrEmpty(search))
                query = query.Where(i => i.Name.Contains(search) || (i.Description != null && i.Description.Contains(search)));

            if (available.HasValue)
                query = query.Where(i => i.IsAvailable == available.Value);

            return await query.OrderBy(i => i.Name).ToListAsync();
        }

        public async Task UpdateItemAsync(Item item)
        {
            item.UpdatedAt = DateTime.UtcNow;
            _context.Items.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteItemAsync(Guid id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item != null)
            {
                item.IsActive = false;
                item.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task ToggleFavouriteAsync(Guid id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item != null)
            {
                item.IsFavourite = !item.IsFavourite;
                item.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task ToggleAvailabilityAsync(Guid id)
        {
            var item = await _context.Items.FindAsync(id);
            if (item != null)
            {
                item.IsAvailable = !item.IsAvailable;
                item.UpdatedAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<Item>> GetItemsByCategoryAsync(Guid categoryId)
        {
            return await _context.Items
                .Where(i => i.CategoryId == categoryId && i.IsActive)
                .OrderBy(i => i.Name)
                .ToListAsync();
        }

        public async Task<bool> ItemExistsAsync(string name, Guid? excludeId = null)
        {
            var query = _context.Items.Where(i => i.Name.ToLower() == name.ToLower() && i.IsActive);
            if (excludeId.HasValue)
            {
                query = query.Where(i => i.Id != excludeId.Value);
            }
            return await query.AnyAsync();
        }
    }
}
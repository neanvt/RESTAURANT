using API.Data;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace API.Services
{
    public class CategoryService : ICategoryService
    {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Category>> GetAllCategoriesAsync()
        {
            return await _context.Categories
                .Include(c => c.Outlet)
                .OrderBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<Category?> GetCategoryByIdAsync(Guid id)
        {
            return await _context.Categories
                .Include(c => c.Outlet)
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Category> CreateCategoryAsync(CategoryCreateDto categoryDto)
        {
            // Check if category name already exists for this outlet
            if (await CategoryExistsAsync(categoryDto.Name))
            {
                throw new InvalidOperationException("A category with this name already exists.");
            }

            var category = new Category
            {
                Id = Guid.NewGuid(),
                Name = categoryDto.Name,
                Description = categoryDto.Description,
                ImageUrl = categoryDto.ImageUrl,
                IsActive = categoryDto.IsActive,
                SortOrder = categoryDto.SortOrder ?? 0,
                OutletId = categoryDto.OutletId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return category;
        }

        public async Task<Category> UpdateCategoryAsync(Guid id, CategoryUpdateDto categoryDto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
            {
                throw new KeyNotFoundException("Category not found.");
            }

            // Check if category name already exists for this outlet (excluding current category)
            if (await CategoryExistsAsync(categoryDto.Name, id))
            {
                throw new InvalidOperationException("A category with this name already exists.");
            }

            category.Name = categoryDto.Name;
            category.Description = categoryDto.Description;
            category.ImageUrl = categoryDto.ImageUrl;
            category.IsActive = categoryDto.IsActive;
            category.SortOrder = categoryDto.SortOrder ?? category.SortOrder;
            category.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return category;
        }

        public async Task<bool> DeleteCategoryAsync(Guid id)
        {
            var category = await _context.Categories
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (category == null)
            {
                return false;
            }

            // Check if category has items
            if (category.Items.Any())
            {
                throw new InvalidOperationException("Cannot delete category that contains items. Please reassign or remove items first.");
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Category>> GetCategoriesByOutletAsync(Guid outletId)
        {
            return await _context.Categories
                .Where(c => c.OutletId == outletId)
                .Include(c => c.Items)
                .OrderBy(c => c.SortOrder)
                .ThenBy(c => c.Name)
                .ToListAsync();
        }

        public async Task<bool> CategoryExistsAsync(string name, Guid? excludeId = null)
        {
            var query = _context.Categories.Where(c => c.Name.ToLower() == name.ToLower());

            if (excludeId.HasValue)
            {
                query = query.Where(c => c.Id != excludeId.Value);
            }

            return await query.AnyAsync();
        }
    }
}
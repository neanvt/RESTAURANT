using API.Models.DTOs;
using API.Models.Entities;

namespace API.Models.Interfaces
{
    public interface ICategoryService
    {
        Task<IEnumerable<Category>> GetAllCategoriesAsync();
        Task<Category?> GetCategoryByIdAsync(Guid id);
        Task<Category> CreateCategoryAsync(CategoryCreateDto categoryDto);
        Task<Category> UpdateCategoryAsync(Guid id, CategoryUpdateDto categoryDto);
        Task<bool> DeleteCategoryAsync(Guid id);
        Task<IEnumerable<Category>> GetCategoriesByOutletAsync(Guid outletId);
        Task<bool> CategoryExistsAsync(string name, Guid? excludeId = null);
    }
}
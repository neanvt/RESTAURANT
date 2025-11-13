using API.Models.DTOs;
using API.Models.Entities;

namespace API.Models.Interfaces
{
    public interface IItemService
    {
        Task<Item> CreateItemAsync(Item item);
        Task<Item?> GetItemByIdAsync(Guid id);
        Task<IEnumerable<Item>> GetItemsAsync(string? category = null, string? search = null, bool? available = null);
        Task UpdateItemAsync(Item item);
        Task DeleteItemAsync(Guid id);
        Task ToggleFavouriteAsync(Guid id);
        Task ToggleAvailabilityAsync(Guid id);
        Task<IEnumerable<Item>> GetItemsByCategoryAsync(Guid categoryId);
        Task<bool> ItemExistsAsync(string name, Guid? excludeId = null);
    }
}
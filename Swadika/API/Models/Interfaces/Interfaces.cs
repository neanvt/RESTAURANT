using System.Linq.Expressions;
using System.Security.Claims;
using API.Models.DTOs;
using API.Models.Entities;

namespace API.Models.Interfaces
{
    // Generic Repository Interface
    public interface IRepository<T> where T : class
    {
        Task<T?> GetByIdAsync(Guid id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
        Task<int> CountAsync(Expression<Func<T, bool>>? predicate = null);
    }

    // Auth Service Interface
    public interface IAuthService
    {
        Task<bool> ValidatePhoneNumberAsync(string phone);
        Task<User> FindOrCreateUserAsync(string phone, string? name = null);
        Task<User> CreateUserAsync(string phone, string? name = null, string? email = null, string? password = null);
        Task<User?> GetUserByIdAsync(Guid userId);
        Task<TokenResult> GenerateTokensAsync(User user);
        Task<TokenResult> RefreshTokensAsync(string refreshToken);
    }

    public class TokenResult
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
    }

    // Order Service Interface
    public interface IOrderService
    {
        Task<Order> CreateOrderAsync(CreateOrderDto dto, Guid outletId, Guid userId);
        Task<Order> GetOrderByIdAsync(Guid orderId, Guid outletId);
        Task UpdateOrderStatusAsync(Guid orderId, string status);
        Task<string> GenerateOrderNumberAsync(Guid outletId);
    }

    // Outlet Service Interface
    public interface IOutletService
    {
        Task<Outlet> CreateOutletAsync(CreateOutletDto dto, Guid ownerId);
        Task<Outlet> UpdateOutletAsync(Guid outletId, CreateOutletDto dto, Guid ownerId);
        Task<Outlet?> GetOutletByIdAsync(Guid outletId, Guid ownerId);
        Task<IEnumerable<Outlet>> GetOutletsByOwnerAsync(Guid ownerId);
        Task<Outlet?> GetCurrentOutletAsync(ClaimsPrincipal user);
        Task SetCurrentOutletAsync(Guid userId, Guid outletId);
    }

    // KOT Service Interface
    public interface IKOTService
    {
        Task<(KOT KOT, Order Order)> GenerateKOTAsync(Guid orderId, Guid outletId);
        Task UpdateKOTStatusAsync(Guid kotId, string status);
        Task PrintKOTAsync(Guid kotId);
    }

    // OTP Service Interface
    // NOTE: IOtpService removed - OTP/Firebase authentication has been removed.
}
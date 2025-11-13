using System.Security.Claims;
using API.Models.DTOs;
using API.Models.Entities;
using API.Models.Interfaces;

namespace API.Services
{
    public class OutletService : IOutletService
    {
        public Task<Outlet> CreateOutletAsync(CreateOutletDto dto, Guid ownerId)
        {
            // TODO: Implement outlet creation
            throw new NotImplementedException();
        }

        public Task<Outlet?> GetCurrentOutletAsync(ClaimsPrincipal user)
        {
            // TODO: Get current outlet from user claims/context
            // For now, return a dummy outlet
            return Task.FromResult<Outlet?>(new Outlet
            {
                Id = Guid.NewGuid(),
                BusinessName = "Test Outlet",
                OwnerId = Guid.NewGuid()
            });
        }

        public Task<Outlet?> GetOutletByIdAsync(Guid outletId, Guid ownerId)
        {
            // TODO: Implement outlet retrieval
            throw new NotImplementedException();
        }

        public Task<IEnumerable<Outlet>> GetOutletsByOwnerAsync(Guid ownerId)
        {
            // TODO: Implement outlets retrieval
            return Task.FromResult(Enumerable.Empty<Outlet>());
        }

        public Task SetCurrentOutletAsync(Guid userId, Guid outletId)
        {
            // TODO: Set current outlet for user
            return Task.CompletedTask;
        }

        public Task<Outlet> UpdateOutletAsync(Guid outletId, CreateOutletDto dto, Guid ownerId)
        {
            // TODO: Implement outlet update
            throw new NotImplementedException();
        }
    }
}
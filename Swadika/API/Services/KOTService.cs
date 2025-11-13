using API.Models.Entities;
using API.Models.Interfaces;

namespace API.Services
{
    public class KOTService : IKOTService
    {
        public Task<(KOT KOT, Order Order)> GenerateKOTAsync(Guid orderId, Guid outletId)
        {
            // TODO: Implement KOT generation logic
            throw new NotImplementedException();
        }

        public Task PrintKOTAsync(Guid kotId)
        {
            // TODO: Implement KOT printing logic
            return Task.CompletedTask;
        }

        public Task UpdateKOTStatusAsync(Guid kotId, string status)
        {
            // TODO: Implement KOT status update
            return Task.CompletedTask;
        }
    }
}
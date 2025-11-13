using System.Text.Json;
using API.Data;
using API.Models.Entities;
using API.Models.Interfaces;
using Microsoft.EntityFrameworkCore;
// OpenAI removed - image generation disabled

namespace API.Services
{
    public class AIService : IAIService
    {
        private readonly ApplicationDbContext _context;
        public AIService(ApplicationDbContext context)
        {
            _context = context;
        }

        // Image generation removed. Other AI helpers remain as placeholders until implemented.
        public async Task<string> EnhanceDescriptionAsync(string description)
        {
            // Image generation removed; text helpers are not implemented yet.
            return await Task.FromResult(description);
        }

        public async Task<string[]> SuggestItemNamesAsync(string category, string[]? existingNames = null)
        {
            // Placeholder suggestions until AI text features are added back
            return await Task.FromResult(new string[] { $"{category} Special", $"Classic {category}", $"Premium {category}" });
        }

        public async Task<object> AnalyzeSalesTrendsAsync(DateTime dateFrom, DateTime dateTo)
        {
            // Not implemented: return a placeholder
            return await Task.FromResult(new { Message = "Sales trend analysis not yet implemented" });
        }

        public async Task<object> PredictDemandAsync(Guid itemId, int daysAhead = 7)
        {
            // Not implemented: return a placeholder
            return await Task.FromResult(new { Message = "Demand prediction not yet implemented" });
        }
    }
}
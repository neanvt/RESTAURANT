namespace API.Models.Interfaces
{
    public interface IAIService
    {
        Task<string> EnhanceDescriptionAsync(string description);
        Task<string[]> SuggestItemNamesAsync(string category, string[]? existingNames = null);
        Task<object> AnalyzeSalesTrendsAsync(DateTime dateFrom, DateTime dateTo);
        Task<object> PredictDemandAsync(Guid itemId, int daysAhead = 7);
    }
}
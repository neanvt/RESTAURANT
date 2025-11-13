using System.Security.Claims;
using API.Models.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/ai")]
    [Authorize]
    public class AIServiceController : ControllerBase
    {
        private readonly IAIService _aiService;

        public AIServiceController(IAIService aiService)
        {
            _aiService = aiService;
        }

        // Image generation endpoint removed as requested

        [HttpPost("enhance-description")]
        public async Task<IActionResult> EnhanceDescription([FromBody] EnhanceDescriptionDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                if (string.IsNullOrEmpty(dto.Description))
                    return BadRequest(new { message = "Description is required" });

                var enhancedDescription = await _aiService.EnhanceDescriptionAsync(dto.Description);

                return Ok(new
                {
                    success = true,
                    originalDescription = dto.Description,
                    enhancedDescription,
                    message = "Description enhanced successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error enhancing description",
                    error = ex.Message
                });
            }
        }

        [HttpPost("suggest-names")]
        public async Task<IActionResult> SuggestItemNames([FromBody] SuggestNamesDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                if (string.IsNullOrEmpty(dto.Category))
                    return BadRequest(new { message = "Category is required" });

                var suggestions = await _aiService.SuggestItemNamesAsync(dto.Category, dto.ExistingNames);

                return Ok(new
                {
                    success = true,
                    category = dto.Category,
                    suggestions,
                    message = "Name suggestions generated successfully"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error generating name suggestions",
                    error = ex.Message
                });
            }
        }

        [HttpPost("analyze-trends")]
        public async Task<IActionResult> AnalyzeTrends([FromQuery] DateTime? dateFrom = null, [FromQuery] DateTime? dateTo = null)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                dateFrom ??= DateTime.UtcNow.AddDays(-30);
                dateTo ??= DateTime.UtcNow;

                var analysis = await _aiService.AnalyzeSalesTrendsAsync(dateFrom.Value, dateTo.Value);

                return Ok(new
                {
                    success = true,
                    dateFrom,
                    dateTo,
                    analysis,
                    message = "Sales trend analysis completed"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error analyzing sales trends",
                    error = ex.Message
                });
            }
        }

        [HttpPost("predict-demand")]
        public async Task<IActionResult> PredictDemand([FromBody] PredictDemandDto dto)
        {
            try
            {
                var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return Unauthorized();

                if (dto.ItemId == Guid.Empty)
                    return BadRequest(new { message = "Item ID is required" });

                var prediction = await _aiService.PredictDemandAsync(dto.ItemId, dto.DaysAhead);

                return Ok(new
                {
                    success = true,
                    itemId = dto.ItemId,
                    daysAhead = dto.DaysAhead,
                    prediction,
                    message = "Demand prediction completed"
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new
                {
                    success = false,
                    message = "Error predicting demand",
                    error = ex.Message
                });
            }
        }
    }

    // GenerateImageDto removed

    public class EnhanceDescriptionDto
    {
        public string Description { get; set; } = string.Empty;
    }

    public class SuggestNamesDto
    {
        public string Category { get; set; } = string.Empty;
        public string[]? ExistingNames { get; set; }
    }

    public class PredictDemandDto
    {
        public Guid ItemId { get; set; }
        public int DaysAhead { get; set; } = 7;
    }
}
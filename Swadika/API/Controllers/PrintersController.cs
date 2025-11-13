using System;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [ApiController]
    [Route("api/printers")]
    public class PrintersController : ControllerBase
    {
        // Printer status endpoint. Requires authentication.
        [HttpGet("status")]
        [Authorize]
        public IActionResult GetPrinterStatus()
        {
            try
            {
                // Example expanded response. In a real implementation this would query
                // printer service/DB to determine actual status and available printers.
                var now = DateTime.UtcNow;
                var response = new
                {
                    status = "online",
                    checkedAt = now,
                    defaultPrinterId = "printer-1",
                    supportedFormats = new[] { "ESC/POS", "PDF" },
                    printers = new[] {
                        new { id = "printer-1", name = "Kitchen Printer", isDefault = true, isOnline = true, lastSeen = now.AddSeconds(-5) },
                        new { id = "printer-2", name = "Receipt Printer", isDefault = false, isOnline = false, lastSeen = now.AddMinutes(-23) }
                    }
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { status = "error", error = ex.Message });
            }
        }
    }
}

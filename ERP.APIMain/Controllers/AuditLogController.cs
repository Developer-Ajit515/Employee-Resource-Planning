using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace ERP.APIMain.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AuditLogController : ControllerBase
    {
        private readonly IAuditLogService _service;

        public AuditLogController(IAuditLogService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(
            CancellationToken cancellationToken)
        {
            var logs = await _service.GetAllAsync(cancellationToken);
            return Ok(logs);
        }

        [HttpGet("{id:long}")]
        public async Task<IActionResult> GetById(
            long id,
            CancellationToken cancellationToken)
        {
            var log = await _service.GetByIdAsync(
                id, cancellationToken);

            if (log == null)
            {
                return NotFound(new
                {
                    message = "Audit log not found."
                });
            }

            return Ok(log);
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(
            [FromQuery] string? search,
            [FromQuery] string? action,
            [FromQuery] string? entityName,
            [FromQuery] int? userId,
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            CancellationToken cancellationToken)
        {
            if (fromDate.HasValue &&
                toDate.HasValue &&
                fromDate.Value > toDate.Value)
            {
                return BadRequest(new
                {
                    message = "fromDate must be earlier than toDate."
                });
            }

            // The upper date boundary is exclusive.
            // For a date-only toDate, include the entire selected day.
            DateTime? exclusiveToDate = toDate?.Date.AddDays(1);

            var logs = await _service.SearchAsync(
                search,
                action,
                entityName,
                userId,
                fromDate,
                exclusiveToDate,
                cancellationToken);

            return Ok(logs);
        }
    }
}

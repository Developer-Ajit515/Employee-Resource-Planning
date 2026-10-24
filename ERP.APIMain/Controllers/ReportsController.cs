using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ERP.APIMain.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    //[Authorize]
    public class ReportsController : ControllerBase
    {
        private readonly IReportService _reportService;

        public ReportsController(IReportService reportService)
        {
            _reportService = reportService;
        }

        // GET: /api/Reports/summary
        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var result = await _reportService.GetSummaryAsync();
            return Ok(result);
        }

        // GET: /api/Reports/tasks
        [HttpGet("tasks")]
        public async Task<IActionResult> GetTaskReport(
            [FromQuery] DateTime? fromDate,
            [FromQuery] DateTime? toDate,
            [FromQuery] string? status,
            [FromQuery] string? priority,
            [FromQuery] int? projectId)
        {
            if (fromDate.HasValue &&
                toDate.HasValue &&
                fromDate.Value.Date > toDate.Value.Date)
            {
                return BadRequest(new
                {
                    message = "fromDate cannot be later than toDate."
                });
            }

            var result = await _reportService.GetTaskReportAsync(
                fromDate, toDate, status, priority, projectId);

            return Ok(result);
        }

        // GET: /api/Reports/projects
        [HttpGet("projects")]
        public async Task<IActionResult> GetProjectReport()
        {
            var result = await _reportService.GetProjectReportAsync();
            return Ok(result);
        }

        // GET: /api/Reports/employees
        [HttpGet("employees")]
        public async Task<IActionResult> GetEmployeeReport()
        {
            var result = await _reportService.GetEmployeeReportAsync();
            return Ok(result);
        }
    }
}
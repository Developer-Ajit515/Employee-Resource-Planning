using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.Dtos.Notifications;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace ERP.APIMain.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class NotificationController : ControllerBase
    {
        private readonly INotificationService _service;

        public NotificationController(INotificationService service)
        {
            _service = service;
        }

        private bool TryGetUserId(out int userId)
        {
            var claim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("id")?.Value;

            return int.TryParse(claim, out userId);
        }

        // GET api/Notification/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var count = await _service.GetUnreadCountAsync(userId);

            return Ok(new { count });
        }

        // GET api/Notification?page=1&pageSize=10&isRead=false&search=task
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] bool? isRead = null,
            [FromQuery] string? search = null)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var result = await _service.GetNotificationsAsync(
                userId, page, pageSize, isRead, search);

            return Ok(new
            {
                items = result.Items,
                page = Math.Max(1, page),
                pageSize = Math.Clamp(pageSize, 1, 100),
                totalCount = result.TotalCount,
                totalPages = result.TotalPages,
                unreadCount = result.UnreadCount
            });
        }

        // GET api/Notification/5
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var item = await _service.GetByIdAsync(userId, id);

            if (item == null)
                return NotFound(new { message = "Notification not found." });

            return Ok(item);
        }

        // POST api/Notification
        // Admin can create a notification for a specified user.
        [HttpPost]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Create(
            [FromBody] CreateNotificationDto dto)
        {
            if (!TryGetUserId(out _))
                return Unauthorized();

            var item = await _service.CreateAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = item.Id },
                item);
        }

        // PUT api/Notification/5/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var success = await _service.MarkAsReadAsync(userId, id);

            if (!success)
                return NotFound(new { message = "Notification not found." });

            return Ok(new { message = "Notification marked as read." });
        }

        // PUT api/Notification/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var count = await _service.MarkAllAsReadAsync(userId);

            return Ok(new
            {
                message = "Notifications marked as read.",
                updatedCount = count
            });
        }

        // DELETE api/Notification/5
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id)
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var success = await _service.DeleteAsync(userId, id);

            if (!success)
                return NotFound(new { message = "Notification not found." });

            return Ok(new { message = "Notification deleted." });
        }

        // DELETE api/Notification/read
        [HttpDelete("read")]
        public async Task<IActionResult> DeleteRead()
        {
            if (!TryGetUserId(out var userId))
                return Unauthorized();

            var count = await _service.DeleteReadAsync(userId);

            return Ok(new
            {
                message = "Read notifications deleted.",
                deletedCount = count
            });
        }
    }
}
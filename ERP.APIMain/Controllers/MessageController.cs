
using ERP.DOMAINMODELS.Dtos;
using ERP.DOMAINMODELS.Entities;
using ERP.INFRASTRUCTUREDATA.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace ERP.APIMain.Controllers
{
    [Route("api/[controller]")]
    [ApiController]

    public class MessageController : ControllerBase
    {
        private readonly AppDbContext _context;

        public MessageController(AppDbContext context)
        {
            _context = context;
        }

        // Get logged-in user's ID from JWT claims.
        private bool TryGetUserId(out int userId)
        {
            var userIdClaim =
                User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("id")?.Value;

            return int.TryParse(userIdClaim, out userId);
        }

        // GET: api/Message/inbox
        [HttpGet("inbox")]
        public async Task<IActionResult> GetInbox()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid user ID in token." });

            var messages = await (
                from message in _context.Messages.AsNoTracking()
                join sender in _context.Users.AsNoTracking()
                    on message.SenderId equals sender.Id
                where message.ReceiverId == userId
                orderby message.CreatedAt descending
                select new
                {
                    message.Id,
                    message.SenderId,
                    message.ReceiverId,
                    SenderName = sender.Name,
                    ReceiverName = "",
                    message.Subject,
                    Body = message.Content,
                    Content = message.Content,
                    message.IsRead,
                    message.CreatedAt
                }
            ).ToListAsync();
            Console.WriteLine($"Logged-in User ID: {userId}");

            return Ok(messages);
        }

        // GET: api/Message/sent
        [HttpGet("sent")]
        public async Task<IActionResult> GetSentMessages()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid user ID in token." });

            var messages = await (
                from message in _context.Messages.AsNoTracking()
                join receiver in _context.Users.AsNoTracking()
                    on message.ReceiverId equals receiver.Id
                where message.SenderId == userId
                orderby message.CreatedAt descending
                select new
                {
                    message.Id,
                    message.SenderId,
                    message.ReceiverId,
                    SenderName = "",
                    ReceiverName = receiver.Name,
                    message.Subject,
                    Body = message.Content,
                    Content = message.Content,
                    message.IsRead,
                    message.CreatedAt
                }
            ).ToListAsync();

            return Ok(messages);
        }

        // GET: api/Message/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid user ID in token." });

            var count = await _context.Messages
                .AsNoTracking()
                .CountAsync(m => m.ReceiverId == userId && !m.IsRead);

            return Ok(new { count });
        }

        // GET: api/Message/{id}
        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetMessage(int id)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid user ID in token." });

            var message = await (
                from m in _context.Messages.AsNoTracking()
                join sender in _context.Users.AsNoTracking()
                    on m.SenderId equals sender.Id
                join receiver in _context.Users.AsNoTracking()
                    on m.ReceiverId equals receiver.Id
                where m.Id == id &&
                      (m.SenderId == userId || m.ReceiverId == userId)
                select new
                {
                    m.Id,
                    m.SenderId,
                    m.ReceiverId,
                    SenderName = sender.Name,
                    ReceiverName = receiver.Name,
                    m.Subject,
                    Body = m.Content,
                    Content = m.Content,
                    m.IsRead,
                    m.CreatedAt
                }
            ).FirstOrDefaultAsync();

            if (message == null)
                return NotFound(new { message = "Message not found." });

            return Ok(message);
        }

        // POST: api/Message/send
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage(
            [FromBody] SendMessageRequest request)
        {
            if (!TryGetUserId(out int senderId))
                return Unauthorized(new { message = "Invalid user ID in token." });

            if (request.ReceiverId <= 0)
                return BadRequest(new { message = "A valid receiver ID is required." });

            if (string.IsNullOrWhiteSpace(request.Subject))
                return BadRequest(new { message = "Subject is required." });

            if (string.IsNullOrWhiteSpace(request.Body))
                return BadRequest(new { message = "Message body is required." });

            if (request.ReceiverId == senderId)
                return BadRequest(new { message = "You cannot send a message to yourself." });

            var receiverExists = await _context.Users
                .AnyAsync(u => u.Id == request.ReceiverId);

            if (!receiverExists)
                return NotFound(new { message = "Receiver user not found." });

            var message = new Message
            {
                SenderId = senderId,
                ReceiverId = request.ReceiverId,
                Subject = request.Subject.Trim(),
                Content = request.Body.Trim(),
                IsRead = false,
                CreatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);
            await _context.SaveChangesAsync();

            return CreatedAtAction(
                nameof(GetMessage),
                new { id = message.Id },
                new
                {
                    message.Id,
                    message.SenderId,
                    message.ReceiverId,
                    message.Subject,
                    Body = message.Content,
                    Content = message.Content,
                    message.IsRead,
                    message.CreatedAt
                });
        }

        // PUT: api/Message/{id}/read
        [HttpPut("{id:int}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            if (!TryGetUserId(out int userId))
                return Unauthorized(new { message = "Invalid user ID in token." });

            var message = await _context.Messages
                .FirstOrDefaultAsync(m =>
                    m.Id == id && m.ReceiverId == userId);

            if (message == null)
                return NotFound(new
                {
                    message = "Message not found in your inbox."
                });

            if (!message.IsRead)
            {
                message.IsRead = true;
                await _context.SaveChangesAsync();
            }

            return Ok(new
            {
                message = "Message marked as read.",
                messageId = message.Id,
                message.IsRead
            });
        }
    }

   
}

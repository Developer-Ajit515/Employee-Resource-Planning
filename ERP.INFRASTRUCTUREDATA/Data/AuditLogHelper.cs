using System.Security.Claims;
using Microsoft.AspNetCore.Http;

namespace ERP.INFRASTRUCTUREDATA.Data
{
    public interface IAuditLogContext
    {
        int? GetUserId();
        string? GetIpAddress();
    }

    public class AuditLogContext : IAuditLogContext
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AuditLogContext(
            IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public int? GetUserId()
        {
            var user = _httpContextAccessor.HttpContext?.User;

            if (user?.Identity?.IsAuthenticated != true)
                return null;

            var value =
                user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value
                ?? user.FindFirst("userId")?.Value;

            return int.TryParse(value, out var userId)
                ? userId
                : null;
        }

        public string? GetIpAddress()
        {
            return _httpContextAccessor.HttpContext?
                .Connection.RemoteIpAddress?
                .ToString();
        }
    }
}
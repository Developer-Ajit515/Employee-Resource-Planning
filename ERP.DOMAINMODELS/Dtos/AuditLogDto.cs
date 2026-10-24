using System;

namespace ERP.DOMAINMODELS.DTOs
{
    public class AuditLogDto
    {
        public long Id { get; set; }

        public int? UserId { get; set; }

        public string Action { get; set; } = string.Empty;

        public string EntityName { get; set; } = string.Empty;

        public string? EntityId { get; set; }

        public string Description { get; set; } = string.Empty;

        public string? OldValues { get; set; }

        public string? NewValues { get; set; }

        public string? IpAddress { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
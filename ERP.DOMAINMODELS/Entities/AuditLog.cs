using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ERP.DOMAINMODELS.Entities
{
    public class AuditLog
    {
        public long Id { get; set; }

        public int? UserId { get; set; }

        public string Action { get; set; } = string.Empty;

        public string EntityName { get; set; }  = string.Empty;

        public string? EntityId { get; set; }

        public string Description { get; set; } = string.Empty;

        public string? OldValues { get; set; }

        public string? NewValues { get; set; }

        public string? IpAddress { get; set; }

        public DateTime CreatedAt { get; set; }
            = DateTime.UtcNow;
    }
}

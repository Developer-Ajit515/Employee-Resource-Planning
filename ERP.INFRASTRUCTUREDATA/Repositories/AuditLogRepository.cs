using ERP.APPLICATION.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.DOMAINMODELS.Entities;
using ERP.INFRASTRUCTUREDATA.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.INFRASTRUCTUREDATA.Repositories
{
    public class AuditLogRepository : IAuditLogRepository
    {
        private readonly AppDbContext _context;

        public AuditLogRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<AuditLog>> GetAllAsync(
            CancellationToken cancellationToken = default)
        {
            return await _context.Set<AuditLog>()
                .AsNoTracking()
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<AuditLog?> GetByIdAsync(
            long id,
            CancellationToken cancellationToken = default)
        {
            return await _context.Set<AuditLog>()
                .AsNoTracking()
                .FirstOrDefaultAsync(
                    x => x.Id == id,
                    cancellationToken);
        }

        public async Task<List<AuditLog>> SearchAsync(
            string? search,
            string? action,
            string? entityName,
            int? userId,
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default)
        {
            IQueryable<AuditLog> query =
                _context.Set<AuditLog>().AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                string term = search.Trim();

                query = query.Where(x =>
                    x.Description.Contains(term) ||
                    x.EntityName.Contains(term) ||
                    x.Action.Contains(term) ||
                    (x.EntityId != null && x.EntityId.Contains(term)));
            }

            if (!string.IsNullOrWhiteSpace(action))
            {
                query = query.Where(x => x.Action == action);
            }

            if (!string.IsNullOrWhiteSpace(entityName))
            {
                query = query.Where(x => x.EntityName == entityName);
            }

            if (userId.HasValue)
            {
                query = query.Where(x => x.UserId == userId.Value);
            }

            if (fromDate.HasValue)
            {
                query = query.Where(x =>
                    x.CreatedAt >= fromDate.Value);
            }

            if (toDate.HasValue)
            {
                query = query.Where(x =>
                    x.CreatedAt < toDate.Value);
            }

            return await query
                .OrderByDescending(x => x.CreatedAt)
                .ToListAsync(cancellationToken);
        }

        public async Task<AuditLog> AddAsync(
            AuditLog auditLog,
            CancellationToken cancellationToken = default)
        {
            auditLog.CreatedAt = DateTime.UtcNow;

            await _context.Set<AuditLog>()
                .AddAsync(auditLog, cancellationToken);

            await _context.SaveChangesAsync(cancellationToken);

            return auditLog;
        }

        public async Task<IEnumerable<AuditLog>> GetRecentAsync(int count = 10, CancellationToken cancellationToken = default)
        {
            return await _context.AuditLogs
        .AsNoTracking()
        .OrderByDescending(x => x.CreatedAt)
        .Take(Math.Max(0, count))
        .ToListAsync(cancellationToken);
        }
    }
}

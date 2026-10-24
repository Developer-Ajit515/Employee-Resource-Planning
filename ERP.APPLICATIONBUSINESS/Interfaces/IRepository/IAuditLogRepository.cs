using ERP.DOMAINMODELS.Entities;

namespace ERP.APPLICATION.Interfaces.IRepository
{
    public interface IAuditLogRepository
    {
        Task<List<AuditLog>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<AuditLog?> GetByIdAsync(
            long id,
            CancellationToken cancellationToken = default);

        Task<IEnumerable<AuditLog>> GetRecentAsync(
    int count = 10,
    CancellationToken cancellationToken = default);

        Task<List<AuditLog>> SearchAsync(
            string? search,
            string? action,
            string? entityName,
            int? userId,
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default);

        Task<AuditLog> AddAsync(
            AuditLog auditLog,
            CancellationToken cancellationToken = default);
    }
}
using ERP.DOMAINMODELS.DTOs;
using ERP.DOMAINMODELS.Entities;

namespace ERP.APPLICATIONBUSINESS.Interfaces.IServices
{
    public interface IAuditLogService
    {
        Task<List<AuditLogDto>> GetAllAsync(
            CancellationToken cancellationToken = default);

        Task<AuditLogDto?> GetByIdAsync(
            long id,
            CancellationToken cancellationToken = default);


        Task<IEnumerable<AuditLogDto>> GetRecentAsync(
            int count = 10,
            CancellationToken cancellationToken = default);

        Task<List<AuditLogDto>> SearchAsync(
            string? search,
            string? action,
            string? entityName,
            int? userId,
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default);

        Task<AuditLogDto> CreateAsync(
            AuditLogDto dto,
            CancellationToken cancellationToken = default);
    }
}
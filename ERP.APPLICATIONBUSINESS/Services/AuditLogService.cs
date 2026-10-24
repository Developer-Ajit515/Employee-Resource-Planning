using ERP.APPLICATION.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.DTOs;
using ERP.DOMAINMODELS.Entities;

namespace ERP.APPLICATIONBUSINESS.Services
{
    public class AuditLogService : IAuditLogService
    {
        private readonly IAuditLogRepository _repository;

        public AuditLogService(
            IAuditLogRepository repository)
        {
            _repository = repository;
        }

        public async Task<List<AuditLogDto>> GetAllAsync(
             CancellationToken cancellationToken = default)
        {
            var logs = await _repository.GetAllAsync(cancellationToken);

            return logs.Select(MapToDto).ToList();
        }

        public async Task<AuditLogDto?> GetByIdAsync(
            long id,
            CancellationToken cancellationToken = default)
        {
            var log = await _repository.GetByIdAsync(
                id, cancellationToken);

            return log == null ? null : MapToDto(log);
        }


        public async Task<List<AuditLogDto>> SearchAsync(
            string? search,
            string? action,
            string? entityName,
            int? userId,
            DateTime? fromDate,
            DateTime? toDate,
            CancellationToken cancellationToken = default)
        {
            var logs = await _repository.SearchAsync(
                search,
                action,
                entityName,
                userId,
                fromDate,
                toDate,
                cancellationToken);

            return logs.Select(MapToDto).ToList();
        }

        public async Task<AuditLogDto> CreateAsync(
            AuditLogDto dto,
            CancellationToken cancellationToken = default)
        {
            var log = new AuditLog
            {
                UserId = dto.UserId,
                Action = dto.Action,
                EntityName = dto.EntityName,
                EntityId = dto.EntityId,
                Description = dto.Description,
                OldValues = dto.OldValues,
                NewValues = dto.NewValues,
                IpAddress = dto.IpAddress,
                CreatedAt = DateTime.UtcNow
            };

            var created = await _repository.AddAsync(
                log, cancellationToken);

            return MapToDto(created);
        }

        private static AuditLogDto MapToDto(AuditLog log)
        {
            return new AuditLogDto
            {
                Id = log.Id,
                UserId = log.UserId,
                Action = log.Action,
                EntityName = log.EntityName,
                EntityId = log.EntityId,
                Description = log.Description,
                OldValues = log.OldValues,
                NewValues = log.NewValues,
                IpAddress = log.IpAddress,
                CreatedAt = log.CreatedAt
            };
        }

        public async Task<IEnumerable<AuditLogDto>> GetRecentAsync(int count = 10, CancellationToken cancellationToken = default)
        {
            var logs = await _repository.GetRecentAsync(
               count, cancellationToken);

            return logs.Select(MapToDto);
        }
    }
}
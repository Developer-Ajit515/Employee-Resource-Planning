using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.Dtos;
using Microsoft.Extensions.Caching.Memory;

public class DashboardService : IDashboardService
{
    private readonly IDashboardRepository _repository;
    private readonly IAuditLogService _auditLogService;
    private readonly IMemoryCache _cache;

    public DashboardService(
        IDashboardRepository repository,
        IAuditLogService auditLogService,
        IMemoryCache cache)
    {
        _repository = repository;
        _auditLogService = auditLogService;
        _cache = cache;
    }

    public async Task<DashboardDto> GetDashboardDataAsync()
    {
        const string cacheKey = "Dashboard_Data";

        var dashboard = await _cache.GetOrCreateAsync(
            cacheKey,
            async entry =>
            {
                entry.AbsoluteExpirationRelativeToNow =
                    TimeSpan.FromMinutes(2);

                var result =
                    await _repository.GetDashboardDataAsync();

                var logs =
                    await _auditLogService.GetRecentAsync(10);

                result.RecentActivities = logs
                    .Select(x => new RecentActivityDto
                    {
                        Type = x.EntityName,
                        Title = x.Action,
                        Description = x.Description,
                        CreatedAt = x.CreatedAt
                    })
                    .ToList();

                return result;
            });

        return dashboard!;
    }
}
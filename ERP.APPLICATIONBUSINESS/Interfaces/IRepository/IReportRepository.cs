using ERP.DOMAINMODELS.Dtos.Reports;

namespace ERP.APPLICATIONBUSINESS.Interfaces.IRepository
{
    public interface IReportRepository
    {
        Task<ReportSummaryDto> GetSummaryAsync();

        Task<List<TaskReportDto>> GetTaskReportAsync(
            DateTime? fromDate,
            DateTime? toDate,
            string? status,
            string? priority,
            int? projectId);

        Task<List<ProjectReportDto>> GetProjectReportAsync();

        Task<List<EmployeeReportDto>> GetEmployeeReportAsync();
    }
}
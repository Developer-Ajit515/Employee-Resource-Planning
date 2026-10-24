using ERP.DOMAINMODELS.Dtos.Reports;

namespace ERP.APPLICATIONBUSINESS.Interfaces.IServices
{
    public interface IReportService
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
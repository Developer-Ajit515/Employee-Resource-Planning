using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.APPLICATIONBUSINESS.Interfaces.IServices;
using ERP.DOMAINMODELS.Dtos.Reports;

namespace ERP.APPLICATIONBUSINESS.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;

        public ReportService(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        public Task<ReportSummaryDto> GetSummaryAsync()
        {
            return _reportRepository.GetSummaryAsync();
        }

        public Task<List<TaskReportDto>> GetTaskReportAsync(
            DateTime? fromDate,
            DateTime? toDate,
            string? status,
            string? priority,
            int? projectId)
        {
            return _reportRepository.GetTaskReportAsync(
                fromDate, toDate, status, priority, projectId);
        }

        public Task<List<ProjectReportDto>> GetProjectReportAsync()
        {
            return _reportRepository.GetProjectReportAsync();
        }

        public Task<List<EmployeeReportDto>> GetEmployeeReportAsync()
        {
            return _reportRepository.GetEmployeeReportAsync();
        }
    }
}
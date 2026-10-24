namespace ERP.DOMAINMODELS.Dtos.Reports
{
    public class ReportSummaryDto
    {
        public int TotalProjects { get; set; }
        public int ActiveProjects { get; set; }

        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int OverdueTasks { get; set; }

        public int TotalEmployees { get; set; }
        public int ActiveEmployees { get; set; }

        public decimal TotalEstimatedHours { get; set; }
        public decimal TotalActualHours { get; set; }
    }
}
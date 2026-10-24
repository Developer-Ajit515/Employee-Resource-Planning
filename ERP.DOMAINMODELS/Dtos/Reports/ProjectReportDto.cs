namespace ERP.DOMAINMODELS.Dtos.Reports
{
    public class ProjectReportDto
    {
        public int ProjectId { get; set; }
        public string ProjectName { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }
        public int OverdueTasks { get; set; }

        public decimal TotalEstimatedHours { get; set; }
        public decimal TotalActualHours { get; set; }

        public decimal CompletionPercentage { get; set; }
    }
}
namespace ERP.DOMAINMODELS.Dtos.Reports
{
    public class TaskReportDto
    {
        public int Id { get; set; }
        public string TaskCode { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;

        public string ProjectName { get; set; } = string.Empty;
        public string EmployeeName { get; set; } = "Unassigned";

        public string Status { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;

        public DateTime? DueDate { get; set; }
        public DateTime? CompletedAt { get; set; }

        public decimal EstimatedHours { get; set; }
        public decimal ActualHours { get; set; }
        public bool IsCompleted { get; set; }
    }
}
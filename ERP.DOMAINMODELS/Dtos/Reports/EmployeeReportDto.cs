namespace ERP.DOMAINMODELS.Dtos.Reports
{
    public class EmployeeReportDto
    {
        public int EmployeeId { get; set; }
        public string EmployeeName { get; set; } = string.Empty;
        public string DepartmentName { get; set; } = string.Empty;
        public string Designation { get; set; } = string.Empty;
        public bool IsActive { get; set; }

        public int TotalTasks { get; set; }
        public int CompletedTasks { get; set; }
        public int PendingTasks { get; set; }

        public decimal TotalEstimatedHours { get; set; }
        public decimal TotalActualHours { get; set; }
    }
}
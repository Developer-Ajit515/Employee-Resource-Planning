using ERP.APPLICATIONBUSINESS.Interfaces.IRepository;
using ERP.DOMAINMODELS.Dtos.Reports;
using ERP.INFRASTRUCTUREDATA.Data;
using Microsoft.EntityFrameworkCore;

namespace ERP.INFRASTRUCTUREDATA.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;

        public ReportRepository(AppDbContext context)
        {
            _context = context;
        }

        // 1. Overall report summary
        public async Task<ReportSummaryDto> GetSummaryAsync()
        {
            var today = DateTime.Today;

            var totalTasks = await _context.ProjectTasks.CountAsync();

            var completedTasks = await _context.ProjectTasks.CountAsync(
                t => t.IsCompleted || t.Status == "Completed");

            var pendingTasks = await _context.ProjectTasks.CountAsync(
                t => !t.IsCompleted && t.Status != "Completed");

            var overdueTasks = await _context.ProjectTasks.CountAsync(
                t => !t.IsCompleted
                     && t.Status != "Completed"
                     && t.DueDate.HasValue
                     && t.DueDate.Value < today);

            return new ReportSummaryDto
            {
                TotalProjects = await _context.Projects.CountAsync(),

                ActiveProjects = await _context.Projects.CountAsync(
                    p => p.IsActive),

                TotalTasks = totalTasks,
                CompletedTasks = completedTasks,
                PendingTasks = pendingTasks,
                OverdueTasks = overdueTasks,

                TotalEmployees = await _context.Employees.CountAsync(),

                ActiveEmployees = await _context.Employees.CountAsync(
                    e => e.Status),

                TotalEstimatedHours = await _context.ProjectTasks
                    .SumAsync(t => (decimal?)t.EstimatedHours) ?? 0,

                TotalActualHours = await _context.ProjectTasks
                    .SumAsync(t => (decimal?)t.ActualHours) ?? 0
            };
        }

        // 2. Task report with filters
        // Date filters are based on DueDate.
        public async Task<List<TaskReportDto>> GetTaskReportAsync(
            DateTime? fromDate,
            DateTime? toDate,
            string? status,
            string? priority,
            int? projectId)
        {
            var query = _context.ProjectTasks
                .AsNoTracking()
                .AsQueryable();

            if (fromDate.HasValue)
            {
                var startDate = fromDate.Value.Date;

                query = query.Where(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value >= startDate);
            }

            if (toDate.HasValue)
            {
                var endDateExclusive = toDate.Value.Date.AddDays(1);

                query = query.Where(t =>
                    t.DueDate.HasValue &&
                    t.DueDate.Value < endDateExclusive);
            }

            if (!string.IsNullOrWhiteSpace(status))
            {
                var selectedStatus = status.Trim();

                query = query.Where(t => t.Status == selectedStatus);
            }

            if (!string.IsNullOrWhiteSpace(priority))
            {
                var selectedPriority = priority.Trim();

                query = query.Where(t => t.Priority == selectedPriority);
            }

            if (projectId.HasValue)
            {
                query = query.Where(t =>
                    t.ProjectId == projectId.Value);
            }

            var result = await (
                from task in query
                join project in _context.Projects
                    on task.ProjectId equals project.Id
                join employee in _context.Employees
                    on task.AssignedToEmployeeId equals (int?)employee.EmployeeId
                    into employeeGroup
                from employee in employeeGroup.DefaultIfEmpty()
                orderby task.DueDate
                select new TaskReportDto
                {
                    Id = task.Id,
                    TaskCode = task.TaskCode,
                    Title = task.Title,

                    ProjectName = project.Name,

                    EmployeeName = employee == null
                        ? "Unassigned"
                        : employee.FirstName + " " + employee.LastName,

                    Status = task.Status,
                    Priority = task.Priority,

                    DueDate = task.DueDate,
                    CompletedAt = task.CompletedAt,

                    EstimatedHours = task.EstimatedHours,
                    ActualHours = task.ActualHours,
                    IsCompleted = task.IsCompleted
                }
            ).ToListAsync();

            return result;
        }

        // 3. Project-wise task report
        public async Task<List<ProjectReportDto>> GetProjectReportAsync()
        {
            var today = DateTime.Today;

            return await _context.Projects
                .AsNoTracking()
                .Select(project => new ProjectReportDto
                {
                    ProjectId = project.Id,
                    ProjectName = project.Name,
                    IsActive = project.IsActive,

                    TotalTasks = project.Tasks.Count(),

                    CompletedTasks = project.Tasks.Count(t =>
                        t.IsCompleted || t.Status == "Completed"),

                    PendingTasks = project.Tasks.Count(t =>
                        !t.IsCompleted && t.Status != "Completed"),

                    OverdueTasks = project.Tasks.Count(t =>
                        !t.IsCompleted
                        && t.Status != "Completed"
                        && t.DueDate.HasValue
                        && t.DueDate.Value < today),

                    TotalEstimatedHours = project.Tasks
                        .Sum(t => (decimal?)t.EstimatedHours) ?? 0,

                    TotalActualHours = project.Tasks
                        .Sum(t => (decimal?)t.ActualHours) ?? 0,

                    CompletionPercentage =
                        project.Tasks.Count() == 0
                            ? 0
                            : Math.Round(
                                project.Tasks.Count(t =>
                                    t.IsCompleted ||
                                    t.Status == "Completed") * 100m
                                / project.Tasks.Count(), 2)
                })
                .OrderBy(p => p.ProjectName)
                .ToListAsync();
        }

        // 4. Employee-wise task report
        public async Task<List<EmployeeReportDto>> GetEmployeeReportAsync()
        {
            return await _context.Employees
                .AsNoTracking()
                .Select(employee => new EmployeeReportDto
                {
                    EmployeeId = employee.EmployeeId,

                    EmployeeName = employee.FirstName
                        + " " + employee.LastName,

                    // Confirm the actual Department property name.
                    DepartmentName = employee.Department != null
                        ? employee.Department.Name
                        : "Unassigned",

                    Designation = employee.Designation,
                    IsActive = employee.Status,

                    TotalTasks = _context.ProjectTasks.Count(t =>
                        t.AssignedToEmployeeId == employee.EmployeeId),

                    CompletedTasks = _context.ProjectTasks.Count(t =>
                        t.AssignedToEmployeeId == employee.EmployeeId
                        && (t.IsCompleted || t.Status == "Completed")),

                    PendingTasks = _context.ProjectTasks.Count(t =>
                        t.AssignedToEmployeeId == employee.EmployeeId
                        && !t.IsCompleted
                        && t.Status != "Completed"),

                    TotalEstimatedHours = _context.ProjectTasks
                        .Where(t =>
                            t.AssignedToEmployeeId == employee.EmployeeId)
                        .Sum(t => (decimal?)t.EstimatedHours) ?? 0,

                    TotalActualHours = _context.ProjectTasks
                        .Where(t =>
                            t.AssignedToEmployeeId == employee.EmployeeId)
                        .Sum(t => (decimal?)t.ActualHours) ?? 0
                })
                .OrderBy(e => e.EmployeeName)
                .ToListAsync();
        }
    }
}
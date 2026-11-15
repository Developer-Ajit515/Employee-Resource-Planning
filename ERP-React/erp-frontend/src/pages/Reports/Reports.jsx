
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import reportService from "../../services/reportService";
import "./Reports.css";

const PAGE_SIZE = 8;

const EMPTY_SUMMARY = {
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0,
    totalEmployees: 0,
    activeEmployees: 0,
    totalEstimatedHours: 0,
    totalActualHours: 0
};

const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.items)) return data.items;
    return [];
};

const number = (value) => Number(value ?? 0);

const formatNumber = (value) =>
    number(value).toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });

const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
};

const escapeCsv = (value) => {
    const text = String(value ?? "");
    return `"${text.replace(/"/g, '""')}"`;
};

function exportCsv(filename, headers, rows) {
    const csv = [
        headers.map(escapeCsv).join(","),
        ...rows.map((row) => row.map(escapeCsv).join(","))
    ].join("\r\n");

    // UTF-8 BOM helps Excel display CSV text correctly.
    const blob = new Blob(["\uFEFF", csv], {
        type: "text/csv;charset=utf-8;"
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
}

function StatCard({ title, value, subtitle, icon, color }) {
    return (
        <div className="report-stat-card">
            <div className={`report-stat-icon ${color}`}>
                <span>{icon}</span>
            </div>

            <div className="report-stat-content">
                <p>{title}</p>
                <h3>{formatNumber(value)}</h3>
                <span>{subtitle}</span>
            </div>
        </div>
    );
}

function StatusBadge({ status }) {
    const normalized = String(status || "Pending").toLowerCase();

    const className = normalized.includes("complete")
        ? "completed"
        : normalized.includes("progress")
        ? "in-progress"
        : normalized.includes("cancel")
        ? "cancelled"
        : normalized.includes("overdue")
        ? "overdue"
        : "pending";

    return (
        <span className={`report-status-badge ${className}`}>
            {status || "Pending"}
        </span>
    );
}

function Reports() {
    const [summary, setSummary] = useState(EMPTY_SUMMARY);
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [employees, setEmployees] = useState([]);

    const [activeTab, setActiveTab] = useState("tasks");
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);

    const [filters, setFilters] = useState({
        fromDate: "",
        toDate: "",
        status: "",
        priority: "",
        projectId: ""
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const loadReports = useCallback(async () => {
        setLoading(true);
        setError("");

        try {
            const [
                summaryResult,
                projectResult,
                employeeResult,
                taskResult
            ] = await Promise.all([
                reportService.getSummary(),
                reportService.getProjects(),
                reportService.getEmployees(),
                reportService.getTasks()
            ]);

            setSummary({
                ...EMPTY_SUMMARY,
                ...(summaryResult?.data ?? summaryResult)
            });

            setProjects(normalizeList(projectResult));
            setEmployees(normalizeList(employeeResult));
            setTasks(normalizeList(taskResult));
        } catch (err) {
            console.error("Reports loading failed:", err);

            setError(
                err.response?.data?.message ||
                "Reports load nahi ho paaye. API, JWT login aur server status check karein."
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadReports();
    }, [loadReports]);

    const updateFilter = (event) => {
        const { name, value } = event.target;

        setFilters((previous) => ({
            ...previous,
            [name]: value
        }));

        setPage(1);
    };

    const applyFilters = async () => {
        if (
            filters.fromDate &&
            filters.toDate &&
            filters.fromDate > filters.toDate
        ) {
            setError("From date, To date se baad nahi ho sakti.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const result = await reportService.getTasks(filters);
            setTasks(normalizeList(result));
            setPage(1);
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Task report fetch nahi ho paayi."
            );
        } finally {
            setLoading(false);
        }
    };

    const resetFilters = async () => {
        setFilters({
            fromDate: "",
            toDate: "",
            status: "",
            priority: "",
            projectId: ""
        });

        setSearch("");
        setPage(1);
        setLoading(true);
        setError("");

        try {
            const result = await reportService.getTasks();
            setTasks(normalizeList(result));
        } catch (err) {
            setError(
                err.response?.data?.message ||
                "Task report reset nahi ho paayi."
            );
        } finally {
            setLoading(false);
        }
    };

    const visibleRows = useMemo(() => {
        const query = search.trim().toLowerCase();

        let rows = [];

        if (activeTab === "tasks") {
            rows = tasks.filter((item) =>
                [
                    item.taskCode,
                    item.title,
                    item.projectName,
                    item.employeeName,
                    item.status,
                    item.priority
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(query)
                )
            );
        } else if (activeTab === "projects") {
            rows = projects.filter((item) =>
                [
                    item.projectName,
                    item.projectId,
                    item.isActive ? "active" : "inactive"
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(query)
                )
            );
        } else {
            rows = employees.filter((item) =>
                [
                    item.employeeName,
                    item.departmentName,
                    item.designation,
                    item.employeeId
                ].some((value) =>
                    String(value ?? "").toLowerCase().includes(query)
                )
            );
        }

        return rows;
    }, [activeTab, tasks, projects, employees, search]);

    const totalPages = Math.max(
        1,
        Math.ceil(visibleRows.length / PAGE_SIZE)
    );

    const currentPage = Math.min(page, totalPages);

    const paginatedRows = visibleRows.slice(
        (currentPage - 1) * PAGE_SIZE,
        currentPage * PAGE_SIZE
    );

    const projectChartData = useMemo(
        () =>
            projects.slice(0, 8).map((project) => ({
                name: project.projectName,
                Completed: number(project.completedTasks),
                Pending: number(project.pendingTasks)
            })),
        [projects]
    );

    const taskStatusData = [
        {
            name: "Completed",
            value: number(summary.completedTasks)
        },
        {
            name: "Pending",
            value: number(summary.pendingTasks)
        },
        {
            name: "Overdue",
            value: number(summary.overdueTasks)
        }
    ];

    const chartColors = ["#16a34a", "#f59e0b", "#dc2626"];

    const exportCurrentReport = () => {
        let headers;
        let rows;

        if (activeTab === "tasks") {
            headers = [
                "Task Code",
                "Title",
                "Project",
                "Employee",
                "Status",
                "Priority",
                "Due Date",
                "Completed At",
                "Estimated Hours",
                "Actual Hours"
            ];

            rows = visibleRows.map((item) => [
                item.taskCode,
                item.title,
                item.projectName,
                item.employeeName,
                item.status,
                item.priority,
                formatDate(item.dueDate),
                formatDate(item.completedAt),
                item.estimatedHours,
                item.actualHours
            ]);
        } else if (activeTab === "projects") {
            headers = [
                "Project ID",
                "Project",
                "Active",
                "Total Tasks",
                "Completed",
                "Pending",
                "Overdue",
                "Completion %",
                "Estimated Hours",
                "Actual Hours"
            ];

            rows = visibleRows.map((item) => [
                item.projectId,
                item.projectName,
                item.isActive ? "Yes" : "No",
                item.totalTasks,
                item.completedTasks,
                item.pendingTasks,
                item.overdueTasks,
                item.completionPercentage,
                item.totalEstimatedHours,
                item.totalActualHours
            ]);
        } else {
            headers = [
                "Employee ID",
                "Employee",
                "Department",
                "Designation",
                "Active",
                "Total Tasks",
                "Completed",
                "Pending",
                "Estimated Hours",
                "Actual Hours"
            ];

            rows = visibleRows.map((item) => [
                item.employeeId,
                item.employeeName,
                item.departmentName,
                item.designation,
                item.isActive ? "Yes" : "No",
                item.totalTasks,
                item.completedTasks,
                item.pendingTasks,
                item.totalEstimatedHours,
                item.totalActualHours
            ]);
        }

        exportCsv(`erp-${activeTab}-report.csv`, headers, rows);
    };

    return (
        <div className="reports-page">
            <div className="reports-page-header">
                <div>
                    <span className="reports-eyebrow">
                        ERP ANALYTICS
                    </span>

                    <h1>Reports & Analytics</h1>

                    <p>
                        Apne ERP ke projects, tasks aur employees ki
                        performance ek jagah dekhein.
                    </p>
                </div>

                <button
                    type="button"
                    className="report-refresh-btn"
                    onClick={loadReports}
                    disabled={loading}
                >
                    <span>↻</span> Refresh
                </button>
            </div>

            {error && (
                <div className="report-error" role="alert">
                    <span>{error}</span>
                    <button
                        type="button"
                        onClick={() => setError("")}
                        aria-label="Dismiss error"
                    >
                        ×
                    </button>
                </div>
            )}

            <div className="report-stats-grid">
                <StatCard
                    title="Total Projects"
                    value={summary.totalProjects}
                    subtitle={`${formatNumber(summary.activeProjects)} active`}
                    icon="▦"
                    color="purple"
                />

                <StatCard
                    title="Total Tasks"
                    value={summary.totalTasks}
                    subtitle={`${formatNumber(summary.pendingTasks)} pending`}
                    icon="☷"
                    color="blue"
                />

                <StatCard
                    title="Completed Tasks"
                    value={summary.completedTasks}
                    subtitle={
                        summary.totalTasks
                            ? `${(
                                number(summary.completedTasks) /
                                number(summary.totalTasks) *
                                100
                            ).toFixed(1)}% completion`
                            : "No tasks available"
                    }
                    icon="✓"
                    color="green"
                />

                <StatCard
                    title="Overdue Tasks"
                    value={summary.overdueTasks}
                    subtitle="Require attention"
                    icon="◷"
                    color="red"
                />

                <StatCard
                    title="Total Employees"
                    value={summary.totalEmployees}
                    subtitle={`${formatNumber(summary.activeEmployees)} active`}
                    icon="♙"
                    color="orange"
                />

                <StatCard
                    title="Actual Hours"
                    value={summary.totalActualHours}
                    subtitle={`${formatNumber(summary.totalEstimatedHours)} estimated`}
                    icon="◴"
                    color="teal"
                />
            </div>

            <div className="reports-charts-grid">
                <section className="report-panel">
                    <div className="report-panel-heading">
                        <div>
                            <h2>Project Performance</h2>
                            <p>Completed vs pending tasks</p>
                        </div>
                    </div>

                    {projectChartData.length ? (
                        <div className="report-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={projectChartData}
                                    margin={{
                                        top: 12,
                                        right: 12,
                                        left: -18,
                                        bottom: 35
                                    }}
                                >
                                    <CartesianGrid
                                        strokeDasharray="3 3"
                                        vertical={false}
                                    />
                                    <XAxis
                                        dataKey="name"
                                        angle={-25}
                                        textAnchor="end"
                                        interval={0}
                                        height={65}
                                        tick={{ fontSize: 11 }}
                                    />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar
                                        dataKey="Completed"
                                        fill="#16a34a"
                                        radius={[4, 4, 0, 0]}
                                    />
                                    <Bar
                                        dataKey="Pending"
                                        fill="#f59e0b"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="report-empty-chart">
                            Project data available nahi hai.
                        </div>
                    )}
                </section>

                <section className="report-panel">
                    <div className="report-panel-heading">
                        <div>
                            <h2>Task Status Overview</h2>
                            <p>Overall task distribution</p>
                        </div>
                    </div>

                    {taskStatusData.some((item) => item.value > 0) ? (
                        <div className="report-chart report-pie-chart">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={taskStatusData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="45%"
                                        innerRadius={55}
                                        outerRadius={90}
                                        paddingAngle={3}
                                    >
                                        {taskStatusData.map((entry, index) => (
                                            <Cell
                                                key={entry.name}
                                                fill={chartColors[index]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    ) : (
                        <div className="report-empty-chart">
                            Task data available nahi hai.
                        </div>
                    )}
                </section>
            </div>

            <section className="report-panel report-data-panel">
                <div className="report-panel-heading report-table-heading">
                    <div>
                        <h2>Detailed Reports</h2>
                        <p>
                            Search, filter aur export your ERP data.
                        </p>
                    </div>

                    <button
                        type="button"
                        className="report-export-btn"
                        onClick={exportCurrentReport}
                        disabled={loading || visibleRows.length === 0}
                    >
                        ↓ Export CSV
                    </button>
                </div>

                <div className="report-tabs">
                    {[
                        ["tasks", "Task Report"],
                        ["projects", "Project Report"],
                        ["employees", "Employee Report"]
                    ].map(([value, label]) => (
                        <button
                            type="button"
                            key={value}
                            className={
                                activeTab === value
                                    ? "report-tab active"
                                    : "report-tab"
                            }
                            onClick={() => {
                                setActiveTab(value);
                                setSearch("");
                                setPage(1);
                            }}
                        >
                            {label}
                        </button>
                    ))}
                </div>

                {activeTab === "tasks" && (
                    <div className="report-filters">
                        <div className="report-filter-field">
                            <label htmlFor="fromDate">Due date from</label>
                            <input
                                id="fromDate"
                                type="date"
                                name="fromDate"
                                value={filters.fromDate}
                                onChange={updateFilter}
                            />
                        </div>

                        <div className="report-filter-field">
                            <label htmlFor="toDate">Due date to</label>
                            <input
                                id="toDate"
                                type="date"
                                name="toDate"
                                value={filters.toDate}
                                onChange={updateFilter}
                            />
                        </div>

                        <div className="report-filter-field">
                            <label htmlFor="status">Status</label>
                            <select
                                id="status"
                                name="status"
                                value={filters.status}
                                onChange={updateFilter}
                            >
                                <option value="">All statuses</option>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Completed">Completed</option>
                            </select>
                        </div>

                        <div className="report-filter-field">
                            <label htmlFor="priority">Priority</label>
                            <select
                                id="priority"
                                name="priority"
                                value={filters.priority}
                                onChange={updateFilter}
                            >
                                <option value="">All priorities</option>
                                <option value="High">High</option>
                                <option value="Medium">Medium</option>
                                <option value="Low">Low</option>
                            </select>
                        </div>

                        <div className="report-filter-field">
                            <label htmlFor="projectId">Project</label>
                            <select
                                id="projectId"
                                name="projectId"
                                value={filters.projectId}
                                onChange={updateFilter}
                            >
                                <option value="">All projects</option>
                                {projects.map((project) => (
                                    <option
                                        key={project.projectId}
                                        value={project.projectId}
                                    >
                                        {project.projectName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="report-filter-actions">
                            <button
                                type="button"
                                onClick={applyFilters}
                                disabled={loading}
                            >
                                Apply
                            </button>

                            <button
                                type="button"
                                className="report-reset-btn"
                                onClick={resetFilters}
                                disabled={loading}
                            >
                                Reset
                            </button>
                        </div>
                    </div>
                )}

                <div className="report-table-toolbar">
                    <span>
                        {formatNumber(visibleRows.length)} records
                    </span>

                    <input
                        type="search"
                        placeholder={`Search ${activeTab}...`}
                        aria-label={`Search ${activeTab}`}
                        value={search}
                        onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }}
                    />
                </div>

                <div className="report-table-wrap">
                    {loading ? (
                        <div className="report-loading">
                            <span className="report-spinner" />
                            <p>Reports load ho rahi hain...</p>
                        </div>
                    ) : (
                        <table className="report-table">
                            <thead>
                                {activeTab === "tasks" ? (
                                    <tr>
                                        <th>Task</th>
                                        <th>Project</th>
                                        <th>Assigned Employee</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                        <th>Due Date</th>
                                        <th>Hours</th>
                                    </tr>
                                ) : activeTab === "projects" ? (
                                    <tr>
                                        <th>Project</th>
                                        <th>State</th>
                                        <th>Total Tasks</th>
                                        <th>Completed</th>
                                        <th>Pending</th>
                                        <th>Overdue</th>
                                        <th>Progress</th>
                                    </tr>
                                ) : (
                                    <tr>
                                        <th>Employee</th>
                                        <th>Department</th>
                                        <th>Designation</th>
                                        <th>Total Tasks</th>
                                        <th>Completed</th>
                                        <th>Pending</th>
                                        <th>Actual Hours</th>
                                    </tr>
                                )}
                            </thead>

                            <tbody>
                                {paginatedRows.map((item, index) => (
                                    <tr
                                        key={
                                            activeTab === "tasks"
                                                ? item.id
                                                : activeTab === "projects"
                                                ? item.projectId
                                                : item.employeeId
                                        }
                                    >
                                        {activeTab === "tasks" ? (
                                            <>
                                                <td>
                                                    <div className="report-primary-cell">
                                                        {item.title}
                                                    </div>
                                                    <small>{item.taskCode}</small>
                                                </td>
                                                <td>{item.projectName}</td>
                                                <td>{item.employeeName || "Unassigned"}</td>
                                                <td>
                                                    <span
                                                        className={`report-priority ${
                                                            String(item.priority).toLowerCase()
                                                        }`}
                                                    >
                                                        {item.priority}
                                                    </span>
                                                </td>
                                                <td>
                                                    <StatusBadge status={item.status} />
                                                </td>
                                                <td>{formatDate(item.dueDate)}</td>
                                                <td>
                                                    {formatNumber(item.actualHours)}
                                                    <small>
                                                        {" "}/ {formatNumber(item.estimatedHours)} est.
                                                    </small>
                                                </td>
                                            </>
                                        ) : activeTab === "projects" ? (
                                            <>
                                                <td>
                                                    <div className="report-primary-cell">
                                                        {item.projectName}
                                                    </div>
                                                    <small>
                                                        ID: {item.projectId}
                                                    </small>
                                                </td>
                                                <td>
                                                    <StatusBadge
                                                        status={item.isActive ? "Active" : "Inactive"}
                                                    />
                                                </td>
                                                <td>{formatNumber(item.totalTasks)}</td>
                                                <td>{formatNumber(item.completedTasks)}</td>
                                                <td>{formatNumber(item.pendingTasks)}</td>
                                                <td>{formatNumber(item.overdueTasks)}</td>
                                                <td>
                                                    <div className="report-progress">
                                                        <div className="report-progress-track">
                                                            <div
                                                                className="report-progress-fill"
                                                                style={{
                                                                    width: `${Math.min(
                                                                        100,
                                                                        Math.max(
                                                                            0,
                                                                            number(item.completionPercentage)
                                                                        )
                                                                    )}%`
                                                                }}
                                                            />
                                                        </div>
                                                        <span>
                                                            {formatNumber(item.completionPercentage)}%
                                                        </span>
                                                    </div>
                                                </td>
                                            </>
                                        ) : (
                                            <>
                                                <td>
                                                    <div className="report-primary-cell">
                                                        {item.employeeName}
                                                    </div>
                                                    <small>ID: {item.employeeId}</small>
                                                </td>
                                                <td>{item.departmentName || "—"}</td>
                                                <td>{item.designation || "—"}</td>
                                                <td>{formatNumber(item.totalTasks)}</td>
                                                <td>{formatNumber(item.completedTasks)}</td>
                                                <td>{formatNumber(item.pendingTasks)}</td>
                                                <td>{formatNumber(item.totalActualHours)}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}

                                {paginatedRows.length === 0 && (
                                    <tr>
                                        <td
                                            colSpan={7}
                                            className="report-empty-row"
                                        >
                                            Koi record nahi mila. Filters ya search change karein.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="report-pagination">
                    <span>
                        Showing{" "}
                        {visibleRows.length === 0
                            ? 0
                            : (currentPage - 1) * PAGE_SIZE + 1}
                        {" "}–{" "}
                        {Math.min(currentPage * PAGE_SIZE, visibleRows.length)}
                        {" "}of {visibleRows.length}
                    </span>

                    <div>
                        <button
                            type="button"
                            disabled={currentPage <= 1 || loading}
                            onClick={() => setPage((value) => Math.max(1, value - 1))}
                        >
                            Previous
                        </button>

                        <span className="report-page-number">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            type="button"
                            disabled={currentPage >= totalPages || loading}
                            onClick={() =>
                                setPage((value) => Math.min(totalPages, value + 1))
                            }
                        >
                            Next
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Reports;

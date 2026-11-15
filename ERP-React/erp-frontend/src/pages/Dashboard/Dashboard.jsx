import { useEffect, useState } from "react";
import {
    FaUsers,
    FaUserTie,
    FaProjectDiagram,
    FaTasks,
    FaCheckCircle,
    FaClock,
    FaUserCheck,
    FaBuilding,
    FaChartPie,
    FaHistory
} from "react-icons/fa";
import Swal from "sweetalert2";
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

import dashboardService from "../../services/dashboardService";
import "./Dashboard.css";

function Dashboard() {

    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // ============================
    // LOAD DASHBOARD
    // ============================

   


const loadDashboard = async () => {
    const startTime = Date.now();

    try {
        setLoading(true);
        setError("");

        const data = await dashboardService.getDashboard();

        // Keep loader visible for at least 800ms
        const elapsed = Date.now() - startTime;
        const minimumDuration = 1000;
        const remainingTime = Math.max(
            0,
            minimumDuration - elapsed
        );

        if (remainingTime > 0) {
            await new Promise(resolve =>
                setTimeout(resolve, remainingTime)
            );
        }

        setDashboard(data);
    } catch (err) {
        console.error("Dashboard API failed:", err);

        setError(
            err?.response?.data?.message ||
            err?.message ||
            "Failed to load dashboard."
        );
    } finally {
        setLoading(false);
    }
};

useEffect(() => {
    loadDashboard();
}, []);

    // ============================
    // LOADING
    // ============================

   if (loading) {
    return (
        <div className="dashboard-loading">
            <div className="loader-card">

                <div className="loader-orbit orbit-one"></div>
                <div className="loader-orbit orbit-two"></div>

                <div className="loader-icon">
                    <div className="loader-icon-inner">
                        <FaChartPie />
                    </div>
                </div>

                <div className="loader-progress">
                    <span></span>
                </div>

                <h2>Preparing Your Workspace</h2>

                <p>
                    Fetching your ERP dashboard data...
                </p>

                <div className="loader-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>

                <div className="loader-status">
                    <span className="status-pulse"></span>
                    Connecting to your workspace
                </div>

            </div>
        </div>
    );
}

    // ============================
    // ERROR
    // ============================

    if (error) {
        return (
            <div className="dashboard-error">
                <h3>Unable to load dashboard</h3>

                <p>{error}</p>

                <button onClick={loadDashboard}>
                    Retry
                </button>
            </div>
        );
    }

    if (!dashboard) {
        return null;
    }

    // ============================
    // SAFE DATA
    // ============================

    const employeeDepartments =
        dashboard.employeeDepartments || [];

    const recentActivities =
        dashboard.recentActivities || [];

    const recentProjects =
        dashboard.recentProjects || [];

    const projectAnalytics =
        dashboard.projectAnalytics || {
            total: dashboard.totalProjects || 0,
            active: dashboard.activeProjects || 0,
            inactive:
                (dashboard.totalProjects || 0) -
                (dashboard.activeProjects || 0)
        };

    const taskAnalytics =
        dashboard.taskAnalytics || {
            total: dashboard.totalTasks || 0,
            completed: dashboard.completedTasks || 0,
            pending: dashboard.pendingTasks || 0
        };

    // ============================
    // PROJECT CHART DATA
    // ============================

    const projectChartData = [
        {
            name: "Active",
            value: projectAnalytics.active || 0
        },
        {
            name: "Inactive",
            value: projectAnalytics.inactive || 0
        }
    ];

    // ============================
    // TASK CHART DATA
    // ============================

    const taskChartData = [
        {
            name: "Completed",
            value: taskAnalytics.completed || 0
        },
        {
            name: "Pending",
            value: taskAnalytics.pending || 0
        }
    ];

    // ============================
    // FORMAT DATE
    // ============================

    const formatDate = (date) => {

        if (!date) {
            return "-";
        }

        return new Date(date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    return (

        <div className="dashboard">

            {/* ================================= */}
            {/* PAGE HEADER */}
            {/* ================================= */}

            <div className="dashboard-header">

                <div>
                    <h1>Dashboard</h1>

                    <p>
                        Welcome back! Here's what's happening
                        in your ERP system.
                    </p>
                </div>

                <button
                    className="dashboard-refresh-btn"
                    onClick={loadDashboard}
                >
                    Refresh
                </button>

            </div>


            {/* ================================= */}
            {/* KPI CARDS */}
            {/* ================================= */}

            <div className="dashboard-cards">

                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaUsers />
                    </div>

                    <div>
                        <span>Total Users</span>

                        <h2>
                            {dashboard.totalUsers || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaUserTie />
                    </div>

                    <div>
                        <span>Total Employees</span>

                        <h2>
                            {dashboard.totalEmployees || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaProjectDiagram />
                    </div>

                    <div>
                        <span>Total Projects</span>

                        <h2>
                            {dashboard.totalProjects || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaTasks />
                    </div>

                    <div>
                        <span>Total Tasks</span>

                        <h2>
                            {dashboard.totalTasks || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaCheckCircle />
                    </div>

                    <div>
                        <span>Completed Tasks</span>

                        <h2>
                            {dashboard.completedTasks || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaClock />
                    </div>

                    <div>
                        <span>Pending Tasks</span>

                        <h2>
                            {dashboard.pendingTasks || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaUserCheck />
                    </div>

                    <div>
                        <span>Active Users</span>

                        <h2>
                            {dashboard.activeUsers || 0}
                        </h2>
                    </div>

                </div>


                <div className="dashboard-card">

                    <div className="dashboard-card-icon">
                        <FaBuilding />
                    </div>

                    <div>
                        <span>Active Employees</span>

                        <h2>
                            {dashboard.activeEmployees || 0}
                        </h2>
                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* ANALYTICS */}
            {/* ================================= */}

            <div className="dashboard-analytics">


                {/* PROJECT ANALYTICS */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h3>
                                <FaProjectDiagram />
                                Project Analytics
                            </h3>

                            <span>
                                Project status overview
                            </span>
                        </div>

                    </div>


                    <div className="analytics-content">

                        <div className="chart-container">

                            <ResponsiveContainer
                                width="100%"
                                height={260}
                            >

                                <PieChart>

                                    <Pie
                                        data={projectChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label
                                    >

                                        {projectChartData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`project-${index}`}
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>


                        <div className="analytics-summary">

                            <div>
                                <span>Total</span>

                                <strong>
                                    {projectAnalytics.total}
                                </strong>
                            </div>

                            <div>
                                <span>Active</span>

                                <strong>
                                    {projectAnalytics.active}
                                </strong>
                            </div>

                            <div>
                                <span>Inactive</span>

                                <strong>
                                    {projectAnalytics.inactive}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>


                {/* TASK ANALYTICS */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h3>
                                <FaTasks />
                                Task Analytics
                            </h3>

                            <span>
                                Task completion overview
                            </span>
                        </div>

                    </div>


                    <div className="analytics-content">

                        <div className="chart-container">

                            <ResponsiveContainer
                                width="100%"
                                height={260}
                            >

                                <PieChart>

                                    <Pie
                                        data={taskChartData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={90}
                                        label
                                    >

                                        {taskChartData.map(
                                            (entry, index) => (
                                                <Cell
                                                    key={`task-${index}`}
                                                />
                                            )
                                        )}

                                    </Pie>

                                    <Tooltip />

                                    <Legend />

                                </PieChart>

                            </ResponsiveContainer>

                        </div>


                        <div className="analytics-summary">

                            <div>
                                <span>Total</span>

                                <strong>
                                    {taskAnalytics.total}
                                </strong>
                            </div>

                            <div>
                                <span>Completed</span>

                                <strong>
                                    {taskAnalytics.completed}
                                </strong>
                            </div>

                            <div>
                                <span>Pending</span>

                                <strong>
                                    {taskAnalytics.pending}
                                </strong>
                            </div>

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* LOWER SECTION */}
            {/* ================================= */}

            <div className="dashboard-bottom">


                {/* ================================= */}
                {/* EMPLOYEE DEPARTMENTS */}
                {/* ================================= */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h3>
                                <FaUsers />
                                Employees by Department
                            </h3>

                            <span>
                                Department-wise employee distribution
                            </span>
                        </div>

                    </div>


                    <div className="department-list">

                        {employeeDepartments.length === 0 ? (

                            <div className="empty-state">
                                No department data available.
                            </div>

                        ) : (

                            employeeDepartments.map(
                                (department, index) => (

                                    <div
                                        className="department-item"
                                        key={index}
                                    >

                                        <div>
                                            <strong>
                                                {department.department}
                                            </strong>

                                            <span>
                                                {department.count} employees
                                            </span>
                                        </div>

                                        <div className="department-count">
                                            {department.count}
                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>


                {/* ================================= */}
                {/* RECENT PROJECTS */}
                {/* ================================= */}

                <div className="dashboard-panel">

                    <div className="panel-header">

                        <div>
                            <h3>
                                <FaProjectDiagram />
                                Recent Projects
                            </h3>

                            <span>
                                Latest projects
                            </span>
                        </div>

                    </div>


                    <div className="recent-projects">

                        {recentProjects.length === 0 ? (

                            <div className="empty-state">
                                No projects available.
                            </div>

                        ) : (

                            recentProjects.map(
                                (project) => (

                                    <div
                                        className="project-item"
                                        key={project.id}
                                    >

                                        <div className="project-info">

                                            <strong>
                                                {project.name}
                                            </strong>

                                            <span>
                                                {project.taskCount || 0} Tasks
                                            </span>

                                        </div>


                                        <div className="project-status">

                                            <span
                                                className={
                                                    project.isActive
                                                        ? "status-active"
                                                        : "status-inactive"
                                                }
                                            >
                                                {project.isActive
                                                    ? "Active"
                                                    : "Inactive"}
                                            </span>

                                            <small>
                                                {project.completedTasks || 0}
                                                {" "}
                                                completed
                                            </small>

                                        </div>

                                    </div>

                                )
                            )

                        )}

                    </div>

                </div>

            </div>


            {/* ================================= */}
            {/* RECENT ACTIVITIES */}
            {/* ================================= */}

            <div className="dashboard-panel recent-activities-panel">

                <div className="panel-header">

                    <div>
                        <h3>
                            <FaHistory />
                            Recent Activities
                        </h3>

                        <span>
                            Latest system activities
                        </span>
                    </div>

                </div>


                <div className="recent-activities">

                    {recentActivities.length === 0 ? (

                        <div className="empty-state">
                            No recent activities found.
                        </div>

                    ) : (

                        recentActivities.map(
                            (activity, index) => (

                                <div
                                    className="activity-item"
                                    key={index}
                                >

                                    <div className="activity-icon">
                                        <FaHistory />
                                    </div>


                                    <div className="activity-content">

                                        <div className="activity-title">

                                            <strong>
                                                {activity.title ||
                                                    "Activity"}
                                            </strong>

                                            {activity.type && (
                                                <span>
                                                    {activity.type}
                                                </span>
                                            )}

                                        </div>


                                        <p>
                                            {activity.description ||
                                                "No description available."}
                                        </p>


                                        <small>
                                            {formatDate(
                                                activity.createdAt
                                            )}
                                        </small>

                                    </div>

                                </div>

                            )
                        )

                    )}

                </div>

            </div>

        </div>
    );
}

export default Dashboard;
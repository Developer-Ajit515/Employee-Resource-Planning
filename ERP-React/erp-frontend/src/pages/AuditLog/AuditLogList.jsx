import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import AuditLogService from "../../services/auditLogService";
import "./AuditLog.css";

const PAGE_SIZE = 10;

const AuditLogList = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [entityName, setEntityName] = useState("");
  const [userId, setUserId] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [page, setPage] = useState(1);

  const loadLogs = useCallback(async (filters = {}) => {
    setLoading(true);

    try {
      const data = await AuditLogService.search(filters);
      setLogs(Array.isArray(data) ? data : []);
      setPage(1);
    } catch (error) {
      console.error("Audit log loading failed:", error);
      toast.error(
        error.response?.status === 403
          ? "You do not have permission to view audit logs."
          : "Failed to load audit logs."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const handleSearch = (event) => {
    event.preventDefault();

    if (fromDate && toDate && fromDate > toDate) {
      toast.error("From date cannot be after to date.");
      return;
    }

    loadLogs({
      search: search.trim(),
      action,
      entityName: entityName.trim(),
      userId,
      fromDate: fromDate ? `${fromDate}T00:00:00` : "",
      toDate,
    });
  };

  const handleReset = () => {
    setSearch("");
    setAction("");
    setEntityName("");
    setUserId("");
    setFromDate("");
    setToDate("");
    loadLogs();
  };

  const formatDate = (value) => {
    if (!value) return "—";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? "—"
      : date.toLocaleString();
  };

  const totalPages = Math.max(1, Math.ceil(logs.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const visibleLogs = logs.slice(startIndex, startIndex + PAGE_SIZE);

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h2>Audit Logs</h2>
          <p>Track user activities and changes across your ERP system.</p>
        </div>

        <button
          type="button"
          className="audit-btn audit-btn-primary"
          onClick={() =>
            loadLogs({
              search: search.trim(),
              action,
              entityName: entityName.trim(),
              userId,
              fromDate: fromDate ? `${fromDate}T00:00:00` : "",
              toDate,
            })
          }
          disabled={loading}
        >
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>

      <form className="audit-filter-card" onSubmit={handleSearch}>
        <div className="audit-filter-grid">
          <div className="audit-field">
            <label htmlFor="audit-search">Search</label>
            <input
              id="audit-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Description, entity ID..."
            />
          </div>

          <div className="audit-field">
            <label htmlFor="audit-action">Action</label>
            <select
              id="audit-action"
              value={action}
              onChange={(e) => setAction(e.target.value)}
            >
              <option value="">All actions</option>
              <option value="Create">Create</option>
              <option value="Update">Update</option>
              <option value="Delete">Delete</option>
              <option value="Login">Login</option>
              <option value="Logout">Logout</option>
            </select>
          </div>

          <div className="audit-field">
            <label htmlFor="audit-entity">Entity name</label>
            <input
              id="audit-entity"
              value={entityName}
              onChange={(e) => setEntityName(e.target.value)}
              placeholder="Employee, Product..."
            />
          </div>

          <div className="audit-field">
            <label htmlFor="audit-user">User ID</label>
            <input
              id="audit-user"
              type="number"
              min="1"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="User ID"
            />
          </div>

          <div className="audit-field">
            <label htmlFor="audit-from">From date</label>
            <input
              id="audit-from"
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
            />
          </div>

          <div className="audit-field">
            <label htmlFor="audit-to">To date</label>
            <input
              id="audit-to"
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
            />
          </div>
        </div>

        <div className="audit-filter-actions">
          <button className="audit-btn audit-btn-primary" type="submit">
            Apply Filters
          </button>
          <button
            className="audit-btn audit-btn-secondary"
            type="button"
            onClick={handleReset}
          >
            Reset
          </button>
        </div>
      </form>

      <div className="audit-table-card">
        <div className="audit-table-heading">
          <h3>Activity History</h3>
          <span>{logs.length} records</span>
        </div>

        <div className="audit-table-wrapper">
          <table className="audit-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Entity ID</th>
                <th>User ID</th>
                <th>Description</th>
                <th>IP Address</th>
                <th>Date &amp; Time</th>
                <th>Details</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="audit-empty">
                    Loading audit logs...
                  </td>
                </tr>
              ) : visibleLogs.length === 0 ? (
                <tr>
                  <td colSpan="9" className="audit-empty">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                visibleLogs.map((log) => (
                  <tr key={log.id}>
                    <td>{log.id}</td>
                    <td>
                      <span
                        className={`audit-action audit-action-${String(
                          log.action || "other"
                        ).toLowerCase()}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>{log.entityName || "—"}</td>
                    <td>{log.entityId || "—"}</td>
                    <td>{log.userId ?? "System"}</td>
                    <td className="audit-description">
                      {log.description || "—"}
                    </td>
                    <td>{log.ipAddress || "—"}</td>
                    <td>{formatDate(log.createdAt)}</td>
                    <td>
                      <Link
                        className="audit-details-link"
                        to={`/audit-logs/${log.id}`}
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="audit-pagination">
          <span>
            {logs.length === 0
              ? "0 records"
              : `${startIndex + 1}–${Math.min(
                  startIndex + PAGE_SIZE,
                  logs.length
                )} of ${logs.length}`}
          </span>

          <div>
            <button
              type="button"
              className="audit-btn audit-btn-secondary"
              disabled={safePage <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </button>
            <span className="audit-page-number">
              Page {safePage} of {totalPages}
            </span>
            <button
              type="button"
              className="audit-btn audit-btn-secondary"
              disabled={safePage >= totalPages || loading}
              onClick={() =>
                setPage((p) => Math.min(totalPages, p + 1))
              }
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogList;
import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import AuditLogService from "../../services/auditLogService";
import "./AuditLog.css";

const AuditLogDetails = () => {
  const { id } = useParams();
  const [log, setLog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadDetails = async () => {
      setLoading(true);

      try {
        const data = await AuditLogService.getById(id);
        if (active) setLog(data);
      } catch (error) {
        console.error("Audit log details error:", error);

        if (active) {
          toast.error(
            error.response?.status === 404
              ? "Audit log not found."
              : "Failed to load audit log details."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetails();

    return () => {
      active = false;
    };
  }, [id]);

  const formatJson = (value) => {
    if (value == null || value === "") return "No data available";

    try {
      return JSON.stringify(JSON.parse(value), null, 2);
    } catch {
      return value;
    }
  };

  if (loading) {
    return <div className="audit-page">Loading audit log...</div>;
  }

  if (!log) {
    return (
      <div className="audit-page">
        <h2>Audit log not found</h2>
        <Link to="/audit-logs">Back to Audit Logs</Link>
      </div>
    );
  }

  return (
    <div className="audit-page">
      <div className="audit-header">
        <div>
          <h2>Audit Log Details</h2>
          <p>Record #{log.id}</p>
        </div>

        <Link to="/audit-logs" className="audit-btn audit-btn-secondary">
          Back to Logs
        </Link>
      </div>

      <div className="audit-detail-card">
        <h3>General Information</h3>

        <div className="audit-detail-grid">
          <div>
            <label>Action</label>
            <p>{log.action}</p>
          </div>
          <div>
            <label>Entity Name</label>
            <p>{log.entityName}</p>
          </div>
          <div>
            <label>Entity ID</label>
            <p>{log.entityId || "—"}</p>
          </div>
          <div>
            <label>User ID</label>
            <p>{log.userId ?? "System"}</p>
          </div>
          <div>
            <label>IP Address</label>
            <p>{log.ipAddress || "—"}</p>
          </div>
          <div>
            <label>Created At</label>
            <p>
              {log.createdAt
                ? new Date(log.createdAt).toLocaleString()
                : "—"}
            </p>
          </div>
          <div className="audit-detail-full">
            <label>Description</label>
            <p>{log.description || "—"}</p>
          </div>
        </div>
      </div>

      <div className="audit-json-grid">
        <div className="audit-detail-card">
          <h3>Old Values</h3>
          <pre className="audit-json">
            {formatJson(log.oldValues)}
          </pre>
        </div>

        <div className="audit-detail-card">
          <h3>New Values</h3>
          <pre className="audit-json">
            {formatJson(log.newValues)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AuditLogDetails;
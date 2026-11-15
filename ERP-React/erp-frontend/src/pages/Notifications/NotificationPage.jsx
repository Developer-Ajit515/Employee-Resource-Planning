import { useCallback, useEffect, useState } from "react";
import {
  FaBell,
  FaCheck,
  FaCheckDouble,
  FaTrash,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";

import notificationService from "../../services/notificationService";
import "./NotificationPage.css";

const PAGE_SIZE = 10;

function NotificationPage() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const isRead =
        filter === "read" ? true :
        filter === "unread" ? false : undefined;

      const result = await notificationService.getAll({
        page,
        pageSize: PAGE_SIZE,
        isRead,
        search,
      });

      setItems(result?.items ?? []);
      setTotalCount(result?.totalCount ?? 0);
      setTotalPages(Math.max(1, result?.totalPages ?? 1));
      setUnreadCount(result?.unreadCount ?? 0);
    } catch (err) {
      setError(err.message || "Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  }, [page, filter, search]);

  useEffect(() => {
    load();
  }, [load]);

  const performAction = async (action) => {
    setBusy(true);
    setError("");

    try {
      await action();
      await load();
    } catch (err) {
      setError(err.message || "Action failed.");
    } finally {
      setBusy(false);
    }
  };

  const markOne = (id) =>
    performAction(() => notificationService.markAsRead(id));

  const deleteOne = (id) => {
    if (!window.confirm("Delete this notification?")) return;
    performAction(() => notificationService.delete(id));
  };

  const markAll = () => {
    if (unreadCount === 0) return;
    performAction(() => notificationService.markAllAsRead());
  };

  const deleteRead = () => {
    if (!window.confirm("Delete all read notifications?")) return;
    performAction(() => notificationService.deleteRead());
  };

  const changeFilter = (value) => {
    setFilter(value);
    setPage(1);
  };

  const get = (item, lower, upper) => item[lower] ?? item[upper];

  const formatDate = (value) => {
    if (!value) return "Date unavailable";

    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? "Date unavailable"
      : date.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  const typeClass = (type) => {
    const value = String(type || "info").toLowerCase();
    return ["info", "success", "warning", "error"].includes(value)
      ? value
      : "info";
  };

  return (
    <main className="notification-page">
      <header className="np-header">
        <div className="np-heading">
          <span className="np-heading-icon"><FaBell /></span>
          <div>
            <h1>Notifications</h1>
            <p>Stay updated with your ERP activities.</p>
          </div>
        </div>

        <div className="np-header-actions">
          <button
            className="np-btn np-btn-light"
            onClick={load}
            disabled={loading || busy}
          >
            <FaSyncAlt /> Refresh
          </button>

          <button
            className="np-btn np-btn-primary"
            onClick={markAll}
            disabled={busy || unreadCount === 0}
          >
            <FaCheckDouble /> Mark all read
          </button>
        </div>
      </header>

      <section className="np-stats">
        <div className="np-stat">
          <span>Total notifications</span>
          <strong>{totalCount}</strong>
        </div>
        <div className="np-stat">
          <span>Unread notifications</span>
          <strong>{unreadCount}</strong>
        </div>
        <div className="np-stat">
          <span>Current page</span>
          <strong>{page} / {totalPages}</strong>
        </div>
      </section>

      <section className="np-toolbar">
        <div className="np-filters">
          {["all", "unread", "read"].map((value) => (
            <button
              key={value}
              className={`np-filter ${filter === value ? "active" : ""}`}
              onClick={() => changeFilter(value)}
            >
              {value[0].toUpperCase() + value.slice(1)}
              {value === "unread" && unreadCount > 0
                ? ` (${unreadCount})`
                : ""}
            </button>
          ))}
        </div>

        <label className="np-search">
          <FaSearch />
          <input
            type="search"
            placeholder="Search notifications..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </label>

        <button
          className="np-btn np-delete-read"
          onClick={deleteRead}
          disabled={busy}
        >
          <FaTrash /> Clear read
        </button>
      </section>

      {error && (
        <div className="np-error" role="alert">
          {error}
          <button onClick={() => setError("")}>Dismiss</button>
        </div>
      )}

      <section className="np-list">
        {loading ? (
          <div className="np-empty">Loading notifications...</div>
        ) : items.length === 0 ? (
          <div className="np-empty">
            <FaBell />
            <h3>No notifications found</h3>
            <p>
              {search
                ? "Try another search term."
                : filter === "unread"
                  ? "You are all caught up."
                  : "Notifications will appear here."}
            </p>
          </div>
        ) : (
          items.map((item) => {
            const id = get(item, "id", "Id");
            const isRead = get(item, "isRead", "IsRead") ?? false;
            const title = get(item, "title", "Title") ?? "Notification";
            const message = get(item, "message", "Message") ?? "";
            const type = get(item, "type", "Type") ?? "Info";
            const createdAt = get(item, "createdAt", "CreatedAt");
            const referenceType = get(item, "referenceType", "ReferenceType");
            const referenceId = get(item, "referenceId", "ReferenceId");

            return (
              <article
                key={id}
                className={`np-item ${isRead ? "read" : "unread"}`}
              >
                <span className={`np-type-icon ${typeClass(type)}`}>
                  <FaBell />
                </span>

                <div className="np-content">
                  <div className="np-title-row">
                    <h3>{title}</h3>
                    <span className={`np-type-badge ${typeClass(type)}`}>
                      {type}
                    </span>
                    {!isRead && <span className="np-dot" />}
                  </div>

                  <p>{message}</p>

                  <small>{formatDate(createdAt)}</small>

                  {referenceType && (
                    <small className="np-reference">
                      Reference: {referenceType}
                      {referenceId != null ? ` #${referenceId}` : ""}
                    </small>
                  )}
                </div>

                <div className="np-item-actions">
                  {!isRead && (
                    <button
                      title="Mark as read"
                      aria-label={`Mark ${title} as read`}
                      disabled={busy}
                      onClick={() => markOne(id)}
                    >
                      <FaCheck />
                    </button>
                  )}

                  <button
                    title="Delete notification"
                    aria-label={`Delete ${title}`}
                    disabled={busy}
                    onClick={() => deleteOne(id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </article>
            );
          })
        )}
      </section>

      {!loading && totalCount > 0 && (
        <footer className="np-pagination">
          <span>Page {page} of {totalPages} · {totalCount} total</span>

          <div>
            <button
              disabled={page <= 1 || busy}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages || busy}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </footer>
      )}
    </main>
  );
}

export default NotificationPage;
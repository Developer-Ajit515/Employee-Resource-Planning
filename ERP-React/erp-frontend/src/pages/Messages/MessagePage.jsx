
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaEnvelope,
  FaInbox,
  FaPaperPlane,
  FaPlus,
  FaSearch,
  FaSync,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import "./MessagePage.css";

const API_BASE_URL = "https://localhost:7011/api";

function MessagePage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [sending, setSending] = useState(false);

  const [form, setForm] = useState({
    receiverId: "",
    subject: "",
    body: "",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    setSelectedMessage(null);

    // These endpoints must be implemented in MessageController.
    const endpoint =
      activeTab === "inbox"
        ? `${API_BASE_URL}/Message/inbox`
        : `${API_BASE_URL}/Message/sent`;

    try {
      const response = await fetch(endpoint, {
        headers: getHeaders(),
      });

      if (!response.ok) {
        throw new Error(
          response.status === 404
            ? "Message API endpoint not found. Add the inbox/sent API to MessageController."
            : `Unable to load messages (${response.status}).`
        );
      }

      const data = await response.json();

      const items = Array.isArray(data)
        ? data
        : data.messages ?? data.items ?? data.data ?? [];

      setMessages(items);
    } catch (err) {
      setMessages([]);
      setError(err.message || "Unable to load messages.");
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  const getId = (message) =>
    message.id ?? message.Id ?? message.messageId ?? message.MessageId;

  const getSubject = (message) =>
    message.subject ?? message.Subject ?? "(No subject)";

  const getBody = (message) =>
    message.body ??
    message.Body ??
    message.content ??
    message.Content ??
    message.messageText ??
    message.MessageText ??
    "";

  const getSender = (message) =>
    message.senderName ??
    message.SenderName ??
    message.sender?.name ??
    message.Sender?.Name ??
    message.senderEmail ??
    message.SenderEmail ??
    message.senderId ??
    message.SenderId ??
    "Unknown sender";

  const getReceiver = (message) =>
    message.receiverName ??
    message.ReceiverName ??
    message.receiver?.name ??
    message.Receiver?.Name ??
    message.receiverEmail ??
    message.ReceiverEmail ??
    message.receiverId ??
    message.ReceiverId ??
    "Unknown recipient";

  const isRead = (message) =>
    Boolean(message.isRead ?? message.IsRead);

  const getDate = (message) => {
    const value =
      message.sentAt ??
      message.SentAt ??
      message.createdAt ??
      message.CreatedAt ??
      message.createdDate ??
      message.CreatedDate;

    if (!value) return "";

    const date = new Date(value);

    return Number.isNaN(date.getTime())
      ? ""
      : date.toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        });
  };

  const filteredMessages = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return messages;

    return messages.filter((message) => {
      const searchable = [
        getSubject(message),
        getBody(message),
        getSender(message),
        getReceiver(message),
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [messages, search]);

  const unreadCount = messages.filter((message) => !isRead(message)).length;

  const openMessage = async (message) => {
    setSelectedMessage(message);

    if (activeTab !== "inbox" || isRead(message)) return;

    const id = getId(message);

    if (id == null) return;

    try {
      // This endpoint must be implemented in MessageController.
      const response = await fetch(
        `${API_BASE_URL}/Message/${encodeURIComponent(id)}/read`,
        {
          method: "PUT",
          headers: getHeaders(),
        }
      );

      if (!response.ok) {
        console.warn("Could not mark message as read.");
        return;
      }

      setMessages((current) =>
        current.map((item) =>
          String(getId(item)) === String(id)
            ? { ...item, isRead: true, IsRead: true }
            : item
        )
      );

      setSelectedMessage((current) =>
        current && String(getId(current)) === String(id)
          ? { ...current, isRead: true, IsRead: true }
          : current
      );
    } catch (err) {
      console.error("Mark message as read failed:", err);
    }
  };

  const sendMessage = async (event) => {
    event.preventDefault();

    if (
      !form.receiverId.trim() ||
      !form.subject.trim() ||
      !form.body.trim()
    ) {
      setError("Please fill in recipient, subject and message.");
      return;
    }

    setSending(true);
    setError("");

    try {
      // This endpoint and request model must exist in the backend.
      const response = await fetch(`${API_BASE_URL}/Message/send`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          receiverId: Number(form.receiverId),
          subject: form.subject.trim(),
          body: form.body.trim(),
        }),
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Send failed (${response.status}).`);
      }

      setForm({ receiverId: "", subject: "", body: "" });
      setShowCompose(false);

      if (activeTab === "sent") {
        await loadMessages();
      } else {
        setActiveTab("sent");
      }
    } catch (err) {
      setError(err.message || "Unable to send message.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="messages-page">
      <div className="messages-header">
        <div>
          <h1>Messages</h1>
          <p>Manage your conversations and internal communication.</p>
        </div>

        <div className="messages-header-actions">
          <button
            type="button"
            className="message-refresh-btn"
            onClick={loadMessages}
            disabled={loading}
            title="Refresh messages"
          >
            <FaSync className={loading ? "message-spin" : ""} />
          </button>

          <button
            type="button"
            className="message-compose-btn"
            onClick={() => {
              setError("");
              setShowCompose(true);
            }}
          >
            <FaPlus /> New Message
          </button>
        </div>
      </div>

      <div className="message-stats">
        <div className="message-stat-card">
          <div className="message-stat-icon">
            <FaEnvelope />
          </div>
          <div>
            <span>Total Messages</span>
            <h2>{messages.length}</h2>
          </div>
        </div>

        <div className="message-stat-card">
          <div className="message-stat-icon unread-icon">
            <FaInbox />
          </div>
          <div>
            <span>Unread in Current View</span>
            <h2>{activeTab === "inbox" ? unreadCount : "—"}</h2>
          </div>
        </div>
      </div>

      {error && (
        <div className="message-error" role="alert">
          <span>{error}</span>
          <button type="button" onClick={() => setError("")}>
            <FaTimes />
          </button>
        </div>
      )}

      <div className="message-workspace">
        <aside className="message-sidebar">
          <button
            type="button"
            className={`message-tab ${activeTab === "inbox" ? "active" : ""}`}
            onClick={() => {
              setSearch("");
              setActiveTab("inbox");
            }}
          >
            <FaInbox />
            Inbox
            {activeTab === "inbox" && unreadCount > 0 && (
              <span className="message-tab-count">{unreadCount}</span>
            )}
          </button>

          <button
            type="button"
            className={`message-tab ${activeTab === "sent" ? "active" : ""}`}
            onClick={() => {
              setSearch("");
              setActiveTab("sent");
            }}
          >
            <FaPaperPlane />
            Sent Messages
          </button>
        </aside>

        <section className="message-content">
          <div className="message-list-header">
            <div>
              <h2>{activeTab === "inbox" ? "Inbox" : "Sent Messages"}</h2>
              <span>{filteredMessages.length} messages</span>
            </div>

            <div className="message-search">
              <FaSearch />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search messages..."
              />
            </div>
          </div>

          <div className="message-list">
            {loading ? (
              <div className="message-empty">Loading messages...</div>
            ) : filteredMessages.length === 0 ? (
              <div className="message-empty">
                <FaEnvelope />
                <h3>No messages found</h3>
                <p>
                  {search
                    ? "Try a different search term."
                    : "Your messages will appear here."}
                </p>
              </div>
            ) : (
              filteredMessages.map((message, index) => {
                const id = getId(message) ?? index;
                const read = isRead(message);

                return (
                  <button
                    type="button"
                    key={id}
                    className={`message-row ${
                      selectedMessage &&
                      String(getId(selectedMessage)) === String(id)
                        ? "selected"
                        : ""
                    } ${!read && activeTab === "inbox" ? "unread" : ""}`}
                    onClick={() => openMessage(message)}
                  >
                    <div className="message-avatar">
                      {(activeTab === "inbox"
                        ? getSender(message)
                        : getReceiver(message)
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="message-row-main">
                      <div className="message-row-top">
                        <strong>
                          {activeTab === "inbox"
                            ? getSender(message)
                            : `To: ${getReceiver(message)}`}
                        </strong>
                        <time>{getDate(message)}</time>
                      </div>

                      <h3>{getSubject(message)}</h3>
                      <p>{getBody(message)}</p>
                    </div>

                    {!read && activeTab === "inbox" && (
                      <span
                        className="message-unread-dot"
                        title="Unread"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {selectedMessage && (
            <div className="message-detail">
              <div className="message-detail-header">
                <div>
                  <span className="message-detail-label">
                    {activeTab === "inbox" ? "From" : "To"}
                  </span>
                  <h2>
                    {activeTab === "inbox"
                      ? getSender(selectedMessage)
                      : getReceiver(selectedMessage)}
                  </h2>
                </div>

                <button
                  type="button"
                  className="message-close-detail"
                  onClick={() => setSelectedMessage(null)}
                  title="Close message"
                >
                  <FaTimes />
                </button>
              </div>

              <h3>{getSubject(selectedMessage)}</h3>
              <span className="message-detail-date">
                {getDate(selectedMessage)}
              </span>

              <div className="message-detail-body">
                {getBody(selectedMessage)}
              </div>

              {activeTab === "inbox" && (
                <span className="message-read-label">
                  <FaCheck /> {isRead(selectedMessage) ? "Read" : "Unread"}
                </span>
              )}
            </div>
          )}
        </section>
      </div>

      {showCompose && (
        <div
          className="message-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCompose(false);
            }
          }}
        >
          <div
            className="message-compose-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="compose-message-title"
          >
            <div className="message-compose-header">
              <div>
                <h2 id="compose-message-title">New Message</h2>
                <p>Send a message to another ERP user.</p>
              </div>

              <button
                type="button"
                onClick={() => setShowCompose(false)}
                aria-label="Close compose window"
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={sendMessage}>
              <label htmlFor="receiverId">Recipient User ID</label>
              <input
                id="receiverId"
                type="number"
                min="1"
                value={form.receiverId}
                onChange={(event) =>
                  setForm({ ...form, receiverId: event.target.value })
                }
                placeholder="Enter recipient user ID"
                required
              />

              <label htmlFor="messageSubject">Subject</label>
              <input
                id="messageSubject"
                value={form.subject}
                onChange={(event) =>
                  setForm({ ...form, subject: event.target.value })
                }
                placeholder="Enter message subject"
                maxLength={200}
                required
              />

              <label htmlFor="messageBody">Message</label>
              <textarea
                id="messageBody"
                value={form.body}
                onChange={(event) =>
                  setForm({ ...form, body: event.target.value })
                }
                placeholder="Write your message..."
                rows={6}
                required
              />

              <div className="message-compose-actions">
                <button
                  type="button"
                  className="message-cancel-btn"
                  onClick={() => setShowCompose(false)}
                  disabled={sending}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="message-compose-btn"
                  disabled={sending}
                >
                  <FaPaperPlane />
                  {sending ? "Sending..." : "Send Message"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MessagePage;

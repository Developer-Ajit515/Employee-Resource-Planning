import axios from "axios";

const API = "https://localhost:7011/api/Notification";

const headers = () => ({
  "Content-Type": "application/json",
  ...(localStorage.getItem("token")
    ? { Authorization: `Bearer ${localStorage.getItem("token")}` }
    : {}),
});

async function request(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: { ...headers(), ...options.headers },
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    throw new Error(
      data?.message || data?.title || `Request failed: ${response.status}`
    );
  }

  return data;
}

const notificationService = {
  getAll: ({ page = 1, pageSize = 10, isRead, search = "" } = {}) => {
    const params = new URLSearchParams({ page, pageSize });

    if (isRead !== undefined && isRead !== null) {
      params.set("isRead", String(isRead));
    }

    if (search.trim()) params.set("search", search.trim());

    return request(`${API}?${params}`);
  },

  getUnreadCount: () => request(`${API}/unread-count`),

  getById: (id) => request(`${API}/${encodeURIComponent(id)}`),

  create: (dto) =>
    request(API, {
      method: "POST",
      body: JSON.stringify(dto),
    }),

  markAsRead: (id) =>
    request(`${API}/${encodeURIComponent(id)}/read`, {
      method: "PUT",
    }),

  markAllAsRead: () =>
    request(`${API}/read-all`, { method: "PUT" }),

  delete: (id) =>
    request(`${API}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    }),

  deleteRead: () =>
    request(`${API}/read`, { method: "DELETE" }),
};

export default notificationService;
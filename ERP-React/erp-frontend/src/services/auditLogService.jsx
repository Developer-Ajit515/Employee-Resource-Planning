import api from "../api/axios";

const BASE_URL = "/AuditLog";

const getAll = async () => {
  const response = await api.get(BASE_URL);
  return response.data;
};

const getById = async (id) => {
  const response = await api.get(`${BASE_URL}/${id}`);
  return response.data;
};

const search = async (filters = {}) => {
  const params = {};

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== "" && value !== null && value !== undefined) {
      params[key] = value;
    }
  });

  const response = await api.get(`${BASE_URL}/search`, { params });
  return response.data;
};

const AuditLogService = {
  getAll,
  getById,
  search,
};

export default AuditLogService;
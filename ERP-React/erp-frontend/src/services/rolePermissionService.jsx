const API = "https://localhost:7011/api/RolePermission";

export const assignPermission = (data) =>
  axios.post(API, data);

export const getRolePermissions = () =>
  axios.get(API);

export const removePermission = (roleId, permissionId) =>
  axios.delete(`${API}?roleId=${roleId}&permissionId=${permissionId}`);
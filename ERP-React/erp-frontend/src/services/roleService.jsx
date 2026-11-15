import axios from "axios";

const API = "https://localhost:7011/api/Role";

export const getRoles = () => axios.get(API);
export const addRole = (data) => axios.post(API, data);
export const updateRole = (data) => axios.put(`${API}/${data.id}`, data);
export const deleteRole = (id) => axios.delete(`${API}/${id}`);
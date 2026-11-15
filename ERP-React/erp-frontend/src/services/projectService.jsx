import api from "../api/axios";

export const getProjects = async () => {

    const response =
        await api.get("/Project");

    return response.data;
};

export const addProject = async (project) => {

    const response =
        await api.post(
            "/Project",
            project
        );

    return response.data;
};

export const updateProject = async (project) => {

    const response =
        await api.put(
            `/Project/${project.id}`,
            project
        );

    return response.data;
};

export const deleteProject = async (id) => {

    const response =
        await api.delete(
            `/Project/${id}`
        );

    return response.data;
};
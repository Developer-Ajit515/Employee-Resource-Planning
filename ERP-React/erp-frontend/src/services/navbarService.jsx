import api from "../api/axios";

export const getCurrentUser = async () => {

    const response =
        await api.get("/Auth/me");

    return response.data;
};

export const getNotificationCount = async () => {

    const response =
        await api.get(
            "/Notification/unread-count"
        );

    return response.data;
};

export const getMessageCount = async () => {

    const response =
        await api.get(
            "/Message/unread-count"
        );

    return response.data;
};

export const search = async (query) => {

    const response =
        await api.get("/Search", {
            params: {
                query
            }
        });

    return response.data;
};
import api from "../api/axios";

export const login = async (data) => {
    try {
        const response = await api.post("/Auth/login", data);

        console.log("========== LOGIN RESPONSE ==========");
        console.log(
            "LOGIN RESPONSE:",
            JSON.stringify(response.data, null, 2)
        );
        console.log("====================================");

        // Save JWT token
        localStorage.setItem(
            "token",
            response.data.token
        );

        return response.data;

    } catch (error) {
        console.error("Login API Error:", error);

        if (!error.response) {
            throw new Error(
                "Unable to connect to the server."
            );
        }

        const message = error.response.data;

        if (typeof message === "string") {
            throw new Error(message);
        }

        if (message?.message) {
            throw new Error(message.message);
        }

        throw new Error("Login failed.");
    }
};
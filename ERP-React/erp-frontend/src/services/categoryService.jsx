import axios from "axios";

const API_URL = "https://localhost:7011/api/Category";

const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    };
};

// Get all categories
const getCategories = async () => {
    const response = await axios.get(
        API_URL,
        getAuthConfig()
    );

    return response.data;
};

// Get category by ID
const getCategoryById = async (id) => {
    const response = await axios.get(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

// Create category
const createCategory = async (category) => {
    const response = await axios.post(
        API_URL,
        category,
        getAuthConfig()
    );

    return response.data;
};

// Update category
const updateCategory = async (id, category) => {
    const response = await axios.put(
        `${API_URL}/${id}`,
        category,
        getAuthConfig()
    );

    return response.data;
};

// Delete category
const deleteCategory = async (id) => {
    const response = await axios.delete(
        `${API_URL}/${id}`,
        getAuthConfig()
    );

    return response.data;
};

const CategoryService = {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
};

export default CategoryService;
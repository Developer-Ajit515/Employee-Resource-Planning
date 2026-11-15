import api from "./axios";

export const getProducts = async () => {
    const response = await api.get("/Product");
    return response.data;
};

export const getProductById = async (id) => {
    const response = await api.get(`/Product/${id}`);
    return response.data;
};

export const createProduct = async (product) => {
    const response = await api.post(
        "/Product",
        product
    );

    return response.data;
};



export const updateProduct = async (product) => {
    const response = await api.put("/Product", {
        id: Number(product.id),
        name: product.name.trim(),
        price: Number(product.price),
        stock: Number(product.stock),
        categoryId: Number(product.categoryId)
    });

    return response.data;
};



export const deleteProduct = async (id) => {
    const response = await api.delete(`/Product/${id}`);
    return response.data;
};

export const getLowStockProducts = async () => {
    const response =
        await api.get("/Product/low-stock");

    return response.data;
};
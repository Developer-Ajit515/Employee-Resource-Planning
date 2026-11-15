import api from "../api/axios";

const employeeService = {

    // GET: /api/Employee
    getEmployees: async () => {
        try {
            const response = await api.get("/Employee");
            return response.data;
        } catch (error) {
            console.error(
                "Employee API Error:",
                error.response?.data || error.message
            );
            throw error;
        }
    },


    // GET: /api/Employee/{id}
    getEmployeeById: async (id) => {
        try {
            const response = await api.get(`/Employee/${id}`);
            return response.data;
        } catch (error) {
            console.error(
                "Get Employee Error:",
                error.response?.data || error.message
            );
            throw error;
        }
    },


    // POST: /api/Employee
    addEmployee: async (employee) => {
        try {
            const response = await api.post(
                "/Employee",
                employee
            );

            return response.data;
        } catch (error) {
            console.error(
                "Employee Add Error:",
                error.response?.data || error.message
            );
            throw error;
        }
    },


    // PUT: /api/Employee/{id}
    updateEmployee: async (id, employee) => {
        try {
            const response = await api.put(
                `/Employee/${id}`,
                employee
            );

            return response.data;
        } catch (error) {
            console.error(
                "Employee Update Error:",
                error.response?.data || error.message
            );
            throw error;
        }
    },


    // DELETE: /api/Employee/{id}
    deleteEmployee: async (id) => {
        try {
            const response = await api.delete(
                `/Employee/${id}`
            );

            return response.data;
        } catch (error) {
            console.error(
                "Employee Delete Error:",
                error.response?.data || error.message
            );
            throw error;
        }
    }

};

export default employeeService;
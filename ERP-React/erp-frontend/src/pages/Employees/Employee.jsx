
import React, {
    useCallback,
    useEffect,
    useState
} from "react";


import Swal from "sweetalert2";
import Pagination from "../../components/common/Pagination";

import employeeService
    from "../../services/employeeService";

import "./Employee.css";

export default function EmployeeApp() {
    return (
        <div className="employee-page">
            <div className="employee-container">
                <EmployeeManager />
            </div>
        </div>
    );
}

function EmployeeManager() {
    const apiUrl = "https://localhost:7011/api/Employee";

   const emptyEmployee = {
    employeeId: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    designation: "",
    salary: "",
    joiningDate: "",
    status: true
};

    const [employees, setEmployees] = useState([]);
    const [employee, setEmployee] = useState(emptyEmployee);
    const [isEdit, setIsEdit] = useState(false);
    const [loading, setLoading] = useState(false);
const [isModalOpen, setIsModalOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
const [itemsPerPage] = useState(5);

    /* =========================
       LOAD EMPLOYEES
    ========================= */

    useEffect(() => {
        getEmployees();
    }, []);

    /* =========================
       GET EMPLOYEES
    ========================= */

   const getEmployees = useCallback(async () => {

    try {

        setLoading(true);

        const data =
            await employeeService.getEmployees();

        setEmployees(
    Array.isArray(data)
        ? data
        : []
);

setCurrentPage(1);

    } catch (error) {

        console.error(
            "Employee API Error:",
            error
        );

        toast.error(
            "Unable to load employees."
        );

    } finally {

        setLoading(false);

    }

}, []);

    /* =========================
       INPUT CHANGE
    ========================= */

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;

        setEmployee((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    /* =========================
       MESSAGE
    ========================= */

    const showMessage = (text, type) => {
        setMessage(text);
        setMessageType(type);

        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 3000);
    };

    /* =========================
       SAVE / UPDATE
    ========================= */

  
const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        setLoading(true);

        const payload = {
            employeeId: employee.employeeId,
            firstName: employee.firstName,
            lastName: employee.lastName,
            email: employee.email,
            phone: employee.phone,
            departmentId: Number(employee.departmentId),
            designation: employee.designation,
            salary:
                employee.salary === ""
                    ? 0
                    : Number(employee.salary),
            joiningDate:
                employee.joiningDate ||
                new Date().toISOString(),
            status: employee.status
        };

        if (isEdit) {

            // =========================
            // UPDATE EMPLOYEE
            // =========================
            await employeeService.updateEmployee(
                employee.employeeId,
                payload
            );

            await Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Employee updated successfully.",
                timer: 1500,
                showConfirmButton: false
            });

        } else {

            // =========================
            // ADD EMPLOYEE
            // =========================
            await employeeService.addEmployee(
                payload
            );

            await Swal.fire({
                icon: "success",
                title: "Success!",
                text: "Employee added successfully.",
                timer: 1500,
                showConfirmButton: false
            });
        }

        await getEmployees();

        resetForm();

    } catch (error) {

        console.error(
            "Employee save error:",
            error.response?.data || error
        );

        const errorMessage =
            error.response?.data?.message ||
            error.response?.data?.title ||
            "Unable to save employee.";

        await Swal.fire({
            icon: "error",
            title: "Error",
            text: errorMessage
        });

    } finally {
        setLoading(false);
    }
};


    /* =========================
       EDIT EMPLOYEE
    ========================= */
const editEmployee = (emp) => {
    setEmployee({
        employeeId: emp.employeeId || 0,
        firstName: emp.firstName || "",
        lastName: emp.lastName || "",
        email: emp.email || "",
        phone: emp.phone || "",
        departmentId: emp.departmentId ?? "",
        designation: emp.designation || "",
        salary: emp.salary ?? "",
        joiningDate: emp.joiningDate
            ? emp.joiningDate.split("T")[0]
            : "",
        status: emp.status ?? true
    });

    setIsEdit(true);
    setIsModalOpen(true);
};

    /* =========================
       DELETE EMPLOYEE
    ========================= */

   const deleteEmployee = async (id) => {

    const result =
        await Swal.fire({

            title: "Delete employee?",

            text:
                "This action cannot be undone.",

            icon: "warning",

            showCancelButton: true,

            confirmButtonText:
                "Yes, delete",

            cancelButtonText:
                "Cancel",

            reverseButtons: true
        });


    if (!result.isConfirmed) {
        return;
    }


    try {

        setLoading(true);

        await employeeService
            .deleteEmployee(id);

        await getEmployees();

        await Swal.fire({

            title: "Deleted!",

            text:
                "Employee has been deleted.",

            icon: "success",

            timer: 1500,

            showConfirmButton: false
        });

    } catch (error) {

        console.error(error);

        toast.error(
            "Unable to delete employee."
        );

    } finally {

        setLoading(false);

    }
};
    /* =========================
       RESET FORM
    ========================= */

   const resetForm = () => {
    setEmployee({
        employeeId: 0,
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        departmentId: "",
        designation: "",
        salary: "",
        joiningDate: "",
        status: true
    });

    setIsEdit(false);
    setIsModalOpen(false);
};

    

    /* =========================
       INITIALS
    ========================= */

    const totalPages = Math.ceil(employees.length / itemsPerPage);

const startIndex = (currentPage - 1) * itemsPerPage;

const currentEmployees = employees.slice(
    startIndex,
    startIndex + itemsPerPage
);

    const getInitials = (firstName, lastName) => {
        const first = firstName?.charAt(0) || "";
        const last = lastName?.charAt(0) || "";

        return `${first}${last}`.toUpperCase();
    };

    return (
        <div>
            <div className="employee-header employee-header-row">
    <div>
        <h1>Employee Management System</h1>
        <p>
            Manage employees, departments, designations and employee status.
        </p>
    </div>

    <button
        type="button"
        className="employee-add-btn"
        onClick={() => {
            resetForm();
            setIsModalOpen(true);
        }}
    >
        <span>＋</span> Add Employee
    </button>
</div>

            {/* MESSAGE */}

            {message && (
                <div
                    className={`employee-message ${
                        messageType === "error"
                            ? "employee-message-error"
                            : "employee-message-success"
                    }`}
                    style={{ marginBottom: "16px" }}
                >
                    {message}
                </div>
            )}

            {/* MAIN LAYOUT */}

            <div className="employee-layout">

                {/* =================================================
                    FORM CARD
                ================================================= */}

               {isModalOpen && (
    <div
        className="employee-modal-overlay"
        onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
                resetForm();
            }
        }}
    >
        <div
            className="employee-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="employee-modal-title"
        >
            <div className="employee-modal-header">
                <div>
                    <h2 id="employee-modal-title">
                        {isEdit ? "Update Employee" : "Add Employee"}
                    </h2>
                    <p>
                        {isEdit
                            ? "Update employee information"
                            : "Enter the employee details below"}
                    </p>
                </div>

                <button
                    type="button"
                    className="employee-modal-close"
                    aria-label="Close form"
                    onClick={resetForm}
                >
                    ×
                </button>
            </div>

            <form onSubmit={handleSubmit} className="employee-form">
                <div className="employee-input-row">
                    <div className="employee-form-group">
                        <label>First Name</label>
                        <input
                            type="text"
                            name="firstName"
                            placeholder="Enter first name"
                            value={employee.firstName}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="employee-form-group">
                        <label>Last Name</label>
                        <input
                            type="text"
                            name="lastName"
                            placeholder="Enter last name"
                            value={employee.lastName}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="employee-form-group">
                    <label>Email Address</label>
                    <input
                        type="email"
                        name="email"
                        placeholder="employee@example.com"
                        value={employee.email}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="employee-form-group">
                    <label>Phone Number</label>
                    <input
                        type="text"
                        name="phone"
                        placeholder="Enter phone number"
                        value={employee.phone}
                        onChange={handleChange}
                    />
                </div>

                <div className="employee-input-row">
                    <div className="employee-form-group">
                        <label>Department</label>
                        <select
                            name="departmentId"
                            value={employee.departmentId}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select Department</option>
                            <option value="2">IT</option>
                            <option value="3">Management</option>
                            <option value="4">HR</option>
                            <option value="5">Finance</option>
                        </select>
                    </div>

                    <div className="employee-form-group">
                        <label>Designation</label>
                        <input
                            type="text"
                            name="designation"
                            placeholder="e.g. Developer"
                            value={employee.designation}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="employee-input-row">
                    <div className="employee-form-group">
                        <label>Salary</label>
                        <input
                            type="number"
                            name="salary"
                            placeholder="Enter salary"
                            min="0"
                            value={employee.salary}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="employee-form-group">
                        <label>Joining Date</label>
                        <input
                            type="date"
                            name="joiningDate"
                            value={employee.joiningDate}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="employee-status">
                    <div className="employee-status-text">
                        <strong>Employee Status</strong>
                        <span>
                            {employee.status
                                ? "Employee is currently active"
                                : "Employee is currently inactive"}
                        </span>
                    </div>

                    <label className="employee-toggle">
                        <input
                            type="checkbox"
                            name="status"
                            checked={employee.status}
                            onChange={handleChange}
                        />
                        <span className="employee-toggle-slider"></span>
                    </label>
                </div>

                <div className="employee-form-actions">
                    <button
                        type="submit"
                        className="employee-btn employee-btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : isEdit
                                ? "Update Employee"
                                : "Add Employee"}
                    </button>

                    <button
                        type="button"
                        className="employee-btn employee-btn-secondary"
                        onClick={resetForm}
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </div>
)}
                {/* =================================================
                    TABLE CARD
                ================================================= */}

                <div className="employee-table-card">

                    {/* TABLE HEADER */}

                    <div className="employee-table-header">

                        <div className="employee-table-title">

                            <h2>Employee List</h2>

                            <p>
                                {employees.length} employee
                                {employees.length !== 1
                                    ? "s"
                                    : ""}{" "}
                                found
                            </p>

                        </div>

                        <button
                            onClick={getEmployees}
                            className="employee-refresh-btn"
                            disabled={loading}
                        >
                            ↻
                            {loading
                                ? "Refreshing..."
                                : "Refresh"}
                        </button>

                    </div>

                    {/* TABLE */}

                    <div className="employee-table-wrapper">

                        {loading && employees.length === 0 ? (

                            <div className="employee-loading">

                                <div className="employee-loading-spinner"></div>

                                <span>
                                    Loading employees...
                                </span>

                            </div>

                        ) : employees.length === 0 ? (

                            <div className="employee-empty">

                                <div className="employee-empty-icon">
                                    👤
                                </div>

                                <strong>
                                    No Employees Found
                                </strong>

                                <span>
                                    Add your first employee
                                    using the form.
                                </span>

                            </div>

                        ) : (

                            <table className="employee-table">

                                <thead>

                                    <tr>

                                        <th>ID</th>

                                        <th>Employee</th>

                                        <th>Email</th>

                                        <th>Department</th>

                                        <th>Designation</th>

                                        <th>Salary</th>

                                        <th>Joining Date</th>

                                        <th>Status</th>

                                        <th>Action</th>

                                    </tr>

                                </thead>

                                <tbody>

                                   {currentEmployees.map((emp) => (

                                        <tr
                                            key={emp.employeeId}
                                        >

                                            {/* ID */}

                                            <td>
                                                #{emp.employeeId}
                                            </td>

                                            {/* NAME */}

                                            <td>

                                                <div className="employee-name">

                                                    <div className="employee-avatar">
                                                        {getInitials(
                                                            emp.firstName,
                                                            emp.lastName
                                                        )}
                                                    </div>

                                                    <div className="employee-name-info">

                                                        <strong>
                                                            {emp.firstName}{" "}
                                                            {emp.lastName}
                                                        </strong>

                                                        <span>
                                                            ID:{" "}
                                                            {emp.employeeId}
                                                        </span>

                                                    </div>

                                                </div>

                                            </td>

                                            {/* EMAIL */}

                                            <td>
                                                {emp.email || "-"}
                                            </td>

                                            {/* DEPARTMENT */}

                                            <td>
<span className="employee-department">
    {emp.departmentName || "Not Assigned"}
</span>

                                            </td>

                                            {/* DESIGNATION */}

                                            <td>
                                                {emp.designation ||
                                                    "-"}
                                            </td>

                                            {/* SALARY */}

                                            <td>
                                                ₹{" "}
                                                {Number(
                                                    emp.salary || 0
                                                ).toLocaleString(
                                                    "en-IN"
                                                )}
                                            </td>

                                            {/* JOINING DATE */}

                                            <td>
                                                {emp.joiningDate
                                                    ? new Date(
                                                          emp.joiningDate
                                                      ).toLocaleDateString(
                                                          "en-IN"
                                                      )
                                                    : "-"}
                                            </td>

                                            {/* STATUS */}

                                            <td>

                                                <span
                                                    className={`employee-status-badge ${
                                                        emp.status
                                                            ? "employee-status-active"
                                                            : "employee-status-inactive"
                                                    }`}
                                                >
                                                    {emp.status
                                                        ? "Active"
                                                        : "Inactive"}
                                                </span>

                                            </td>

                                            {/* ACTION */}

                                            <td>

                                                <div className="employee-actions">

                                                    <button
                                                        type="button"
                                                        title="Edit employee"
                                                        onClick={() =>
                                                            editEmployee(
                                                                emp
                                                            )
                                                        }
                                                        className="employee-action-btn employee-edit"
                                                    >
                                                        ✎
                                                    </button>

                                                    <button
                                                        type="button"
                                                        title="Delete employee"
                                                        onClick={() =>
                                                            deleteEmployee(
                                                                emp.employeeId
                                                            )
                                                        }
                                                        className="employee-action-btn employee-delete"
                                                    >
                                                        🗑
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>
                            

                            

                        )}

                        <Pagination
    currentPage={currentPage}
    totalPages={totalPages}
    onPageChange={setCurrentPage}
/>

                    </div>
                </div>
            </div>
        </div>
    );
}


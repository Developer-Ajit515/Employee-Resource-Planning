import {
    FaTachometerAlt,
    FaUsers,
    FaUserTie,
    FaUserShield,
    FaProjectDiagram,
    FaTasks,
    FaBox,
    FaTags,
    FaLock,
    FaCog,
    FaSignOutAlt,
    FaClipboardList,
    FaBuilding,
    FaCalendarCheck,
    FaCalendarTimes,
    FaWarehouse,
    FaBoxes,
    FaUserFriends,
    FaShoppingCart,
    FaFileInvoice,
    FaMoneyBillWave,
    FaTruck,
    FaClipboardCheck,
    FaDolly,
    FaClock,
    FaChartBar
} from "react-icons/fa";

import {
    NavLink,
    useNavigate
} from "react-router-dom";

import { useAuth } from "../context/authContext";
import "./Sidebar.css";


function Sidebar({ onClose, isOpen }) {

    const navigate = useNavigate();

    const {
        hasPermission,
        hasRole
    } = useAuth();

    // =====================================
    // MENU
    // =====================================

    const menuGroups = [

        {
            title: "MAIN",

            items: [
                {
                    name: "Dashboard",
                    path: "/dashboard",
                    icon: <FaTachometerAlt />
                }
            ]
        },

        {
            title: "ADMINISTRATION",

            items: [
                {
                    name: "Users",
                    path: "/users",
                    icon: <FaUsers />,
                    permission: "User.View"
                },
                {
                    name: "Roles",
                    path: "/roles",
                    icon: <FaUserShield />,
                    permission: "Role.View"
                },
                {
                    name: "Permissions",
                    path: "/permissions",
                    icon: <FaLock />,
                    permission: "Permission.View"
                },
                {
                    name: "Audit Logs",
                    path: "/audit-logs",
                    icon: <FaClipboardList />,
                    permission: "AuditLog.View"
                }
            ]
        },

        {
            title: "HUMAN RESOURCES",

            items: [
                {
                    name: "Employees",
                    path: "/employees",
                    icon: <FaUserTie />,
                    permission: "Employee.View"
                },
                {
                    name: "Departments",
                    path: "/departments",
                    icon: <FaBuilding />,
                    permission: "Department.View"
                },
                {
                    name: "Attendance",
                    path: "/attendance",
                    icon: <FaCalendarCheck />,
                    permission: "Attendance.View"
                },
                {
                    name: "Leave",
                    path: "/leave",
                    icon: <FaCalendarTimes />,
                    permission: "Leave.View"
                }
            ]
        },

        {
            title: "INVENTORY",

            items: [
                {
                    name: "Categories",
                    path: "/categories",
                    icon: <FaTags />,
                    permission: "Category.View"
                },
                {
                    name: "Products",
                    path: "/products",
                    icon: <FaBox />,
                    permission: "Product.View"
                },
                {
                    name: "Warehouses",
                    path: "/warehouses",
                    icon: <FaWarehouse />,
                    permission: "Warehouse.View"
                },
                {
                    
    name: "Inventory",
    path: "/inventory",
    icon: <FaBoxes />,
    permission: "Inventory.View"
}
                
            ]
        },

        {
            title: "SALES",

            items: [
                {
                    name: "Customers",
                    path: "/customers",
                    icon: <FaUserFriends />,
                    permission: "Customer.View"
                },
                {
                    name: "Sales Orders",
                    path: "/sales-orders",
                    icon: <FaShoppingCart />,
                    permission: "SalesOrder.View"
                },
                {
                    name: "Invoices",
                    path: "/invoices",
                    icon: <FaFileInvoice />,
                    permission: "Invoice.View"
                },
                {
                    name: "Payments",
                    path: "/payments",
                    icon: <FaMoneyBillWave />,
                    permission: "Payment.View"
                }
            ]
        },

        {
            title: "PROCUREMENT",

            items: [
                {
                    name: "Suppliers",
                    path: "/suppliers",
                    icon: <FaTruck />,
                    permission: "Supplier.View"
                },
                {
                    name: "Purchase Orders",
                    path: "/purchase-orders",
                    icon: <FaClipboardCheck />,
                    permission: "PurchaseOrder.View"
                },
                
{
    name: "Goods Receipt",
    path: "/goods-receipts",
    icon: <FaDolly />,
    permission: "GoodsReceipt.View"
}

            ]
        },

        {
            title: "PROJECT MANAGEMENT",

            items: [
                {
                    name: "Projects",
                    path: "/projects",
                    icon: <FaProjectDiagram />,
                    permission: "Project.View"
                },
                {
                    name: "Tasks",
                    path: "/tasks",
                    icon: <FaTasks />,
                    permission: "Task.View"
                },
                {
                    name: "Timesheets",
                    path: "/timesheets",
                    icon: <FaClock />,
                    permission: "Timesheet.View"
                }
            ]
        },

        {
            title: "REPORTS",

            items: [
                {
                    name: "Reports",
                    path: "/reports",
                    icon: <FaChartBar />,
                    permission: "Report.View"
                }
            ]
        }
    ];


    // =====================================
    // PERMISSION
    // =====================================

    const canViewItem = (item) => {

        if (!item.permission) {
            return true;
        }

        if (hasRole("Admin")) {
            return true;
        }

        return hasPermission(item.permission);
    };


    // =====================================
    // LOGOUT
    // =====================================

    const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user")

navigate("/login", {
    replace: true
});

window.location.reload();


};



    // =====================================
    // NAVIGATION CLICK
    // =====================================

    const handleNavClick = () => {

        if (typeof onClose === "function") {
            onClose();
        }
    };


    return (

        <aside
            className={`sidebar ${isOpen ? "open" : ""}`}
        >

            {/* =================================
                LOGO
            ================================= */}

            <div className="sidebar-logo">

                <div className="logo-mark">
                    E
                </div>

                <div className="logo-text">

                    <h2>
                        ERP<span>Pro</span>
                    </h2>

                    <p>
                        Management Suite
                    </p>

                </div>

            </div>


            {/* =================================
                NAVIGATION
            ================================= */}

            <div className="sidebar-content">

                <nav className="sidebar-nav">

                    {menuGroups.map((group) => {

                        const visibleItems =
                            group.items.filter(canViewItem);

                        if (visibleItems.length === 0) {
                            return null;
                        }

                        return (

                            <div
                                className="menu-group"
                                key={group.title}
                            >

                                <div className="menu-title">
                                    {group.title}
                                </div>


                                {visibleItems.map((item) => (

                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        onClick={handleNavClick}
                                        className={({ isActive }) =>
                                            `menu-item ${
                                                isActive
                                                    ? "active"
                                                    : ""
                                            }`
                                        }
                                    >

                                        <span className="menu-icon">
                                            {item.icon}
                                        </span>

                                        <span className="menu-name">
                                            {item.name}
                                        </span>

                                    </NavLink>

                                ))}

                            </div>
                        );

                    })}

                </nav>

            </div>


            {/* =================================
                BOTTOM
            ================================= */}

            <div className="sidebar-bottom">

                <NavLink
                    to="/settings"
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                        `menu-item ${
                            isActive ? "active" : ""
                        }`
                    }
                >

                    <span className="menu-icon">
                        <FaCog />
                    </span>

                    <span className="menu-name">
                        Settings
                    </span>

                </NavLink>


                <button
                    type="button"
                    className="logout-btn"
                    onClick={handleLogout}
                >

                    <span className="menu-icon">
                        <FaSignOutAlt />
                    </span>

                    <span className="menu-name">
                        Logout
                    </span>

                </button>

            </div>

        </aside>
    );
}

export default Sidebar;
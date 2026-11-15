
import React from "react";

import { Routes, Route, Navigate } from "react-router-dom";
 
import Login from "../pages/Login/Login";

import Dashboard from "../pages/Dashboard/Dashboard";
import MessagePage from "../pages/Messages/MessagePage";
import NotificationPage from "../pages/Notifications/NotificationPage";

import UserList from "../pages/Users/UserList";
import UserForm from "../pages/Users/UserForm";
import UserDetails from "../pages/Users/UserDetails";

import AuditLogList from "../pages/AuditLog/AuditLogList";
import AuditLogDetails from "../pages/AuditLog/AuditLogDetails";

import ProjectList from "../pages/Projects/ProjectList";
import ProjectForm from "../pages/Projects/ProjectForm";
import ProjectDetails from "../pages/Projects/ProjectDetails";

import TaskList from "../pages/Tasks/TaskList";
import TaskForm from "../pages/Tasks/TaskForm";
import TaskDetails from "../pages/Tasks/TaskDetails";

import RoleList from "../pages/Roles/RoleList";
import RoleForm from "../pages/Roles/RoleForm";

import PermissionList from "../pages/Permission/PermissionList";
import PermissionForm from "../pages/Permission/PermissionForm";
import PermissionDetails from "../pages/Permission/PermissionDetails";

import EmployeeApp from "../pages/Employees/Employee";

import ProductList from "../pages/Products/ProductList";
import ProductForm from "../pages/Products/ProductForm";
import ProductDetails from "../pages/Products/ProductDetails";

import DepartmentList from "../pages/Department/DepartmentList";
import DepartmentForm from "../pages/Department/DepartmentForm";
import DepartmentDetails from "../pages/Department/DepartmentDetails";

import LeaveList from "../pages/Leave/LeaveList";
import LeaveForm from "../pages/Leave/LeaveForm";

import AttendanceList from "../pages/Attendance/AttendanceList";
import AttendanceForm from "../pages/Attendance/AttendanceForm";
import AttendanceDetails from "../pages/Attendance/AttendanceDetails";


import CategoryList from "../pages/Categories/CategoryList";
import CategoryForm from "../pages/Categories/CategoryForm";
import CategoryDetails from "../pages/Categories/CategoryDetails";

import InventoryList from "../pages/Inventory/InventoryList";
import StockAdjustment from "../pages/Inventory/StockAdjustment";
import StockIn from "../pages/Inventory/StockIn";
import StockOut from "../pages/Inventory/StockOut";

import WarehouseList from "../pages/Warehouse/WarehouseList";
import WarehouseDetails from "../pages/Warehouse/WarehouseDetails";
import WarehouseForm from "../pages/Warehouse/WarehouseForm";

import TimesheetList from "../pages/Timesheet/TimesheetList";
import TimesheetForm from "../pages/Timesheet/TimesheetForm";
import TimesheetDetails from "../pages/Timesheet/TimesheetDetails";

import CustomerList from "../pages/Customer/CustomerList";
import CustomerForm from "../pages/Customer/CustomerForm";
import CustomerDetails from "../pages/Customer/CustomerDetails";

import SalesOrderList from "../pages/SalesOrders/SalesOrderList";
import SalesOrderDetails from "../pages/SalesOrders/SalesOrderDetails";
import SalesOrderForm from "../pages/SalesOrders/SalesOrderForm";

import InvoiceList from "../pages/Invoices/InvoiceList";
import InvoiceForm from "../pages/Invoices/InvoiceForm";
import InvoiceDetails from "../pages/Invoices/InvoiceDetails";

import PaymentList from "../pages/Payments/PaymentList";
import PaymentForm from "../pages/Payments/PaymentForm";
import PaymentDetails from "../pages/Payments/PaymentDetails";

import StripeSuccess from "../pages/Payments/StripeSuccess";
import StripeCancel from "../pages/Payments/StripeCancel";

import SupplierList from "../pages/Suppliers/SupplierList";
import SupplierForm from "../pages/Suppliers/SupplierForm";
import SupplierDetails from "../pages/Suppliers/SupplierDetails";

import PurchaseOrderList from "../pages/PurchaseOrder/PurchaseOrderList";
import PurchaseOrderForm from "../pages/PurchaseOrder/PurchaseOrderForm";
import PurchaseOrderDetails from "../pages/PurchaseOrder/PurchaseOrderDetails";

import GoodsReceiptList from "../pages/GoodsReceipt/GoodsReceiptList";
import GoodsReceiptForm from "../pages/GoodsReceipt/GoodsReceiptForm";
import GoodsReceiptDetails from "../pages/GoodsReceipt/GoodsReceiptDetails";

import ProtectedRoutes from "./ProtectedRoutes";
import MainLayout from "../Layouts/MainLayout";

import ComingSoon from "../pages/Common/ComingSoon";
import Reports from "../pages/Reports/Reports";
import Settings from "../pages/Settings/Settings";



function AppRoutes() {

    return (

        <Routes>

            {/* =========================
                PUBLIC
            ========================= */}

            <Route
                path="/"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

            <Route
                path="/login"
                element={<Login />}
            />


            {/* =========================
                PROTECTED APPLICATION
            ========================= */}

            <Route element={<ProtectedRoutes />}>

                <Route element={<MainLayout />}>

                    {/* =====================
                        DASHBOARD
                    ===================== */}

                    <Route
                        path="/dashboard"
                        element={<Dashboard />}
                    />


<Route path="/messages" element={<MessagePage />} />

<Route
  path="/notifications"
  element={
    
      <NotificationPage />
    
  }
/>

<Route
    path="/reports"
    element={ <Reports />
        
    }
/>

                    {/* =====================
    USERS
===================== */}

<Route
    path="/users"
    element={<UserList />}
/>

<Route
    path="/users/create"
    element={<UserForm />}
/>

<Route
    path="/users/edit/:id"
    element={<UserForm />}
/>

<Route
    path="/users/:id"
    element={<UserDetails />}
/>
                    {/* =====================
                        PROJECTS
                    ===================== */}

                    <Route
                        path="/projects"
                        element={<ProjectList />}
                    />

                    <Route
                        path="/projects/add"
                        element={<ProjectForm />}
                    />

                    <Route
                        path="/projects/edit/:id"
                        element={<ProjectForm />}
                    />

                    <Route path="/projects/details/:id" 
                    element={<ProjectDetails />}
                     />


                    {/* =====================
                        TASKS
                    ===================== */}

                    <Route
                        path="/tasks"
                        element={<TaskList />}
                    />

                    <Route
                        path="/tasks/create"
                        element={<TaskForm />}
                    />

                    <Route
                        path="/tasks/edit/:id"
                        element={<TaskForm />}
                    />

                    <Route
                         path="/tasks/details/:id"
                         element={<TaskDetails />}
                    />


                    {/* =====================
                        ROLES
                    ===================== */}

                    <Route
                        path="/roles"
                        element={<RoleList />}
                    />

                    <Route
                        path="/roles/create"
                        element={<RoleForm />}
                    />

                    <Route
                        path="/roles/edit/:id"
                        element={<RoleForm />}
                    />


                    {/* =====================
                        EMPLOYEES
                    ===================== */}

                    <Route
                        path="/employees"
                        element={<EmployeeApp />}
                    />


                    {/* =====================
                        PRODUCTS
                    ===================== */}

                    <Route
                        path="/products"
                        element={<ProductList />}
                    />

                    <Route
                        path="/products/create"
                        element={<ProductForm />}
                    />

                    <Route
                        path="/products/edit/:id"
                        element={<ProductForm />}
                    />

                    <Route
                        path="/products/:id"
                        element={<ProductDetails />}
                    />

                      {/* =====================
                        CATEGORIES
                    ===================== */}

                   <Route
                       path="/categories"
                       element={<CategoryList />}
                   />

                   <Route
                       path="/categories/add"
                       element={<CategoryForm />}
                   />

                    <Route
                       path="/categories/edit/:id"
                       element={<CategoryForm />}
                   />

                    <Route
                       path="/categories/:id"
                       element={<CategoryDetails />}
                   />



                    {/* =====================
                        ADMINISTRATION
                    ===================== */}

                    <Route
    path="/permissions"
    element={<PermissionList />}
/>

<Route
    path="/permissions/create"
    element={<PermissionForm />}
/>

<Route
    path="/permissions/edit/:id"
    element={<PermissionForm />}
/>

<Route
    path="/permissions/:id"
    element={<PermissionDetails />}
/>

                    <Route path="/audit-logs" element={<AuditLogList />} />
                    <Route path="/audit-logs/:id" element={<AuditLogDetails />} />


                    {/* =====================
                        HR
                    ===================== */}

                    {/* Department CRUD */}

                    <Route
                        path="/departments"
                        element={<DepartmentList />}
                    />

                    <Route
                        path="/departments/create"
                        element={<DepartmentForm />}
                    />

                    <Route
                        path="/departments/edit/:id"
                        element={<DepartmentForm />}
                    />

                    <Route
                        path="/departments/:id"
                        element={<DepartmentDetails />}
                    />

                   <Route
                         path="/attendance"
                         element={<AttendanceList />}
                    />

                   <Route
                          path="/attendance/mark"
                          element={<AttendanceForm />}
                     />

                     <Route path="/attendance/edit/:id" 
                            element={<AttendanceForm />} />

                     <Route
                           path="/attendance/details/:id"
                           element={<AttendanceDetails />}
                    />


                   <Route path="/leave" 
                            element={<LeaveList />} />

                   <Route
                          path="/leave/apply"
                            element={<LeaveForm />} />


                    {/* =====================
                        INVENTORY
                    ===================== */}

                     <Route path="/inventory" 
                            element={<InventoryList />} /> 

                     <Route path="/inventory/stock-in" 
                            element={<StockIn />} />
                      <Route 
                            path="/inventory/stock-out" 
                            element={<StockOut />} /> 

                    <Route path="/inventory/adjustment" 
                           element={<StockAdjustment />} />

                   <Route path="/warehouses" element={<WarehouseList />} />
                   <Route path="/warehouses/create" element={<WarehouseForm />} />
                   <Route path="/warehouses/edit/:id" element={<WarehouseForm />} />
                   <Route path="/warehouses/:id" element={<WarehouseDetails />} />

                   


                    {/* =====================
                        SALES
                    ===================== */}

                                     <Route
                                               path="/customers"
                                              element={<CustomerList />}
                                          />

                                     <Route
                                             path="/customers/add"
                                            element={<CustomerForm />}
                                       />

                                    <Route
                                            path="/customers/edit/:id"
                                            element={<CustomerForm />}
                                       />

                                    <Route
                                            path="/customers/details/:id"
                                            element={<CustomerDetails />}
                                       />

                   <Route
    path="/sales-orders"
    element={<SalesOrderList />}
/>

<Route
    path="/sales-orders/add"
    element={<SalesOrderForm />}
/>

<Route
    path="/sales-orders/edit/:id"
    element={<SalesOrderForm />}
/>

<Route
    path="/sales-orders/details/:id"
    element={<SalesOrderDetails />}
/>

                                  <Route
    path="/invoices"
    element={<InvoiceList />}
/>

<Route
    path="/invoices/create"
    element={<InvoiceForm />}
/>

<Route
    path="/invoices/edit/:id"
    element={<InvoiceForm />}
/>

<Route
    path="/invoices/:id"
    element={<InvoiceDetails />}
/>

                        <Route path="/payments" element={<PaymentList />} />
                        <Route path="/payments/create" element={<PaymentForm />} />
                        <Route path="/payments/edit/:id" element={<PaymentForm />} />
                        <Route path="/payments/details/:id" element={<PaymentDetails />} />
                        <Route path="/payments/stripe-success" element={<StripeSuccess />}/>

                        <Route path="/payments/stripe-cancel" element={<StripeCancel />}/>

                    {/* =====================
                        PROCUREMENT
                    ===================== */}

                     <Route
    path="/suppliers"
    element={
        
            <SupplierList />
        
    }
/>

<Route
    path="/suppliers/create"
    element={
        
            <SupplierForm />
        
    }
/>

<Route
    path="/suppliers/edit/:id"
    element={
        
            <SupplierForm />
        
    }
/>
<Route
    path="/suppliers/:id"
    element={<SupplierDetails />}
/>
                    <Route


    path="/purchase-orders"
    element={<PurchaseOrderList />}
/>

<Route
    path="/purchase-orders/create"
    element={<PurchaseOrderForm />}
/>

<Route
    path="/purchase-orders/edit/:id"
    element={<PurchaseOrderForm />}
/>

<Route
    path="/purchase-orders/details/:id"
    element={<PurchaseOrderDetails />}
/>

    <Route
    path="/goods-receipts"
    element={<GoodsReceiptList />}
/>

<Route
    path="/goods-receipts/create"
    element={<GoodsReceiptForm />}
/>

<Route
    path="/goods-receipts/edit/:id"
    element={<GoodsReceiptForm />}
/>

<Route
    path="/goods-receipts/details/:id"
    element={<GoodsReceiptDetails />}
/>


                    {/* =====================
                        PROJECT MANAGEMENT
                    ===================== */}

                    {/* ==========================================
                        TIMESHEET
                    ========================================== */}

                    <Route
                        path="/timesheets"
                        element={<TimesheetList />}
                    />

                    <Route
                        path="/timesheets/add"
                        element={<TimesheetForm />}
                    />

                    <Route
                        path="/timesheets/edit/:id"
                        element={<TimesheetForm />}
                    />

                    <Route
                        path="/timesheets/details/:id"
                        element={<TimesheetDetails />}
                    />


                    {/* =====================
                        REPORTS
                    ===================== */}

                    <Route
                        path="/reports"
                        element={<ComingSoon />}
                    />


                    {/* =====================
                        SETTINGS
                    ===================== */}

                   <Route path="/settings" element={<Settings />} />

                </Route>

            </Route>


            {/* =========================
                CATCH ALL
            ========================= */}

            <Route
                path="*"
                element={
                    <Navigate
                        to="/dashboard"
                        replace
                    />
                }
            />

        </Routes>
    );
}

export default AppRoutes;


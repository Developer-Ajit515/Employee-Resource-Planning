import React from "react";
import {
    Navigate,
    Outlet,
    useLocation
} from "react-router-dom";

import { useAuth } from "../context/authContext";

function ProtectedRoutes({
    allowedRoles = [],
    requiredPermissions = []
}) {

    const {
        user,
        loading,
        hasAnyRole,
        hasAnyPermission
    } = useAuth();

    const location = useLocation();


    // =====================================
    // AUTH INITIALIZATION
    // =====================================

    if (loading) {
        return (
            <div className="auth-loading">
                <div className="auth-spinner" />

                <span>
                    Loading ERP...
                </span>
            </div>
        );
    }


    // =====================================
    // TOKEN CHECK
    // =====================================

    const token = localStorage.getItem("token");

    if (!token || !user) {
        return (
            <Navigate
                to="/login"
                replace
                state={{
                    from: location
                }}
            />
        );
    }


    // =====================================
    // ROLE CHECK
    // =====================================

    if (
        allowedRoles.length > 0 &&
        !hasAnyRole(allowedRoles)
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    // =====================================
    // PERMISSION CHECK
    // =====================================

    if (
        requiredPermissions.length > 0 &&
        !hasAnyPermission(requiredPermissions)
    ) {
        return (
            <Navigate
                to="/dashboard"
                replace
            />
        );
    }


    // =====================================
    // ALLOW ROUTE
    // =====================================

    return <Outlet />;
}

export default ProtectedRoutes;
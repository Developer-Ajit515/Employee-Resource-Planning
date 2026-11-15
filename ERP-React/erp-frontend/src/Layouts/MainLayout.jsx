
import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import Navbar from "../components/Navbar";
import NavigationLoader from "../components/NavigationLoader";

import "./MainLayout.css";

function MainLayout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="app-shell">

            {/* Global navigation loader */}
            <NavigationLoader />

            <Sidebar
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            />

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="main-content">

                <Navbar
                    onMenuClick={() => setSidebarOpen(true)}
                />

                <div className="page-content">
                    <Outlet />
                </div>

            </main>

        </div>
    );
}

export default MainLayout;

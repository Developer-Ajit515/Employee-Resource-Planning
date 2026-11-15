
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

import SettingsService from "../../services/settingsService";

import "./Settings.css";

function Settings() {

    const [settings, setSettings] = useState(null);

    const [activeTab, setActiveTab] = useState("general");

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);


    // ============================
    // LOAD SETTINGS
    // ============================

    const loadSettings = async () => {

        try {

            setLoading(true);

            const data =
                await SettingsService.getSettings();

            setSettings(data);

        } catch (error) {

            console.error(
                "Error loading settings:",
                error
            );

            Swal.fire(
                "Error",
                "Failed to load settings.",
                "error"
            );

        } finally {

            setLoading(false);

        }
    };


    // ============================
    // LOAD ON COMPONENT MOUNT
    // ============================

    useEffect(() => {

        loadSettings();

    }, []);


    // ============================
    // INPUT CHANGE
    // ============================

    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setSettings((prev) => ({
            ...prev,
            [name]:
                type === "checkbox"
                    ? checked
                    : value
        }));
    };


    // ============================
    // SAVE SETTINGS
    // ============================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setSaving(true);

            const updated =
                await SettingsService.updateSettings(
                    settings
                );

            setSettings(updated);

            Swal.fire({
                icon: "success",
                title: "Settings Updated",
                text: "Settings saved successfully.",
                timer: 1800,
                showConfirmButton: false
            });

        } catch (error) {

            console.error(
                "Error updating settings:",
                error
            );

            Swal.fire(
                "Error",
                "Failed to update settings.",
                "error"
            );

        } finally {

            setSaving(false);

        }
    };


    // ============================
    // RESET FORM
    // ============================

    const handleReset = () => {

        loadSettings();

    };


    // ============================
    // LOADING
    // ============================

    if (loading) {

        return (
            <div className="settings-page">

                <div className="settings-loading">
                    Loading settings...
                </div>

            </div>
        );
    }


    if (!settings) {

        return (
            <div className="settings-page">

                <div className="settings-error">
                    Unable to load settings.
                </div>

            </div>
        );
    }


    return (

        <div className="settings-page">

            {/* ============================
                HEADER
            ============================ */}

            <div className="settings-header">

                <div>

                    <h1>Settings</h1>

                    <p>
                        Manage your ERP system
                        preferences and configuration.
                    </p>

                </div>

            </div>


            {/* ============================
                SETTINGS CONTENT
            ============================ */}

            <div className="settings-layout">


                {/* ============================
                    SIDEBAR
                ============================ */}

                <div className="settings-sidebar">

                    <button
                        className={
                            activeTab === "general"
                                ? "settings-tab active"
                                : "settings-tab"
                        }
                        onClick={() =>
                            setActiveTab("general")
                        }
                    >
                        <span>⚙️</span>
                        General
                    </button>


                    <button
                        className={
                            activeTab === "notifications"
                                ? "settings-tab active"
                                : "settings-tab"
                        }
                        onClick={() =>
                            setActiveTab("notifications")
                        }
                    >
                        <span>🔔</span>
                        Notifications
                    </button>


                    <button
                        className={
                            activeTab === "system"
                                ? "settings-tab active"
                                : "settings-tab"
                        }
                        onClick={() =>
                            setActiveTab("system")
                        }
                    >
                        <span>🖥️</span>
                        System
                    </button>


                    <button
                        className={
                            activeTab === "appearance"
                                ? "settings-tab active"
                                : "settings-tab"
                        }
                        onClick={() =>
                            setActiveTab("appearance")
                        }
                    >
                        <span>🎨</span>
                        Appearance
                    </button>


                    <button
                        className={
                            activeTab === "security"
                                ? "settings-tab active"
                                : "settings-tab"
                        }
                        onClick={() =>
                            setActiveTab("security")
                        }
                    >
                        <span>🔐</span>
                        Security
                    </button>

                </div>


                {/* ============================
                    MAIN CONTENT
                ============================ */}

                <div className="settings-content">

                    <form onSubmit={handleSubmit}>


                        {/* ============================
                            GENERAL
                        ============================ */}

                        {activeTab === "general" && (

                            <div className="settings-section">

                                <div className="section-heading">

                                    <h2>
                                        General Settings
                                    </h2>

                                    <p>
                                        Manage your company
                                        information.
                                    </p>

                                </div>


                                <div className="settings-grid">


                                    <div className="form-group">

                                        <label>
                                            Company Name
                                        </label>

                                        <input
                                            type="text"
                                            name="companyName"
                                            value={
                                                settings.companyName || ""
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter company name"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Email
                                        </label>

                                        <input
                                            type="email"
                                            name="email"
                                            value={
                                                settings.email || ""
                                            }
                                            onChange={handleChange}
                                            placeholder="company@example.com"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Phone
                                        </label>

                                        <input
                                            type="text"
                                            name="phone"
                                            value={
                                                settings.phone || ""
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter phone number"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Website
                                        </label>

                                        <input
                                            type="text"
                                            name="website"
                                            value={
                                                settings.website || ""
                                            }
                                            onChange={handleChange}
                                            placeholder="https://example.com"
                                        />

                                    </div>


                                    <div className="form-group full-width">

                                        <label>
                                            Address
                                        </label>

                                        <textarea
                                            name="address"
                                            value={
                                                settings.address || ""
                                            }
                                            onChange={handleChange}
                                            placeholder="Enter company address"
                                            rows="3"
                                        />

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Currency
                                        </label>

                                        <select
                                            name="currency"
                                            value={
                                                settings.currency || "INR"
                                            }
                                            onChange={handleChange}
                                        >

                                            <option value="INR">
                                                INR - Indian Rupee
                                            </option>

                                            <option value="USD">
                                                USD - US Dollar
                                            </option>

                                            <option value="EUR">
                                                EUR - Euro
                                            </option>

                                            <option value="GBP">
                                                GBP - British Pound
                                            </option>

                                        </select>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* ============================
                            NOTIFICATIONS
                        ============================ */}

                        {activeTab === "notifications" && (

                            <div className="settings-section">

                                <div className="section-heading">

                                    <h2>
                                        Notification Settings
                                    </h2>

                                    <p>
                                        Control ERP notifications
                                        and alerts.
                                    </p>

                                </div>


                                <div className="settings-options">


                                    <div className="setting-option">

                                        <div>

                                            <h3>
                                                Email Notifications
                                            </h3>

                                            <p>
                                                Receive important
                                                notifications by email.
                                            </p>

                                        </div>

                                        <label className="switch">

                                            <input
                                                type="checkbox"
                                                name="emailNotifications"
                                                checked={
                                                    settings.emailNotifications
                                                }
                                                onChange={handleChange}
                                            />

                                            <span className="slider"></span>

                                        </label>

                                    </div>


                                    <div className="setting-option">

                                        <div>

                                            <h3>
                                                Task Notifications
                                            </h3>

                                            <p>
                                                Receive notifications
                                                related to tasks.
                                            </p>

                                        </div>

                                        <label className="switch">

                                            <input
                                                type="checkbox"
                                                name="taskNotifications"
                                                checked={
                                                    settings.taskNotifications
                                                }
                                                onChange={handleChange}
                                            />

                                            <span className="slider"></span>

                                        </label>

                                    </div>


                                    <div className="setting-option">

                                        <div>

                                            <h3>
                                                Stock Notifications
                                            </h3>

                                            <p>
                                                Get alerts for stock
                                                related activities.
                                            </p>

                                        </div>

                                        <label className="switch">

                                            <input
                                                type="checkbox"
                                                name="stockNotifications"
                                                checked={
                                                    settings.stockNotifications
                                                }
                                                onChange={handleChange}
                                            />

                                            <span className="slider"></span>

                                        </label>

                                    </div>


                                    <div className="setting-option">

                                        <div>

                                            <h3>
                                                Low Stock Alert
                                            </h3>

                                            <p>
                                                Get notified when
                                                product stock is low.
                                            </p>

                                        </div>

                                        <label className="switch">

                                            <input
                                                type="checkbox"
                                                name="lowStockAlert"
                                                checked={
                                                    settings.lowStockAlert
                                                }
                                                onChange={handleChange}
                                            />

                                            <span className="slider"></span>

                                        </label>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* ============================
                            SYSTEM
                        ============================ */}

                        {activeTab === "system" && (

                            <div className="settings-section">

                                <div className="section-heading">

                                    <h2>
                                        System Settings
                                    </h2>

                                    <p>
                                        Configure system-wide
                                        preferences.
                                    </p>

                                </div>


                                <div className="settings-grid">


                                    <div className="form-group">

                                        <label>
                                            Language
                                        </label>

                                        <select
                                            name="language"
                                            value={
                                                settings.language || "en-IN"
                                            }
                                            onChange={handleChange}
                                        >

                                            <option value="en-IN">
                                                English (India)
                                            </option>

                                            <option value="en-US">
                                                English (US)
                                            </option>

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Date Format
                                        </label>

                                        <select
                                            name="dateFormat"
                                            value={
                                                settings.dateFormat ||
                                                "dd-MM-yyyy"
                                            }
                                            onChange={handleChange}
                                        >

                                            <option value="dd-MM-yyyy">
                                                DD-MM-YYYY
                                            </option>

                                            <option value="MM-dd-yyyy">
                                                MM-DD-YYYY
                                            </option>

                                            <option value="yyyy-MM-dd">
                                                YYYY-MM-DD
                                            </option>

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Time Zone
                                        </label>

                                        <select
                                            name="timeZone"
                                            value={
                                                settings.timeZone ||
                                                "India Standard Time"
                                            }
                                            onChange={handleChange}
                                        >

                                            <option value="India Standard Time">
                                                India Standard Time
                                            </option>

                                            <option value="UTC">
                                                UTC
                                            </option>

                                            <option value="Eastern Standard Time">
                                                Eastern Standard Time
                                            </option>

                                        </select>

                                    </div>


                                    <div className="form-group">

                                        <label>
                                            Page Size
                                        </label>

                                        <select
                                            name="pageSize"
                                            value={
                                                settings.pageSize || 10
                                            }
                                            onChange={handleChange}
                                        >

                                            <option value={5}>
                                                5
                                            </option>

                                            <option value={10}>
                                                10
                                            </option>

                                            <option value={25}>
                                                25
                                            </option>

                                            <option value={50}>
                                                50
                                            </option>

                                            <option value={100}>
                                                100
                                            </option>

                                        </select>

                                    </div>

                                </div>


                                <div className="settings-options">

                                    <div className="setting-option">

                                        <div>

                                            <h3>
                                                Maintenance Mode
                                            </h3>

                                            <p>
                                                Temporarily restrict
                                                system access.
                                            </p>

                                        </div>

                                        <label className="switch">

                                            <input
                                                type="checkbox"
                                                name="maintenanceMode"
                                                checked={
                                                    settings.maintenanceMode
                                                }
                                                onChange={handleChange}
                                            />

                                            <span className="slider"></span>

                                        </label>

                                    </div>

                                </div>

                            </div>
                        )}


                        {/* ============================
                            APPEARANCE
                        ============================ */}

{activeTab === "appearance" && (

    <div className="settings-section">

        <div className="section-heading">

            <h2>
                Appearance Settings
            </h2>

            <p>
                Customize the look and layout of your ERP.
            </p>

        </div>


        {/* ============================
            THEME
        ============================ */}

        <div className="appearance-group">

            <h3>
                Theme
            </h3>

            <p>
                Choose how the ERP interface should appear.
            </p>


            <div className="theme-options">

                <label
                    className={
                        settings.theme === "light"
                            ? "theme-card active"
                            : "theme-card"
                    }
                >

                    <input
                        type="radio"
                        name="theme"
                        value="light"
                        checked={
                            settings.theme === "light"
                        }
                        onChange={handleChange}
                    />

                    <div className="theme-preview light-preview">

                        <div className="preview-sidebar"></div>

                        <div className="preview-content">

                            <div className="preview-bar"></div>

                            <div className="preview-card"></div>

                            <div className="preview-card small"></div>

                        </div>

                    </div>

                    <strong>
                        Light
                    </strong>

                    <span>
                        Default light theme
                    </span>

                </label>


                <label
                    className={
                        settings.theme === "dark"
                            ? "theme-card active"
                            : "theme-card"
                    }
                >

                    <input
                        type="radio"
                        name="theme"
                        value="dark"
                        checked={
                            settings.theme === "dark"
                        }
                        onChange={handleChange}
                    />

                    <div className="theme-preview dark-preview">

                        <div className="preview-sidebar"></div>

                        <div className="preview-content">

                            <div className="preview-bar"></div>

                            <div className="preview-card"></div>

                            <div className="preview-card small"></div>

                        </div>

                    </div>

                    <strong>
                        Dark
                    </strong>

                    <span>
                        Dark interface
                    </span>

                </label>


                <label
                    className={
                        settings.theme === "system"
                            ? "theme-card active"
                            : "theme-card"
                    }
                >

                    <input
                        type="radio"
                        name="theme"
                        value="system"
                        checked={
                            settings.theme === "system"
                        }
                        onChange={handleChange}
                    />

                    <div className="theme-preview system-preview">

                        <div className="preview-half light"></div>

                        <div className="preview-half dark"></div>

                    </div>

                    <strong>
                        System
                    </strong>

                    <span>
                        Follow device theme
                    </span>

                </label>

            </div>

        </div>


        {/* ============================
            SIDEBAR
        ============================ */}

        <div className="appearance-group">

            <h3>
                Sidebar
            </h3>

            <p>
                Customize how the navigation sidebar behaves.
            </p>


            <div className="settings-options">


                <div className="setting-option">

                    <div>

                        <h3>
                            Compact Sidebar
                        </h3>

                        <p>
                            Reduce sidebar spacing and item size.
                        </p>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="compactSidebar"
                            checked={
                                settings.compactSidebar
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>


                <div className="setting-option">

                    <div>

                        <h3>
                            Collapsed Sidebar
                        </h3>

                        <p>
                            Keep the sidebar collapsed by default.
                        </p>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="sidebarCollapsed"
                            checked={
                                settings.sidebarCollapsed
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>

        </div>


        {/* ============================
            DASHBOARD
        ============================ */}

        <div className="appearance-group">

            <h3>
                Dashboard Layout
            </h3>

            <p>
                Select your preferred dashboard arrangement.
            </p>


            <div className="dashboard-layout-options">

                <label
                    className={
                        settings.dashboardLayout === "default"
                            ? "layout-card active"
                            : "layout-card"
                    }
                >

                    <input
                        type="radio"
                        name="dashboardLayout"
                        value="default"
                        checked={
                            settings.dashboardLayout === "default"
                        }
                        onChange={handleChange}
                    />

                    <div className="layout-preview">

                        <div className="layout-box"></div>

                        <div className="layout-row">

                            <div></div>
                            <div></div>
                            <div></div>

                        </div>

                    </div>

                    <strong>
                        Default
                    </strong>

                </label>


                <label
                    className={
                        settings.dashboardLayout === "compact"
                            ? "layout-card active"
                            : "layout-card"
                    }
                >

                    <input
                        type="radio"
                        name="dashboardLayout"
                        value="compact"
                        checked={
                            settings.dashboardLayout === "compact"
                        }
                        onChange={handleChange}
                    />

                    <div className="layout-preview compact">

                        <div className="layout-row">

                            <div></div>
                            <div></div>
                            <div></div>
                            <div></div>

                        </div>

                        <div className="layout-box"></div>

                    </div>

                    <strong>
                        Compact
                    </strong>

                </label>


                <label
                    className={
                        settings.dashboardLayout === "wide"
                            ? "layout-card active"
                            : "layout-card"
                    }
                >

                    <input
                        type="radio"
                        name="dashboardLayout"
                        value="wide"
                        checked={
                            settings.dashboardLayout === "wide"
                        }
                        onChange={handleChange}
                    />

                    <div className="layout-preview wide">

                        <div className="layout-box"></div>

                        <div className="layout-box"></div>

                    </div>

                    <strong>
                        Wide
                    </strong>

                </label>

            </div>

        </div>

    </div>

)}



                        {/* ============================
                            SECURITY
                        ============================ */}

                      {activeTab === "security" && (

    <div className="settings-section">

        <div className="section-heading">

            <h2>
                Security Settings
            </h2>

            <p>
                Manage password policy, login security
                and session controls.
            </p>

        </div>


        {/* ============================
            PASSWORD POLICY
        ============================ */}

        <div className="appearance-group">

            <h3>
                Password Policy
            </h3>

            <p>
                Configure password requirements for users.
            </p>


            <div className="settings-grid">

                <div className="form-group">

                    <label>
                        Minimum Password Length
                    </label>

                    <input
                        type="number"
                        name="minimumPasswordLength"
                        min="6"
                        max="32"
                        value={
                            settings.minimumPasswordLength ?? 8
                        }
                        onChange={handleChange}
                    />

                </div>

            </div>


            <div className="settings-options">

                <div className="setting-option">

                    <div>
                        <h3>
                            Require Uppercase
                        </h3>

                        <p>
                            Password must contain at least
                            one uppercase letter.
                        </p>
                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="requireUppercase"
                            checked={
                                settings.requireUppercase ?? true
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>


                <div className="setting-option">

                    <div>
                        <h3>
                            Require Number
                        </h3>

                        <p>
                            Password must contain at least
                            one number.
                        </p>
                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="requireNumber"
                            checked={
                                settings.requireNumber ?? true
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>


                <div className="setting-option">

                    <div>
                        <h3>
                            Require Special Character
                        </h3>

                        <p>
                            Password must contain a special
                            character such as @, # or $.
                        </p>
                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="requireSpecialCharacter"
                            checked={
                                settings.requireSpecialCharacter ?? true
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>

        </div>


        {/* ============================
            LOGIN SECURITY
        ============================ */}

        <div className="appearance-group">

            <h3>
                Login Security
            </h3>

            <p>
                Control failed login attempts and account
                lockout behaviour.
            </p>


            <div className="settings-grid">

                <div className="form-group">

                    <label>
                        Maximum Login Attempts
                    </label>

                    <input
                        type="number"
                        name="maximumLoginAttempts"
                        min="1"
                        max="20"
                        value={
                            settings.maximumLoginAttempts ?? 5
                        }
                        onChange={handleChange}
                    />

                </div>


                <div className="form-group">

                    <label>
                        Lockout Duration (Minutes)
                    </label>

                    <input
                        type="number"
                        name="lockoutDurationMinutes"
                        min="1"
                        max="1440"
                        value={
                            settings.lockoutDurationMinutes ?? 15
                        }
                        onChange={handleChange}
                    />

                </div>

            </div>

        </div>


        {/* ============================
            SESSION SECURITY
        ============================ */}

        <div className="appearance-group">

            <h3>
                Session Security
            </h3>

            <p>
                Configure user session behaviour.
            </p>


            <div className="settings-grid">

                <div className="form-group">

                    <label>
                        Session Timeout (Minutes)
                    </label>

                    <input
                        type="number"
                        name="sessionTimeoutMinutes"
                        min="5"
                        max="1440"
                        value={
                            settings.sessionTimeoutMinutes ?? 30
                        }
                        onChange={handleChange}
                    />

                </div>

            </div>


            <div className="settings-options">

                <div className="setting-option">

                    <div>

                        <h3>
                            Two-Factor Authentication
                        </h3>

                        <p>
                            Require an additional verification
                            step during login.
                        </p>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="twoFactorAuthentication"
                            checked={
                                settings.twoFactorAuthentication ?? false
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>


                <div className="setting-option">

                    <div>

                        <h3>
                            Force Password Change
                        </h3>

                        <p>
                            Require users to change their password
                            after administrator action.
                        </p>

                    </div>

                    <label className="switch">

                        <input
                            type="checkbox"
                            name="forcePasswordChange"
                            checked={
                                settings.forcePasswordChange ?? false
                            }
                            onChange={handleChange}
                        />

                        <span className="slider"></span>

                    </label>

                </div>

            </div>

        </div>

    </div>

)}


                        {/* ============================
                            ACTION BUTTONS
                        ============================ */}

                        {(
                            activeTab === "general" ||
                            activeTab === "notifications" ||
                            activeTab === "system" ||
                            activeTab === "appearance" ||
                            activeTab === "security"
) && (

                            <div className="settings-actions">

                                <button
                                    type="button"
                                    className="btn-secondary"
                                    onClick={handleReset}
                                    disabled={saving}
                                >
                                    Reset
                                </button>


                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={saving}
                                >

                                    {saving
                                        ? "Saving..."
                                        : "Save Changes"}

                                </button>

                            </div>

                        )}

                    </form>

                </div>

            </div>

        </div>
    );
}

export default Settings;


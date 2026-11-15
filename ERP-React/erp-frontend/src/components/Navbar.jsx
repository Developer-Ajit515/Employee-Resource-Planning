
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBell,
  FaSearch,
  FaEnvelope,
  FaUserCircle,
  FaChevronDown,
  FaUser,
  FaCog,
  FaSignOutAlt,
} from "react-icons/fa";
import Swal from "sweetalert2";
import "./Navbar.css";

const API_BASE_URL = "https://localhost:7011/api";

function Navbar() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [messageCount, setMessageCount] = useState(0);
  const [notificationCount, setNotificationCount] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);
  const searchRequestId = useRef(0);
  const profileRef = useRef(null);

  const today = new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const getHeaders = () => {
    const token = localStorage.getItem("token");

    return {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  const normalizeType = (type) =>
    String(type ?? "")
      .toLowerCase()
      .replace(/[\s_-]/g, "");

  const getResultPath = (item) => {
    const type = normalizeType(item.type);
    const id = item.id;

    const routes = {
      user: { list: "/users", details: (v) => `/users/${v}` },
      users: { list: "/users", details: (v) => `/users/${v}` },
      employee: { list: "/employees" },
      employees: { list: "/employees" },
      project: {
        list: "/projects",
        details: (v) => `/projects/details/${v}`,
      },
      projects: {
        list: "/projects",
        details: (v) => `/projects/details/${v}`,
      },
      task: { list: "/tasks", details: (v) => `/tasks/details/${v}` },
      tasks: { list: "/tasks", details: (v) => `/tasks/details/${v}` },
      role: { list: "/roles" },
      roles: { list: "/roles" },
      permission: {
        list: "/permissions",
        details: (v) => `/permissions/${v}`,
      },
      permissions: {
        list: "/permissions",
        details: (v) => `/permissions/${v}`,
      },
      product: { list: "/products", details: (v) => `/products/${v}` },
      products: { list: "/products", details: (v) => `/products/${v}` },
      supplier: { list: "/suppliers", details: (v) => `/suppliers/${v}` },
      suppliers: { list: "/suppliers", details: (v) => `/suppliers/${v}` },
      purchaseorder: {
        list: "/purchase-orders",
        details: (v) => `/purchase-orders/details/${v}`,
      },
      purchaseorders: {
        list: "/purchase-orders",
        details: (v) => `/purchase-orders/details/${v}`,
      },
      goodsreceipt: {
        list: "/goods-receipts",
        details: (v) => `/goods-receipts/details/${v}`,
      },
      goodsreceipts: {
        list: "/goods-receipts",
        details: (v) => `/goods-receipts/details/${v}`,
      },
      customer: {
        list: "/customers",
        details: (v) => `/customers/details/${v}`,
      },
      customers: {
        list: "/customers",
        details: (v) => `/customers/details/${v}`,
      },
      salesorder: {
        list: "/sales-orders",
        details: (v) => `/sales-orders/details/${v}`,
      },
      salesorders: {
        list: "/sales-orders",
        details: (v) => `/sales-orders/details/${v}`,
      },
      invoice: { list: "/invoices", details: (v) => `/invoices/${v}` },
      invoices: { list: "/invoices", details: (v) => `/invoices/${v}` },
      payment: {
        list: "/payments",
        details: (v) => `/payments/details/${v}`,
      },
      payments: {
        list: "/payments",
        details: (v) => `/payments/details/${v}`,
      },
      department: {
        list: "/departments",
        details: (v) => `/departments/${v}`,
      },
      departments: {
        list: "/departments",
        details: (v) => `/departments/${v}`,
      },
      category: {
        list: "/categories",
        details: (v) => `/categories/${v}`,
      },
      categories: {
        list: "/categories",
        details: (v) => `/categories/${v}`,
      },
      warehouse: {
        list: "/warehouses",
        details: (v) => `/warehouses/${v}`,
      },
      warehouses: {
        list: "/warehouses",
        details: (v) => `/warehouses/${v}`,
      },
      timesheet: {
        list: "/timesheets",
        details: (v) => `/timesheets/details/${v}`,
      },
      timesheets: {
        list: "/timesheets",
        details: (v) => `/timesheets/details/${v}`,
      },
      attendance: { list: "/attendance" },
      leave: { list: "/leave" },
      inventory: { list: "/inventory" },
    };

    const route = routes[type];

    if (!route) {
      console.error("No search route configured for entity type:", item.type);
      return null;
    }

    if (id !== null && id !== undefined && String(id).trim() !== "") {
      const encodedId = encodeURIComponent(String(id));

      return route.details
        ? route.details(encodedId)
        : route.list;
    }

    return route.list;
  };

  const openSearchResult = (item) => {
    if (!item) return;

    const path = getResultPath(item);

    if (!path) {
      console.error("Unable to navigate to search result:", item);
      return;
    }

    setDropdownOpen(false);
    setSearchQuery("");
    setSearchResults([]);
    setSelectedIndex(-1);
    setSearchLoading(false);

    navigate(path);
  };

  // Load logged-in user and navbar counters.
  useEffect(() => {
    let active = true;

    const loadNavbarData = async () => {
      if (!localStorage.getItem("token")) return;

      try {
        const headers = getHeaders();

        const [userResponse, notificationResponse, messageResponse] =
          await Promise.all([
            fetch(`${API_BASE_URL}/Auth/me`, { headers }),
            fetch(`${API_BASE_URL}/Notification/unread-count`, { headers }),
            fetch(`${API_BASE_URL}/Message/unread-count`, { headers }),
          ]);

        if (!active) return;

        if (userResponse.ok) {
          setUser(await userResponse.json());
        }

        if (notificationResponse.ok) {
          const data = await notificationResponse.json();

          if (active) {
            setNotificationCount(
              data.count ?? data.unreadCount ?? data.total ?? 0
            );
          }
        }

        if (messageResponse.ok) {
          const data = await messageResponse.json();

          if (active) {
            setMessageCount(
              data.count ?? data.unreadCount ?? data.total ?? 0
            );
          }
        }
      } catch (error) {
        if (active) {
          console.error("Navbar data loading failed:", error);
        }
      }
    };

    loadNavbarData();

    return () => {
      active = false;
    };
  }, []);

  // Close menus when clicking outside.
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setDropdownOpen(false);
        setSelectedIndex(-1);
      }

      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
        title: "Logout from ERP?",
        text: "Are you sure you want to end your session?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, Logout",
        cancelButtonText: "Stay Logged In",
        reverseButtons: true,
        focusCancel: true,
        buttonsStyling: false,
        customClass: {
            popup: "erp-swal-popup",
            title: "erp-swal-title",
            htmlContainer: "erp-swal-text",
            confirmButton: "erp-swal-confirm",
            cancelButton: "erp-swal-cancel",
            icon: "erp-swal-icon",
            actions: "erp-swal-actions"
        }
    });

    if (!result.isConfirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    setUser(null);
    setProfileOpen(false);

    await Swal.fire({
        title: "Logged Out Successfully",
        text: "Your ERP session has been closed.",
        icon: "success",
        timer: 1400,
        showConfirmButton: false,
        customClass: {
            popup: "erp-swal-popup",
            title: "erp-swal-title",
            htmlContainer: "erp-swal-text"
        }
    });

    navigate("/login", { replace: true });
};
  // Global search with debounce and stale-response protection.
  useEffect(() => {
    const query = searchQuery.trim();
    const requestId = ++searchRequestId.current;

    if (!query) {
      setSearchResults([]);
      setSearchLoading(false);
      setSelectedIndex(-1);
      return;
    }

    setSearchLoading(true);

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/Search?query=${encodeURIComponent(query)}`,
          {
            method: "GET",
            headers: getHeaders(),
          }
        );

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();

        if (requestId !== searchRequestId.current) return;

        const items = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : Array.isArray(data.data)
              ? data.data
              : [];

        const normalized = items.map((item) => ({
          id: item.id ?? item.Id,
          type:
            item.type ??
            item.Type ??
            item.entityType ??
            item.EntityType ??
            item.tableName ??
            item.TableName ??
            "Other",
          title:
            item.title ??
            item.Title ??
            item.name ??
            item.Name ??
            item.userName ??
            item.UserName ??
            item.companyName ??
            item.CompanyName ??
            "Untitled",
          description:
            item.description ??
            item.Description ??
            item.email ??
            item.Email ??
            "",
        }));

        const lowerQuery = query.toLocaleLowerCase();

        const getRank = (item) => {
          const title = String(item.title).toLocaleLowerCase();
          const description = String(item.description).toLocaleLowerCase();

          if (title === lowerQuery) return 0;
          if (title.startsWith(lowerQuery)) return 1;
          if (title.includes(lowerQuery)) return 2;
          if (description.includes(lowerQuery)) return 3;

          return 4;
        };

        normalized.sort((a, b) => getRank(a) - getRank(b));

        setSearchResults(normalized);
        setSelectedIndex(normalized.length > 0 ? 0 : -1);
        setDropdownOpen(true);
      } catch (error) {
        if (requestId !== searchRequestId.current) return;

        console.error("Global search failed:", error);
        setSearchResults([]);
        setSelectedIndex(-1);
        setDropdownOpen(true);
      } finally {
        if (requestId === searchRequestId.current) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setDropdownOpen(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setDropdownOpen(true);

      if (searchResults.length > 0) {
        setSelectedIndex((current) =>
          current < 0 ? 0 : (current + 1) % searchResults.length
        );
      }

      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setDropdownOpen(true);

      if (searchResults.length > 0) {
        setSelectedIndex((current) =>
          current <= 0 ? searchResults.length - 1 : current - 1
        );
      }

      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();

      if (dropdownOpen && selectedIndex >= 0) {
        openSearchResult(searchResults[selectedIndex]);
      }
    }
  };

  const displayName =
    user?.name ??
    user?.fullName ??
    user?.userName ??
    user?.Name ??
    "User";

  const displayRole = Array.isArray(user?.roles)
    ? user.roles.join(", ")
    : user?.role ?? user?.roleName ?? user?.Role ?? "User";

  const userId = user?.id ?? user?.Id;

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h2>Dashboard</h2>
        <p>{today}</p>
      </div>

      <div className="search-container" ref={searchContainerRef}>
        <div className="search-box">
          <FaSearch className="search-icon" />

          <input
            ref={inputRef}
            type="search"
            value={searchQuery}
            placeholder="Search users, employees, projects..."
            autoComplete="off"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={dropdownOpen}
            aria-controls="global-search-results"
            aria-activedescendant={
              selectedIndex >= 0
                ? `search-result-${selectedIndex}`
                : undefined
            }
            onFocus={() => {
              if (searchQuery.trim()) setDropdownOpen(true);
            }}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setDropdownOpen(true);
              setSelectedIndex(-1);
            }}
            onKeyDown={handleSearchKeyDown}
          />
        </div>

        {dropdownOpen && searchQuery.trim() && (
          <div
            className="search-results"
            id="global-search-results"
            role="listbox"
          >
            {searchLoading && (
              <div className="search-message">Searching...</div>
            )}

            {!searchLoading && searchResults.length === 0 && (
              <div className="search-message">No results found</div>
            )}

            {!searchLoading &&
              searchResults.map((item, index) => (
                <button
                  type="button"
                  id={`search-result-${index}`}
                  role="option"
                  aria-selected={index === selectedIndex}
                  className={`search-result-item ${
                    index === selectedIndex ? "active" : ""
                  }`}
                  key={`${item.type}-${item.id ?? index}`}
                  onMouseEnter={() => setSelectedIndex(index)}
                  onClick={() => openSearchResult(item)}
                >
                  <span className="search-result-text">
                    <strong>{item.title}</strong>

                    {item.description &&
                      item.description !== item.title && (
                        <small>{item.description}</small>
                      )}
                  </span>

                  <span className="search-result-type">{item.type}</span>
                </button>
              ))}
          </div>
        )}
      </div>

      <div className="navbar-right">
        <button
          type="button"
          className="icon-btn"
          title="Notifications"
          onClick={() => navigate("/notifications")}
        >
          <FaBell />

          {notificationCount > 0 && (
            <span className="badge">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className="icon-btn"
          title="Messages"
          onClick={() => navigate("/messages")}
        >
          <FaEnvelope />

          {messageCount > 0 && (
            <span className="badge">
              {messageCount > 99 ? "99+" : messageCount}
            </span>
          )}
        </button>

        {/* Keep the trigger and dropdown inside this same wrapper. */}
        <div
          className={`profile-wrapper ${profileOpen ? "open" : ""}`}
          ref={profileRef}
          onMouseEnter={() => setProfileOpen(true)}
          onMouseLeave={() => setProfileOpen(false)}
        >
          <button
            type="button"
            className="profile-trigger"
            aria-haspopup="true"
            aria-expanded={profileOpen}
            onClick={() => setProfileOpen((prev) => !prev)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setProfileOpen(false);
            }}
          >
            <FaUserCircle className="profile-icon" />

            <div className="profile-trigger-info">
              <h4>{displayName}</h4>
              <span>{displayRole}</span>
            </div>

            <FaChevronDown className="profile-chevron" />
          </button>

          {profileOpen && (
            <div className="profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <FaUserCircle className="profile-dropdown-avatar" />

                <div className="profile-dropdown-user">
                  <strong>{displayName}</strong>
                  <span>{user?.email ?? user?.Email ?? "Email unavailable"}</span>
                  <small>{displayRole}</small>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-menu-item"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);

                  if (userId !== null && userId !== undefined) {
                    navigate(`/users/${encodeURIComponent(String(userId))}`);
                  } else {
                    console.error("User ID is unavailable.");
                  }
                }}
              >
                <FaUser />
                <span>My Profile</span>
              </button>

              <button
                type="button"
                className="profile-menu-item"
                role="menuitem"
                onClick={() => {
                  setProfileOpen(false);
                  navigate("/settings");
                }}
              >
                <FaCog />
                <span>Account Settings</span>
              </button>

              <div className="profile-dropdown-divider" />

              <button
                type="button"
                className="profile-menu-item logout-menu-item"
                role="menuitem"
                onClick={handleLogout}
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;

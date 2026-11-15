import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState
} from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // ==========================================
    // RESTORE USER FROM LOCAL STORAGE
    // ==========================================
    useEffect(() => {

        try {

            const token =
                localStorage.getItem("token");

            const storedUser =
                localStorage.getItem("user");

            if (token && storedUser) {

                const parsedUser =
                    JSON.parse(storedUser);

                setUser(parsedUser);
            }

        } catch (error) {

            console.error(
                "Auth restore error:",
                error
            );

            localStorage.removeItem("user");

        } finally {

            setLoading(false);

        }

    }, []);


    // ==========================================
    // LOGIN
    // ==========================================
    const login = (userData) => {

   console.log(
    "LOGIN USER DATA:",
    JSON.stringify(userData, null, 2)
);

    const roles = [];

    if (Array.isArray(userData?.roles)) {
        roles.push(...userData.roles);
    }

    if (userData?.role && !roles.includes(userData.role)) {
        roles.push(userData.role);
    }

    if (userData?.Role && !roles.includes(userData.Role)) {
        roles.push(userData.Role);
    }

    const permissions = Array.isArray(userData?.permissions)
        ? userData.permissions
        : [];

    const normalizedUser = {
        id: userData?.id ?? userData?.userId,
        name: userData?.name ?? userData?.userName,
        email: userData?.email,
        roles,
        permissions
    };

    console.log("NORMALIZED USER:", normalizedUser);
    console.log("ROLES:", roles);
    console.log("PERMISSIONS:", permissions);

    setUser(normalizedUser);

    localStorage.setItem(
        "user",
        JSON.stringify(normalizedUser)
    );
};


    // ==========================================
    // LOGOUT
    // ==========================================
    const logout = () => {

        setUser(null);

        localStorage.removeItem("user");

        localStorage.removeItem("token");
    };


    // ==========================================
    // ROLE CHECK
    // ==========================================
    const hasRole = (role) => {

        if (!user) {
            return false;
        }

        return (
            user.roles?.includes(role) ?? false
        );
    };


    // ==========================================
    // MULTIPLE ROLE CHECK
    // ==========================================
    const hasAnyRole = (roles = []) => {

        if (!user) {
            return false;
        }

        return roles.some(
            role => user.roles?.includes(role)
        );
    };


    // ==========================================
    // PERMISSION CHECK
    // ==========================================
    const hasPermission = (permission) => {

        if (!user) {
            return false;
        }

        // Admin bypass
        if (hasRole("Admin")) {
            return true;
        }

        return (
            user.permissions?.includes(
                permission
            ) ?? false
        );
    };


    // ==========================================
    // MULTIPLE PERMISSIONS
    // ==========================================
    const hasAnyPermission = (
        permissions = []
    ) => {

        return permissions.some(
            permission =>
                hasPermission(permission)
        );
    };


    // ==========================================
    // CONTEXT VALUE
    // ==========================================
    const value = useMemo(
        () => ({
            user,
            loading,
            login,
            logout,
            hasRole,
            hasAnyRole,
            hasPermission,
            hasAnyPermission
        }),
        [user, loading]
    );


    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};


// ==========================================
// USE AUTH HOOK
// ==========================================
export const useAuth = () => {

    const context =
        useContext(AuthContext);

    if (!context) {

        throw new Error(
            "useAuth must be used inside AuthProvider"
        );
    }

    return context;
};
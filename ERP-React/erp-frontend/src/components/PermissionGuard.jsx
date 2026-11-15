import { useAuth } from "../context/AuthContext";

export default function PermissionGuard({
  permission,
  children
}) {
  const { user, hasPermission } = useAuth();

  // 1. User not loaded yet
  if (!user) {
    return null; // or loading spinner
  }

  // 2. Permission check
  const allowed = hasPermission(permission);

  if (!allowed) {
    return null; // or "Access Denied"
  }

  return children;
}
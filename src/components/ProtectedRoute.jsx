import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading, logout } = useAuth();

  // Check if login has expired
  const checkExpiration = () => {
    const expiresAt = localStorage.getItem('login_expires_at');
    if (expiresAt) {
      const expirationTime = parseInt(expiresAt, 10);
      const currentTime = Date.now();
      
      if (currentTime > expirationTime) {
        // Expired, logout
        logout();
        return true;
      }
    }
    return false;
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  // Check expiration before checking user
  if (checkExpiration()) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  if (!user) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  // Check admin requirement
  if (requireAdmin && !user.is_staff && !user.is_superuser) {
    return <Navigate to="/admin/login" replace />;
  }

  // Redirect admin users away from regular dashboard
  if (!requireAdmin && (user.is_staff || user.is_superuser)) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;


import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

export default function AdminRoute() {
  const { isAdmin, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-shell py-20">
        <Loader label="Loading admin area..." compact />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

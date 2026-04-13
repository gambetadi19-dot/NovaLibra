import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

export default function ProtectedRoute() {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-shell py-20">
        <Loader label="Loading session..." compact />
      </div>
    );
  }

  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace state={{ from: location }} />;
}

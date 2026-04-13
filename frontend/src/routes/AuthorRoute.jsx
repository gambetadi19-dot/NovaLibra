import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';

export default function AuthorRoute() {
  const { isAuthenticated, isAuthor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="container-shell py-20">
        <Loader label="Loading author workspace..." compact />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return isAuthor ? <Outlet /> : <Navigate to="/" replace />;
}

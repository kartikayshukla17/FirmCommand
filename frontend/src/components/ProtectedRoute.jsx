import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
    const { user, loading } = useAuth();

    console.log('ProtectedRoute - User:', user, 'Loading:', loading);

    if (loading) return <div>Loading...</div>;

    if (!user) {
        console.log('ProtectedRoute - No user, redirecting to login');
        return <Navigate to="/login" replace />;
    }

    if (roles && !roles.includes(user.role)) {
        return <Navigate to="/" />; // Or unauthorized page
    }

    return children;
};

export default ProtectedRoute;

import { Navigate, useLocation } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const location = useLocation();
    const userInfoString = localStorage.getItem('userInfo');
    const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
    const user = userInfo?.user || userInfo; // Handle both structures

    if (!user || !user.email) {
        // Not logged in
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (adminOnly && user.role !== 'admin') {
        // Not admin
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;

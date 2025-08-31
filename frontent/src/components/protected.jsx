// components/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const userId = localStorage.getItem('user_id');
  return userId ? children : <Navigate to="/" />;
};

export default ProtectedRoute;


import { Navigate } from 'react-router-dom';

const Index = () => {
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  return isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export default Index;

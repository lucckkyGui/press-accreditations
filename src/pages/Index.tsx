
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard or login depending on authentication status
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  return isLoggedIn ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;
};

export default Index;

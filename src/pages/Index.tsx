
import React from 'react';
import { Navigate } from 'react-router-dom';

const Index = () => {
  // Redirect to dashboard or home depending on authentication status
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  
  if (isLoggedIn) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Navigate to="/login" />;
};

export default Index;

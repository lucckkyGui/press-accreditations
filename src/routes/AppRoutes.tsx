
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import Index from '@/pages/Index';
import HomePage from '@/pages/HomePage';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import NotFound from '@/pages/NotFound';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AccreditationRequest from '@/pages/AccreditationRequest';
import AccreditationCategories from '@/pages/AccreditationCategories';
import AccreditationEvents from '@/pages/AccreditationEvents';
import UserProfile from '@/pages/UserProfile';
import Ticketing from '@/pages/Ticketing';
import Scanner from '@/pages/Scanner';
import Events from '@/pages/Events';
import Settings from '@/pages/Settings';
import Notifications from '@/pages/Notifications';
import Purchase from '@/pages/Purchase';
import EventDetails from '@/pages/EventDetails';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/purchase" element={<Purchase />} />
      
      {/* Accreditation routes */}
      <Route path="/accreditation-categories" element={<AccreditationCategories />} />
      <Route path="/accreditation-events/:categoryId" element={<AccreditationEvents />} />
      <Route path="/accreditation-request/:eventId" element={<AccreditationRequest />} />
      
      {/* Protected routes */}
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
      <Route path="/ticketing" element={<ProtectedRoute><Ticketing /></ProtectedRoute>} />
      <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
      <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
      <Route path="/events/:id" element={<ProtectedRoute><EventDetails /></ProtectedRoute>} />
      <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />
      <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
      
      {/* Catch all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

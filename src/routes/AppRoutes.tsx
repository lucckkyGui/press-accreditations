
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
import MainLayout from '@/components/layout/MainLayout';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/purchase" element={<Purchase />} />
      
      {/* Trasy akredytacyjne - dostępne bez logowania */}
      <Route path="/accreditation-categories" element={
        <ProtectedRoute requireAuth={false}>
          <AccreditationCategories />
        </ProtectedRoute>
      } />
      <Route path="/accreditation-events/:categoryId" element={
        <ProtectedRoute requireAuth={false}>
          <AccreditationEvents />
        </ProtectedRoute>
      } />
      <Route path="/accreditation-request/:eventId" element={
        <ProtectedRoute requireAuth={false}>
          <AccreditationRequest />
        </ProtectedRoute>
      } />
      
      {/* Trasy chronione - wymagają zalogowania */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <MainLayout>
            <Dashboard />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <UserProfile />
        </ProtectedRoute>
      } />
      <Route path="/ticketing" element={
        <ProtectedRoute>
          <Ticketing />
        </ProtectedRoute>
      } />
      <Route path="/scanner" element={
        <ProtectedRoute>
          <MainLayout>
            <Scanner />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/events" element={
        <ProtectedRoute>
          <MainLayout>
            <Events />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/events/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <EventDetails />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <Notifications />
          </MainLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <MainLayout>
            <Settings />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      {/* Złap wszystkie nieobsłużone trasy */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

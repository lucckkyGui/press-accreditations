
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from '@/pages/HomePage';
import Dashboard from '@/pages/Dashboard';
import Events from '@/pages/Events';
import Guests from '@/pages/Guests';
import EventDetails from '@/pages/EventDetails';
import Settings from '@/pages/Settings';
import Login from '@/pages/Login';
import UserProfile from '@/pages/UserProfile';
import NotFound from '@/pages/NotFound';
import Scanner from '@/pages/Scanner';
import Ticketing from '@/pages/Ticketing';
import Notifications from '@/pages/Notifications';
import Purchase from '@/pages/Purchase';
import MainLayout from '@/components/layout/MainLayout';
import AccreditationRequest from '@/pages/AccreditationRequest';
import AccreditationEvents from '@/pages/AccreditationEvents';
import AccreditationCategories from '@/pages/AccreditationCategories';
import PressReleasePage from '@/pages/PressReleasePage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/purchase" element={<Purchase />} />
      <Route path="/accreditation/request" element={<AccreditationRequest />} />
      <Route path="/accreditation/events" element={<AccreditationEvents />} />
      
      {/* Protected Routes */}
      <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/events" element={<Events />} />
        <Route path="/events/:id" element={<EventDetails />} />
        <Route path="/guests" element={<Guests />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/tickets" element={<Ticketing />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/accreditation/categories" element={<AccreditationCategories />} />
        <Route path="/press-releases" element={<PressReleasePage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;

import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { AuthContextType } from '@/hooks/auth/types';

const { mockUseAuth } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
}));

vi.mock('@/hooks/auth', () => ({
  useAuth: mockUseAuth,
}));

const makeAuthState = (overrides: Partial<AuthContextType> = {}): AuthContextType => ({
  user: null,
  session: null,
  profile: null,
  roles: [],
  rolesLoaded: false,
  userDataLoaded: false,
  loading: false,
  isLoading: false,
  isAuthenticated: false,
  isOrganizer: false,
  isAdmin: false,
  hasRole: vi.fn(),
  signUp: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
  resetPassword: vi.fn(),
  ...overrides,
});

const renderProtectedDashboard = () => render(
  <MemoryRouter initialEntries={['/dashboard']}>
    <Routes>
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin', 'organizer']}>
            <div>Dashboard content</div>
          </ProtectedRoute>
        }
      />
      <Route path="/access-denied" element={<div>Access denied page</div>} />
      <Route path="/auth/login" element={<div>Login page</div>} />
    </Routes>
  </MemoryRouter>
);

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
  });

  it('waits while an authenticated user roles are still loading', () => {
    mockUseAuth.mockReturnValue(makeAuthState({
      isAuthenticated: true,
      isLoading: false,
      roles: [],
      rolesLoaded: false,
      userDataLoaded: false,
    }));

    const { container } = renderProtectedDashboard();

    expect(container.querySelector('.animate-spin')).toBeTruthy();
    expect(screen.queryByText('Dashboard content')).toBeNull();
    expect(screen.queryByText('Access denied page')).toBeNull();
  });

  it('allows an admin user after roles have loaded', () => {
    mockUseAuth.mockReturnValue(makeAuthState({
      isAuthenticated: true,
      roles: ['guest', 'admin'],
      rolesLoaded: true,
      userDataLoaded: true,
      isAdmin: true,
      isOrganizer: true,
    }));

    renderProtectedDashboard();

    expect(screen.getByText('Dashboard content')).toBeTruthy();
  });

  it('redirects an authenticated user without organizer access after roles have loaded', () => {
    mockUseAuth.mockReturnValue(makeAuthState({
      isAuthenticated: true,
      roles: ['guest'],
      rolesLoaded: true,
      userDataLoaded: true,
    }));

    renderProtectedDashboard();

    expect(screen.getByText('Access denied page')).toBeTruthy();
  });
});

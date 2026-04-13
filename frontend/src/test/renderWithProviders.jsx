import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { ToastContext } from '../context/ToastContext';

export function renderWithProviders(
  ui,
  {
    route = '/',
    auth = {},
    notifications = {}
  } = {}
) {
  const authValue = {
    user: null,
    loading: false,
    isAuthenticated: false,
    isAdmin: false,
    isAuthor: false,
    isReader: false,
    login: async () => {},
    register: async () => {},
    logout: async () => {},
    updateUser: () => {},
    ...auth
  };

  const notificationValue = {
    notifications: [],
    connected: false,
    loading: false,
    error: '',
    unreadCount: 0,
    refreshNotifications: async () => {},
    markAsRead: async () => {},
    markAllAsRead: async () => {},
    ...notifications
  };

  const toastValue = {
    show: () => {},
    success: () => {},
    error: () => {},
    info: () => {},
    dismiss: () => {}
  };

  return render(
    <MemoryRouter
      initialEntries={[route]}
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true
      }}
    >
      <ToastContext.Provider value={toastValue}>
        <AuthContext.Provider value={authValue}>
          <NotificationContext.Provider value={notificationValue}>{ui}</NotificationContext.Provider>
        </AuthContext.Provider>
      </ToastContext.Provider>
    </MemoryRouter>
  );
}

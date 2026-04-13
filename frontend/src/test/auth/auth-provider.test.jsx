import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import { AuthProvider, AuthContext } from '../../context/AuthContext';
import { sessionKeys } from '../../constants/sessionKeys';
import { renderWithProviders } from '../renderWithProviders';
import api from '../../api/axios';

vi.mock('../../api/axios', () => ({
  default: {
    post: vi.fn()
  }
}));

function AuthProbe() {
  return (
    <AuthContext.Consumer>
      {(auth) => (
        <div>
          <p data-testid="loading">{String(auth.loading)}</p>
          <p data-testid="user-email">{auth.user?.email || ''}</p>
          <p data-testid="user-role">{auth.user?.role || ''}</p>
          <p data-testid="authenticated">{String(auth.isAuthenticated)}</p>
          <button
            type="button"
            onClick={() =>
              auth.login({
                email: 'user@example.com',
                password: 'password123'
              })
            }
          >
            Trigger login
          </button>
          <button
            type="button"
            onClick={() =>
              auth.register({
                name: 'New Reader',
                email: 'new-reader@example.com',
                password: 'password123',
                bio: 'Freshly registered'
              })
            }
          >
            Trigger register
          </button>
          <button type="button" onClick={() => auth.logout()}>
            Trigger logout
          </button>
        </div>
      )}
    </AuthContext.Consumer>
  );
}

describe('AuthProvider session behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('skips refresh when there is no stored session', async () => {
    renderWithProviders(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    expect(api.post).not.toHaveBeenCalled();
    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
  });

  test('restores a stored session through /auth/refresh', async () => {
    localStorage.setItem(sessionKeys.accessToken, 'stale-access-token');
    localStorage.setItem(
      sessionKeys.user,
      JSON.stringify({
        id: 8,
        email: 'reader@example.com',
        role: 'USER'
      })
    );

    api.post.mockResolvedValueOnce({
      data: {
        accessToken: 'fresh-access-token',
        user: {
          id: 8,
          email: 'reader@example.com',
          role: 'READER'
        }
      }
    });

    renderWithProviders(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/refresh');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-email')).toHaveTextContent('reader@example.com');
    expect(screen.getByTestId('user-role')).toHaveTextContent('READER');
    expect(localStorage.getItem(sessionKeys.accessToken)).toBe('fresh-access-token');
    expect(JSON.parse(localStorage.getItem(sessionKeys.user))).toMatchObject({
      email: 'reader@example.com',
      role: 'READER'
    });
  });

  test('login persists the returned access token and normalized user role', async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValueOnce({
      data: {
        accessToken: 'login-access-token',
        user: {
          id: 3,
          email: 'user@example.com',
          role: 'USER'
        }
      }
    });

    renderWithProviders(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await user.click(screen.getByRole('button', { name: /trigger login/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'user@example.com',
        password: 'password123'
      });
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    expect(screen.getByTestId('user-role')).toHaveTextContent('READER');
    expect(localStorage.getItem(sessionKeys.accessToken)).toBe('login-access-token');
  });

  test('register persists the new reader session', async () => {
    const user = userEvent.setup();

    api.post.mockResolvedValueOnce({
      data: {
        accessToken: 'register-access-token',
        user: {
          id: 11,
          email: 'new-reader@example.com',
          role: 'READER'
        }
      }
    });

    renderWithProviders(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('false');
    });

    await user.click(screen.getByRole('button', { name: /trigger register/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        name: 'New Reader',
        email: 'new-reader@example.com',
        password: 'password123',
        bio: 'Freshly registered'
      });
    });

    expect(screen.getByTestId('user-email')).toHaveTextContent('new-reader@example.com');
    expect(localStorage.getItem(sessionKeys.accessToken)).toBe('register-access-token');
  });

  test('logout clears stored session data even if the API call succeeds', async () => {
    const user = userEvent.setup();

    localStorage.setItem(sessionKeys.accessToken, 'existing-token');
    localStorage.setItem(
      sessionKeys.user,
      JSON.stringify({
        id: 12,
        email: 'reader@example.com',
        role: 'READER'
      })
    );

    api.post.mockResolvedValueOnce({
      data: {
        accessToken: 'refreshed-token',
        user: {
          id: 12,
          email: 'reader@example.com',
          role: 'READER'
        }
      }
    });
    api.post.mockResolvedValueOnce({
      data: {
        success: true
      }
    });

    renderWithProviders(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    await user.click(screen.getByRole('button', { name: /trigger logout/i }));

    await waitFor(() => {
      expect(api.post).toHaveBeenLastCalledWith('/auth/logout');
    });

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    expect(localStorage.getItem(sessionKeys.accessToken)).toBeNull();
    expect(localStorage.getItem(sessionKeys.user)).toBeNull();
  });
});

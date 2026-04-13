import { createContext, useEffect, useMemo, useState } from 'react';
import api from '../api/axios';
import { sessionKeys } from '../constants/sessionKeys';

export const AuthContext = createContext(null);

function normalizeRole(role) {
  return role === 'USER' ? 'READER' : role;
}

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  return {
    ...user,
    role: normalizeRole(user.role)
  };
}

function persistSession({ accessToken, user }) {
  const normalizedUser = normalizeUser(user);
  localStorage.setItem(sessionKeys.accessToken, accessToken);
  localStorage.setItem(sessionKeys.user, JSON.stringify(normalizedUser));
}

function clearSession() {
  Object.values(sessionKeys).forEach((key) => localStorage.removeItem(key));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem(sessionKeys.user);
    return stored ? normalizeUser(JSON.parse(stored)) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const hasStoredSession =
      Boolean(localStorage.getItem(sessionKeys.accessToken)) || Boolean(localStorage.getItem(sessionKeys.user));

    if (!hasStoredSession) {
      clearSession();
      setUser(null);
      setLoading(false);
      return () => {
        active = false;
      };
    }

    api
      .post('/auth/refresh')
      .then(({ data }) => {
        if (!active) {
          return;
        }

        persistSession(data);
        setUser(normalizeUser(data.user));
      })
      .catch(() => {
        if (!active) {
          return;
        }

        const hasCurrentSession =
          Boolean(localStorage.getItem(sessionKeys.accessToken)) && Boolean(localStorage.getItem(sessionKeys.user));

        if (hasCurrentSession) {
          setUser(() => {
            const stored = localStorage.getItem(sessionKeys.user);
            return stored ? normalizeUser(JSON.parse(stored)) : null;
          });
          return;
        }

        clearSession();
        setUser(null);
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isAdmin: user?.role === 'ADMIN',
      isAuthor: user?.role === 'AUTHOR',
      isReader: user?.role === 'READER',
      async login(credentials) {
        const { data } = await api.post('/auth/login', credentials);
        persistSession(data);
        setUser(normalizeUser(data.user));
        setLoading(false);
        return data;
      },
      async register(userInput) {
        const { data } = await api.post('/auth/register', userInput);
        persistSession(data);
        setUser(normalizeUser(data.user));
        setLoading(false);
        return data;
      },
      async logout() {
        try {
          await api.post('/auth/logout');
        } catch {}

        clearSession();
        setUser(null);
        setLoading(false);
      },
      updateUser(nextUser) {
        const normalizedUser = normalizeUser(nextUser);
        setUser(normalizedUser);
        localStorage.setItem(sessionKeys.user, JSON.stringify(normalizedUser));
      }
    }),
    [loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

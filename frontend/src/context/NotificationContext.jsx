import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { sessionKeys } from '../constants/sessionKeys';
import { getApiErrorMessage } from '../utils/getApiErrorMessage';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated } = useContext(AuthContext);

  function mergeNotifications(current, incoming) {
    const next = [...current];

    for (const item of incoming) {
      const existingIndex = next.findIndex((entry) => entry.id === item.id);
      if (existingIndex === -1) {
        next.push(item);
      } else {
        next[existingIndex] = { ...next[existingIndex], ...item };
      }
    }

    return next.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  useEffect(() => {
    const token = localStorage.getItem(sessionKeys.accessToken);

    if (!token || !user?.id || !isAuthenticated) {
      setNotifications([]);
      setConnected(false);
      setLoading(false);
      setError('');
      return;
    }

    let active = true;
    setLoading(true);
    setError('');

    api
      .get('/notifications')
      .then(({ data }) => {
        if (active) {
          setNotifications((current) => mergeNotifications(current, data.notifications));
        }
      })
      .catch((apiError) => {
        if (active) {
          setNotifications([]);
          setError(getApiErrorMessage(apiError, 'Unable to load notifications right now.'));
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token }
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('notifications:join', user.id);
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('notification:new', (notification) => {
      if (!active) {
        return;
      }

      setNotifications((current) => mergeNotifications(current, [notification]));
    });

    return () => {
      active = false;
      setConnected(false);
      socket.disconnect();
    };
  }, [isAuthenticated, user?.id]);

  const value = useMemo(
    () => ({
      notifications,
      connected,
      loading,
      error,
      unreadCount: notifications.filter((item) => !item.isRead).length,
      async refreshNotifications() {
        setLoading(true);
        setError('');
        try {
          const { data } = await api.get('/notifications');
          setNotifications((current) => mergeNotifications(current, data.notifications));
        } catch (apiError) {
          setError(getApiErrorMessage(apiError, 'Unable to refresh notifications.'));
          throw apiError;
        } finally {
          setLoading(false);
        }
      },
      async markAsRead(notificationId) {
        await api.patch(`/notifications/${notificationId}/read`);
        setNotifications((current) =>
          current.map((item) => (item.id === notificationId ? { ...item, isRead: true } : item))
        );
      },
      async markAllAsRead() {
        await api.patch('/notifications/read-all');
        setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
      }
    }),
    [connected, error, loading, notifications]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

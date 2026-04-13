import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

function extractMessageSubject(text = '') {
  const match = text.match(/:\s(.+)$/);
  return match ? match[1].trim() : '';
}

function extractSenderName(text = '') {
  const match = text.match(/^(.+?) sent you a message/);
  return match ? match[1].trim() : '';
}

function extractBookTitle(text = '') {
  const match = text.match(/on (.+?)(?:\.|$)/i);
  return match ? match[1].trim() : '';
}

export function useNotificationNavigation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  async function resolveAnnouncement(notification) {
    const { data } = await api.get('/announcements');
    const announcement = data.announcements.find(
      (item) => item.title === notification.title || item.content === notification.message
    );

    return announcement ? `/?announcement=${announcement.id}#announcements` : '/#announcements';
  }

  async function resolveMessage(notification) {
    const { data } = await api.get('/messages');
    const subject = extractMessageSubject(notification.message);
    const senderName = extractSenderName(notification.message);

    const candidates = data.messages.filter((message) =>
      user?.role === 'ADMIN'
        ? message.receiverId === user?.id || message.senderId === user?.id
        : message.receiverId === user?.id || message.senderId === user?.id
    );

    const exact = candidates.find(
      (message) =>
        (subject && message.subject === subject) ||
        (senderName && message.sender.name === senderName && message.receiverId === user?.id)
    );

    const fallback = exact || candidates[0];
    if (!fallback) {
      return user?.role === 'ADMIN' ? '/admin/messages' : '/messages';
    }

    const basePath = user?.role === 'ADMIN' ? '/admin/messages' : '/messages';
    return `${basePath}?messageId=${fallback.id}`;
  }

  async function resolveComment(notification) {
    const profileResponse = await api.get('/users/me/profile');
    const titleFromMessage = extractBookTitle(notification.message) || extractBookTitle(notification.title);

    const comment =
      profileResponse.data.profile.comments.find((entry) =>
        titleFromMessage ? entry.book.title === titleFromMessage : true
      ) || profileResponse.data.profile.comments[0];

    if (!comment?.book?.slug) {
      return '/books';
    }

    return `/books/${comment.book.slug}?commentId=${comment.id}#discussion`;
  }

  async function resolveSystem(notification) {
    const titleFromNotification = extractBookTitle(notification.title) || extractBookTitle(notification.message);
    if (!titleFromNotification) {
      return '/notifications';
    }

    const { data } = await api.get('/books');
    const matchingBook = data.books.find((book) => book.title === titleFromNotification);

    return matchingBook ? `/books/${matchingBook.slug}` : '/books';
  }

  async function openNotification(notification, { onMarkedRead } = {}) {
    try {
      let destination = '/notifications';

      if (notification.type === 'ANNOUNCEMENT') {
        destination = await resolveAnnouncement(notification);
      } else if (notification.type === 'MESSAGE') {
        destination = await resolveMessage(notification);
      } else if (notification.type === 'COMMENT_REPLY') {
        destination = await resolveComment(notification);
      } else if (notification.type === 'SYSTEM') {
        destination = await resolveSystem(notification);
      }

      if (onMarkedRead) {
        await onMarkedRead();
      }

      navigate(destination);
    } catch (_error) {
      if (onMarkedRead) {
        await onMarkedRead().catch(() => {});
      }

      toast.info('We could not open that item directly.', 'The related content may have moved, so we sent you to the closest available view.');

      if (notification.type === 'MESSAGE') {
        navigate(user?.role === 'ADMIN' ? '/admin/messages' : '/messages');
      } else if (notification.type === 'ANNOUNCEMENT') {
        navigate('/#announcements');
      } else if (notification.type === 'COMMENT_REPLY') {
        navigate('/books');
      } else if (notification.type === 'SYSTEM') {
        navigate('/books');
      } else {
        navigate('/notifications');
      }
    }
  }

  return { openNotification };
}

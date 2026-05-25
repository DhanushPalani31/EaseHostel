import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchNotifications,
  markRead as markReadAction,
  markAllRead as markAllReadAction
} from '../store/slices/notificationSlice.js';

/**
 * useNotifications – encapsulates notification state + actions.
 */
export const useNotifications = () => {
  const dispatch = useDispatch();
  const { items, unreadCount, loading } = useSelector(s => s.notifications);

  useEffect(() => { dispatch(fetchNotifications()); }, [dispatch]);

  const markRead    = useCallback((id)  => dispatch(markReadAction(id)),    [dispatch]);
  const markAllRead = useCallback(()    => dispatch(markAllReadAction()),    [dispatch]);
  const refresh     = useCallback(()    => dispatch(fetchNotifications()),   [dispatch]);

  return { notifications: items, unreadCount, loading, markRead, markAllRead, refresh };
};

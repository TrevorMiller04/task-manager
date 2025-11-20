import { useEffect } from 'react';
import { useTaskStore } from '../store/taskStore';
import {
  requestNotificationPermissions,
  scheduleEveningReminder,
  scheduleDeadlineNotifications,
} from '../utils/notifications';

/**
 * Hook to manage notifications for the app
 * - Requests permissions on mount
 * - Schedules evening reminders
 * - Schedules deadline notifications for tasks
 */
export const useNotifications = () => {
  const tasks = useTaskStore((state) => state.tasks);
  const getIncompleteTasks = useTaskStore((state) => state.getIncompleteTasks);

  useEffect(() => {
    // Request permissions on mount
    requestNotificationPermissions();
  }, []);

  useEffect(() => {
    // Schedule evening reminder whenever tasks change
    const incompleteTasks = getIncompleteTasks();
    scheduleEveningReminder(incompleteTasks);
  }, [tasks, getIncompleteTasks]);

  useEffect(() => {
    // Schedule deadline notifications for all incomplete tasks with deadlines
    const incompleteTasks = getIncompleteTasks();
    incompleteTasks.forEach((task) => {
      if (task.deadline) {
        scheduleDeadlineNotifications(task);
      }
    });
  }, [tasks, getIncompleteTasks]);
};

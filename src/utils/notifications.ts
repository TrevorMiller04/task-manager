import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Task } from '../types/Task';
import { differenceInHours, parseISO } from 'date-fns';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions
 */
export const requestNotificationPermissions = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Failed to get notification permissions');
    return false;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return true;
};

/**
 * Schedule evening reminder for tasks without details
 * Runs at 7:30 PM daily
 */
export const scheduleEveningReminder = async (incompleteTasks: Task[]): Promise<string | null> => {
  try {
    // Cancel any existing evening reminders
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allScheduled) {
      if (notification.content.data?.type === 'evening_reminder') {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }

    // Count tasks without details (no deadline, energy, or time estimate)
    const tasksWithoutDetails = incompleteTasks.filter(
      (task) => !task.deadline && !task.energy && !task.estimatedMinutes
    );

    if (tasksWithoutDetails.length === 0) {
      return null;
    }

    // Schedule for 7:30 PM daily
    const notificationId = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🌙 Evening Reminder',
        body: `You have ${tasksWithoutDetails.length} task${
          tasksWithoutDetails.length > 1 ? 's' : ''
        } without details. Take a moment to add deadlines and estimates.`,
        data: { type: 'evening_reminder' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 19,
        minute: 30,
      },
    });

    return notificationId;
  } catch (error) {
    console.error('Error scheduling evening reminder:', error);
    return null;
  }
};

/**
 * Schedule deadline notifications for a task
 * - 24 hours before deadline
 * - 2 hours before deadline
 * - At deadline time
 */
export const scheduleDeadlineNotifications = async (task: Task): Promise<void> => {
  if (!task.deadline) return;

  try {
    // Cancel existing notifications for this task
    await cancelTaskNotifications(task.id);

    const deadline = parseISO(task.deadline);
    const now = new Date();

    // 24 hours before
    const twentyFourHoursBefore = new Date(deadline);
    twentyFourHoursBefore.setHours(deadline.getHours() - 24);

    if (twentyFourHoursBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Deadline Tomorrow',
          body: `"${task.title}" is due in 24 hours`,
          data: { type: 'deadline_reminder', taskId: task.id, timing: '24h' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: twentyFourHoursBefore,
        },
      });
    }

    // 2 hours before
    const twoHoursBefore = new Date(deadline);
    twoHoursBefore.setHours(deadline.getHours() - 2);

    if (twoHoursBefore > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '⏰ Deadline Soon',
          body: `"${task.title}" is due in 2 hours`,
          data: { type: 'deadline_reminder', taskId: task.id, timing: '2h' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: twoHoursBefore,
        },
      });
    }

    // At deadline
    if (deadline > now) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Deadline Now',
          body: `"${task.title}" is due now!`,
          data: { type: 'deadline_reminder', taskId: task.id, timing: 'now' },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: deadline,
        },
      });
    }
  } catch (error) {
    console.error('Error scheduling deadline notifications:', error);
  }
};

/**
 * Cancel all notifications for a specific task
 */
export const cancelTaskNotifications = async (taskId: string): Promise<void> => {
  try {
    const allScheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notification of allScheduled) {
      if (notification.content.data?.taskId === taskId) {
        await Notifications.cancelScheduledNotificationAsync(notification.identifier);
      }
    }
  } catch (error) {
    console.error('Error canceling task notifications:', error);
  }
};

/**
 * Get all scheduled notifications (for debugging)
 */
export const getAllScheduledNotifications = async () => {
  return await Notifications.getAllScheduledNotificationsAsync();
};

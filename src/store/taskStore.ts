import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/Task';
import { format } from 'date-fns';

interface TaskStore {
  tasks: Task[];
  addTask: (title: string) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleComplete: (id: string) => void;
  toggleStar: (id: string) => void;
  getStarredTasks: () => Task[];
  getBrainDumpTasks: () => Task[];
  getIncompleteTasks: () => Task[];
}

const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const useTaskStore = create<TaskStore>()(
  persist(
    (set, get) => ({
      tasks: [],

      addTask: (title: string) => {
        const newTask: Task = {
          id: generateId(),
          title,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          tasks: [newTask, ...state.tasks],
        }));
      },

      updateTask: (id: string, updates: Partial<Task>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id ? { ...task, ...updates } : task
          ),
        }));
      },

      deleteTask: (id: string) => {
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
        }));
      },

      toggleComplete: (id: string) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? {
                  ...task,
                  completedAt: task.completedAt ? undefined : new Date().toISOString(),
                }
              : task
          ),
        }));
      },

      toggleStar: (id: string) => {
        const today = format(new Date(), 'yyyy-MM-dd');
        const starredTasks = get().getStarredTasks();

        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id === id) {
              // Toggle: if already starred for today, unstar it
              return {
                ...task,
                starredFor: task.starredFor === today ? undefined : today,
              };
            }
            // If we already have 3 starred tasks and this task isn't starred,
            // we need to unstar the oldest one
            if (starredTasks.length >= 3 && !task.starredFor) {
              // This will be handled by the UI preventing more than 3 stars
              return task;
            }
            return task;
          }),
        }));
      },

      getStarredTasks: () => {
        const today = format(new Date(), 'yyyy-MM-dd');
        return get()
          .tasks.filter((task) => !task.completedAt && task.starredFor === today)
          .slice(0, 3); // Max 3 starred tasks
      },

      getBrainDumpTasks: () => {
        return get()
          .tasks.filter((task) => !task.completedAt)
          .slice(0, 10); // Last 10 incomplete tasks
      },

      getIncompleteTasks: () => {
        return get().tasks.filter((task) => !task.completedAt);
      },
    }),
    {
      name: 'adhd-task-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

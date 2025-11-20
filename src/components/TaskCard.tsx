import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Task } from '../types/Task';
import { useTaskStore } from '../store/taskStore';
import { formatDistanceToNow } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onPress: () => void;
  showStar?: boolean;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onPress, showStar = true }) => {
  const toggleComplete = useTaskStore((state) => state.toggleComplete);
  const toggleStar = useTaskStore((state) => state.toggleStar);
  const getStarredTasks = useTaskStore((state) => state.getStarredTasks);

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleComplete(task.id);
  };

  const handleStar = () => {
    const starredTasks = getStarredTasks();
    const isStarred = task.starredFor;

    // Prevent starring if already at max (3) and this task isn't already starred
    if (!isStarred && starredTasks.length >= 3) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toggleStar(task.id);
  };

  const timeAgo = formatDistanceToNow(new Date(task.createdAt), { addSuffix: true });

  return (
    <Pressable
      style={({ pressed }) => [
        styles.container,
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <View style={styles.content}>
        {/* Complete checkbox */}
        <TouchableOpacity
          onPress={handleComplete}
          style={styles.checkbox}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <View style={[styles.checkboxInner, task.completedAt && styles.checkboxChecked]}>
            {task.completedAt && <Text style={styles.checkmark}>✓</Text>}
          </View>
        </TouchableOpacity>

        {/* Task content */}
        <View style={styles.textContent}>
          <Text
            style={[
              styles.title,
              task.completedAt && styles.completedText,
            ]}
            numberOfLines={2}
          >
            {task.title}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.timeAgo}>{timeAgo}</Text>
            {task.estimatedMinutes && (
              <Text style={styles.estimate}>{task.estimatedMinutes}m</Text>
            )}
            {task.energy && (
              <Text style={styles.energy}>{task.energy.toUpperCase()}</Text>
            )}
          </View>
        </View>

        {/* Star button */}
        {showStar && !task.completedAt && (
          <TouchableOpacity
            onPress={handleStar}
            style={styles.starButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.star}>{task.starredFor ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    minHeight: 56,
  },
  pressed: {
    backgroundColor: '#f9f9f9',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    marginRight: 12,
  },
  checkboxInner: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#ddd',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  checkmark: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 17,
    color: '#333',
    marginBottom: 4,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 8,
  },
  timeAgo: {
    fontSize: 13,
    color: '#999',
  },
  estimate: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  energy: {
    fontSize: 13,
    color: '#2196F3',
    fontWeight: '500',
  },
  starButton: {
    marginLeft: 8,
  },
  star: {
    fontSize: 24,
  },
});

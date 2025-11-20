import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { QuickAddBar } from '../components/QuickAddBar';
import { TaskCard } from '../components/TaskCard';
import { TaskEditorModal } from '../components/TaskEditorModal';
import { IHaveTimeModal } from '../components/IHaveTimeModal';
import { useTaskStore } from '../store/taskStore';
import { useNotifications } from '../hooks/useNotifications';
import { Task } from '../types/Task';

export const MainScreen: React.FC = () => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [showIHaveTimeModal, setShowIHaveTimeModal] = useState(false);
  const getStarredTasks = useTaskStore((state) => state.getStarredTasks);
  const getBrainDumpTasks = useTaskStore((state) => state.getBrainDumpTasks);

  // Set up notifications
  useNotifications();

  const starredTasks = getStarredTasks();
  const brainDumpTasks = getBrainDumpTasks();

  const handleTaskPress = (task: Task) => {
    setSelectedTask(task);
  };

  const handleCloseModal = () => {
    setSelectedTask(null);
  };

  const handleIHaveTimePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowIHaveTimeModal(true);
  };

  const handleIHaveTimeClose = () => {
    setShowIHaveTimeModal(false);
  };

  const handleIHaveTimeTaskSelected = (task: Task) => {
    // Open the task editor when a suggestion is selected
    setSelectedTask(task);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>ADHD Task Manager</Text>
        </View>

        {/* Quick Add Bar */}
        <QuickAddBar />

        {/* Scrollable Content */}
        <ScrollView style={styles.content}>
          {/* Most Important Today Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>⭐ Most Important Today</Text>
              <Text style={styles.sectionSubtitle}>
                {starredTasks.length}/3 tasks
              </Text>
            </View>

            {starredTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  Star up to 3 tasks to focus on today
                </Text>
              </View>
            ) : (
              <View style={styles.taskList}>
                {starredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => handleTaskPress(task)}
                    showStar={false}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Brain Dump Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>🧠 Brain Dump</Text>
              <Text style={styles.sectionSubtitle}>
                Last {brainDumpTasks.length} tasks
              </Text>
            </View>

            {brainDumpTasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  No tasks yet. Type above to add your first task!
                </Text>
              </View>
            ) : (
              <View style={styles.taskList}>
                {brainDumpTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onPress={() => handleTaskPress(task)}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>

        {/* Floating Action Button - I Have Time */}
        <TouchableOpacity
          style={styles.fab}
          onPress={handleIHaveTimePress}
          activeOpacity={0.8}
        >
          <Text style={styles.fabText}>⏰</Text>
          <Text style={styles.fabLabel}>I Have Time</Text>
        </TouchableOpacity>

        {/* Task Editor Modal */}
        {selectedTask && (
          <TaskEditorModal
            visible={!!selectedTask}
            task={selectedTask}
            onClose={handleCloseModal}
          />
        )}

        {/* I Have Time Modal */}
        <IHaveTimeModal
          visible={showIHaveTimeModal}
          onClose={handleIHaveTimeClose}
          onTaskSelected={handleIHaveTimeTaskSelected}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  taskList: {
    backgroundColor: '#fff',
  },
  emptyState: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 80,
    backgroundColor: '#2196F3',
    borderRadius: 30,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
    minHeight: 56,
  },
  fabText: {
    fontSize: 24,
    marginRight: 8,
  },
  fabLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

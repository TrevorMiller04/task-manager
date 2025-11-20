import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  TextInput,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { Task } from '../types/Task';
import { useTaskStore } from '../store/taskStore';
import { Capacity, suggestTasks } from '../utils/taskScoring';
import { TaskCard } from './TaskCard';

interface IHaveTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onTaskSelected: (task: Task) => void;
}

const CAPACITY_OPTIONS: Capacity[] = ['low', 'med', 'high'];
const QUICK_MINUTES = [15, 30, 60, 120];

export const IHaveTimeModal: React.FC<IHaveTimeModalProps> = ({
  visible,
  onClose,
  onTaskSelected,
}) => {
  const tasks = useTaskStore((state) => state.tasks);

  const [capacity, setCapacity] = useState<Capacity>('med');
  const [minutes, setMinutes] = useState<string>('30');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<Task[]>([]);

  const handleCapacitySelect = (cap: Capacity) => {
    setCapacity(cap);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleQuickMinutes = (min: number) => {
    setMinutes(min.toString());
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleGetSuggestions = () => {
    const availableMin = parseInt(minutes) || 30;
    const suggested = suggestTasks(tasks, capacity, availableMin, 3);

    setSuggestions(suggested);
    setShowSuggestions(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  };

  const handleTaskSelect = (task: Task) => {
    onTaskSelected(task);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setCapacity('med');
    setMinutes('30');
    setShowSuggestions(false);
    setSuggestions([]);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const capacityLabels: Record<Capacity, string> = {
    low: '🌙 Low Energy',
    med: '☀️ Medium Energy',
    high: '⚡ High Energy',
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>I Have Time</Text>
          <View style={styles.headerButton} />
        </View>

        <ScrollView style={styles.content}>
          {!showSuggestions ? (
            <>
              {/* Capacity Selector */}
              <View style={styles.section}>
                <Text style={styles.label}>How's your brain feeling?</Text>
                <View style={styles.chipRow}>
                  {CAPACITY_OPTIONS.map((cap) => (
                    <TouchableOpacity
                      key={cap}
                      style={[
                        styles.chip,
                        capacity === cap && styles.chipSelected,
                      ]}
                      onPress={() => handleCapacitySelect(cap)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          capacity === cap && styles.chipTextSelected,
                        ]}
                      >
                        {capacityLabels[cap]}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Time Input */}
              <View style={styles.section}>
                <Text style={styles.label}>How many minutes do you have?</Text>
                <TextInput
                  style={styles.input}
                  value={minutes}
                  onChangeText={setMinutes}
                  placeholder="30"
                  keyboardType="number-pad"
                  returnKeyType="done"
                />

                {/* Quick Time Buttons */}
                <View style={styles.chipRow}>
                  {QUICK_MINUTES.map((min) => (
                    <TouchableOpacity
                      key={min}
                      style={styles.quickButton}
                      onPress={() => handleQuickMinutes(min)}
                    >
                      <Text style={styles.quickButtonText}>{min}m</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Get Suggestions Button */}
              <TouchableOpacity
                style={styles.getSuggestionsButton}
                onPress={handleGetSuggestions}
              >
                <Text style={styles.getSuggestionsText}>
                  Show Me What To Do
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Suggestions */}
              <View style={styles.section}>
                <Text style={styles.suggestionsTitle}>
                  {suggestions.length > 0
                    ? `Here are ${suggestions.length} great task${
                        suggestions.length > 1 ? 's' : ''
                      } for you:`
                    : 'No perfect matches right now'}
                </Text>

                {suggestions.length === 0 ? (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>
                      No tasks fit your current time and energy level.
                    </Text>
                    <Text style={styles.emptySubtext}>
                      Try adjusting your available time or adding more details
                      to your tasks.
                    </Text>
                  </View>
                ) : (
                  <View style={styles.suggestionsList}>
                    {suggestions.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        onPress={() => handleTaskSelect(task)}
                        showStar={false}
                      />
                    ))}
                  </View>
                )}
              </View>

              {/* Try Again Button */}
              <TouchableOpacity
                style={styles.tryAgainButton}
                onPress={handleReset}
              >
                <Text style={styles.tryAgainText}>Try Different Filters</Text>
              </TouchableOpacity>
            </>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingTop: Platform.OS === 'ios' ? 56 : 12,
  },
  headerButton: {
    minWidth: 60,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  cancelText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minHeight: 48,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  input: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    minHeight: 64,
    textAlign: 'center',
    marginBottom: 12,
  },
  quickButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2196F3',
    minHeight: 44,
    justifyContent: 'center',
  },
  quickButtonText: {
    fontSize: 15,
    color: '#2196F3',
    fontWeight: '500',
  },
  getSuggestionsButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    minHeight: 56,
    justifyContent: 'center',
    marginTop: 8,
  },
  getSuggestionsText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  suggestionsList: {
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  emptyState: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  tryAgainButton: {
    backgroundColor: '#fff',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#2196F3',
    minHeight: 48,
    justifyContent: 'center',
    marginTop: 16,
  },
  tryAgainText: {
    color: '#2196F3',
    fontSize: 16,
    fontWeight: '600',
  },
});

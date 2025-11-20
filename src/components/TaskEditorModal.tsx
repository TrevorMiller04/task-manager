import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Task, EnergyLevel, Importance } from '../types/Task';
import { useTaskStore } from '../store/taskStore';

interface TaskEditorModalProps {
  visible: boolean;
  task: Task;
  onClose: () => void;
}

const ENERGY_LEVELS: EnergyLevel[] = ['low', 'med', 'high'];
const IMPORTANCE_LEVELS: Importance[] = [1, 2, 3];
const TIME_ESTIMATES = [15, 30, 60, 120, 240]; // in minutes

export const TaskEditorModal: React.FC<TaskEditorModalProps> = ({
  visible,
  task,
  onClose,
}) => {
  const updateTask = useTaskStore((state) => state.updateTask);
  const deleteTask = useTaskStore((state) => state.deleteTask);

  const [title, setTitle] = useState(task.title);
  const [notes, setNotes] = useState(task.notes || '');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [deadline, setDeadline] = useState(task.deadline ? new Date(task.deadline) : undefined);
  const [energy, setEnergy] = useState<EnergyLevel | undefined>(task.energy);
  const [importance, setImportance] = useState<Importance | undefined>(task.importance);
  const [estimatedMinutes, setEstimatedMinutes] = useState<number | undefined>(
    task.estimatedMinutes
  );

  const handleSave = () => {
    if (title.trim()) {
      updateTask(task.id, {
        title: title.trim(),
        notes: notes.trim() || undefined,
        deadline: deadline?.toISOString(),
        energy,
        importance,
        estimatedMinutes,
      });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onClose();
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Task', 'Are you sure you want to delete this task?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTask(task.id);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          onClose();
        },
      },
    ]);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDeadline(selectedDate);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Edit Task</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {/* Title */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              value={title}
              onChangeText={setTitle}
              placeholder="Task title"
              autoFocus
              multiline
            />
          </View>

          {/* Notes */}
          <View style={styles.section}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={styles.notesInput}
              value={notes}
              onChangeText={setNotes}
              placeholder="Add notes..."
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Deadline */}
          <View style={styles.section}>
            <Text style={styles.label}>Deadline</Text>
            <TouchableOpacity
              style={styles.chipButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.chipText}>
                {deadline ? deadline.toLocaleDateString() : 'Set deadline'}
              </Text>
            </TouchableOpacity>
            {deadline && (
              <TouchableOpacity
                onPress={() => {
                  setDeadline(undefined);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
                style={styles.clearButton}
              >
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
            {showDatePicker && (
              <DateTimePicker
                value={deadline || new Date()}
                mode="datetime"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>

          {/* Energy Level */}
          <View style={styles.section}>
            <Text style={styles.label}>Energy Level</Text>
            <View style={styles.chipRow}>
              {ENERGY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.chip,
                    energy === level && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setEnergy(energy === level ? undefined : level);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      energy === level && styles.chipTextSelected,
                    ]}
                  >
                    {level.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Time Estimate */}
          <View style={styles.section}>
            <Text style={styles.label}>Time Estimate</Text>
            <View style={styles.chipRow}>
              {TIME_ESTIMATES.map((minutes) => (
                <TouchableOpacity
                  key={minutes}
                  style={[
                    styles.chip,
                    estimatedMinutes === minutes && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setEstimatedMinutes(
                      estimatedMinutes === minutes ? undefined : minutes
                    );
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      estimatedMinutes === minutes && styles.chipTextSelected,
                    ]}
                  >
                    {minutes < 60 ? `${minutes}m` : `${minutes / 60}h`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Importance */}
          <View style={styles.section}>
            <Text style={styles.label}>Importance</Text>
            <View style={styles.chipRow}>
              {IMPORTANCE_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.chip,
                    importance === level && styles.chipSelected,
                  ]}
                  onPress={() => {
                    setImportance(importance === level ? undefined : level);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.chipText,
                      importance === level && styles.chipTextSelected,
                    ]}
                  >
                    {'★'.repeat(level)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Delete Button */}
          <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
            <Text style={styles.deleteText}>Delete Task</Text>
          </TouchableOpacity>
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
  saveText: {
    fontSize: 16,
    color: '#2196F3',
    fontWeight: '600',
    textAlign: 'right',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  titleInput: {
    fontSize: 18,
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 50,
  },
  notesInput: {
    fontSize: 16,
    color: '#333',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 44,
    justifyContent: 'center',
  },
  chipSelected: {
    backgroundColor: '#2196F3',
    borderColor: '#2196F3',
  },
  chipText: {
    fontSize: 15,
    color: '#666',
    fontWeight: '500',
  },
  chipTextSelected: {
    color: '#fff',
  },
  chipButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minHeight: 48,
    justifyContent: 'center',
  },
  clearButton: {
    marginTop: 8,
    paddingVertical: 8,
  },
  clearText: {
    color: '#FF5252',
    fontSize: 14,
  },
  deleteButton: {
    marginTop: 32,
    marginBottom: 32,
    paddingVertical: 14,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    alignItems: 'center',
    minHeight: 48,
    justifyContent: 'center',
  },
  deleteText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
  },
});

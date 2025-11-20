import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { useTaskStore } from '../store/taskStore';

export const QuickAddBar: React.FC = () => {
  const [text, setText] = useState('');
  const addTask = useTaskStore((state) => state.addTask);

  const handleSubmit = () => {
    if (text.trim()) {
      addTask(text.trim());
      setText('');
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          onSubmitEditing={handleSubmit}
          placeholder="What's on your mind?"
          placeholderTextColor="#999"
          returnKeyType="done"
          blurOnSubmit={false}
          autoCapitalize="sentences"
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
  },
  inputWrapper: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  input: {
    fontSize: 18,
    minHeight: 44,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    color: '#333',
  },
});

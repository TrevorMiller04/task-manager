import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { format, addHours } from 'date-fns';
import {
  requestCalendarPermissions,
  getEvents,
  calculateFreeBlocks,
  CalendarEvent,
  FreeBlock,
} from '../utils/calendar';

export const CalendarScreen: React.FC = () => {
  const [hasPermission, setHasPermission] = useState(false);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [freeBlocks, setFreeBlocks] = useState<FreeBlock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadCalendarData = async () => {
    try {
      setIsLoading(true);

      const hasAccess = await requestCalendarPermissions();
      setHasPermission(hasAccess);

      if (!hasAccess) {
        setIsLoading(false);
        return;
      }

      // Get events for the next 12 hours
      const now = new Date();
      const later = addHours(now, 12);

      const calendarEvents = await getEvents(now, later);
      setEvents(calendarEvents);

      // Calculate free blocks
      const blocks = calculateFreeBlocks(calendarEvents, now, later);
      setFreeBlocks(blocks);

      setIsLoading(false);
    } catch (error) {
      console.error('Error loading calendar data:', error);
      setIsLoading(false);
      Alert.alert('Error', 'Failed to load calendar data');
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadCalendarData();
    setIsRefreshing(false);
  };

  const handleRequestPermission = async () => {
    const granted = await requestCalendarPermissions();
    if (granted) {
      await loadCalendarData();
    } else {
      Alert.alert(
        'Permission Denied',
        'Calendar access is required to show free time blocks. Please enable it in Settings.'
      );
    }
  };

  const formatTime = (date: Date) => {
    return format(date, 'h:mm a');
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  if (!hasPermission) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Calendar</Text>
          </View>

          <View style={styles.permissionContainer}>
            <Text style={styles.permissionTitle}>📅</Text>
            <Text style={styles.permissionText}>
              Calendar access helps us find free time for your tasks
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={handleRequestPermission}
            >
              <Text style={styles.permissionButtonText}>
                Enable Calendar Access
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Calendar</Text>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
          }
        >
          {/* Free Blocks Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>⏰ Free Time (Next 12h)</Text>
            {freeBlocks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {isLoading
                    ? 'Loading...'
                    : 'No free blocks found. Your calendar is packed!'}
                </Text>
              </View>
            ) : (
              <View style={styles.blockList}>
                {freeBlocks.map((block, index) => (
                  <View key={index} style={styles.freeBlock}>
                    <View style={styles.blockTime}>
                      <Text style={styles.blockTimeText}>
                        {formatTime(block.start)} - {formatTime(block.end)}
                      </Text>
                      <Text style={styles.blockDuration}>
                        {formatDuration(block.durationMinutes)}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* Events Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Scheduled Events</Text>
            {events.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>
                  {isLoading ? 'Loading...' : 'No upcoming events'}
                </Text>
              </View>
            ) : (
              <View style={styles.eventList}>
                {events.map((event) => (
                  <View key={event.id} style={styles.event}>
                    <Text style={styles.eventTitle}>{event.title}</Text>
                    <Text style={styles.eventTime}>
                      {formatTime(event.startDate)} - {formatTime(event.endDate)}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    paddingHorizontal: 16,
    marginBottom: 12,
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
  blockList: {
    paddingHorizontal: 16,
  },
  freeBlock: {
    backgroundColor: '#E8F5E9',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  blockTime: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  blockTimeText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2E7D32',
  },
  blockDuration: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
  },
  eventList: {
    paddingHorizontal: 16,
  },
  event: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#2196F3',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  eventTime: {
    fontSize: 14,
    color: '#666',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  permissionTitle: {
    fontSize: 64,
    marginBottom: 16,
  },
  permissionText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 8,
    minHeight: 48,
    justifyContent: 'center',
  },
  permissionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

import * as Calendar from 'expo-calendar';
import { addHours, startOfDay, endOfDay, isWithinInterval, parseISO } from 'date-fns';

export interface FreeBlock {
  start: Date;
  end: Date;
  durationMinutes: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  startDate: Date;
  endDate: Date;
  allDay: boolean;
}

/**
 * Request calendar permissions from the user
 * @returns true if permission granted, false otherwise
 */
export const requestCalendarPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Calendar.requestCalendarPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('Error requesting calendar permissions:', error);
    return false;
  }
};

/**
 * Get all device calendars
 * @returns Array of calendars or empty array if no permission
 */
export const getCalendars = async (): Promise<Calendar.Calendar[]> => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    return calendars;
  } catch (error) {
    console.error('Error fetching calendars:', error);
    return [];
  }
};

/**
 * Get events from device calendars for a date range
 * @param startDate Start of date range
 * @param endDate End of date range
 * @returns Array of calendar events
 */
export const getEvents = async (
  startDate: Date,
  endDate: Date
): Promise<CalendarEvent[]> => {
  try {
    const { status } = await Calendar.getCalendarPermissionsAsync();
    if (status !== 'granted') {
      return [];
    }

    const calendars = await Calendar.getCalendarsAsync(Calendar.EntityTypes.EVENT);
    if (calendars.length === 0) {
      return [];
    }

    // Get events from all calendars
    const calendarIds = calendars.map((cal) => cal.id);
    const events = await Calendar.getEventsAsync(
      calendarIds,
      startDate,
      endDate
    );

    return events.map((event) => ({
      id: event.id,
      title: event.title,
      startDate: new Date(event.startDate),
      endDate: new Date(event.endDate),
      allDay: event.allDay || false,
    }));
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};

/**
 * Calculate free blocks between calendar events
 * @param events Calendar events for the day
 * @param dayStart Start of the working day (default: now)
 * @param dayEnd End of the working day (default: 12 hours from start)
 * @returns Array of free time blocks
 */
export const calculateFreeBlocks = (
  events: CalendarEvent[],
  dayStart: Date = new Date(),
  dayEnd: Date = addHours(dayStart, 12)
): FreeBlock[] => {
  // Filter to only non-all-day events within our time window
  const relevantEvents = events
    .filter((event) => !event.allDay)
    .filter(
      (event) =>
        isWithinInterval(event.startDate, { start: dayStart, end: dayEnd }) ||
        isWithinInterval(event.endDate, { start: dayStart, end: dayEnd }) ||
        (event.startDate <= dayStart && event.endDate >= dayEnd)
    )
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());

  const freeBlocks: FreeBlock[] = [];

  // If no events, the entire period is free
  if (relevantEvents.length === 0) {
    const durationMs = dayEnd.getTime() - dayStart.getTime();
    return [
      {
        start: dayStart,
        end: dayEnd,
        durationMinutes: Math.floor(durationMs / (1000 * 60)),
      },
    ];
  }

  // Check for free block before first event
  const firstEvent = relevantEvents[0];
  if (firstEvent.startDate > dayStart) {
    const durationMs = firstEvent.startDate.getTime() - dayStart.getTime();
    freeBlocks.push({
      start: dayStart,
      end: firstEvent.startDate,
      durationMinutes: Math.floor(durationMs / (1000 * 60)),
    });
  }

  // Check for free blocks between events
  for (let i = 0; i < relevantEvents.length - 1; i++) {
    const currentEvent = relevantEvents[i];
    const nextEvent = relevantEvents[i + 1];

    if (currentEvent.endDate < nextEvent.startDate) {
      const durationMs = nextEvent.startDate.getTime() - currentEvent.endDate.getTime();
      const durationMinutes = Math.floor(durationMs / (1000 * 60));

      // Only include blocks that are at least 5 minutes
      if (durationMinutes >= 5) {
        freeBlocks.push({
          start: currentEvent.endDate,
          end: nextEvent.startDate,
          durationMinutes,
        });
      }
    }
  }

  // Check for free block after last event
  const lastEvent = relevantEvents[relevantEvents.length - 1];
  if (lastEvent.endDate < dayEnd) {
    const durationMs = dayEnd.getTime() - lastEvent.endDate.getTime();
    const durationMinutes = Math.floor(durationMs / (1000 * 60));

    if (durationMinutes >= 5) {
      freeBlocks.push({
        start: lastEvent.endDate,
        end: dayEnd,
        durationMinutes,
      });
    }
  }

  return freeBlocks;
};

/**
 * Get the next available free block from now
 * @returns The next free block, or null if none available
 */
export const getNextFreeBlock = async (): Promise<FreeBlock | null> => {
  try {
    const now = new Date();
    const endOfToday = endOfDay(now);

    const events = await getEvents(now, endOfToday);
    const freeBlocks = calculateFreeBlocks(events, now, endOfToday);

    // Return the first free block (they're already sorted by start time)
    return freeBlocks.length > 0 ? freeBlocks[0] : null;
  } catch (error) {
    console.error('Error getting next free block:', error);
    return null;
  }
};

/**
 * Clamp available minutes to the next calendar conflict
 * @param requestedMinutes User's requested available time
 * @returns Clamped minutes based on next calendar event
 */
export const clampToNextConflict = async (
  requestedMinutes: number
): Promise<number> => {
  try {
    const nextBlock = await getNextFreeBlock();

    if (!nextBlock) {
      // No calendar access or no events, return requested time
      return requestedMinutes;
    }

    // Return the smaller of requested time or available free time
    return Math.min(requestedMinutes, nextBlock.durationMinutes);
  } catch (error) {
    console.error('Error clamping to next conflict:', error);
    return requestedMinutes;
  }
};

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an ADHD-friendly task management mobile application built with React Native and Expo. The app focuses on zero-friction task capture, limited daily focus (max 3 starred tasks), and intelligent task suggestions based on available time and mental capacity.

## Commands

### Development
```bash
# Start the development server
npm start
# or
npx expo start

# Clear cache and start fresh
npx expo start --clear

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Run on web
npm run web
```

### Testing
```bash
# Type checking
npx tsc --noEmit

# Install dependencies
npm install

# Update dependencies to match Expo version
npx expo install --fix
```

## Architecture

### State Management
- **Zustand** with AsyncStorage persistence for all task state
- Single store located in `src/store/taskStore.ts`
- Automatic persistence to device storage using `@react-native-async-storage/async-storage`

### Data Model
The core `Task` interface (`src/types/Task.ts`) includes:
- Basic fields: id, title, notes, createdAt
- Optional metadata: deadline, estimatedMinutes, importance (1-3), effort (1-3), energy (low/med/high)
- State tracking: starredFor (ISO date), completedAt, calendarBlockId

### Component Structure
- **QuickAddBar**: Zero-friction task input (type and press Enter)
- **TaskCard**: Individual task display with complete checkbox and star button
- **TaskEditorModal**: Full-screen modal with chip-based inputs (no anxiety-inducing forms)
- **MainScreen**: Primary view with "Most Important Today" (max 3) and "Brain Dump" (last 10 tasks)

### ADHD-Friendly UX Principles
1. **Zero friction for task capture** - No required fields, just type and hit Enter
2. **Limited choices** - Max 3 starred tasks, show only last 10 in brain dump
3. **Chip-based UI** - No overwhelming forms, use tappable chips for metadata
4. **Large tap targets** - Minimum 44pt touch targets throughout
5. **Haptic feedback** - Physical confirmation for all interactions via `expo-haptics`
6. **No anxiety triggers** - No badge counters, no overwhelming lists, no pressure
7. **Reverse chronological** - Latest tasks first (matches brain dump flow)

### Notifications System
- **Evening reminders**: Daily at 7:30 PM for tasks without details (deadline/energy/time)
- **Deadline notifications**: T-24h, T-2h, and at deadline time
- All notification logic in `src/utils/notifications.ts`
- Managed by `useNotifications` hook in `src/hooks/useNotifications.ts`

### File Structure
```
src/
├── components/     # Reusable UI components
├── screens/        # Top-level screen components
├── store/          # Zustand state management
├── types/          # TypeScript interfaces
├── utils/          # Utility functions (notifications, etc.)
└── hooks/          # Custom React hooks
```

## Important Implementation Notes

### When Adding New Features
1. **Keep it minimal** - This is an MVP focused on core ADHD-friendly task management
2. **Maintain UX principles** - Every feature should reduce cognitive load, not add to it
3. **Use haptic feedback** - Import from `expo-haptics` and add to all user interactions
4. **Update notifications** - If adding deadline-related features, update notification scheduling

### Notification Caveats
- Notifications use `expo-notifications` with proper TypeScript types
- Always specify `type: Notifications.SchedulableTriggerInputTypes.DATE` or `DAILY` for triggers
- Include all required fields: `shouldShowAlert`, `shouldPlaySound`, `shouldSetBadge`, `shouldShowBanner`, `shouldShowList`

### Zustand Store Patterns
- Use functional updates: `set((state) => ({ ...state, newValue }))`
- Derive values in selectors, not in components
- AsyncStorage persistence is automatic via middleware

### Known Dependencies
The app uses:
- `expo-notifications` for local notifications
- `@react-native-async-storage/async-storage` for persistence
- `zustand` for state management
- `date-fns` for date manipulation
- `expo-haptics` for tactile feedback
- `@react-native-community/datetimepicker` for deadline selection
- `react-native-gesture-handler` and `react-native-reanimated` for gestures

## Sprint 1 Status

✅ Completed:
- Project scaffolding
- QuickAdd functionality with brain dump list
- Task editing with chip-based UI
- "Most Important Today" starring (max 3 tasks)
- Local notifications (evening reminders + deadline alerts)
- Data persistence via AsyncStorage

## Sprint 2 Status (Current)

✅ Completed:
- "I Have Time" wizard with capacity selector and minutes input
- Task scoring/prioritization algorithm (importance, urgency, energy fit, time fit)
- Smart task suggestions (1-3 tasks based on available time and energy)
- expo-calendar integration for reading device calendars
- Free block detection and display
- Calendar screen showing events and free time slots
- Bottom tab navigation (Tasks / Calendar)
- Floating Action Button (FAB) for "I Have Time" feature

## Future Features (Not Yet Implemented)

The following stretch features are documented in `OriginalMVP.md`:
- Settings screen
- Natural language parsing for task input
- Recurring tasks
- Focus timer with countdown
- Google Calendar API (cloud-synced calendars)
- Cross-device sync via Supabase

## Testing in Expo Go

To test the app:
1. Install Expo Go on your iOS or Android device
2. Run `npx expo start` in the project directory
3. Scan the QR code with your camera (iOS) or Expo Go app (Android)
4. The app should load and be fully functional

Note: Notifications will request permissions on first launch.

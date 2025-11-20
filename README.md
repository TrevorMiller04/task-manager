# ADHD Task Manager

A minimal, ADHD-friendly task management app built with React Native and Expo. Designed for zero-friction task capture and focused daily planning.

## Features (Sprint 1)

✅ **Zero-Friction Task Capture**
- Type and hit Enter to add tasks instantly
- No required fields, no forms to fill out
- Tasks appear in reverse-chronological order (brain dump style)

✅ **Most Important Today**
- Star up to 3 tasks to focus on each day
- Prevents overwhelm by limiting daily priorities
- Quick visual separation from brain dump

✅ **Intelligent Task Editing**
- Tap any task to open the editor
- Chip-based UI for deadline, energy level, time estimate, and importance
- No anxiety-inducing forms

✅ **Smart Notifications**
- Evening reminders (7:30 PM) for tasks without details
- Deadline alerts at T-24h, T-2h, and at deadline time
- Automatic permission requests

✅ **Data Persistence**
- All tasks automatically saved to device storage
- Survives app restarts
- No cloud sync needed (Sprint 1)

## Getting Started

### Prerequisites
- Node.js 20.15.0 or higher (20.19.4+ recommended)
- npm or yarn
- Expo Go app on your iOS or Android device

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

The app will load in Expo Go on your device.

### Running on Simulators/Emulators

```bash
# iOS Simulator (requires macOS and Xcode)
npm run ios

# Android Emulator (requires Android Studio)
npm run android

# Web browser
npm run web
```

## Usage

### Adding Tasks
1. Type your task in the input field at the top
2. Press Enter or Return
3. Task appears at the top of the Brain Dump list

### Starring Tasks
1. Tap the ☆ icon on any task
2. It moves to "Most Important Today"
3. Maximum of 3 starred tasks allowed
4. Tap the ⭐ to unstar

### Editing Tasks
1. Tap anywhere on a task card
2. Edit title and notes
3. Use chips to add:
   - Deadline (date and time)
   - Energy level (LOW/MED/HIGH)
   - Time estimate (15m, 30m, 1h, 2h, 4h)
   - Importance (★, ★★, ★★★)
4. Tap "Save" when done

### Completing Tasks
1. Tap the circle checkbox on any task
2. Task is marked complete (strike-through)
3. Completed tasks remain visible but filtered out of active lists

## Project Structure

```
ADHD_App/
├── src/
│   ├── components/      # Reusable UI components
│   │   ├── QuickAddBar.tsx
│   │   ├── TaskCard.tsx
│   │   └── TaskEditorModal.tsx
│   ├── screens/         # Main screen
│   │   └── MainScreen.tsx
│   ├── store/           # Zustand state management
│   │   └── taskStore.ts
│   ├── types/           # TypeScript interfaces
│   │   └── Task.ts
│   ├── utils/           # Utility functions
│   │   └── notifications.ts
│   └── hooks/           # Custom React hooks
│       └── useNotifications.ts
├── App.tsx              # Root component
├── app.json             # Expo configuration
└── package.json         # Dependencies
```

## Technology Stack

- **React Native** - Cross-platform mobile framework
- **Expo** - Development platform and tools
- **TypeScript** - Type safety
- **Zustand** - Lightweight state management
- **AsyncStorage** - Local data persistence
- **expo-notifications** - Push notifications
- **date-fns** - Date manipulation
- **expo-haptics** - Tactile feedback

## Design Principles

This app follows ADHD-friendly UX principles:

1. **Zero friction** - No required fields, just type and go
2. **Limited choices** - Max 3 priorities, last 10 tasks shown
3. **Clear visual hierarchy** - Big, tappable buttons (44-56pt)
4. **Positive reinforcement** - Haptic feedback, no anxiety triggers
5. **Minimal cognitive load** - Chip-based UI instead of forms
6. **Brain dump friendly** - Reverse chronological order

## Troubleshooting

### Metro Bundler won't start
```bash
# Clear cache and restart
npx expo start --clear

# Or kill any process on port 8081
lsof -ti:8081 | xargs kill
npm start
```

### TypeScript errors
```bash
# Run type checking
npx tsc --noEmit
```

### Package version mismatches
```bash
# Auto-fix package versions to match Expo
npx expo install --fix
```

### Notifications not working
- Make sure you've allowed notification permissions
- Notifications only work on physical devices (not in browsers)
- Check that tasks have deadlines for deadline notifications

## Roadmap (Sprint 2)

Planned features for future sprints:

- 🧠 "I Have Time" wizard with smart suggestions
- 📅 Google Calendar integration
- ⚙️ Settings screen
- 🔁 Recurring tasks
- ⏲️ Focus timer
- 🌐 Cross-device sync via Supabase
- 🗣️ Natural language parsing

## Development

### Type Checking
```bash
npx tsc --noEmit
```

### Linting
```bash
npm run lint
```

## License

MIT

## Contributing

This is currently an MVP implementation. Contributions welcome for Sprint 2 features!

---

Built with ❤️ for the ADHD community

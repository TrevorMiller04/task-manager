# Bug Fixes Log

## Error: TypeError - expected dynamic type 'boolean', but had type 'string'

### Root Cause
- **Expo Go (SDK 54+) ALWAYS uses Fabric (React Native's new architecture)**
- Fabric has strict type checking that requires `fontWeight` to be a STRING not a NUMBER
- React Navigation + react-native-screens have compatibility issues with Fabric

### Attempted Fixes

#### ❌ FAILED: Disable Fabric in app.json
- **What we tried**: Set `"newArchEnabled": false` in app.json
- **Why it failed**: Expo Go IGNORES this setting - it always forces Fabric on
- **Result**: Error persists because Expo Go still uses Fabric regardless of app.json

#### ❌ FAILED: Create Development Build
- **What we tried**: Use `npx expo run:ios` to create custom build that respects newArchEnabled setting
- **Why it failed**:
  - Build failed with RNReanimated C++ compilation error
  - react-native-reanimated v4.1.3 REQUIRES Fabric to be enabled
  - Downgraded to v3.16.7 but CocoaPods still had issues
  - Xcode build took 30+ minutes and ultimately failed
- **Result**: Development build approach is a rabbit hole - not worth debugging for MVP

#### ✅ CORRECT FIX: Change fontWeight to strings
- **What works**: Change ALL `fontWeight: 600` to `fontWeight: '600'` (string)
- **Why it works**: Fabric requires string values for fontWeight prop
- **Files changed**:
  - App.tsx (1 occurrence)
  - src/screens/MainScreen.tsx (2 occurrences)
  - src/screens/CalendarScreen.tsx (5 occurrences)
  - src/components/TaskCard.tsx (2 occurrences)
  - src/components/TaskEditorModal.tsx (5 occurrences)
  - src/components/IHaveTimeModal.tsx (8 occurrences)
- **Configuration**:
  - app.json: `"newArchEnabled": true` (must match Expo Go)
  - babel.config.js: Must include `'react-native-reanimated/plugin'`

### Current Status
- ✅ All fontWeight values fixed (changed to strings)
- ✅ app.json has `"newArchEnabled": true`
- ✅ babel.config.js has Reanimated plugin
- ⚠️ User getting "No development build installed" error when trying to open on iOS

## Error: No development build (com.anonymous.ADHD-App) installed

### Root Cause
- Expo CLI is trying to open the app in a development build instead of Expo Go
- This happens when expo-dev-client is installed in package.json

### ✅ SOLUTION: Remove expo-dev-client
```bash
npm uninstall expo-dev-client --legacy-peer-deps
rm -rf ios android
```

After removing:
- Restart Metro: `npx expo start --clear`
- Press `i` to open in iOS Simulator with Expo Go
- OR scan QR code with Expo Go on physical device

### Status
- ✅ expo-dev-client removed from package.json
- ✅ ios/ and android/ folders deleted
- ✅ App should now use Expo Go instead of development build

## Error: Cannot find module 'react-refresh/babel'

### Root Cause
- Removing expo-dev-client may have removed react-refresh as a dependency
- babel-preset-expo requires react-refresh/babel

### ✅ SOLUTION: Reinstall dependencies
```bash
npm install react-refresh --legacy-peer-deps
# OR
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

## Error: Asset not found - /assets/images/icon.png

### Root Cause
- Metro bundler looking for icon.png in wrong location
- Should be in `/assets/` not `/assets/images/`

### ✅ SOLUTION: Check asset paths
- Verify icon.png exists at correct path
- Check app.json references correct paths
- Clear Metro cache: `npx expo start --clear`

**Status**: ✅ Fixed - assets in correct location, cache cleared

## Error: Unable to resolve "react-native-safe-area-context"

### Root Cause
- @react-navigation/bottom-tabs requires react-native-safe-area-context
- Was likely removed when we uninstalled expo-dev-client

### ✅ SOLUTION: Install missing dependency
```bash
npm install react-native-safe-area-context --legacy-peer-deps
```

**Status**: ✅ Fixed - react-native-safe-area-context installed

---

## Error: TypeError - expected dynamic type 'boolean', but had type 'string' (AFTER PUBLISHING)

### ✅ FIXED: Upgrade react-native-reanimated to 4.1.1

**Root Cause:**
- Expo SDK 54 with Fabric (newArchEnabled: true) REQUIRES Reanimated v4.x
- We had downgraded to v3.16.7 to avoid Fabric issues in the past
- Reanimated v3.x has type incompatibilities with Fabric's strict type checking
- The boolean/string type error was coming from Reanimated's internal code

**Solution:**
```bash
npm install react-native-reanimated@~4.1.1 --legacy-peer-deps
```

**Why this works:**
- Reanimated v4.1.1 is fully compatible with Fabric
- It has correct type definitions for Fabric's strict boolean props
- Expo SDK 54 expects this version

**Configuration:**
- app.json: `"newArchEnabled": true`
- package.json: `"react-native-reanimated": "~4.1.1"`
- babel.config.js: `plugins: ['react-native-reanimated/plugin']`

---

## Key Learnings

1. **Expo Go ALWAYS uses Fabric** - cannot be disabled
2. **Development builds are complex** - require successful Xcode compilation
3. **For MVP stage, stick with Expo Go** - much faster iteration
4. **fontWeight MUST be strings with Fabric** - `'600'` not `600`
5. **Fabric REQUIRES Reanimated v4.x** - v3.x has type incompatibilities
6. **Different TypeErrors need different solutions** - don't assume same error = same fix
7. **Always check Expo's expected package versions** - warnings about version mismatches are critical

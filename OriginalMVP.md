awesome — let’s turn this into a tight, shippable MVP you can run in Expo Go and iterate on fast. below is a concrete blueprint: user stories, flows, data model, components, and “just-enough” algorithms you can paste into a TS/Expo project.

# product shape (ADHD-friendly, minimal)

## core user stories

1. As a user, I can brain-dump anything in 2 taps from the main screen (no fields required).
2. I can mark a few items as “Most Important Today” without opening an editor.
3. If I tap “I Have Time,” the app suggests 1–3 tasks that fit the time I have and my brain capacity right now.
4. If I give a dump item a deadline, I’ll get a nudge before it’s due. If I don’t add details, the app reminds me this evening to fill them in.
5. I can view my calendar (Google) and see free blocks; “I Have Time” respects conflicts.

## screens (keep it to two + modals)

* **Main** (single page):

  * Section A: “Most Important Today” (3 slots max).
  * Section B: Brain Dump list (reverse-chronological; chips show deadline/time/energy if present).
  * Floating button: **“I Have Time”**.
  * Quick Add bar: “Type and hit enter” (optional: mic icon later).
* **Calendar**:

  * Google Calendar day/week list with free blocks highlighted.
* **Modals**:

  * Quick Add (inline on Main).
  * Task Details (only if user wants to add/edit details).
  * “I Have Time” wizard: brain capacity (Low/Med/High), minutes available → suggestions.

# flows that matter

## quick add (zero friction)

* User types → press enter → creates `Task` with `{title, createdAt}` only.
* App schedules an **evening reminder** at, say, 7:30 pm local for all tasks created today that lack `deadline || estimatedMinutes || energy`.

## “mark as most important”

* Long-press a task → “Star for Today.” Cap at 3—enforced to prevent overwhelm.

## “I Have Time” decisioning

1. Ask capacity (Low/Med/High) and available minutes.
2. Read next busy time from Calendar; clamp minutes to that free window.
3. Suggest top 1–3 tasks computed by a simple scoring function (below).
4. One-tap: “Start” → marks as **In Focus** (optional mini timer later) or “Skip” → next suggestion.

# lightweight prioritization (simple & explainable)

### task fields that influence choice

* `deadline?: Date`
* `importance?: 1|2|3` (defaults to 1; user can bump with one tap)
* `energy?: 'low'|'med'|'high'` (optional)
* `estimatedMinutes?: number` (optional)
* `effort?: 1|2|3` (inverse of “bigness”, optional)

### helper mappings

* capacity fit:

  * Low fits tasks with `energy in {low}` best; Med fits `{low, med}`; High fits `{med, high}`
  * `energyFit = 1.0 if perfect, 0.7 if adjacent, 0.4 otherwise (or missing)`
* time fit:

  * if `estimatedMinutes` present: `timeFit = min(1, available/estimated)` but give a slight bonus if `estimated ≤ available` (e.g., +0.1 clamp 1.0)
  * if missing, default `0.8` (encourage tiny unknowns)
* urgency:

  * `urgency = 1 / max(0.5, daysUntil(deadline))`, capped at 2.0. If no deadline, 0.8.

### score (keep it tiny)

```
base = 1
score = base
      + 0.8 * importance
      + 1.0 * urgency
      + 0.8 * energyFit
      + 0.6 * timeFit
      - 0.2 * (effort-1)   // small nudge toward easier wins
```

Return tasks with `estimatedMinutes <= available` first; if none, include unknown durations.

# data model (MVP-friendly)

Keep it simple with **AsyncStorage** first; move to **expo-sqlite** if queries feel slow.

```ts
// types.ts
export type Energy = 'low'|'med'|'high';

export interface Task {
  id: string;               // uuid
  title: string;
  notes?: string;
  createdAt: string;        // ISO
  deadline?: string;        // ISO
  estimatedMinutes?: number;
  importance?: 1|2|3;
  effort?: 1|2|3;
  energy?: Energy;
  starredFor?: string;      // ISO date "YYYY-MM-DD" when starred as Most Important
  completedAt?: string;     // ISO
  calendarBlockId?: string; // optional link
}
```

Storage layout:

* `tasks:<date>` cache for starred-today querying is overkill; just store array `tasks` and compute derived lists in memory for MVP.
* `settings`: eveningReminderTime, calendar integration flags, default importance.

# tech stack (Expo Go compatible)

* **UI**: React Native + Expo Router or React Navigation (1 stack, 2 screens).
* **State**: Zustand or Jotai (tiny, async-friendly) or React Query for persistence sync. (Zustand is great here).
* **Storage**: `@react-native-async-storage/async-storage`.
* **Notifications**: `expo-notifications` (local for MVP).
* **Google auth**: `expo-auth-session` (Google).
* **Calendar read**: either

  * `expo-calendar` (device calendars) for a zero-server start, or
  * Google Calendar API via token from `expo-auth-session` (cloud calendars).
    Start with device calendars; upgrade to Google API in v2.
* **Dates**: `date-fns` (tiny helpers).
* **Accessibility**: larger touch targets (min 44pt), haptics via `expo-haptics` (light taps on star/success).

# component map

* `MainScreen`

  * `QuickAddBar`
  * `ImportantTodayList` (max 3)
  * `BrainDumpList`
  * FAB: `IHaveTimeButton`
* `CalendarScreen`

  * `FreeBlockStrip` (simple list of free ranges today/next)
* Modals

  * `TaskEditorModal`
  * `IHaveTimeModal` (capacity + minutes → suggestions list)

# key interactions (pseudo/TS)

### quick add + evening reminder

```ts
import * as Notifications from 'expo-notifications';
import { startOfToday, setHours, setMinutes, isToday } from 'date-fns';

const EVENING_HOUR = 19, EVENING_MIN = 30;

async function addQuickTask(title: string) {
  const t: Task = { id: crypto.randomUUID(), title, createdAt: new Date().toISOString() };
  await saveTask(t);
  scheduleFillInReminder(); // idempotent per day
}

let scheduledId: string|undefined;

async function scheduleFillInReminder() {
  // one reminder per evening if there are undetailed tasks from today
  const tasks = await loadTasks();
  const needsDetails = tasks.some(t =>
    isToday(new Date(t.createdAt)) &&
    !t.deadline && !t.estimatedMinutes && !t.energy
  );
  if (!needsDetails) return;

  const fireAt = setMinutes(setHours(startOfToday(), EVENING_HOUR), EVENING_MIN);
  if (new Date() > fireAt) return; // too late today

  if (scheduledId) await Notifications.cancelScheduledNotificationAsync(scheduledId);
  scheduledId = await Notifications.scheduleNotificationAsync({
    content: {
      title: "Take 2 min to add details?",
      body: "Add a deadline or estimate to today’s brain dump so Future-You is grateful.",
    },
    trigger: fireAt,
  });
}
```

### “I Have Time” suggestions

```ts
type Capacity = 'low'|'med'|'high';

function energyFit(cap: Capacity, t?: Energy) {
  if (!t) return 0.4;
  if (cap==='low') return t==='low' ? 1 : (t==='med' ? 0.7 : 0.4);
  if (cap==='med') return t!=='high' ? 1 : 0.7;
  return t==='high' ? 1 : (t==='med' ? 0.7 : 0.4);
}

function urgency(deadline?: string) {
  if (!deadline) return 0.8;
  const days = Math.max(0.5, (new Date(deadline).getTime()-Date.now())/(1000*60*60*24));
  return Math.min(2.0, 1/days);
}

function timeFit(availableMin: number, est?: number) {
  if (!est) return 0.8;
  const ratio = availableMin/Math.max(1, est);
  return Math.min(1, ratio) + (est <= availableMin ? 0.1 : 0);
}

function score(t: Task, cap: Capacity, availableMin: number) {
  const imp = t.importance ?? 1;
  const eff = t.effort ?? 1;
  return 1
    + 0.8*imp
    + 1.0*urgency(t.deadline)
    + 0.8*energyFit(cap, t.energy)
    + 0.6*timeFit(availableMin, t.estimatedMinutes)
    - 0.2*(eff-1);
}

export function suggest(tasks: Task[], cap: Capacity, availableMin: number) {
  const eligible = tasks.filter(t => !t.completedAt);
  // prefer those that fit time; fall back to unknowns
  const fits = eligible.filter(t => t.estimatedMinutes ? t.estimatedMinutes <= availableMin : true);
  return (fits.length ? fits : eligible)
    .sort((a,b)=> score(b, cap, availableMin)-score(a, cap, availableMin))
    .slice(0,3);
}
```

### star as “Most Important Today”

```ts
import { format } from 'date-fns';
function toggleStarForToday(t: Task) {
  const today = format(new Date(), 'yyyy-MM-dd');
  if (t.starredFor === today) t.starredFor = undefined;
  else t.starredFor = today;
  return saveTask(t);
}
```

# calendar integration (start simple)

**Phase 1 (MVP):** use `expo-calendar` to read device calendars → compute free blocks for today/next.

* ask permission → list calendars → fetch events in next 12 hours
* free windows = gaps between now and next events.
* clamp “I Have Time” minutes to nearest free window end.

**Phase 2:** add Google sign-in (AuthSession) + Google Calendar API read. Keep writes out of MVP to avoid scopes creep.

# notifications design

* **Deadline alerts:** when a task gets a `deadline`, schedule a local notification:

  * T-24h, T-2h, and at time (configurable).
* **Evening “add details” nudge:** once per day at 7:30 pm if there are undetailed tasks from today.
* **Optional gentle morning check-in (later):** “Pick your 3 Most Important Today.”

# visual & interaction guidelines (for ADHD)

* single column, big tap targets (44–56pt).
* keep lists short by default:

  * “Most Important Today” (max 3).
  * Brain Dump shows last 10; “See all” reveals the rest.
* chips instead of fields (Energy, ETA, Importance): tap cycles values inline; no modal needed.
* haptics on: star, complete, add.
* **no badges/counters** that induce anxiety; show “Next best actions” as plain cards.

# implementation plan (2 short sprints)

**Sprint 1 (4–6 hrs)**

* scaffolding (Expo, Navigation, Zustand, AsyncStorage).
* MainScreen with QuickAdd + BrainDump list + star for today.
* TaskEditorModal with chips (deadline, energy, estimate, importance).
* Local notifications + evening reminder logic.

**Sprint 2 (4–6 hrs)**

* IHaveTime modal + scoring + suggestion cards.
* expo-calendar read + free block clamping.
* Calendar screen (read-only list of events/free blocks).
* Deadline notifications schedule.

**Stretch (later)**

* Focus timer (countdown with subtle progress).
* Recurring tasks.
* Natural-language quick add (“pay rent tomorrow 5pm ⏰”).
* Google Calendar API (cloud-synced), cross-device sync via Supabase.

# simple state shape (Zustand)

```ts
type Store = {
  tasks: Task[];
  add: (title: string) => Promise<void>;
  update: (id: string, patch: Partial<Task>) => Promise<void>;
  toggleStarForToday: (id: string) => Promise<void>;
  complete: (id: string) => Promise<void>;
  load: () => Promise<void>;
};
```

Persist with AsyncStorage middleware; derive selectors for “mostImportantToday” and “undetailedToday”.

# empty states & edge cases

* If no tasks fit time/capacity → show one “Tiny Wins” suggestion: “Pick any 5-minute task” + a button to filter brain dump by `estimated ≤ 5`.
* If calendar permission denied → fall back to “assume free” with info banner and a “Enable calendar” CTA.
* If user never sets estimates → still suggest based on importance & urgency; offer a 2-tap “Quick estimate: 5/15/30 min.”

# metrics for iteration (local only)

* count of quick adds/day
* percent tasks with details by end of day
* how often “I Have Time” leads to a started task
  (Just log to AsyncStorage; no backend needed yet.)

---

if you want, I can spin this into a tiny Expo project skeleton (files, packages, and stub components) or draft the Zustand store and the two screens so you can paste straight into your repo.

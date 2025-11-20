import { Task, EnergyLevel } from '../types/Task';

export type Capacity = 'low' | 'med' | 'high';

/**
 * Calculate how well a task's energy level matches the user's current capacity
 * @param cap User's current mental capacity
 * @param taskEnergy Task's required energy level
 * @returns Fitness score between 0.4 and 1.0
 */
export function energyFit(cap: Capacity, taskEnergy?: EnergyLevel): number {
  if (!taskEnergy) return 0.4; // Unknown energy gets lower score

  if (cap === 'low') {
    return taskEnergy === 'low' ? 1.0 : taskEnergy === 'med' ? 0.7 : 0.4;
  }

  if (cap === 'med') {
    return taskEnergy !== 'high' ? 1.0 : 0.7;
  }

  // cap === 'high'
  return taskEnergy === 'high' ? 1.0 : taskEnergy === 'med' ? 0.7 : 0.4;
}

/**
 * Calculate urgency based on deadline
 * @param deadline Task deadline (ISO string)
 * @returns Urgency score between 0.8 and 2.0
 */
export function urgency(deadline?: string): number {
  if (!deadline) return 0.8; // No deadline gets moderate urgency

  const days = Math.max(
    0.5,
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  return Math.min(2.0, 1 / days);
}

/**
 * Calculate how well a task fits into available time
 * @param availableMin Minutes available
 * @param estimatedMin Task's estimated duration
 * @returns Time fitness score between 0 and 1.1
 */
export function timeFit(availableMin: number, estimatedMin?: number): number {
  if (!estimatedMin) return 0.8; // Unknown duration gets decent score

  const ratio = availableMin / Math.max(1, estimatedMin);
  const baseScore = Math.min(1.0, ratio);

  // Give bonus if task fits perfectly within available time
  const bonus = estimatedMin <= availableMin ? 0.1 : 0;

  return baseScore + bonus;
}

/**
 * Calculate overall priority score for a task
 * @param task Task to score
 * @param cap User's current mental capacity
 * @param availableMin Minutes available
 * @returns Priority score (higher is better)
 */
export function calculateScore(
  task: Task,
  cap: Capacity,
  availableMin: number
): number {
  const importance = task.importance ?? 1;
  const effort = task.effort ?? 1;

  const score =
    1.0 + // base score
    0.8 * importance +
    1.0 * urgency(task.deadline) +
    0.8 * energyFit(cap, task.energy) +
    0.6 * timeFit(availableMin, task.estimatedMinutes) -
    0.2 * (effort - 1); // Slight nudge toward easier tasks

  return score;
}

/**
 * Suggest tasks based on capacity, time, and priority
 * @param tasks All available tasks
 * @param cap User's current mental capacity
 * @param availableMin Minutes available
 * @param maxSuggestions Maximum number of tasks to suggest (default 3)
 * @returns Sorted array of suggested tasks (highest priority first)
 */
export function suggestTasks(
  tasks: Task[],
  cap: Capacity,
  availableMin: number,
  maxSuggestions: number = 3
): Task[] {
  // Filter to only incomplete tasks
  const eligible = tasks.filter((t) => !t.completedAt);

  // Prefer tasks that fit within the available time
  const fitsTime = eligible.filter((t) =>
    t.estimatedMinutes ? t.estimatedMinutes <= availableMin : true
  );

  // Use tasks that fit, or fall back to all eligible if none fit
  const candidates = fitsTime.length > 0 ? fitsTime : eligible;

  // Sort by score (highest first) and return top suggestions
  return candidates
    .sort((a, b) => calculateScore(b, cap, availableMin) - calculateScore(a, cap, availableMin))
    .slice(0, maxSuggestions);
}

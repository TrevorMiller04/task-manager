export interface Task {
  id: string;               // uuid
  title: string;
  notes?: string;
  createdAt: string;        // ISO
  deadline?: string;        // ISO
  estimatedMinutes?: number;
  importance?: 1 | 2 | 3;
  effort?: 1 | 2 | 3;
  energy?: 'low' | 'med' | 'high';
  starredFor?: string;      // ISO date "YYYY-MM-DD"
  completedAt?: string;     // ISO
  calendarBlockId?: string;
}

export type EnergyLevel = 'low' | 'med' | 'high';
export type Importance = 1 | 2 | 3;
export type Effort = 1 | 2 | 3;

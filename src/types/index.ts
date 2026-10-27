export type GoalStatus = 'active' | 'completed' | 'archived';

export interface MeasurableTarget {
  targetValue: number;
  currentValue?: number;
  unit: string; // e.g. "hours", "chapters", "projects", "exercises"
}

export interface LearningGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  targetDate: string; // YYYY-MM-DD
  measurableTarget?: MeasurableTarget;
  status: GoalStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  goalId: string;
  title: string;
  notes?: string;
  targetDate?: string; // YYYY-MM-DD
  completed: boolean;
  completedAt?: string; // ISO string
  order: number;
}

export interface StudySession {
  id: string;
  goalId?: string; // Optional if general study
  date: string; // YYYY-MM-DD
  durationMinutes: number;
  topic: string;
  notes?: string;
  createdAt: string;
}

export type ResourceType = 'article' | 'video' | 'book' | 'course' | 'doc' | 'tool' | 'cheatsheet';
export type ResourceStatus = 'to_explore' | 'in_progress' | 'completed';

export interface Resource {
  id: string;
  goalId?: string;
  title: string;
  url: string;
  category: string;
  type: ResourceType;
  notes?: string;
  status: ResourceStatus;
  createdAt: string;
}

export interface AppData {
  goals: LearningGoal[];
  milestones: Milestone[];
  sessions: StudySession[];
  resources: Resource[];
  hasSeenWelcome: boolean;
}

export const PRESET_CATEGORIES = [
  'Computer Science',
  'Web Development',
  'Data Science & AI',
  'Languages',
  'Mathematics',
  'Design & UX',
  'Productivity',
  'Professional Skills',
  'Music & Arts',
  'Science'
] as const;

export type PresetCategory = typeof PRESET_CATEGORIES[number];

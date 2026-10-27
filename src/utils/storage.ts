import { AppData, LearningGoal, Milestone, StudySession, Resource } from '../types';
import { getTodayYMD, formatDateToLocalYMD } from './dateUtils';

const STORAGE_KEY = 'skilltrack_app_data_v1';

export function getInitialSampleData(): AppData {
  const today = new Date();
  
  const relativeDate = (daysOffset: number): string => {
    const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysOffset);
    return formatDateToLocalYMD(d);
  };

  const goals: LearningGoal[] = [
    {
      id: 'goal-ts-fullstack',
      title: 'Full-Stack TypeScript & React Architecture',
      description: 'Master advanced React patterns, state machines, serverless APIs, and TypeScript strict compiler configurations.',
      category: 'Web Development',
      targetDate: relativeDate(45),
      measurableTarget: {
        targetValue: 60,
        currentValue: 34,
        unit: 'hours',
      },
      status: 'active',
      createdAt: relativeDate(-30),
      updatedAt: relativeDate(-1),
    },
    {
      id: 'goal-ml-python',
      title: 'Applied Machine Learning & PyTorch',
      description: 'Build intuition for deep neural networks, transformer attention mechanisms, and fine-tuning open weights.',
      category: 'Data Science & AI',
      targetDate: relativeDate(75),
      measurableTarget: {
        targetValue: 8,
        currentValue: 3,
        unit: 'projects',
      },
      status: 'active',
      createdAt: relativeDate(-20),
      updatedAt: relativeDate(-2),
    },
    {
      id: 'goal-spanish-b1',
      title: 'Conversational Spanish (CEFR B1)',
      description: 'Achieve conversational fluency, mastering subjunctive moods, listening comprehension, and daily conversation.',
      category: 'Languages',
      targetDate: relativeDate(120),
      measurableTarget: {
        targetValue: 500,
        currentValue: 260,
        unit: 'flashcards',
      },
      status: 'active',
      createdAt: relativeDate(-40),
      updatedAt: relativeDate(-1),
    },
    {
      id: 'goal-system-design',
      title: 'Distributed Systems & Database Internals',
      description: 'Understand consensus protocols (Raft), LSM trees vs B-Trees, caching layers, and high-throughput architectures.',
      category: 'Computer Science',
      targetDate: relativeDate(30),
      measurableTarget: {
        targetValue: 12,
        currentValue: 12,
        unit: 'chapters',
      },
      status: 'completed',
      createdAt: relativeDate(-60),
      updatedAt: relativeDate(-5),
    },
  ];

  const milestones: Milestone[] = [
    {
      id: 'm-ts-1',
      goalId: 'goal-ts-fullstack',
      title: 'TypeScript Generics, Conditional Types & Utility Types',
      notes: 'Read TypeScript handbook sections on mapped types and infer keyword.',
      targetDate: relativeDate(-20),
      completed: true,
      completedAt: relativeDate(-19),
      order: 1,
    },
    {
      id: 'm-ts-2',
      goalId: 'goal-ts-fullstack',
      title: 'Implement Custom State Management with Context & Reducers',
      notes: 'Compare Zustand architecture vs TanStack Query cache patterns.',
      targetDate: relativeDate(-10),
      completed: true,
      completedAt: relativeDate(-8),
      order: 2,
    },
    {
      id: 'm-ts-3',
      goalId: 'goal-ts-fullstack',
      title: 'Build Resilient Local Storage & Offline Cache Engine',
      notes: 'Handle quota exceptions, compression, and schema migrations.',
      targetDate: relativeDate(10),
      completed: false,
      order: 3,
    },
    {
      id: 'm-ts-4',
      goalId: 'goal-ts-fullstack',
      title: 'End-to-End Vitest & Playwright Test Suite',
      notes: 'Test accessible ARIA roles, focus traps, and keyboard navigation.',
      targetDate: relativeDate(35),
      completed: false,
      order: 4,
    },
    {
      id: 'm-ml-1',
      goalId: 'goal-ml-python',
      title: 'Tensors, Autograd & Linear Regression in PyTorch',
      notes: 'Completed Stanford CS231n assignment 1 notes.',
      targetDate: relativeDate(-14),
      completed: true,
      completedAt: relativeDate(-12),
      order: 1,
    },
    {
      id: 'm-ml-2',
      goalId: 'goal-ml-python',
      title: 'Convolutional Networks for Computer Vision',
      notes: 'Train a ResNet-18 model on CIFAR-10 with data augmentation.',
      targetDate: relativeDate(-3),
      completed: true,
      completedAt: relativeDate(-2),
      order: 2,
    },
    {
      id: 'm-ml-3',
      goalId: 'goal-ml-python',
      title: 'Self-Attention Mechanism & Small Transformer from Scratch',
      notes: 'Implement scaled dot-product attention and multi-head projection layers.',
      targetDate: relativeDate(20),
      completed: false,
      order: 3,
    },
    {
      id: 'm-ml-4',
      goalId: 'goal-ml-python',
      title: 'Fine-Tuning LoRA on Open-Source LLM for Domain Tasks',
      notes: 'Use HuggingFace PEFT library and evaluate perplexity.',
      targetDate: relativeDate(50),
      completed: false,
      order: 4,
    },
    {
      id: 'm-sp-1',
      goalId: 'goal-spanish-b1',
      title: 'Past Tenses Distinction: Pretérito Indefinido vs Imperfecto',
      notes: 'Practice storytelling in the past tense with daily voice notes.',
      targetDate: relativeDate(-15),
      completed: true,
      completedAt: relativeDate(-14),
      order: 1,
    },
    {
      id: 'm-sp-2',
      goalId: 'goal-spanish-b1',
      title: 'Present Subjunctive & Clauses of Doubt and Desire',
      notes: 'Complete 5 conversational partner sessions on iTalki.',
      targetDate: relativeDate(15),
      completed: false,
      order: 2,
    },
    {
      id: 'm-sp-3',
      goalId: 'goal-spanish-b1',
      title: 'Read First Short Novel (El Principito in Spanish)',
      notes: 'Highlight unfamiliar idioms and add to Anki deck.',
      targetDate: relativeDate(60),
      completed: false,
      order: 3,
    },
    {
      id: 'm-sd-1',
      goalId: 'goal-system-design',
      title: 'LSM Trees vs B+Trees Storage Engines',
      notes: 'Analyzed SSTable write amplification vs read latency.',
      targetDate: relativeDate(-45),
      completed: true,
      completedAt: relativeDate(-42),
      order: 1,
    },
    {
      id: 'm-sd-2',
      goalId: 'goal-system-design',
      title: 'Distributed Consensus: Raft Protocol Implementation',
      notes: 'Simulated leader election and log replication across 5 virtual nodes.',
      targetDate: relativeDate(-15),
      completed: true,
      completedAt: relativeDate(-10),
      order: 2,
    },
    {
      id: 'm-sd-3',
      goalId: 'goal-system-design',
      title: 'Design Scalable Rate Limiter & Token Bucket Service',
      notes: 'Benchmark Redis cluster with Lua scripts.',
      targetDate: relativeDate(-5),
      completed: true,
      completedAt: relativeDate(-5),
      order: 3,
    },
  ];

  const sessions: StudySession[] = [
    {
      id: 'sess-1',
      goalId: 'goal-ts-fullstack',
      date: relativeDate(0),
      durationMinutes: 90,
      topic: 'React 19 Server Actions & Optimistic UI Hooks',
      notes: 'Implemented useOptimistic and useActionState patterns; tested form rollback behavior on error.',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'sess-2',
      goalId: 'goal-ml-python',
      date: relativeDate(-1),
      durationMinutes: 120,
      topic: 'Multi-Head Attention Vector Math & Einsum',
      notes: 'Derived query, key, value projections manually; inspected tensor shapes.',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      id: 'sess-3',
      goalId: 'goal-spanish-b1',
      date: relativeDate(-2),
      durationMinutes: 45,
      topic: 'Subjunctive Mood Triggers & Audio Podcast',
      notes: 'Listened to Radio Ambulante episode 12; noted 18 new expressions.',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      id: 'sess-4',
      goalId: 'goal-ts-fullstack',
      date: relativeDate(-3),
      durationMinutes: 75,
      topic: 'TypeScript Conditional Types & Discriminated Unions',
      notes: 'Refactored boolean flags into clean tagged union state transitions.',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
    {
      id: 'sess-5',
      goalId: 'goal-ml-python',
      date: relativeDate(-4),
      durationMinutes: 60,
      topic: 'Backpropagation Through Time & Residual Connections',
      notes: 'Examined vanishing gradient mitigation with skip connections.',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
    },
    {
      id: 'sess-6',
      goalId: 'goal-spanish-b1',
      date: relativeDate(-5),
      durationMinutes: 30,
      topic: 'Daily Anki Flashcard Review (200 cards)',
      notes: 'Maintained 94% retention rate on spaced repetition schedule.',
      createdAt: new Date(Date.now() - 432000000).toISOString(),
    },
    {
      id: 'sess-7',
      goalId: 'goal-ts-fullstack',
      date: relativeDate(-6),
      durationMinutes: 110,
      topic: 'Tailwind CSS v4 Modern Theme & Layout Constraints',
      notes: 'Built accessible modal focus traps and responsive grid containers.',
      createdAt: new Date(Date.now() - 518400000).toISOString(),
    },
    {
      id: 'sess-8',
      goalId: 'goal-system-design',
      date: relativeDate(-10),
      durationMinutes: 140,
      topic: 'Distributed Transactions: 2PC vs Sagas',
      notes: 'Compared orchestrator vs choreography sagas with compensation workflows.',
      createdAt: new Date(Date.now() - 864000000).toISOString(),
    },
    {
      id: 'sess-9',
      goalId: 'goal-ml-python',
      date: relativeDate(-12),
      durationMinutes: 90,
      topic: 'Optimizer Implementations: AdamW vs RMSprop',
      notes: 'Checked weight decay decoupling nuances in PyTorch AdamW.',
      createdAt: new Date(Date.now() - 1036800000).toISOString(),
    },
    {
      id: 'sess-10',
      goalId: 'goal-ts-fullstack',
      date: relativeDate(-15),
      durationMinutes: 60,
      topic: 'Zod Schema Validation & Strict Runtime Parsing',
      notes: 'Configured safeParse with structured error formatting for boundaries.',
      createdAt: new Date(Date.now() - 1296000000).toISOString(),
    },
  ];

  const resources: Resource[] = [
    {
      id: 'res-1',
      goalId: 'goal-ts-fullstack',
      title: 'Total TypeScript Core Handbook & Type Gymnastics',
      url: 'https://www.totaltypescript.com/tutorials',
      category: 'Web Development',
      type: 'course',
      notes: 'Exceptional deep dive on generics, mapped types, and branded primitive types.',
      status: 'in_progress',
      createdAt: relativeDate(-25),
    },
    {
      id: 'res-2',
      goalId: 'goal-ml-python',
      title: 'Stanford CS224N: Natural Language Processing with Deep Learning',
      url: 'https://web.stanford.edu/class/cs224n/',
      category: 'Data Science & AI',
      type: 'course',
      notes: 'Comprehensive slides and problem sets on word vectors and Transformer architectures.',
      status: 'in_progress',
      createdAt: relativeDate(-18),
    },
    {
      id: 'res-3',
      goalId: 'goal-spanish-b1',
      title: 'Radio Ambulante (NPR Spanish Storytelling)',
      url: 'https://radioambulante.org',
      category: 'Languages',
      type: 'video',
      notes: 'High-quality Latin American investigative audio journalism with full transcripts.',
      status: 'to_explore',
      createdAt: relativeDate(-35),
    },
    {
      id: 'res-4',
      goalId: 'goal-system-design',
      title: 'Designing Data-Intensive Applications (Martin Kleppmann)',
      url: 'https://dataintensive.net',
      category: 'Computer Science',
      type: 'book',
      notes: 'Essential reference on storage engines, replication, partitioning, and consistency models.',
      status: 'completed',
      createdAt: relativeDate(-55),
    },
    {
      id: 'res-5',
      goalId: 'goal-ts-fullstack',
      title: 'MDN Web Docs: Web Accessibility Guide (WCAG)',
      url: 'https://developer.mozilla.org/en-US/docs/Web/Accessibility',
      category: 'Web Development',
      type: 'doc',
      notes: 'Keyboard focus navigation, ARIA live regions, and contrast standards.',
      status: 'completed',
      createdAt: relativeDate(-12),
    },
  ];

  return {
    goals,
    milestones,
    sessions,
    resources,
    hasSeenWelcome: false,
  };
}

export function loadAppData(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const sample = getInitialSampleData();
      saveAppData(sample);
      return sample;
    }
    const parsed = JSON.parse(raw);
    if (
      Array.isArray(parsed?.goals) &&
      Array.isArray(parsed?.milestones) &&
      Array.isArray(parsed?.sessions) &&
      Array.isArray(parsed?.resources)
    ) {
      return {
        goals: parsed.goals,
        milestones: parsed.milestones,
        sessions: parsed.sessions,
        resources: parsed.resources,
        hasSeenWelcome: Boolean(parsed.hasSeenWelcome),
      };
    }
    const sample = getInitialSampleData();
    saveAppData(sample);
    return sample;
  } catch (err) {
    console.error('Failed to load SkillTrack data from localStorage:', err);
    return getInitialSampleData();
  }
}

export function saveAppData(data: AppData): { success: boolean; error?: string } {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return { success: true };
  } catch (err: unknown) {
    console.error('Failed to save to localStorage:', err);
    let message = 'Could not save data to browser storage.';
    if (err instanceof Error) {
      if (err.name === 'QuotaExceededError' || err.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
        message = 'Browser storage quota exceeded. Please export your backup and clear old entries.';
      } else {
        message = err.message;
      }
    }
    return { success: false, error: message };
  }
}

export function exportDataAsJSON(data: AppData): void {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `skilltrack-backup-${getTodayYMD()}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function validateImportedData(rawObj: unknown): rawObj is AppData {
  if (!rawObj || typeof rawObj !== 'object') return false;
  const candidate = rawObj as Record<string, unknown>;
  return (
    Array.isArray(candidate.goals) &&
    Array.isArray(candidate.milestones) &&
    Array.isArray(candidate.sessions) &&
    Array.isArray(candidate.resources)
  );
}

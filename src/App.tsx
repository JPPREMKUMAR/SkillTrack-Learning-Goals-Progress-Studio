import React, { useState, useEffect, useRef } from 'react';
import {
  AppData,
  LearningGoal,
  Milestone,
  StudySession,
  Resource,
  ResourceStatus,
} from './types';
import {
  loadAppData,
  saveAppData,
  exportDataAsJSON,
  validateImportedData,
  getInitialSampleData,
} from './utils/storage';
import { getTodayYMD, formatYMDToReadable } from './utils/dateUtils';
import { Navbar, NavTab } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { GoalsView } from './components/GoalsView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { ResourcesView } from './components/ResourcesView';
import { GoalDetailModal } from './components/GoalDetailModal';
import { GoalFormModal } from './components/GoalFormModal';
import { MilestoneModal } from './components/MilestoneModal';
import { StudySessionModal } from './components/StudySessionModal';
import { ResourceModal } from './components/ResourceModal';
import { ConfirmModal } from './components/ConfirmModal';
import { WelcomeModal } from './components/WelcomeModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<AppData>(() => loadAppData());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Modals state
  const [selectedGoal, setSelectedGoal] = useState<LearningGoal | null>(null);
  const [isGoalFormOpen, setIsGoalFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<LearningGoal | null>(null);

  const [isMilestoneModalOpen, setIsMilestoneModalOpen] = useState(false);
  const [milestoneGoalId, setMilestoneGoalId] = useState<string>('');
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [sessionDefaultGoalId, setSessionDefaultGoalId] = useState<string | undefined>();
  const [sessionDefaultDate, setSessionDefaultDate] = useState<string | undefined>();
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);

  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [resourceDefaultGoalId, setResourceDefaultGoalId] = useState<string | undefined>();
  const [editingResource, setEditingResource] = useState<Resource | null>(null);

  const [isWelcomeOpen, setIsWelcomeOpen] = useState<boolean>(() => !data.hasSeenWelcome);

  // Confirm Modal state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    isDestructive?: boolean;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  // Notification Toast
  const [toast, setToast] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync data updates to localStorage
  const updateAppData = (updater: (prev: AppData) => AppData, successMsg?: string) => {
    setData((prev) => {
      const next = updater(prev);
      const res = saveAppData(next);
      if (!res.success && res.error) {
        showToast('error', res.error);
      } else if (successMsg) {
        showToast('success', successMsg);
      }
      return next;
    });
  };

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast((curr) => (curr?.message === message ? null : curr));
    }, 3500);
  };

  const handleCloseWelcome = () => {
    setIsWelcomeOpen(false);
    if (!data.hasSeenWelcome) {
      updateAppData((prev) => ({ ...prev, hasSeenWelcome: true }));
    }
  };

  // Keep selectedGoal in sync if goals change
  useEffect(() => {
    if (selectedGoal) {
      const refreshed = data.goals.find((g) => g.id === selectedGoal.id);
      setSelectedGoal(refreshed || null);
    }
  }, [data.goals]);

  // Goal operations
  const handleSaveGoal = (
    goalInput: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const nowISO = new Date().toISOString();
    if (editingGoal) {
      updateAppData((prev) => ({
        ...prev,
        goals: prev.goals.map((g) =>
          g.id === editingGoal.id
            ? { ...g, ...goalInput, updatedAt: nowISO }
            : g
        ),
      }), 'Goal updated successfully');
    } else {
      const newGoal: LearningGoal = {
        ...goalInput,
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        createdAt: nowISO,
        updatedAt: nowISO,
      };
      updateAppData((prev) => ({
        ...prev,
        goals: [newGoal, ...prev.goals],
      }), 'New learning goal created');
    }
    setEditingGoal(null);
  };

  const handleDeleteGoal = (goal: LearningGoal) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete "${goal.title}"?`,
      message:
        'This will permanently delete this learning goal and its associated milestones. Logged study sessions will be kept in your history as general studies.',
      confirmLabel: 'Delete Goal',
      isDestructive: true,
      onConfirm: () => {
        updateAppData((prev) => ({
          ...prev,
          goals: prev.goals.filter((g) => g.id !== goal.id),
          milestones: prev.milestones.filter((m) => m.goalId !== goal.id),
          sessions: prev.sessions.map((s) =>
            s.goalId === goal.id ? { ...s, goalId: undefined } : s
          ),
          resources: prev.resources.map((r) =>
            r.goalId === goal.id ? { ...r, goalId: undefined } : r
          ),
        }), 'Goal deleted');
        setSelectedGoal((curr) => (curr?.id === goal.id ? null : curr));
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleGoalStatus = (
    goalId: string,
    status: 'active' | 'completed' | 'archived'
  ) => {
    updateAppData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) =>
        g.id === goalId ? { ...g, status, updatedAt: new Date().toISOString() } : g
      ),
    }), `Goal marked as ${status}`);
  };

  const handleUpdateTargetProgress = (goalId: string, delta: number) => {
    updateAppData((prev) => ({
      ...prev,
      goals: prev.goals.map((g) => {
        if (g.id === goalId && g.measurableTarget) {
          const nextVal = Math.max(0, (g.measurableTarget.currentValue ?? 0) + delta);
          return {
            ...g,
            measurableTarget: {
              ...g.measurableTarget,
              currentValue: nextVal,
            },
          };
        }
        return g;
      }),
    }));
  };

  // Milestone operations
  const handleToggleMilestone = (milestoneId: string) => {
    const nowISO = new Date().toISOString();
    let isAllDoneForGoal = false;
    let goalTitle = '';

    updateAppData((prev) => {
      const target = prev.milestones.find((m) => m.id === milestoneId);
      const willBeCompleted = !target?.completed;

      const nextMilestones = prev.milestones.map((m) =>
        m.id === milestoneId
          ? {
              ...m,
              completed: willBeCompleted,
              completedAt: willBeCompleted ? nowISO : undefined,
            }
          : m
      );

      if (target && willBeCompleted) {
        const goalMilestones = nextMilestones.filter((m) => m.goalId === target.goalId);
        if (goalMilestones.length > 0 && goalMilestones.every((m) => m.completed)) {
          isAllDoneForGoal = true;
          const g = prev.goals.find((gl) => gl.id === target.goalId);
          if (g) goalTitle = g.title;
        }
      }

      return {
        ...prev,
        milestones: nextMilestones,
      };
    });

    if (isAllDoneForGoal) {
      showToast('success', `All milestones complete for "${goalTitle}"!`);
    }
  };

  const handleSaveMilestone = (milestoneData: {
    title: string;
    notes?: string;
    targetDate?: string;
    completed: boolean;
  }) => {
    if (editingMilestone) {
      updateAppData((prev) => ({
        ...prev,
        milestones: prev.milestones.map((m) =>
          m.id === editingMilestone.id
            ? {
                ...m,
                ...milestoneData,
                completedAt:
                  milestoneData.completed && !m.completed
                    ? new Date().toISOString()
                    : m.completedAt,
              }
            : m
        ),
      }), 'Milestone updated');
    } else {
      const newMilestone: Milestone = {
        ...milestoneData,
        id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        goalId: milestoneGoalId,
        completedAt: milestoneData.completed ? new Date().toISOString() : undefined,
        order: data.milestones.filter((m) => m.goalId === milestoneGoalId).length + 1,
      };
      updateAppData((prev) => ({
        ...prev,
        milestones: [...prev.milestones, newMilestone],
      }), 'Milestone added');
    }
    setEditingMilestone(null);
  };

  const handleDeleteMilestone = (milestone: Milestone) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete Milestone?`,
      message: `Are you sure you want to delete "${milestone.title}"?`,
      confirmLabel: 'Delete Milestone',
      isDestructive: true,
      onConfirm: () => {
        updateAppData((prev) => ({
          ...prev,
          milestones: prev.milestones.filter((m) => m.id !== milestone.id),
        }), 'Milestone removed');
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Study session operations
  const handleSaveSession = (
    sessionInput: Omit<StudySession, 'id' | 'createdAt'>
  ) => {
    const nowISO = new Date().toISOString();
    if (editingSession) {
      updateAppData((prev) => ({
        ...prev,
        sessions: prev.sessions.map((s) =>
          s.id === editingSession.id ? { ...s, ...sessionInput } : s
        ),
      }), 'Study session updated');
    } else {
      const newSession: StudySession = {
        ...sessionInput,
        id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: nowISO,
      };

      // Also increment current target value if goal has hours target
      updateAppData((prev) => {
        const nextGoals = prev.goals.map((g) => {
          if (g.id === sessionInput.goalId && g.measurableTarget?.unit.toLowerCase().includes('hour')) {
            const addedHours = sessionInput.durationMinutes / 60;
            const newCur = (g.measurableTarget.currentValue ?? 0) + Math.round(addedHours * 10) / 10;
            return {
              ...g,
              measurableTarget: {
                ...g.measurableTarget,
                currentValue: newCur,
              },
            };
          }
          return g;
        });

        return {
          ...prev,
          goals: nextGoals,
          sessions: [newSession, ...prev.sessions],
        };
      }, `Logged ${sessionInput.durationMinutes} minutes of study`);
    }
    setEditingSession(null);
  };

  const handleEditSession = (session: StudySession) => {
    setEditingSession(session);
    setSessionDefaultGoalId(session.goalId);
    setSessionDefaultDate(session.date);
    setIsSessionModalOpen(true);
  };

  const handleDeleteSession = (session: StudySession) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Study Session?',
      message: `Are you sure you want to delete the ${session.durationMinutes}-minute log on "${session.topic}" (${formatYMDToReadable(session.date)})?`,
      confirmLabel: 'Delete Session',
      isDestructive: true,
      onConfirm: () => {
        updateAppData((prev) => ({
          ...prev,
          sessions: prev.sessions.filter((s) => s.id !== session.id),
        }), 'Study session deleted');
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  // Resource operations
  const handleSaveResource = (
    resourceInput: Omit<Resource, 'id' | 'createdAt'>
  ) => {
    const nowISO = new Date().toISOString();
    if (editingResource) {
      updateAppData((prev) => ({
        ...prev,
        resources: prev.resources.map((r) =>
          r.id === editingResource.id ? { ...r, ...resourceInput } : r
        ),
      }), 'Resource updated');
    } else {
      const newResource: Resource = {
        ...resourceInput,
        id: `res-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        createdAt: nowISO,
      };
      updateAppData((prev) => ({
        ...prev,
        resources: [newResource, ...prev.resources],
      }), 'Resource saved to library');
    }
    setEditingResource(null);
  };

  const handleDeleteResource = (resource: Resource) => {
    setConfirmConfig({
      isOpen: true,
      title: `Delete Resource?`,
      message: `Are you sure you want to remove "${resource.title}" from your library?`,
      confirmLabel: 'Delete Resource',
      isDestructive: true,
      onConfirm: () => {
        updateAppData((prev) => ({
          ...prev,
          resources: prev.resources.filter((r) => r.id !== resource.id),
        }), 'Resource deleted');
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleToggleResourceStatus = (resourceId: string, status: ResourceStatus) => {
    updateAppData((prev) => ({
      ...prev,
      resources: prev.resources.map((r) =>
        r.id === resourceId ? { ...r, status } : r
      ),
    }));
  };

  // Data import & export
  const handleExportJSON = () => {
    exportDataAsJSON(data);
    showToast('success', 'Backup exported as JSON');
  };

  const handleTriggerImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileImportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (validateImportedData(parsed)) {
          setConfirmConfig({
            isOpen: true,
            title: 'Restore Data from Backup?',
            message: `This backup contains ${parsed.goals.length} goals, ${parsed.milestones.length} milestones, and ${parsed.sessions.length} study logs. Importing will replace your current data.`,
            confirmLabel: 'Overwrite & Restore',
            isDestructive: false,
            onConfirm: () => {
              setData(parsed);
              saveAppData(parsed);
              showToast('success', 'Data successfully restored from backup');
              setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
            },
          });
        } else {
          showToast('error', 'Invalid backup file format. Missing goals or sessions.');
        }
      } catch (err) {
        showToast('error', 'Failed to parse JSON backup file.');
      }
    };
    reader.readAsText(file);
    // Reset input
    e.target.value = '';
  };

  const handleResetToSample = () => {
    setConfirmConfig({
      isOpen: true,
      title: 'Reset to Sample Curriculum?',
      message:
        'This will replace your current studio records with the rich sample learning goals, sessions, and resources.',
      confirmLabel: 'Reset to Sample',
      isDestructive: true,
      onConfirm: () => {
        const sample = getInitialSampleData();
        setData(sample);
        saveAppData(sample);
        showToast('success', 'Studio reset to sample curriculum');
        setConfirmConfig((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const handleStartFresh = () => {
    const blank: AppData = {
      goals: [],
      milestones: [],
      sessions: [],
      resources: [],
      hasSeenWelcome: true,
    };
    setData(blank);
    saveAppData(blank);
    setIsWelcomeOpen(false);
    showToast('info', 'Started fresh with an empty learning studio');
  };

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col antialiased">
      {/* Hidden file input for backup imports */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json,application/json"
        className="hidden"
        onChange={handleFileImportChange}
      />

      {/* Top Bar Contract Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenNewGoalModal={() => {
          setEditingGoal(null);
          setIsGoalFormOpen(true);
        }}
        onOpenLogSessionModal={() => {
          setEditingSession(null);
          setSessionDefaultGoalId(undefined);
          setSessionDefaultDate(getTodayYMD());
          setIsSessionModalOpen(true);
        }}
        onOpenWelcomeModal={() => setIsWelcomeOpen(true)}
        onExportData={handleExportJSON}
        onTriggerImport={handleTriggerImport}
        onResetData={handleResetToSample}
      />

      {/* Toast Notification Container */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-4 right-4 z-50 flex items-center gap-2.5 px-4 py-3 bg-stone-900 text-white text-xs font-medium rounded-xl shadow-xl border border-stone-800 animate-in fade-in slide-in-from-bottom-2 duration-200"
        >
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {toast.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          {toast.type === 'info' && <Info className="w-4 h-4 text-blue-400 shrink-0" />}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-stone-400 hover:text-white p-0.5 ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Viewport Canvas (Desktop baseline 1440px wide max container) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'dashboard' && (
          <DashboardView
            goals={data.goals}
            milestones={data.milestones}
            sessions={data.sessions}
            onSelectGoal={(goal) => setSelectedGoal(goal)}
            onOpenNewGoalModal={() => {
              setEditingGoal(null);
              setIsGoalFormOpen(true);
            }}
            onOpenLogSessionModal={() => {
              setEditingSession(null);
              setSessionDefaultGoalId(undefined);
              setSessionDefaultDate(getTodayYMD());
              setIsSessionModalOpen(true);
            }}
            onNavigateTab={(tab) => setActiveTab(tab)}
            onEditSession={handleEditSession}
          />
        )}

        {activeTab === 'goals' && (
          <GoalsView
            goals={data.goals}
            milestones={data.milestones}
            sessions={data.sessions}
            onSelectGoal={(goal) => setSelectedGoal(goal)}
            onOpenNewGoalModal={() => {
              setEditingGoal(null);
              setIsGoalFormOpen(true);
            }}
            onEditGoal={(goal) => {
              setEditingGoal(goal);
              setIsGoalFormOpen(true);
            }}
            onDeleteGoal={handleDeleteGoal}
            onToggleGoalStatus={handleToggleGoalStatus}
            onToggleMilestone={handleToggleMilestone}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            goals={data.goals}
            milestones={data.milestones}
            sessions={data.sessions}
            onOpenLogSessionForDate={(dateYMD) => {
              setEditingSession(null);
              setSessionDefaultGoalId(undefined);
              setSessionDefaultDate(dateYMD);
              setIsSessionModalOpen(true);
            }}
            onSelectGoal={(goal) => setSelectedGoal(goal)}
            onEditSession={handleEditSession}
            onDeleteSession={handleDeleteSession}
          />
        )}

        {activeTab === 'analytics' && (
          <AnalyticsView
            goals={data.goals}
            milestones={data.milestones}
            sessions={data.sessions}
            onOpenLogSessionModal={() => {
              setEditingSession(null);
              setSessionDefaultGoalId(undefined);
              setSessionDefaultDate(getTodayYMD());
              setIsSessionModalOpen(true);
            }}
          />
        )}

        {activeTab === 'resources' && (
          <ResourcesView
            resources={data.resources}
            goals={data.goals}
            onOpenNewResourceModal={() => {
              setEditingResource(null);
              setResourceDefaultGoalId(undefined);
              setIsResourceModalOpen(true);
            }}
            onEditResource={(res) => {
              setEditingResource(res);
              setIsResourceModalOpen(true);
            }}
            onDeleteResource={handleDeleteResource}
            onToggleResourceStatus={handleToggleResourceStatus}
            onSelectGoal={(goal) => setSelectedGoal(goal)}
          />
        )}
      </main>

      {/* Quiet, unpretentious Footer adhering to anti-slop rules */}
      <footer className="border-t border-stone-200 bg-white py-6 mt-12 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>SkillTrack — Deliberate Learning Goals & Progress Studio</span>
          <div className="flex items-center gap-4 text-stone-400">
            <button
              type="button"
              onClick={() => setIsWelcomeOpen(true)}
              className="hover:text-stone-700 transition-colors"
            >
              Guide
            </button>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleExportJSON}
              className="hover:text-stone-700 transition-colors"
            >
              Export Data
            </button>
            <span aria-hidden="true">·</span>
            <span>Local Storage Active</span>
          </div>
        </div>
      </footer>

      {/* Goal Detail Modal */}
      <GoalDetailModal
        isOpen={Boolean(selectedGoal)}
        goal={selectedGoal}
        milestones={data.milestones}
        sessions={data.sessions}
        resources={data.resources}
        onClose={() => setSelectedGoal(null)}
        onEditGoal={(g) => {
          setSelectedGoal(null);
          setEditingGoal(g);
          setIsGoalFormOpen(true);
        }}
        onDeleteGoal={(g) => {
          setSelectedGoal(null);
          handleDeleteGoal(g);
        }}
        onToggleGoalStatus={handleToggleGoalStatus}
        onToggleMilestone={handleToggleMilestone}
        onAddMilestone={(gid) => {
          setMilestoneGoalId(gid);
          setEditingMilestone(null);
          setIsMilestoneModalOpen(true);
        }}
        onEditMilestone={(m) => {
          setEditingMilestone(m);
          setMilestoneGoalId(m.goalId);
          setIsMilestoneModalOpen(true);
        }}
        onDeleteMilestone={handleDeleteMilestone}
        onLogSessionForGoal={(gid) => {
          setSessionDefaultGoalId(gid);
          setSessionDefaultDate(getTodayYMD());
          setEditingSession(null);
          setIsSessionModalOpen(true);
        }}
        onEditSession={handleEditSession}
        onDeleteSession={handleDeleteSession}
        onAddResourceForGoal={(gid) => {
          setResourceDefaultGoalId(gid);
          setEditingResource(null);
          setIsResourceModalOpen(true);
        }}
        onUpdateTargetProgress={handleUpdateTargetProgress}
      />

      {/* Goal Form Modal (Create / Edit) */}
      <GoalFormModal
        isOpen={isGoalFormOpen}
        initialGoal={editingGoal}
        onSave={handleSaveGoal}
        onClose={() => {
          setIsGoalFormOpen(false);
          setEditingGoal(null);
        }}
      />

      {/* Milestone Form Modal (Create / Edit) */}
      <MilestoneModal
        isOpen={isMilestoneModalOpen}
        goalId={milestoneGoalId}
        initialMilestone={editingMilestone}
        onSave={handleSaveMilestone}
        onClose={() => {
          setIsMilestoneModalOpen(false);
          setEditingMilestone(null);
        }}
      />

      {/* Study Session Modal (Create / Edit & Live Timer) */}
      <StudySessionModal
        isOpen={isSessionModalOpen}
        goals={data.goals}
        defaultGoalId={sessionDefaultGoalId}
        defaultDate={sessionDefaultDate}
        initialSession={editingSession}
        onSave={handleSaveSession}
        onClose={() => {
          setIsSessionModalOpen(false);
          setEditingSession(null);
        }}
      />

      {/* Resource Modal (Create / Edit) */}
      <ResourceModal
        isOpen={isResourceModalOpen}
        goals={data.goals}
        defaultGoalId={resourceDefaultGoalId}
        initialResource={editingResource}
        onSave={handleSaveResource}
        onClose={() => {
          setIsResourceModalOpen(false);
          setEditingResource(null);
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmLabel={confirmConfig.confirmLabel}
        isDestructive={confirmConfig.isDestructive}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev) => ({ ...prev, isOpen: false }))}
      />

      {/* Welcome / Onboarding Modal */}
      <WelcomeModal
        isOpen={isWelcomeOpen}
        onClose={handleCloseWelcome}
        onLoadSampleData={() => {
          const sample = getInitialSampleData();
          sample.hasSeenWelcome = true;
          setData(sample);
          saveAppData(sample);
          setIsWelcomeOpen(false);
          showToast('success', 'Loaded sample curriculum');
        }}
        onStartFresh={handleStartFresh}
      />
    </div>
  );
}

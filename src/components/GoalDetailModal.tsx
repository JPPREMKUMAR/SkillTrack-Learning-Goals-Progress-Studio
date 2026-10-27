import React, { useState } from 'react';
import { LearningGoal, Milestone, StudySession, Resource } from '../types';
import { formatYMDToReadable, getDaysRemaining } from '../utils/dateUtils';
import {
  X,
  Clock,
  CheckCircle2,
  Circle,
  Plus,
  Edit2,
  Trash2,
  Bookmark,
  ExternalLink,
  Archive,
  RotateCcw,
} from 'lucide-react';

interface GoalDetailModalProps {
  isOpen: boolean;
  goal: LearningGoal | null;
  milestones: Milestone[];
  sessions: StudySession[];
  resources: Resource[];
  onClose: () => void;
  onEditGoal: (goal: LearningGoal) => void;
  onDeleteGoal: (goal: LearningGoal) => void;
  onToggleGoalStatus: (goalId: string, newStatus: 'active' | 'completed' | 'archived') => void;
  onToggleMilestone: (milestoneId: string) => void;
  onAddMilestone: (goalId: string) => void;
  onEditMilestone: (milestone: Milestone) => void;
  onDeleteMilestone: (milestone: Milestone) => void;
  onLogSessionForGoal: (goalId: string) => void;
  onEditSession: (session: StudySession) => void;
  onDeleteSession: (session: StudySession) => void;
  onAddResourceForGoal: (goalId: string) => void;
  onUpdateTargetProgress?: (goalId: string, delta: number) => void;
}

export const GoalDetailModal: React.FC<GoalDetailModalProps> = ({
  isOpen,
  goal,
  milestones,
  sessions,
  resources,
  onClose,
  onEditGoal,
  onDeleteGoal,
  onToggleGoalStatus,
  onToggleMilestone,
  onAddMilestone,
  onEditMilestone,
  onDeleteMilestone,
  onLogSessionForGoal,
  onEditSession,
  onDeleteSession,
  onAddResourceForGoal,
  onUpdateTargetProgress,
}) => {
  const [activeTab, setActiveTab] = useState<'milestones' | 'sessions' | 'resources'>('milestones');

  if (!isOpen || !goal) return null;

  const goalMilestones = milestones
    .filter((m) => m.goalId === goal.id)
    .sort((a, b) => a.order - b.order);

  const completedMilestonesCount = goalMilestones.filter((m) => m.completed).length;
  const milestoneProgressPct =
    goalMilestones.length > 0
      ? Math.round((completedMilestonesCount / goalMilestones.length) * 100)
      : goal.status === 'completed'
      ? 100
      : 0;

  const goalSessions = sessions
    .filter((s) => s.goalId === goal.id)
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalMinutes = goalSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const goalResources = resources.filter((r) => r.goalId === goal.id);
  const daysRemaining = getDaysRemaining(goal.targetDate);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-detail-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-5 sm:p-6 bg-stone-50 border-b border-stone-200 flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                <span className="text-emerald-800 font-semibold">{goal.category}</span>
                <span aria-hidden="true">·</span>
                <span>Target: {formatYMDToReadable(goal.targetDate)}</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    daysRemaining < 0
                      ? 'text-red-600 font-medium'
                      : daysRemaining <= 7
                      ? 'text-amber-700 font-medium'
                      : 'text-stone-600'
                  }
                >
                  {daysRemaining < 0
                    ? `${Math.abs(daysRemaining)}d overdue`
                    : daysRemaining === 0
                    ? 'Due today'
                    : `${daysRemaining}d remaining`}
                </span>
                <span aria-hidden="true">·</span>
                <span className="capitalize">{goal.status}</span>
              </div>

              <h2 id="goal-detail-title" className="text-lg sm:text-xl font-bold text-stone-900 leading-snug">
                {goal.title}
              </h2>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={() => onEditGoal(goal)}
                aria-label="Edit goal"
                title="Edit Goal"
                className="p-1.5 text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() =>
                  onToggleGoalStatus(
                    goal.id,
                    goal.status === 'archived' ? 'active' : 'archived'
                  )
                }
                title={goal.status === 'archived' ? 'Unarchive Goal' : 'Archive Goal'}
                className="p-1.5 text-stone-500 hover:text-stone-800 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
              >
                {goal.status === 'archived' ? (
                  <RotateCcw className="w-4 h-4" />
                ) : (
                  <Archive className="w-4 h-4" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onDeleteGoal(goal)}
                aria-label="Delete goal"
                title="Delete Goal"
                className="p-1.5 text-stone-500 hover:text-red-600 bg-white border border-stone-200 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close modal"
                className="p-1.5 text-stone-400 hover:text-stone-600 ml-1 rounded-lg hover:bg-stone-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {goal.description && (
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-xl">
              {goal.description}
            </p>
          )}

          {/* Progress Strip */}
          <div className="pt-2 border-t border-stone-200/80 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <span className="text-[11px] text-stone-500 block">Milestones</span>
              <span className="text-sm font-semibold text-stone-900 tabular-nums">
                {completedMilestonesCount} / {goalMilestones.length}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">Milestone Progress</span>
              <span className="text-sm font-semibold text-emerald-800 tabular-nums">
                {milestoneProgressPct}%
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">Study Time</span>
              <span className="text-sm font-semibold text-stone-900 tabular-nums">
                {totalHours} hrs
              </span>
            </div>

            <div>
              <span className="text-[11px] text-stone-500 block">Target Metric</span>
              {goal.measurableTarget ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-stone-900 tabular-nums">
                    {goal.measurableTarget.currentValue ?? 0} / {goal.measurableTarget.targetValue}{' '}
                    {goal.measurableTarget.unit}
                  </span>
                  {onUpdateTargetProgress && (
                    <div className="flex items-center gap-0.5">
                      <button
                        type="button"
                        onClick={() => onUpdateTargetProgress(goal.id, -1)}
                        title="Decrement target progress"
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 rounded"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() => onUpdateTargetProgress(goal.id, 1)}
                        title="Increment target progress"
                        className="w-5 h-5 flex items-center justify-center text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-100 hover:bg-emerald-200 rounded"
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <span className="text-xs text-stone-400">Milestone based</span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-600 h-full rounded-full transition-all duration-300"
              style={{ width: `${Math.min(100, Math.max(0, milestoneProgressPct))}%` }}
            />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-stone-200 bg-white">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('milestones')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'milestones'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Milestones ({goalMilestones.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'sessions'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Study Logs ({goalSessions.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('resources')}
              className={`px-3 py-2 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'resources'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-800'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Resources ({goalResources.length})</span>
            </button>
          </div>

          <div>
            {activeTab === 'milestones' && (
              <button
                type="button"
                onClick={() => onAddMilestone(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            )}
            {activeTab === 'sessions' && (
              <button
                type="button"
                onClick={() => onLogSessionForGoal(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            )}
            {activeTab === 'resources' && (
              <button
                type="button"
                onClick={() => onAddResourceForGoal(goal.id)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Resource</span>
              </button>
            )}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-5 overflow-y-auto space-y-3 flex-1 bg-white">
          {/* Milestones Tab */}
          {activeTab === 'milestones' && (
            <div className="space-y-2">
              {goalMilestones.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl space-y-2">
                  <p className="text-xs text-stone-500">
                    No milestones defined for this goal yet. Break down this goal into clear checkpoints!
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddMilestone(goal.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create First Milestone</span>
                  </button>
                </div>
              ) : (
                goalMilestones.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3.5 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                      m.completed
                        ? 'bg-emerald-50/40 border-emerald-200/80 text-stone-700'
                        : 'bg-white border-stone-200 hover:border-stone-300 text-stone-900'
                    }`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <button
                        type="button"
                        onClick={() => onToggleMilestone(m.id)}
                        aria-label={m.completed ? 'Mark incomplete' : 'Mark complete'}
                        className="mt-0.5 text-stone-400 hover:text-emerald-600 transition-colors shrink-0"
                      >
                        {m.completed ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 fill-emerald-100" />
                        ) : (
                          <Circle className="w-4 h-4 text-stone-400" />
                        )}
                      </button>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-xs font-semibold ${
                              m.completed ? 'line-through text-stone-500' : 'text-stone-900'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>

                        {m.notes && <p className="text-xs text-stone-500 leading-normal">{m.notes}</p>}

                        <div className="flex items-center gap-2 text-[11px] text-stone-400">
                          {m.targetDate && (
                            <span>Target: {formatYMDToReadable(m.targetDate)}</span>
                          )}
                          {m.completed && m.completedAt && (
                            <>
                              {m.targetDate && <span aria-hidden="true">·</span>}
                              <span>Completed {formatYMDToReadable(m.completedAt.split('T')[0])}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 opacity-80 hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onEditMilestone(m)}
                        aria-label="Edit milestone"
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-md transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteMilestone(m)}
                        aria-label="Delete milestone"
                        className="p-1 text-stone-400 hover:text-red-600 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="space-y-2">
              {goalSessions.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl space-y-2">
                  <p className="text-xs text-stone-500">
                    No study sessions recorded for this goal yet.
                  </p>
                  <button
                    type="button"
                    onClick={() => onLogSessionForGoal(goal.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Log First Study Session</span>
                  </button>
                </div>
              ) : (
                goalSessions.map((s) => (
                  <div
                    key={s.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-semibold text-stone-900">{s.topic}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1 text-xs font-mono tabular-nums text-emerald-800 font-semibold shrink-0">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{s.durationMinutes} mins</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => onEditSession(s)}
                          aria-label="Edit session"
                          title="Edit Session"
                          className="p-1 text-stone-400 hover:text-stone-700 rounded transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSession(s)}
                          aria-label="Delete session"
                          title="Delete Session"
                          className="p-1 text-stone-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {s.notes && (
                      <p className="text-xs text-stone-600 leading-relaxed">{s.notes}</p>
                    )}

                    <div className="text-[11px] text-stone-400">
                      <span>{formatYMDToReadable(s.date)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Resources Tab */}
          {activeTab === 'resources' && (
            <div className="space-y-2">
              {goalResources.length === 0 ? (
                <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl space-y-2">
                  <p className="text-xs text-stone-500">
                    No resources linked to this goal yet. Add articles, documentation, or books.
                  </p>
                  <button
                    type="button"
                    onClick={() => onAddResourceForGoal(goal.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Link a Resource</span>
                  </button>
                </div>
              ) : (
                goalResources.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-stone-300 transition-colors flex items-start justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <span className="capitalize">{r.type}</span>
                        <span aria-hidden="true">·</span>
                        <span className="capitalize">{r.status.replace('_', ' ')}</span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-900">{r.title}</h4>
                      {r.notes && <p className="text-xs text-stone-600">{r.notes}</p>}
                    </div>

                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 p-1.5 text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors shrink-0"
                    >
                      <span>Open</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          <div>
            {goal.status !== 'completed' ? (
              <button
                type="button"
                onClick={() => onToggleGoalStatus(goal.id, 'completed')}
                className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Mark Goal Completed</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleGoalStatus(goal.id, 'active')}
                className="flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reopen as Active</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-100 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { LearningGoal, Milestone, StudySession } from '../types';
import { formatYMDToReadable, calculateStudyStreaks, getPastNDaysYMD, getDaysRemaining } from '../utils/dateUtils';
import {
  Target,
  CheckCircle2,
  Clock,
  Flame,
  Plus,
  ArrowRight,
  TrendingUp,
  BookOpen,
} from 'lucide-react';

interface DashboardViewProps {
  goals: LearningGoal[];
  milestones: Milestone[];
  sessions: StudySession[];
  onSelectGoal: (goal: LearningGoal) => void;
  onOpenNewGoalModal: () => void;
  onOpenLogSessionModal: () => void;
  onNavigateTab: (tab: 'goals' | 'calendar' | 'analytics' | 'resources') => void;
  onEditSession?: (session: StudySession) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  goals,
  milestones,
  sessions,
  onSelectGoal,
  onOpenNewGoalModal,
  onOpenLogSessionModal,
  onNavigateTab,
  onEditSession,
}) => {
  const activeGoals = goals.filter((g) => g.status === 'active');
  const completedGoals = goals.filter((g) => g.status === 'completed');
  const completedMilestones = milestones.filter((m) => m.completed);

  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);

  const sessionDates = sessions.map((s) => s.date);
  const streakStats = calculateStudyStreaks(sessionDates);

  // Past 7 days data for mini-chart
  const past7Days = getPastNDaysYMD(7);
  const dailyStudyMap = new Map<string, number>();
  past7Days.forEach((d) => dailyStudyMap.set(d, 0));
  sessions.forEach((s) => {
    if (dailyStudyMap.has(s.date)) {
      dailyStudyMap.set(s.date, (dailyStudyMap.get(s.date) || 0) + s.durationMinutes);
    }
  });

  const recentSessions = [...sessions]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const maxMinutesInWeek = Math.max(...Array.from(dailyStudyMap.values()), 60);

  return (
    <div className="space-y-6">
      {/* Welcome Kicker Banner */}
      <div className="bg-white rounded-xl border border-stone-200 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
            Personal Learning Studio
          </span>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 mt-0.5">
            Overview & Momentum
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 mt-1">
            Track purposeful skill acquisition, milestone execution, and continuous study habits.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onOpenLogSessionModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Study Session</span>
          </button>
          <button
            type="button"
            onClick={onOpenNewGoalModal}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Learning Goal</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Active Goals */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Active Goals</span>
            <Target className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {activeGoals.length}
            </span>
            <span className="text-xs text-stone-500">
              · {completedGoals.length} completed
            </span>
          </div>
        </div>

        {/* Milestones Completed */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Milestones Done</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {completedMilestones.length}
            </span>
            <span className="text-xs text-stone-500">
              · of {milestones.length} total
            </span>
          </div>
        </div>

        {/* Study Hours */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Total Study Hours</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {totalHours}
            </span>
            <span className="text-xs text-stone-500">
              · {sessions.length} sessions
            </span>
          </div>
        </div>

        {/* Consecutive Streak */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Active Study Streak</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {streakStats.currentStreak}
            </span>
            <span className="text-xs text-stone-500">
              {streakStats.currentStreak === 1 ? 'day' : 'days'} · best: {streakStats.longestStreak}d
            </span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Active Goals (2 cols wide) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-xs">
              In-Progress Learning Goals
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('goals')}
              className="text-xs font-medium text-emerald-800 hover:text-emerald-950 inline-flex items-center gap-1 transition-colors"
            >
              <span>View All Goals ({goals.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activeGoals.length === 0 ? (
            <div className="bg-white rounded-xl border border-stone-200 p-8 text-center space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
                <Target className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-stone-900">No active learning goals</h3>
                <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                  Ready to develop a new capability? Create your first learning goal with targeted milestones.
                </p>
              </div>
              <button
                type="button"
                onClick={onOpenNewGoalModal}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Goal</span>
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeGoals.slice(0, 4).map((goal) => {
                const goalMilestones = milestones.filter((m) => m.goalId === goal.id);
                const completedCount = goalMilestones.filter((m) => m.completed).length;
                const progressPct =
                  goalMilestones.length > 0
                    ? Math.round((completedCount / goalMilestones.length) * 100)
                    : 0;

                const daysRemaining = getDaysRemaining(goal.targetDate);

                return (
                  <div
                    key={goal.id}
                    onClick={() => onSelectGoal(goal)}
                    className="group bg-white rounded-xl border border-stone-200 hover:border-emerald-300 p-4 transition-all shadow-xs hover:shadow-sm cursor-pointer space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        {/* Unboxed metadata line with typographic dot separator */}
                        <div className="flex items-center gap-2 text-xs text-stone-500">
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
                                : 'text-stone-500'
                            }
                          >
                            {daysRemaining < 0
                              ? `${Math.abs(daysRemaining)}d overdue`
                              : daysRemaining === 0
                              ? 'Due today'
                              : `${daysRemaining}d remaining`}
                          </span>
                        </div>

                        <h3 className="text-sm font-semibold text-stone-900 group-hover:text-emerald-800 transition-colors">
                          {goal.title}
                        </h3>
                      </div>

                      <span className="text-xs font-mono font-semibold text-stone-900 tabular-nums shrink-0">
                        {progressPct}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                      />
                    </div>

                    {/* Footer Info */}
                    <div className="flex items-center justify-between text-xs text-stone-500 pt-1">
                      <span>
                        {completedCount} of {goalMilestones.length} milestones completed
                      </span>
                      {goal.measurableTarget && (
                        <span className="tabular-nums">
                          {goal.measurableTarget.currentValue ?? 0} /{' '}
                          {goal.measurableTarget.targetValue} {goal.measurableTarget.unit}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Weekly Habit Mini-Chart & Recent Sessions */}
        <div className="space-y-6">
          {/* Weekly Activity Mini Chart */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                  Past 7 Days Practice
                </h3>
                <span className="text-[11px] text-stone-500">Daily study duration in minutes</span>
              </div>
              <button
                type="button"
                onClick={() => onNavigateTab('analytics')}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-medium"
              >
                Analytics
              </button>
            </div>

            {/* Mini SVG Bar Chart */}
            <div className="pt-2">
              <div className="h-28 flex items-end justify-between gap-2 border-b border-stone-100 pb-1">
                {past7Days.map((d) => {
                  const mins = dailyStudyMap.get(d) || 0;
                  const barHeight = Math.max(4, Math.round((mins / maxMinutesInWeek) * 90));
                  const dayParts = d.split('-');
                  const dateObj = new Date(
                    Number(dayParts[0]),
                    Number(dayParts[1]) - 1,
                    Number(dayParts[2])
                  );
                  const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'short' }).slice(0, 2);

                  return (
                    <div key={d} className="flex-1 flex flex-col items-center gap-1.5 group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-stone-900 text-white text-[10px] px-1.5 py-0.5 rounded-md whitespace-nowrap z-10 tabular-nums">
                        {mins}m
                      </div>
                      <div
                        className={`w-full max-w-[28px] rounded-t-sm transition-all duration-300 ${
                          mins > 0 ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-stone-100'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <span className="text-[10px] text-stone-500 font-medium">{dayName}</span>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2">
                <span>0m</span>
                <span className="tabular-nums">Peak: {maxMinutesInWeek}m</span>
              </div>
            </div>
          </div>

          {/* Recent Sessions List */}
          <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Recent Logs
              </h3>
              <button
                type="button"
                onClick={onOpenLogSessionModal}
                className="text-xs text-emerald-800 hover:text-emerald-950 font-medium"
              >
                + Log
              </button>
            </div>

            {recentSessions.length === 0 ? (
              <p className="text-xs text-stone-500 py-3 text-center">No study sessions logged yet.</p>
            ) : (
              <div className="space-y-2.5">
                {recentSessions.map((s) => {
                  const linkedGoal = goals.find((g) => g.id === s.goalId);
                  return (
                    <div
                      key={s.id}
                      onClick={() => onEditSession && onEditSession(s)}
                      className={`p-2.5 rounded-lg border border-stone-100 hover:border-stone-300 bg-stone-50/50 hover:bg-white transition-all text-xs space-y-1 ${
                        onEditSession ? 'cursor-pointer group' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-stone-900 truncate group-hover:text-emerald-800 transition-colors">
                          {s.topic}
                        </span>
                        <span className="font-mono tabular-nums text-emerald-800 font-semibold shrink-0">
                          {s.durationMinutes}m
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-stone-400">
                        <span>{formatYMDToReadable(s.date)}</span>
                        {linkedGoal && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-stone-500 truncate max-w-[150px]">
                              {linkedGoal.title}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

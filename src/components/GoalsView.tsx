import React, { useState, useMemo } from 'react';
import { LearningGoal, Milestone, StudySession, PRESET_CATEGORIES } from '../types';
import { formatYMDToReadable, getDaysRemaining } from '../utils/dateUtils';
import {
  Search,
  Plus,
  Target,
  CheckCircle2,
  Circle,
  Clock,
  MoreVertical,
  Edit2,
  Trash2,
  Archive,
  RotateCcw,
  SlidersHorizontal,
  X,
} from 'lucide-react';

interface GoalsViewProps {
  goals: LearningGoal[];
  milestones: Milestone[];
  sessions: StudySession[];
  onSelectGoal: (goal: LearningGoal) => void;
  onOpenNewGoalModal: () => void;
  onEditGoal: (goal: LearningGoal) => void;
  onDeleteGoal: (goal: LearningGoal) => void;
  onToggleGoalStatus: (goalId: string, status: 'active' | 'completed' | 'archived') => void;
  onToggleMilestone: (milestoneId: string) => void;
}

type SortOption = 'date-asc' | 'date-desc' | 'progress-desc' | 'progress-asc' | 'title-asc';

export const GoalsView: React.FC<GoalsViewProps> = ({
  goals,
  milestones,
  sessions,
  onSelectGoal,
  onOpenNewGoalModal,
  onEditGoal,
  onDeleteGoal,
  onToggleGoalStatus,
  onToggleMilestone,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'archived'>('active');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');

  // Extract all unique categories present in goals
  const existingCategories = useMemo(() => {
    const set = new Set<string>();
    goals.forEach((g) => {
      if (g.category) set.add(g.category);
    });
    return Array.from(set).sort();
  }, [goals]);

  // Compute goal stats map for sorting & filtering
  const goalStatsMap = useMemo(() => {
    const map = new Map<
      string,
      {
        milestones: Milestone[];
        completedCount: number;
        totalCount: number;
        progressPct: number;
        totalMinutes: number;
      }
    >();

    goals.forEach((g) => {
      const gMilestones = milestones
        .filter((m) => m.goalId === g.id)
        .sort((a, b) => a.order - b.order);
      const completedCount = gMilestones.filter((m) => m.completed).length;
      const progressPct =
        gMilestones.length > 0
          ? Math.round((completedCount / gMilestones.length) * 100)
          : g.status === 'completed'
          ? 100
          : 0;
      const gSessions = sessions.filter((s) => s.goalId === g.id);
      const totalMinutes = gSessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);

      map.set(g.id, {
        milestones: gMilestones,
        completedCount,
        totalCount: gMilestones.length,
        progressPct,
        totalMinutes,
      });
    });

    return map;
  }, [goals, milestones, sessions]);

  // Filter and sort
  const filteredGoals = useMemo(() => {
    return goals
      .filter((goal) => {
        // Status filter
        if (statusFilter !== 'all' && goal.status !== statusFilter) {
          return false;
        }

        // Category filter
        if (categoryFilter !== 'all' && goal.category !== categoryFilter) {
          return false;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = goal.title.toLowerCase().includes(q);
          const matchesDesc = (goal.description || '').toLowerCase().includes(q);
          const matchesCat = goal.category.toLowerCase().includes(q);
          if (!matchesTitle && !matchesDesc && !matchesCat) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const statsA = goalStatsMap.get(a.id);
        const statsB = goalStatsMap.get(b.id);
        const pctA = statsA ? statsA.progressPct : 0;
        const pctB = statsB ? statsB.progressPct : 0;

        switch (sortBy) {
          case 'date-asc':
            return a.targetDate.localeCompare(b.targetDate);
          case 'date-desc':
            return b.targetDate.localeCompare(a.targetDate);
          case 'progress-desc':
            return pctB - pctA;
          case 'progress-asc':
            return pctA - pctB;
          case 'title-asc':
            return a.title.localeCompare(b.title);
          default:
            return 0;
        }
      });
  }, [goals, statusFilter, categoryFilter, searchQuery, sortBy, goalStatsMap]);

  return (
    <div className="space-y-5">
      {/* Header and New Goal CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Learning Goals & Curricula</h1>
          <p className="text-xs text-stone-500">
            Define objectives, break into milestones, and inspect completion status
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewGoalModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Goal</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-xs space-y-3">
        {/* Top row: Search input + Category + Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search goals by title, topic, or description..."
              className="w-full pl-9 pr-8 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category dropdown */}
          <div className="sm:col-span-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Categories ({existingCategories.length})</option>
              {existingCategories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Sort dropdown */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="date-asc">Target Date: Soonest</option>
              <option value="date-desc">Target Date: Furthest</option>
              <option value="progress-desc">Progress: High to Low</option>
              <option value="progress-asc">Progress: Low to High</option>
              <option value="title-asc">Title: Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Bottom row: Interactive Status Filter Tabs (Zero-pill discipline: segmented control buttons) */}
        <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
            {(['all', 'active', 'completed', 'archived'] as const).map((st) => {
              const count =
                st === 'all' ? goals.length : goals.filter((g) => g.status === st).length;
              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize ${
                    statusFilter === st
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {st} ({count})
                </button>
              );
            })}
          </div>

          <div className="text-xs text-stone-500">
            Showing <span className="font-semibold text-stone-800">{filteredGoals.length}</span>{' '}
            goals
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 mx-auto flex items-center justify-center">
            <Target className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">No matching goals found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery || categoryFilter !== 'all' || statusFilter !== 'all'
              ? 'Try relaxing your filter criteria or clearing your search term.'
              : 'Get started by creating your very first learning goal.'}
          </p>
          <div className="flex items-center justify-center gap-2 pt-1">
            {(searchQuery || categoryFilter !== 'all' || statusFilter !== 'active') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                  setStatusFilter('active');
                }}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Reset Filters
              </button>
            )}
            <button
              type="button"
              onClick={onOpenNewGoalModal}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              + Create Goal
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const stats = goalStatsMap.get(goal.id);
            const goalMilestones = stats ? stats.milestones : [];
            const completedCount = stats ? stats.completedCount : 0;
            const progressPct = stats ? stats.progressPct : 0;
            const studyHours = stats ? (stats.totalMinutes / 60).toFixed(1) : '0.0';
            const daysRemaining = getDaysRemaining(goal.targetDate);

            return (
              <div
                key={goal.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-emerald-300 transition-all p-4 shadow-xs flex flex-col justify-between gap-4 group"
              >
                {/* Top Section */}
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      {/* Unboxed Metadata Line */}
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
                              : 'text-stone-500'
                          }
                        >
                          {daysRemaining < 0
                            ? `${Math.abs(daysRemaining)}d overdue`
                            : daysRemaining === 0
                            ? 'Due today'
                            : `${daysRemaining}d left`}
                        </span>
                      </div>

                      <h3
                        onClick={() => onSelectGoal(goal)}
                        className="text-base font-bold text-stone-900 group-hover:text-emerald-800 cursor-pointer transition-colors leading-snug"
                      >
                        {goal.title}
                      </h3>
                    </div>

                    {/* Actions menu */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditGoal(goal)}
                        aria-label="Edit goal"
                        title="Edit Goal"
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onToggleGoalStatus(
                            goal.id,
                            goal.status === 'archived' ? 'active' : 'archived'
                          )
                        }
                        title={goal.status === 'archived' ? 'Unarchive' : 'Archive'}
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-50 transition-colors"
                      >
                        {goal.status === 'archived' ? (
                          <RotateCcw className="w-3.5 h-3.5" />
                        ) : (
                          <Archive className="w-3.5 h-3.5" />
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteGoal(goal)}
                        aria-label="Delete goal"
                        title="Delete Goal"
                        className="p-1 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {goal.description}
                    </p>
                  )}

                  {/* Progress Strip */}
                  <div className="pt-1 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500 font-medium">
                        {completedCount} of {goalMilestones.length} milestones complete
                      </span>
                      <span className="font-mono font-bold text-emerald-800 tabular-nums">
                        {progressPct}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                      />
                    </div>
                  </div>

                  {/* Milestones preview (first 3) */}
                  {goalMilestones.length > 0 && (
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block">
                        Milestones Checklist
                      </span>
                      {goalMilestones.slice(0, 3).map((m) => (
                        <div
                          key={m.id}
                          className="flex items-center gap-2 text-xs text-stone-700 group/m"
                        >
                          <button
                            type="button"
                            onClick={() => onToggleMilestone(m.id)}
                            className="shrink-0 text-stone-400 hover:text-emerald-600 transition-colors"
                          >
                            {m.completed ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Circle className="w-3.5 h-3.5 text-stone-400" />
                            )}
                          </button>
                          <span
                            className={`truncate ${
                              m.completed ? 'line-through text-stone-400' : 'text-stone-700'
                            }`}
                          >
                            {m.title}
                          </span>
                        </div>
                      ))}
                      {goalMilestones.length > 3 && (
                        <span className="text-[11px] text-stone-400 block pt-0.5">
                          + {goalMilestones.length - 3} more milestones...
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Card Footer */}
                <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1 font-mono tabular-nums">
                      <Clock className="w-3.5 h-3.5 text-stone-400" />
                      {studyHours} hrs
                    </span>
                    {goal.measurableTarget && (
                      <span className="tabular-nums">
                        {goal.measurableTarget.currentValue ?? 0} /{' '}
                        {goal.measurableTarget.targetValue} {goal.measurableTarget.unit}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectGoal(goal)}
                    className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 transition-colors"
                  >
                    View Details & Logs →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

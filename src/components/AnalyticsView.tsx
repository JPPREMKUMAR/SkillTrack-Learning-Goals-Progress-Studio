import React, { useState } from 'react';
import { LearningGoal, Milestone, StudySession } from '../types';
import {
  calculateStudyStreaks,
  getPastNDaysYMD,
  getPastNMonths,
  formatYMDToReadable,
} from '../utils/dateUtils';
import {
  BarChart3,
  Clock,
  Flame,
  Award,
  Calendar,
  Layers,
  CheckCircle2,
  TrendingUp,
  Plus,
} from 'lucide-react';

interface AnalyticsViewProps {
  goals: LearningGoal[];
  milestones: Milestone[];
  sessions: StudySession[];
  onOpenLogSessionModal: () => void;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  goals,
  milestones,
  sessions,
  onOpenLogSessionModal,
}) => {
  const [weeklyViewRange, setWeeklyViewRange] = useState<7 | 14>(14);

  // Overall calculations
  const totalMinutes = sessions.reduce((acc, curr) => acc + curr.durationMinutes, 0);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const avgSessionMins =
    sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0;

  const sessionDates = sessions.map((s) => s.date);
  const streakStats = calculateStudyStreaks(sessionDates);

  const completedMilestones = milestones.filter((m) => m.completed).length;
  const milestoneCompletionPct =
    milestones.length > 0
      ? Math.round((completedMilestones / milestones.length) * 100)
      : 0;

  // 1. Weekly Activity Data
  const daysList = getPastNDaysYMD(weeklyViewRange);
  const dailyDataMap = new Map<string, { minutes: number; sessionCount: number; topics: string[] }>();
  daysList.forEach((d) => {
    dailyDataMap.set(d, { minutes: 0, sessionCount: 0, topics: [] });
  });

  sessions.forEach((s) => {
    if (dailyDataMap.has(s.date)) {
      const entry = dailyDataMap.get(s.date)!;
      entry.minutes += s.durationMinutes;
      entry.sessionCount += 1;
      if (!entry.topics.includes(s.topic)) entry.topics.push(s.topic);
    }
  });

  const maxDailyMinutes = Math.max(
    ...Array.from(dailyDataMap.values()).map((v) => v.minutes),
    60
  );

  // 2. Monthly Trend Data (last 6 months)
  const past6Months = getPastNMonths(6);
  const monthlyDataMap = new Map<string, { minutes: number; sessionCount: number }>();
  past6Months.forEach((m) => {
    monthlyDataMap.set(m.key, { minutes: 0, sessionCount: 0 });
  });

  sessions.forEach((s) => {
    const monthKey = s.date.slice(0, 7); // "YYYY-MM"
    if (monthlyDataMap.has(monthKey)) {
      const entry = monthlyDataMap.get(monthKey)!;
      entry.minutes += s.durationMinutes;
      entry.sessionCount += 1;
    }
  });

  const maxMonthlyMinutes = Math.max(
    ...Array.from(monthlyDataMap.values()).map((v) => v.minutes),
    120
  );

  // 3. Category Distribution
  const categoryHoursMap = new Map<string, { minutes: number; sessionCount: number }>();
  sessions.forEach((s) => {
    const linkedGoal = goals.find((g) => g.id === s.goalId);
    const cat = linkedGoal ? linkedGoal.category : 'General Studies';
    const current = categoryHoursMap.get(cat) || { minutes: 0, sessionCount: 0 };
    current.minutes += s.durationMinutes;
    current.sessionCount += 1;
    categoryHoursMap.set(cat, current);
  });

  const categoryDistribution = Array.from(categoryHoursMap.entries())
    .map(([category, stats]) => ({
      category,
      minutes: stats.minutes,
      hours: (stats.minutes / 60).toFixed(1),
      sessionCount: stats.sessionCount,
      percentage: totalMinutes > 0 ? Math.round((stats.minutes / totalMinutes) * 100) : 0,
    }))
    .sort((a, b) => b.minutes - a.minutes);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Study Analytics & Progress</h1>
          <p className="text-xs text-stone-500">
            Deliberate practice distributions, habit consistency, and milestone completion velocity
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenLogSessionModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Log Study Session</span>
        </button>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total Study Hours */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Cumulative Study</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {totalHours}
            </span>
            <span className="text-xs text-stone-500">hours ({totalMinutes} mins)</span>
          </div>
        </div>

        {/* Avg Session Length */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Avg Session Time</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {avgSessionMins}
            </span>
            <span className="text-xs text-stone-500">mins / session</span>
          </div>
        </div>

        {/* Current & Longest Streak */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Study Streaks</span>
            <Flame className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {streakStats.currentStreak}d
            </span>
            <span className="text-xs text-stone-500">
              · best {streakStats.longestStreak} days
            </span>
          </div>
        </div>

        {/* Milestone Execution */}
        <div className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Milestone Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-stone-900 tabular-nums">
              {milestoneCompletionPct}%
            </span>
            <span className="text-xs text-stone-500">
              ({completedMilestones}/{milestones.length})
            </span>
          </div>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <BarChart3 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-stone-900">No study analytics yet</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Log your first study session or run the live focus timer to begin generating weekly and monthly analytics.
          </p>
          <button
            type="button"
            onClick={onOpenLogSessionModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Study Session</span>
          </button>
        </div>
      ) : (
        <>
          {/* Section 1: Daily Activity Chart */}
          <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-xs">
                  Daily Study Activity
                </h3>
                <span className="text-xs text-stone-500">
                  Minutes of practice logged per day
                </span>
              </div>

              {/* Range Toggle */}
              <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-lg self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setWeeklyViewRange(7)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    weeklyViewRange === 7
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  type="button"
                  onClick={() => setWeeklyViewRange(14)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    weeklyViewRange === 14
                      ? 'bg-white text-stone-900 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Last 14 Days
                </button>
              </div>
            </div>

            {/* SVG Bar Chart */}
            <div className="pt-2">
              <div className="h-44 flex items-end justify-between gap-1.5 sm:gap-3 border-b border-stone-200 pb-1">
                {daysList.map((d) => {
                  const data = dailyDataMap.get(d) || { minutes: 0, sessionCount: 0, topics: [] };
                  const barHeight = Math.max(4, Math.round((data.minutes / maxDailyMinutes) * 150));
                  const parts = d.split('-');
                  const dateObj = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
                  const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'short' });
                  const dayNum = parts[2];

                  return (
                    <div
                      key={d}
                      className="flex-1 flex flex-col items-center gap-1.5 group relative"
                    >
                      {/* Hover Tooltip */}
                      <div className="absolute -top-12 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-stone-900 text-white text-[11px] px-2 py-1 rounded-md whitespace-nowrap z-20 shadow-md">
                        <div className="font-semibold tabular-nums">{data.minutes} mins ({formatYMDToReadable(d)})</div>
                        {data.sessionCount > 0 && (
                          <div className="text-[10px] text-stone-300">
                            {data.sessionCount} session{data.sessionCount > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>

                      <div
                        className={`w-full max-w-[36px] rounded-t transition-all duration-300 ${
                          data.minutes > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700'
                            : 'bg-stone-100 hover:bg-stone-200'
                        }`}
                        style={{ height: `${barHeight}px` }}
                      />
                      <div className="text-center">
                        <span className="text-[10px] sm:text-xs font-semibold text-stone-700 block">
                          {dayNum}
                        </span>
                        <span className="text-[9px] text-stone-400 block -mt-0.5">
                          {dayOfWeek.slice(0, 1)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 font-mono tabular-nums">
                <span>0 mins</span>
                <span>Peak: {maxDailyMinutes} mins ({(maxDailyMinutes / 60).toFixed(1)} hrs)</span>
              </div>
            </div>
          </div>

          {/* Section 2: Two Column (Monthly Trend & Category Breakdown) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Monthly Trend */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-xs">
                  Monthly Study Trend
                </h3>
                <span className="text-xs text-stone-500">
                  Total practice hours per month
                </span>
              </div>

              <div className="pt-2">
                <div className="h-40 flex items-end justify-between gap-3 border-b border-stone-200 pb-1">
                  {past6Months.map((m) => {
                    const stats = monthlyDataMap.get(m.key) || { minutes: 0, sessionCount: 0 };
                    const hours = (stats.minutes / 60).toFixed(1);
                    const barHeight = Math.max(
                      6,
                      Math.round((stats.minutes / maxMonthlyMinutes) * 130)
                    );

                    return (
                      <div
                        key={m.key}
                        className="flex-1 flex flex-col items-center gap-1.5 group relative"
                      >
                        <div className="absolute -top-9 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity bg-stone-900 text-white text-[11px] px-2 py-0.5 rounded-md whitespace-nowrap z-20 tabular-nums">
                          {hours} hrs ({stats.sessionCount} sessions)
                        </div>

                        <div
                          className={`w-full max-w-[42px] rounded-t transition-all duration-300 ${
                            stats.minutes > 0 ? 'bg-emerald-700 hover:bg-emerald-800' : 'bg-stone-100'
                          }`}
                          style={{ height: `${barHeight}px` }}
                        />
                        <span className="text-[11px] font-semibold text-stone-700 truncate max-w-full">
                          {m.label.split(' ')[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between text-[11px] text-stone-500 mt-2 font-mono tabular-nums">
                  <span>0 hrs</span>
                  <span>Peak: {(maxMonthlyMinutes / 60).toFixed(1)} hrs</span>
                </div>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="bg-white rounded-xl border border-stone-200 p-5 shadow-xs space-y-4">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider text-xs">
                  Time Investment by Category
                </h3>
                <span className="text-xs text-stone-500">
                  Distribution of practice across learning domains
                </span>
              </div>

              {categoryDistribution.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">No category data yet.</p>
              ) : (
                <div className="space-y-3.5 pt-1">
                  {categoryDistribution.map((item) => (
                    <div key={item.category} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-stone-800">{item.category}</span>
                        <div className="flex items-center gap-2 font-mono tabular-nums">
                          <span className="font-bold text-emerald-800">{item.hours} hrs</span>
                          <span className="text-stone-400">({item.percentage}%)</span>
                        </div>
                      </div>
                      <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(100, Math.max(2, item.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

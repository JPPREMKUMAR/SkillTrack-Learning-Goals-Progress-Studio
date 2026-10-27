import React, { useState } from 'react';
import { LearningGoal, Milestone, StudySession } from '../types';
import {
  generateMonthGrid,
  formatYMDToReadable,
  formatDateToLocalYMD,
  getTodayYMD,
  CalendarCell,
} from '../utils/dateUtils';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Target,
  CheckCircle2,
  Plus,
  Calendar as CalendarIcon,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

interface CalendarViewProps {
  goals: LearningGoal[];
  milestones: Milestone[];
  sessions: StudySession[];
  onOpenLogSessionForDate: (dateYMD: string) => void;
  onSelectGoal: (goal: LearningGoal) => void;
  onEditSession?: (session: StudySession) => void;
  onDeleteSession?: (session: StudySession) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  goals,
  milestones,
  sessions,
  onOpenLogSessionForDate,
  onSelectGoal,
  onEditSession,
  onDeleteSession,
}) => {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth()); // 0-indexed
  const [selectedDayYMD, setSelectedDayYMD] = useState<string>(getTodayYMD());

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const weekdayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const now = new Date();
    setCurrentYear(now.getFullYear());
    setCurrentMonth(now.getMonth());
    setSelectedDayYMD(getTodayYMD());
  };

  const gridCells = generateMonthGrid(currentYear, currentMonth);

  // Group events by YMD string
  const sessionsByDate = new Map<string, StudySession[]>();
  sessions.forEach((s) => {
    const list = sessionsByDate.get(s.date) || [];
    list.push(s);
    sessionsByDate.set(s.date, list);
  });

  const milestoneDeadlinesByDate = new Map<string, Milestone[]>();
  milestones.forEach((m) => {
    if (m.targetDate) {
      const list = milestoneDeadlinesByDate.get(m.targetDate) || [];
      list.push(m);
      milestoneDeadlinesByDate.set(m.targetDate, list);
    }
  });

  const goalDeadlinesByDate = new Map<string, LearningGoal[]>();
  goals.forEach((g) => {
    if (g.targetDate) {
      const list = goalDeadlinesByDate.get(g.targetDate) || [];
      list.push(g);
      goalDeadlinesByDate.set(g.targetDate, list);
    }
  });

  // Selected day items
  const selectedDaySessions = sessionsByDate.get(selectedDayYMD) || [];
  const selectedDayMilestones = milestoneDeadlinesByDate.get(selectedDayYMD) || [];
  const selectedDayGoals = goalDeadlinesByDate.get(selectedDayYMD) || [];
  const selectedDayTotalMinutes = selectedDaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);

  return (
    <div className="space-y-5">
      {/* Top Header & Month Navigator */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Study Calendar</h1>
          <p className="text-xs text-stone-500">
            View practice frequency, planned study logs, and milestone deadlines
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleToday}
            className="px-3 py-1.5 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors shadow-xs"
          >
            Today
          </button>
          <div className="flex items-center bg-white border border-stone-200 rounded-lg shadow-xs p-0.5">
            <button
              type="button"
              onClick={handlePrevMonth}
              aria-label="Previous month"
              className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-xs font-semibold text-stone-800 min-w-[130px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              aria-label="Next month"
              className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-50 rounded-md transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid + Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Calendar Grid (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden flex flex-col">
          {/* Weekday headers */}
          <div className="grid grid-cols-7 border-b border-stone-200 bg-stone-50 text-center py-2.5">
            {weekdayNames.map((w) => (
              <span key={w} className="text-xs font-semibold text-stone-600">
                {w}
              </span>
            ))}
          </div>

          {/* Day Cells */}
          <div className="grid grid-cols-7 auto-rows-fr divide-x divide-y divide-stone-100 flex-1">
            {gridCells.map((cell) => {
              const daySessions = sessionsByDate.get(cell.dateYMD) || [];
              const dayMilestones = milestoneDeadlinesByDate.get(cell.dateYMD) || [];
              const dayGoals = goalDeadlinesByDate.get(cell.dateYMD) || [];

              const totalMinutes = daySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
              const isSelected = cell.dateYMD === selectedDayYMD;

              return (
                <div
                  key={cell.dateYMD}
                  onClick={() => setSelectedDayYMD(cell.dateYMD)}
                  className={`min-h-[76px] sm:min-h-[96px] p-1.5 sm:p-2 cursor-pointer transition-colors flex flex-col justify-between ${
                    cell.isCurrentMonth ? 'bg-white' : 'bg-stone-50/60 text-stone-400'
                  } ${
                    isSelected ? 'ring-2 ring-emerald-600 ring-inset z-10' : 'hover:bg-emerald-50/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold tabular-nums inline-block w-5 h-5 rounded-full text-center leading-5 ${
                        cell.isToday
                          ? 'bg-emerald-700 text-white font-bold'
                          : cell.isCurrentMonth
                          ? 'text-stone-800'
                          : 'text-stone-400'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {totalMinutes > 0 && (
                      <span className="text-[10px] font-mono text-emerald-800 font-semibold tabular-nums">
                        {totalMinutes}m
                      </span>
                    )}
                  </div>

                  {/* Indicators inside cell */}
                  <div className="space-y-1 mt-1">
                    {/* Logged study indicator */}
                    {daySessions.length > 0 && (
                      <div className="text-[10px] bg-emerald-50 text-emerald-900 border border-emerald-200/60 rounded px-1 py-0.5 truncate hidden sm:block">
                        {daySessions.length === 1
                          ? daySessions[0].topic
                          : `${daySessions.length} sessions`}
                      </div>
                    )}

                    {/* Milestone indicator */}
                    {dayMilestones.length > 0 && (
                      <div className="text-[10px] bg-amber-50 text-amber-900 border border-amber-200/60 rounded px-1 py-0.5 truncate hidden sm:block">
                        🎯 {dayMilestones[0].title}
                      </div>
                    )}

                    {/* Goal deadline indicator */}
                    {dayGoals.length > 0 && (
                      <div className="text-[10px] bg-blue-50 text-blue-900 border border-blue-200/60 rounded px-1 py-0.5 truncate hidden sm:block">
                        🏁 Goal Due
                      </div>
                    )}

                    {/* Mobile tiny indicators */}
                    <div className="flex items-center gap-1 sm:hidden">
                      {daySessions.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                      )}
                      {dayMilestones.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                      )}
                      {dayGoals.length > 0 && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Inspector (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-xl border border-stone-200 p-4 sm:p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-start justify-between border-b border-stone-100 pb-3">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block">
                  Day Inspector
                </span>
                <h2 className="text-base font-bold text-stone-900">
                  {formatYMDToReadable(selectedDayYMD, { shortMonth: false })}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onOpenLogSessionForDate(selectedDayYMD)}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>

            {/* Total practice on this day */}
            <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/80 flex items-center justify-between">
              <span className="text-xs font-medium text-stone-600">Total Practice Logged</span>
              <span className="text-sm font-bold font-mono text-emerald-800 tabular-nums">
                {selectedDayTotalMinutes} mins ({(selectedDayTotalMinutes / 60).toFixed(1)} hrs)
              </span>
            </div>

            {/* Study Sessions on this date */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Study Sessions ({selectedDaySessions.length})
              </span>

              {selectedDaySessions.length === 0 ? (
                <p className="text-xs text-stone-400 py-1">
                  No sessions recorded for this calendar date.
                </p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDaySessions.map((s) => {
                    const linkedGoal = goals.find((g) => g.id === s.goalId);
                    return (
                      <div
                        key={s.id}
                        className="p-2.5 rounded-lg border border-stone-200 bg-white space-y-1 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-stone-900">{s.topic}</span>
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-semibold text-emerald-800 tabular-nums">
                              {s.durationMinutes}m
                            </span>
                            {onEditSession && (
                              <button
                                type="button"
                                onClick={() => onEditSession(s)}
                                title="Edit session"
                                className="p-0.5 text-stone-400 hover:text-stone-700"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                            {onDeleteSession && (
                              <button
                                type="button"
                                onClick={() => onDeleteSession(s)}
                                title="Delete session"
                                className="p-0.5 text-stone-400 hover:text-red-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                        {linkedGoal && (
                          <span className="text-[11px] text-stone-500 block truncate">
                            Goal: {linkedGoal.title}
                          </span>
                        )}
                        {s.notes && <p className="text-[11px] text-stone-600">{s.notes}</p>}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Milestones / Goals due */}
            <div className="space-y-2 pt-2 border-t border-stone-100">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800 block">
                Target Deadlines ({selectedDayMilestones.length + selectedDayGoals.length})
              </span>

              {selectedDayMilestones.length === 0 && selectedDayGoals.length === 0 ? (
                <p className="text-xs text-stone-400 py-1">No deadlines scheduled for this day.</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedDayGoals.map((g) => (
                    <div
                      key={g.id}
                      onClick={() => onSelectGoal(g)}
                      className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/50 hover:bg-blue-50 cursor-pointer transition-colors text-xs space-y-0.5"
                    >
                      <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">
                        Goal Completion Deadline
                      </span>
                      <h4 className="font-semibold text-stone-900">{g.title}</h4>
                    </div>
                  ))}

                  {selectedDayMilestones.map((m) => {
                    const linkedGoal = goals.find((g) => g.id === m.goalId);
                    return (
                      <div
                        key={m.id}
                        className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/50 text-xs space-y-0.5"
                      >
                        <span className="text-[10px] font-semibold text-amber-700 uppercase tracking-wider">
                          Milestone Due
                        </span>
                        <h4 className="font-semibold text-stone-900">{m.title}</h4>
                        {linkedGoal && (
                          <span className="text-[11px] text-stone-500 block">
                            For: {linkedGoal.title}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Quick Log CTA */}
          <button
            type="button"
            onClick={() => onOpenLogSessionForDate(selectedDayYMD)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Log Study Time for {selectedDayYMD}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

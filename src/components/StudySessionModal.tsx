import React, { useState, useEffect, useRef } from 'react';
import { LearningGoal, StudySession } from '../types';
import { getTodayYMD } from '../utils/dateUtils';
import { Clock, Play, Pause, RotateCcw, Check, X, BookOpen } from 'lucide-react';

interface StudySessionModalProps {
  isOpen: boolean;
  goals: LearningGoal[];
  defaultGoalId?: string;
  defaultDate?: string;
  initialSession?: StudySession | null;
  onSave: (sessionData: Omit<StudySession, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  goals,
  defaultGoalId,
  defaultDate,
  initialSession,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialSession);

  // Tab: 'manual' vs 'timer'
  const [activeTab, setActiveTab] = useState<'manual' | 'timer'>('manual');

  // Fields
  const [goalId, setGoalId] = useState<string>('');
  const [date, setDate] = useState<string>('');
  const [durationMinutes, setDurationMinutes] = useState<number | ''>(45);
  const [topic, setTopic] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Live Timer states
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const accumulatedSecondsRef = useRef<number>(0);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (initialSession) {
      setGoalId(initialSession.goalId || '');
      setDate(initialSession.date);
      setDurationMinutes(initialSession.durationMinutes);
      setTopic(initialSession.topic);
      setNotes(initialSession.notes || '');
      setActiveTab('manual');
    } else {
      setGoalId(defaultGoalId || (goals.length > 0 ? goals[0].id : ''));
      setDate(defaultDate || getTodayYMD());
      setDurationMinutes(45);
      setTopic('');
      setNotes('');
      setActiveTab('manual');
    }
    setErrors({});
    setTimerRunning(false);
    setTimerSeconds(0);
    accumulatedSecondsRef.current = 0;
    startTimeRef.current = null;
  }, [initialSession, defaultGoalId, defaultDate, goals, isOpen]);

  // Drift-proof timer tick effect using Date.now()
  useEffect(() => {
    if (timerRunning) {
      startTimeRef.current = Date.now();
      timerIntervalRef.current = window.setInterval(() => {
        if (startTimeRef.current !== null) {
          const deltaSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
          setTimerSeconds(accumulatedSecondsRef.current + deltaSec);
        }
      }, 500);
    } else {
      if (startTimeRef.current !== null) {
        const deltaSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
        accumulatedSecondsRef.current += deltaSec;
        startTimeRef.current = null;
      }
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [timerRunning]);

  if (!isOpen) return null;

  const handleFinishTimer = () => {
    let finalSec = timerSeconds;
    if (timerRunning && startTimeRef.current !== null) {
      const deltaSec = Math.floor((Date.now() - startTimeRef.current) / 1000);
      finalSec = accumulatedSecondsRef.current + deltaSec;
      accumulatedSecondsRef.current = finalSec;
      startTimeRef.current = null;
    }
    setTimerRunning(false);
    const calculatedMinutes = Math.max(1, Math.round(finalSec / 60));
    setDurationMinutes(calculatedMinutes);
    setActiveTab('manual');
  };

  const handleResetTimer = () => {
    setTimerRunning(false);
    startTimeRef.current = null;
    accumulatedSecondsRef.current = 0;
    setTimerSeconds(0);
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!topic.trim()) {
      errs.topic = 'Study topic or session focus is required';
    }
    if (durationMinutes === '' || Number(durationMinutes) <= 0) {
      errs.durationMinutes = 'Duration must be at least 1 minute';
    } else if (Number(durationMinutes) > 1440) {
      errs.durationMinutes = 'Duration cannot exceed 24 hours (1440 mins)';
    }
    if (!date) {
      errs.date = 'Date is required';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      goalId: goalId || undefined,
      date,
      durationMinutes: Number(durationMinutes),
      topic: topic.trim(),
      notes: notes.trim() || undefined,
    });
    onClose();
  };

  const formatTimerDisplay = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s
        .toString()
        .padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="session-modal-title" className="text-sm font-semibold text-stone-900">
                {isEditing ? 'Edit Study Session' : 'Log Study Session'}
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-stone-400 hover:text-stone-600 p-1 rounded-md hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch for new session */}
        {!isEditing && (
          <div className="flex items-center px-4 pt-3 border-b border-stone-100">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors ${
                activeTab === 'manual'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              Manual Entry
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('timer')}
              className={`px-3 py-1.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
                activeTab === 'timer'
                  ? 'border-emerald-600 text-emerald-800'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <span>Live Study Timer</span>
              {timerRunning && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-ping" />
              )}
            </button>
          </div>
        )}

        {/* Live Timer View */}
        {activeTab === 'timer' ? (
          <div className="p-6 text-center space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-stone-500 font-medium">Deliberate Study Stopwatch</span>
              <div className="text-5xl font-mono font-bold tracking-tight text-stone-900 tabular-nums">
                {formatTimerDisplay(timerSeconds)}
              </div>
              <p className="text-xs text-stone-400">
                {timerSeconds > 0
                  ? `≈ ${Math.max(1, Math.round(timerSeconds / 60))} minutes elapsed`
                  : 'Ready when you are'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {!timerRunning ? (
                <button
                  type="button"
                  onClick={() => setTimerRunning(true)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>{timerSeconds === 0 ? 'Start Focus Timer' : 'Resume'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setTimerRunning(false)}
                  className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-stone-800 bg-amber-100 hover:bg-amber-200 rounded-lg transition-colors"
                >
                  <Pause className="w-4 h-4" />
                  <span>Pause Timer</span>
                </button>
              )}

              {timerSeconds > 0 && (
                <button
                  type="button"
                  onClick={handleResetTimer}
                  title="Reset timer"
                  className="p-2.5 text-stone-500 hover:text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              )}
            </div>

            {timerSeconds >= 10 && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleFinishTimer}
                  className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Apply {Math.max(1, Math.round(timerSeconds / 60))} Mins & Fill Details</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Manual Entry Form */
          <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5">
            {/* Goal Link */}
            <div>
              <label htmlFor="session-goal" className="block text-xs font-semibold text-stone-700 mb-1">
                Associated Goal
              </label>
              <select
                id="session-goal"
                value={goalId}
                onChange={(e) => setGoalId(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="">General Independent Study (No Goal Linked)</option>
                {goals.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.title} ({g.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Date & Duration */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="session-date" className="block text-xs font-semibold text-stone-700 mb-1">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  id="session-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className={`w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                    errors.date ? 'border-red-400' : 'border-stone-300 focus:border-emerald-600'
                  }`}
                />
                {errors.date && <p className="mt-1 text-[10px] text-red-600">{errors.date}</p>}
              </div>

              <div>
                <label htmlFor="session-duration" className="block text-xs font-semibold text-stone-700 mb-1">
                  Minutes <span className="text-red-500">*</span>
                </label>
                <input
                  id="session-duration"
                  type="number"
                  min="1"
                  max="1440"
                  step="5"
                  value={durationMinutes}
                  onChange={(e) =>
                    setDurationMinutes(e.target.value === '' ? '' : Number(e.target.value))
                  }
                  className={`w-full px-2.5 py-1.5 text-xs bg-white border rounded-lg tabular-nums focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                    errors.durationMinutes
                      ? 'border-red-400'
                      : 'border-stone-300 focus:border-emerald-600'
                  }`}
                />
                {errors.durationMinutes && (
                  <p className="mt-1 text-[10px] text-red-600">{errors.durationMinutes}</p>
                )}
              </div>
            </div>

            {/* Quick minute buttons */}
            <div className="flex items-center gap-1.5 pt-0.5">
              <span className="text-[11px] text-stone-400 mr-1">Quick add:</span>
              {[25, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  type="button"
                  onClick={() => setDurationMinutes(mins)}
                  className={`px-2 py-0.5 text-[11px] font-medium rounded-md border transition-colors ${
                    durationMinutes === mins
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                      : 'bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {mins}m
                </button>
              ))}
            </div>

            {/* Topic */}
            <div>
              <label htmlFor="session-topic" className="block text-xs font-semibold text-stone-700 mb-1">
                Topic or Focus Area <span className="text-red-500">*</span>
              </label>
              <input
                id="session-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Raft Consensus Leader Election"
                className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                  errors.topic ? 'border-red-400' : 'border-stone-300 focus:border-emerald-600'
                }`}
              />
              {errors.topic && <p className="mt-1 text-[11px] text-red-600">{errors.topic}</p>}
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="session-notes" className="block text-xs font-semibold text-stone-700 mb-1">
                Session Takeaways & Insights
              </label>
              <textarea
                id="session-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Key insights, blockers overcome, formulas practiced..."
                className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
              >
                {isEditing ? 'Save Session' : 'Log Session'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

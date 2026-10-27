import React from 'react';
import { SproutLogo } from './SproutLogo';
import { Target, CheckCircle2, Clock, Calendar, BookmarkCheck, ArrowRight, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadSampleData: () => void;
  onStartFresh: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({
  isOpen,
  onClose,
  onLoadSampleData,
  onStartFresh,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
    >
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header with botanical theme */}
        <div className="p-6 bg-gradient-to-br from-emerald-50 via-white to-stone-50 border-b border-stone-100 flex items-start justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-emerald-100/70 border border-emerald-200 rounded-xl">
              <SproutLogo className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">Learning Studio</span>
              <h2 id="welcome-modal-title" className="text-xl font-bold text-stone-900">
                Welcome to SkillTrack
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close welcome modal"
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Core feature walkthrough */}
        <div className="p-6 overflow-y-auto space-y-4 text-stone-700">
          <p className="text-sm leading-relaxed text-stone-600">
            SkillTrack helps students and self-directed learners structure ambitious skills into actionable milestones, measure deliberate practice, and sustain learning momentum.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-800 font-semibold text-xs">
                <Target className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Measurable Goals</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                Set clear deadlines, categories, and targets like hours, chapters, or projects.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-800 font-semibold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Step-by-Step Milestones</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                Break complex curricula into bite-sized checkpoints with progress calculation.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-800 font-semibold text-xs">
                <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Study Sessions & Timer</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                Log deliberate study duration, topics, and notes, or use the live focus timer.
              </p>
            </div>

            <div className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50">
              <div className="flex items-center gap-2.5 mb-1.5 text-emerald-800 font-semibold text-xs">
                <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Calendar & Analytics</span>
              </div>
              <p className="text-xs text-stone-600 leading-normal">
                Inspect weekly and monthly charts, consecutive streaks, and planned deadlines.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50">
            <div className="flex items-center gap-2.5 mb-1 text-emerald-800 font-semibold text-xs">
              <BookmarkCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Verified Resource Library</span>
            </div>
            <p className="text-xs text-stone-600 leading-normal">
              Organize articles, books, courses, and documentation with validated URLs and progress status.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-xs text-emerald-900 leading-relaxed">
            <span className="font-semibold">Local & Private:</span> All your learning data is securely saved in your browser&apos;s localStorage. You can export or import JSON backups anytime from the settings.
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-5 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onLoadSampleData}
              className="w-full sm:w-auto px-3.5 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Load Sample Curriculum
            </button>
            <button
              type="button"
              onClick={onStartFresh}
              className="w-full sm:w-auto px-3 py-2 text-xs font-medium text-stone-500 hover:text-stone-700 transition-colors"
            >
              Start Empty
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <span>Continue to Studio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Milestone } from '../types';
import { X, CheckCircle2 } from 'lucide-react';

interface MilestoneModalProps {
  isOpen: boolean;
  goalId: string;
  initialMilestone?: Milestone | null;
  onSave: (milestoneData: {
    title: string;
    notes?: string;
    targetDate?: string;
    completed: boolean;
  }) => void;
  onClose: () => void;
}

export const MilestoneModal: React.FC<MilestoneModalProps> = ({
  isOpen,
  initialMilestone,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialMilestone);
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [completed, setCompleted] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialMilestone) {
      setTitle(initialMilestone.title);
      setNotes(initialMilestone.notes || '');
      setTargetDate(initialMilestone.targetDate || '');
      setCompleted(initialMilestone.completed);
    } else {
      setTitle('');
      setNotes('');
      setTargetDate('');
      setCompleted(false);
    }
    setError('');
  }, [initialMilestone, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Milestone title is required');
      return;
    }

    onSave({
      title: trimmedTitle,
      notes: notes.trim() || undefined,
      targetDate: targetDate || undefined,
      completed,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="milestone-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h2 id="milestone-modal-title" className="text-sm font-semibold text-stone-900">
              {isEditing ? 'Edit Milestone' : 'Add Milestone'}
            </h2>
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

        <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
          <div>
            <label htmlFor="milestone-title" className="block text-xs font-semibold text-stone-700 mb-1">
              Milestone Objective <span className="text-red-500">*</span>
            </label>
            <input
              id="milestone-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement Transformer Attention Layers"
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                error ? 'border-red-400' : 'border-stone-300 focus:border-emerald-600'
              }`}
            />
            {error && <p className="mt-1 text-[11px] text-red-600">{error}</p>}
          </div>

          <div>
            <label htmlFor="milestone-date" className="block text-xs font-semibold text-stone-700 mb-1">
              Target Deadline (Optional)
            </label>
            <input
              id="milestone-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div>
            <label htmlFor="milestone-notes" className="block text-xs font-semibold text-stone-700 mb-1">
              Notes or Verification Criteria
            </label>
            <textarea
              id="milestone-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Must achieve 95% test accuracy on evaluation set."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={completed}
                onChange={(e) => setCompleted(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-xs font-medium text-stone-700">Mark as completed</span>
            </label>
          </div>

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
              {isEditing ? 'Save' : 'Add Milestone'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

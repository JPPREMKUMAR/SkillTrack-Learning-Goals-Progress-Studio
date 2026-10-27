import React, { useState, useEffect } from 'react';
import { LearningGoal, PRESET_CATEGORIES } from '../types';
import { getTodayYMD } from '../utils/dateUtils';
import { X, Target } from 'lucide-react';

interface GoalFormModalProps {
  isOpen: boolean;
  initialGoal?: LearningGoal | null;
  onSave: (goalData: Omit<LearningGoal, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
}

export const GoalFormModal: React.FC<GoalFormModalProps> = ({
  isOpen,
  initialGoal,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialGoal);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>(PRESET_CATEGORIES[0]);
  const [customCategory, setCustomCategory] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [hasMeasurableTarget, setHasMeasurableTarget] = useState(true);
  const [targetValue, setTargetValue] = useState<number | ''>(50);
  const [currentValue, setCurrentValue] = useState<number | ''>(0);
  const [unit, setUnit] = useState('hours');
  const [status, setStatus] = useState<'active' | 'completed' | 'archived'>('active');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialGoal) {
      setTitle(initialGoal.title);
      setDescription(initialGoal.description || '');
      if (PRESET_CATEGORIES.includes(initialGoal.category as (typeof PRESET_CATEGORIES)[number])) {
        setCategory(initialGoal.category);
        setCustomCategory('');
      } else {
        setCategory('Custom');
        setCustomCategory(initialGoal.category);
      }
      setTargetDate(initialGoal.targetDate || '');
      setStatus(initialGoal.status);

      if (initialGoal.measurableTarget) {
        setHasMeasurableTarget(true);
        setTargetValue(initialGoal.measurableTarget.targetValue);
        setCurrentValue(initialGoal.measurableTarget.currentValue ?? 0);
        setUnit(initialGoal.measurableTarget.unit || 'hours');
      } else {
        setHasMeasurableTarget(false);
        setTargetValue('');
        setCurrentValue('');
      }
    } else {
      // Default new goal
      setTitle('');
      setDescription('');
      setCategory(PRESET_CATEGORIES[0]);
      setCustomCategory('');
      // Default target date: 60 days in the future
      const d = new Date();
      d.setDate(d.getDate() + 60);
      const futureYMD = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
        d.getDate()
      ).padStart(2, '0')}`;
      setTargetDate(futureYMD);
      setHasMeasurableTarget(true);
      setTargetValue(40);
      setCurrentValue(0);
      setUnit('hours');
      setStatus('active');
    }
    setErrors({});
  }, [initialGoal, isOpen]);

  if (!isOpen) return null;

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      errs.title = 'Title is required';
    } else if (trimmedTitle.length < 3) {
      errs.title = 'Title must be at least 3 characters long';
    }

    if (category === 'Custom' && !customCategory.trim()) {
      errs.category = 'Please specify your custom category';
    }

    if (!targetDate) {
      errs.targetDate = 'Target completion date is required';
    } else {
      const parts = targetDate.split('-');
      if (parts.length !== 3 || isNaN(Date.parse(targetDate))) {
        errs.targetDate = 'Please provide a valid calendar date (YYYY-MM-DD)';
      }
    }

    if (hasMeasurableTarget) {
      if (targetValue === '' || Number(targetValue) <= 0) {
        errs.targetValue = 'Target value must be greater than 0';
      }
      if (currentValue !== '' && Number(currentValue) < 0) {
        errs.currentValue = 'Current progress cannot be negative';
      }
      if (!unit.trim()) {
        errs.unit = 'Unit is required (e.g. hours, chapters, projects)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const finalCategory = category === 'Custom' ? customCategory.trim() : category;

    onSave({
      title: title.trim(),
      description: description.trim(),
      category: finalCategory,
      targetDate,
      status,
      measurableTarget: hasMeasurableTarget && targetValue !== ''
        ? {
            targetValue: Number(targetValue),
            currentValue: currentValue === '' ? 0 : Number(currentValue),
            unit: unit.trim(),
          }
        : undefined,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="goal-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-100/60 text-emerald-800 rounded-lg">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h2 id="goal-form-title" className="text-base font-semibold text-stone-900">
                {isEditing ? 'Edit Learning Goal' : 'Create New Learning Goal'}
              </h2>
              <span className="text-xs text-stone-500">
                Define the domain, measurable threshold, and target deadline
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="text-stone-400 hover:text-stone-600 p-1.5 rounded-md hover:bg-stone-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="goal-title" className="block text-xs font-semibold text-stone-700 mb-1">
              Goal Title <span className="text-red-500">*</span>
            </label>
            <input
              id="goal-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Systems & Raft Consensus"
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 transition-all ${
                errors.title ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-emerald-600'
              }`}
            />
            {errors.title && <p className="mt-1 text-xs text-red-600">{errors.title}</p>}
          </div>

          {/* Category & Status Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-category" className="block text-xs font-semibold text-stone-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                id="goal-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
                <option value="Custom">+ Custom Category...</option>
              </select>
            </div>

            <div>
              <label htmlFor="goal-target-date" className="block text-xs font-semibold text-stone-700 mb-1">
                Target Date <span className="text-red-500">*</span>
              </label>
              <input
                id="goal-target-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                  errors.targetDate ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-emerald-600'
                }`}
              />
              {errors.targetDate && <p className="mt-1 text-xs text-red-600">{errors.targetDate}</p>}
            </div>
          </div>

          {/* Custom Category input if chosen */}
          {category === 'Custom' && (
            <div>
              <label htmlFor="custom-category" className="block text-xs font-semibold text-stone-700 mb-1">
                Custom Category Name <span className="text-red-500">*</span>
              </label>
              <input
                id="custom-category"
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. Cognitive Psychology"
                className={`w-full px-3 py-2 text-sm bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                  errors.category ? 'border-red-400 focus:border-red-500' : 'border-stone-300 focus:border-emerald-600'
                }`}
              />
              {errors.category && <p className="mt-1 text-xs text-red-600">{errors.category}</p>}
            </div>
          )}

          {/* Description */}
          <div>
            <label htmlFor="goal-description" className="block text-xs font-semibold text-stone-700 mb-1">
              Description & Learning Intent
            </label>
            <textarea
              id="goal-description"
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are the key competencies, papers, or projects you will complete?"
              className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
            />
          </div>

          {/* Measurable Target Section */}
          <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-800 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={hasMeasurableTarget}
                  onChange={(e) => setHasMeasurableTarget(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>Set Measurable Quantity Target</span>
              </label>
              <span className="text-[11px] text-stone-500">e.g. 50 hours, 10 chapters</span>
            </div>

            {hasMeasurableTarget && (
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label htmlFor="target-val" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Goal Target
                  </label>
                  <input
                    id="target-val"
                    type="number"
                    min="1"
                    step="1"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-md tabular-nums focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    placeholder="50"
                  />
                  {errors.targetValue && <p className="mt-1 text-[10px] text-red-600">{errors.targetValue}</p>}
                </div>

                <div>
                  <label htmlFor="current-val" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Current Done
                  </label>
                  <input
                    id="current-val"
                    type="number"
                    min="0"
                    step="1"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-md tabular-nums focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    placeholder="0"
                  />
                  {errors.currentValue && <p className="mt-1 text-[10px] text-red-600">{errors.currentValue}</p>}
                </div>

                <div>
                  <label htmlFor="unit-val" className="block text-[11px] font-medium text-stone-600 mb-1">
                    Unit
                  </label>
                  <input
                    id="unit-val"
                    type="text"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                    placeholder="hours / pages"
                  />
                  {errors.unit && <p className="mt-1 text-[10px] text-red-600">{errors.unit}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Status selector (if editing) */}
          {isEditing && (
            <div>
              <label htmlFor="goal-status" className="block text-xs font-semibold text-stone-700 mb-1">
                Status
              </label>
              <select
                id="goal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'completed' | 'archived')}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20"
              >
                <option value="active">Active (In Progress)</option>
                <option value="completed">Completed</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          )}

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
            >
              {isEditing ? 'Save Changes' : 'Create Goal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

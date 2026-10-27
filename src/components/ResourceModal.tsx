import React, { useState, useEffect } from 'react';
import { Resource, ResourceType, ResourceStatus, LearningGoal, PRESET_CATEGORIES } from '../types';
import { Bookmark, ExternalLink, X, AlertCircle } from 'lucide-react';

interface ResourceModalProps {
  isOpen: boolean;
  goals: LearningGoal[];
  defaultGoalId?: string;
  initialResource?: Resource | null;
  onSave: (resourceData: Omit<Resource, 'id' | 'createdAt'>) => void;
  onClose: () => void;
}

export const ResourceModal: React.FC<ResourceModalProps> = ({
  isOpen,
  goals,
  defaultGoalId,
  initialResource,
  onSave,
  onClose,
}) => {
  const isEditing = Boolean(initialResource);

  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceType>('article');
  const [category, setCategory] = useState<string>(PRESET_CATEGORIES[0]);
  const [goalId, setGoalId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<ResourceStatus>('to_explore');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialResource) {
      setTitle(initialResource.title);
      setUrl(initialResource.url);
      setType(initialResource.type);
      setCategory(initialResource.category);
      setGoalId(initialResource.goalId || '');
      setNotes(initialResource.notes || '');
      setStatus(initialResource.status);
    } else {
      setTitle('');
      setUrl('');
      setType('article');
      setCategory(PRESET_CATEGORIES[0]);
      setGoalId(defaultGoalId || '');
      setNotes('');
      setStatus('to_explore');
    }
    setErrors({});
  }, [initialResource, defaultGoalId, isOpen]);

  if (!isOpen) return null;

  const normalizeAndValidateUrl = (testUrl: string): { isValid: boolean; normalized: string } => {
    let trimmed = testUrl.trim();
    if (!trimmed) return { isValid: false, normalized: '' };
    if (!/^https?:\/\//i.test(trimmed)) {
      trimmed = `https://${trimmed}`;
    }
    try {
      const parsed = new URL(trimmed);
      const isValid =
        (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
        parsed.hostname.length > 2 &&
        (parsed.hostname.includes('.') || parsed.hostname === 'localhost');
      return { isValid, normalized: trimmed };
    } catch {
      return { isValid: false, normalized: trimmed };
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};

    if (!title.trim()) {
      errs.title = 'Resource title is required';
    }

    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      errs.url = 'URL is required';
    } else {
      const { isValid } = normalizeAndValidateUrl(trimmedUrl);
      if (!isValid) {
        errs.url = 'Please provide a valid web address (e.g. https://example.com/guide)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const { normalized } = normalizeAndValidateUrl(url);

    onSave({
      title: title.trim(),
      url: normalized,
      type,
      category,
      goalId: goalId || undefined,
      notes: notes.trim() || undefined,
      status,
    });
    onClose();
  };

  const { isValid: isCurrentUrlValid, normalized: currentNormalizedUrl } = normalizeAndValidateUrl(url);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="resource-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white rounded-xl shadow-xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-stone-100 bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-100/60 text-emerald-800 rounded-lg">
              <Bookmark className="w-4 h-4" />
            </div>
            <h2 id="resource-modal-title" className="text-sm font-semibold text-stone-900">
              {isEditing ? 'Edit Learning Resource' : 'Save Learning Resource'}
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

        <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-3.5">
          {/* Title */}
          <div>
            <label htmlFor="resource-title" className="block text-xs font-semibold text-stone-700 mb-1">
              Resource Title <span className="text-red-500">*</span>
            </label>
            <input
              id="resource-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed Consensus in Plain English"
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 ${
                errors.title ? 'border-red-400' : 'border-stone-300 focus:border-emerald-600'
              }`}
            />
            {errors.title && <p className="mt-1 text-[11px] text-red-600">{errors.title}</p>}
          </div>

          {/* URL & Verification */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="resource-url" className="text-xs font-semibold text-stone-700">
                Resource Link (URL) <span className="text-red-500">*</span>
              </label>
              {isCurrentUrlValid && (
                <a
                  href={currentNormalizedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-emerald-700 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <span>Test URL</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
            <input
              id="resource-url"
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (errors.url) setErrors((prev) => ({ ...prev, url: '' }));
              }}
              placeholder="https://example.com/guide"
              className={`w-full px-3 py-2 text-xs bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600/20 font-mono text-[11px] ${
                errors.url ? 'border-red-400' : 'border-stone-300 focus:border-emerald-600'
              }`}
            />
            {errors.url ? (
              <p className="mt-1 text-[11px] text-red-600 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.url}</span>
              </p>
            ) : (
              <p className="mt-1 text-[10px] text-stone-400">Must begin with https:// or http://</p>
            )}
          </div>

          {/* Type and Category */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="resource-type" className="block text-xs font-semibold text-stone-700 mb-1">
                Format
              </label>
              <select
                id="resource-type"
                value={type}
                onChange={(e) => setType(e.target.value as ResourceType)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
              >
                <option value="article">Article / Guide</option>
                <option value="video">Video / Talk</option>
                <option value="book">Book</option>
                <option value="course">Course</option>
                <option value="doc">Documentation</option>
                <option value="tool">Interactive Tool</option>
                <option value="cheatsheet">Cheatsheet</option>
              </select>
            </div>

            <div>
              <label htmlFor="resource-category" className="block text-xs font-semibold text-stone-700 mb-1">
                Category
              </label>
              <select
                id="resource-category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-2.5 py-1.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
              >
                {PRESET_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Associated Goal */}
          <div>
            <label htmlFor="resource-goal" className="block text-xs font-semibold text-stone-700 mb-1">
              Link to Goal (Optional)
            </label>
            <select
              id="resource-goal"
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="">No Specific Goal Linked</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.category})
                </option>
              ))}
            </select>
          </div>

          {/* Reading Status */}
          <div>
            <label htmlFor="resource-status" className="block text-xs font-semibold text-stone-700 mb-1">
              Study Status
            </label>
            <select
              id="resource-status"
              value={status}
              onChange={(e) => setStatus(e.target.value as ResourceStatus)}
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="to_explore">To Read / Explore</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed / Read</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label htmlFor="resource-notes" className="block text-xs font-semibold text-stone-700 mb-1">
              Key Insights & Study Notes
            </label>
            <textarea
              id="resource-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Summary, chapters to focus on, or personal review..."
              className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
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
              {isEditing ? 'Save Resource' : 'Add to Library'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

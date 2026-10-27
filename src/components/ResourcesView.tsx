import React, { useState, useMemo } from 'react';
import { Resource, LearningGoal, ResourceType, ResourceStatus, PRESET_CATEGORIES } from '../types';
import { formatYMDToReadable } from '../utils/dateUtils';
import {
  Bookmark,
  ExternalLink,
  Plus,
  Search,
  BookOpen,
  Video,
  FileText,
  GraduationCap,
  Wrench,
  FileCode,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  Clock,
} from 'lucide-react';

interface ResourcesViewProps {
  resources: Resource[];
  goals: LearningGoal[];
  onOpenNewResourceModal: () => void;
  onEditResource: (resource: Resource) => void;
  onDeleteResource: (resource: Resource) => void;
  onToggleResourceStatus: (resourceId: string, status: ResourceStatus) => void;
  onSelectGoal: (goal: LearningGoal) => void;
}

export const ResourcesView: React.FC<ResourcesViewProps> = ({
  resources,
  goals,
  onOpenNewResourceModal,
  onEditResource,
  onDeleteResource,
  onToggleResourceStatus,
  onSelectGoal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    resources.forEach((r) => set.add(r.category));
    return Array.from(set).sort();
  }, [resources]);

  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      if (typeFilter !== 'all' && res.type !== typeFilter) return false;
      if (statusFilter !== 'all' && res.status !== statusFilter) return false;
      if (categoryFilter !== 'all' && res.category !== categoryFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = res.title.toLowerCase().includes(q);
        const matchesUrl = res.url.toLowerCase().includes(q);
        const matchesNotes = (res.notes || '').toLowerCase().includes(q);
        const matchesCat = res.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesUrl && !matchesNotes && !matchesCat) return false;
      }
      return true;
    });
  }, [resources, typeFilter, statusFilter, categoryFilter, searchQuery]);

  const getTypeIcon = (type: ResourceType) => {
    switch (type) {
      case 'video':
        return <Video className="w-4 h-4 text-emerald-700" />;
      case 'book':
        return <BookOpen className="w-4 h-4 text-emerald-700" />;
      case 'course':
        return <GraduationCap className="w-4 h-4 text-emerald-700" />;
      case 'doc':
        return <FileCode className="w-4 h-4 text-emerald-700" />;
      case 'tool':
        return <Wrench className="w-4 h-4 text-emerald-700" />;
      case 'cheatsheet':
      case 'article':
      default:
        return <FileText className="w-4 h-4 text-emerald-700" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-stone-900">Resource Library</h1>
          <p className="text-xs text-stone-500">
            Validated documentation, books, video lectures, and tools tied to your learning goals
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenNewResourceModal}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Save Resource</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-xl border border-stone-200 p-3 sm:p-4 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
          {/* Search */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by title, notes, or URL..."
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

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Formats</option>
              <option value="article">Articles & Guides</option>
              <option value="video">Videos & Talks</option>
              <option value="book">Books</option>
              <option value="course">Courses</option>
              <option value="doc">Documentation</option>
              <option value="tool">Interactive Tools</option>
              <option value="cheatsheet">Cheatsheets</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Statuses</option>
              <option value="to_explore">To Read</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full py-1.5 px-2.5 text-xs bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-emerald-600"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-stone-100 pt-2.5 text-xs text-stone-500">
          <span>
            Showing <strong className="text-stone-800">{filteredResources.length}</strong> of{' '}
            {resources.length} resources
          </span>
          {(searchQuery || typeFilter !== 'all' || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setTypeFilter('all');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-emerald-800 hover:underline font-medium"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Resources List */}
      {filteredResources.length === 0 ? (
        <div className="bg-white rounded-xl border border-stone-200 p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 mx-auto flex items-center justify-center">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-stone-900">No resources found</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Try adjusting your search query or format filters.'
              : 'Save your first study resource to build your knowledge base.'}
          </p>
          <button
            type="button"
            onClick={onOpenNewResourceModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Resource</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredResources.map((res) => {
            const linkedGoal = goals.find((g) => g.id === res.goalId);

            return (
              <div
                key={res.id}
                className="bg-white rounded-xl border border-stone-200 hover:border-emerald-300 transition-all p-4 shadow-xs flex flex-col justify-between gap-3 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-100 shrink-0 mt-0.5">
                        {getTypeIcon(res.type)}
                      </div>
                      <div className="space-y-1">
                        {/* Unboxed metadata line with typographic dot separator */}
                        <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
                          <span className="capitalize">{res.type}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-emerald-800">{res.category}</span>
                          <span aria-hidden="true">·</span>
                          <span className="capitalize">{res.status.replace('_', ' ')}</span>
                        </div>

                        <h3 className="text-sm font-bold text-stone-900 group-hover:text-emerald-800 transition-colors leading-snug">
                          {res.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditResource(res)}
                        aria-label="Edit resource"
                        title="Edit Resource"
                        className="p-1 text-stone-400 hover:text-stone-700 rounded-md hover:bg-stone-50 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteResource(res)}
                        aria-label="Delete resource"
                        title="Delete Resource"
                        className="p-1 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {res.notes && (
                    <p className="text-xs text-stone-600 leading-relaxed pl-9">{res.notes}</p>
                  )}

                  {linkedGoal && (
                    <div className="pl-9 pt-1">
                      <button
                        type="button"
                        onClick={() => onSelectGoal(linkedGoal)}
                        className="text-[11px] text-stone-500 hover:text-emerald-800 inline-flex items-center gap-1 transition-colors"
                      >
                        <span>Goal:</span>
                        <strong className="underline underline-offset-2">{linkedGoal.title}</strong>
                      </button>
                    </div>
                  )}
                </div>

                {/* Footer with status select & Open URL */}
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-stone-400">Status:</span>
                    <select
                      value={res.status}
                      onChange={(e) =>
                        onToggleResourceStatus(res.id, e.target.value as ResourceStatus)
                      }
                      className="text-[11px] font-medium bg-stone-50 border border-stone-200 rounded px-2 py-0.5 text-stone-700 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="to_explore">To Read</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>

                  <a
                    href={res.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                  >
                    <span>Visit Link</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

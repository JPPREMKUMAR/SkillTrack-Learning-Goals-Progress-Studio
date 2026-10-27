import React, { useState } from 'react';
import { SproutLogo } from './SproutLogo';
import {
  LayoutDashboard,
  Target,
  Calendar,
  BarChart2,
  Bookmark,
  Plus,
  HelpCircle,
  Download,
  Upload,
  RefreshCw,
  Menu,
  X,
  Clock,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'goals' | 'calendar' | 'analytics' | 'resources';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  onOpenNewGoalModal: () => void;
  onOpenLogSessionModal: () => void;
  onOpenWelcomeModal: () => void;
  onExportData: () => void;
  onTriggerImport: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewGoalModal,
  onOpenLogSessionModal,
  onOpenWelcomeModal,
  onExportData,
  onTriggerImport,
  onResetData,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settingsDropdownOpen, setSettingsDropdownOpen] = useState(false);

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
    { id: 'calendar', label: 'Calendar', icon: <Calendar className="w-4 h-4" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-4 h-4" /> },
    { id: 'resources', label: 'Resources', icon: <Bookmark className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Top Bar 3-Zone Contract */}
        <div className="flex items-center justify-between gap-4 md:gap-8 h-16">
          {/* Zone 1: Single text element wordmark with custom Sprout Logo */}
          <div
            onClick={() => onTabChange('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group"
          >
            <div className="p-1.5 bg-emerald-100/70 border border-emerald-200/80 rounded-lg group-hover:scale-105 transition-transform">
              <SproutLogo className="w-6 h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-stone-900 group-hover:text-emerald-800 transition-colors">
                SkillTrack
              </span>
              <span className="text-[10px] text-stone-400 -mt-1 hidden sm:block">
                Learning Studio
              </span>
            </div>
          </div>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onTabChange(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary action + helper utilities */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Quick Log Session Button (Desktop secondary) */}
            <button
              type="button"
              onClick={onOpenLogSessionModal}
              title="Log Study Session or Run Timer"
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 border border-stone-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Log Session</span>
            </button>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={onOpenNewGoalModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Goal</span>
            </button>

            {/* Help / Onboarding Guide */}
            <button
              type="button"
              onClick={onOpenWelcomeModal}
              title="Tour & About SkillTrack"
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
            >
              <HelpCircle className="w-4 h-4" />
            </button>

            {/* Settings & Backup Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSettingsDropdownOpen(!settingsDropdownOpen)}
                title="Backup and Data Settings"
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>

              {settingsDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setSettingsDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-stone-200 py-1.5 z-40 text-xs">
                    <div className="px-3 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider">
                      Storage & Backup
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onExportData();
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left"
                    >
                      <Download className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Export Backup (JSON)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onTriggerImport();
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-stone-700 hover:bg-stone-50 hover:text-stone-900 transition-colors text-left"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Import Backup (JSON)</span>
                    </button>
                    <div className="my-1 border-t border-stone-100" />
                    <button
                      type="button"
                      onClick={() => {
                        onResetData();
                        setSettingsDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Reset to Sample Data</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 text-stone-600 hover:text-stone-900 rounded-lg hover:bg-stone-100"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-stone-200 py-3 space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
            <div className="pt-2 border-t border-stone-100 flex items-center gap-2 px-2">
              <button
                type="button"
                onClick={() => {
                  onOpenLogSessionModal();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Log Session</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

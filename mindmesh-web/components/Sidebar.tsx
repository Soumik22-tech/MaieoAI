'use client';

import { Plus, Trash2, Search, Settings, ChevronLeft, ChevronRight, Moon, Sun, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { getHistory, deleteDebate, clearHistory, SavedDebate } from '../lib/storage';
import { UserButton, useUser } from '@clerk/nextjs';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewDebate: () => void;
  refreshTrigger: number;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

function formatRelativeTime(dateInput: Date | string) {
  const date = new Date(dateInput);
  const now = new Date();
  
  if (isNaN(date.getTime())) return 'just now';

  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays === 1) return 'Yesterday';
  if (diffInDays < 30) return `${diffInDays} days ago`;
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) return `${diffInMonths} month${diffInMonths !== 1 ? 's' : ''} ago`;
  
  return `${Math.floor(diffInMonths / 12)} year${Math.floor(diffInMonths / 12) !== 1 ? 's' : ''} ago`;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

export default function Sidebar({ 
  isOpen, 
  onClose, 
  activeId, 
  onSelect, 
  onNewDebate, 
  refreshTrigger,
  isCollapsed,
  onToggleCollapse
}: SidebarProps) {
  const [history, setHistory] = useState<SavedDebate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showThemeMenu, setShowThemeMenu] = useState(false);
  const { user, isLoaded } = useUser();

  useEffect(() => {
    setMounted(true);
    // Close menus when clicking outside
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.settings-menu-container')) {
        setShowSettings(false);
        setShowThemeMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    loadHistory();
  }, [refreshTrigger]); // Reload when trigger changes

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDebate(id);
    loadHistory();
    if (activeId === id) {
      onNewDebate(); // Reset main view if active debate was deleted
    }
  };

  const handleSelect = (id: string) => {
    onSelect(id);
    onClose();
  };

  const handleClearAll = () => {
    clearHistory();
    loadHistory();
    onNewDebate();
    onClose();
  };

  const filteredHistory = history.filter(debate => 
    debate.query.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Backdrop for tablet */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-[55] lg:hidden"
          onClick={onClose}
        />
      )}

      <aside 
        className={`
          hidden md:flex flex-col justify-between z-[60] shrink-0
          bg-sidebar-bg border-r border-sidebar-border h-full
          fixed top-0 left-0 transition-all duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          ${isCollapsed ? 'md:w-[70px]' : 'md:w-[280px] lg:w-[260px]'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden p-4">
        {/* Logo & Collapse Toggle */}
        <div className={`flex items-center mb-6 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center overflow-hidden">
            {!isCollapsed ? (
              <span className="text-xl font-bold tracking-tight whitespace-nowrap">
                <span className="text-white">Mind</span>
                <span className="text-[#7C6AF7]">Mesh.</span>
              </span>
            ) : (
              <span className="text-xl font-bold text-[#7C6AF7]">M.</span>
            )}
          </div>
          
          <button 
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-sidebar-hover text-text-secondary transition-colors"
          >
            {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        {/* New Debate Button */}
        <div className="mb-4">
          <button
            onClick={() => {
              onNewDebate();
              onClose();
            }}
            className={`
              w-full bg-accent hover:bg-accent/90 text-white rounded-xl py-3 px-4 flex items-center gap-2 text-sm font-medium transition-all
              ${isCollapsed ? 'justify-center p-0 h-10 w-10 mx-auto rounded-full' : 'justify-center'}
            `}
            title="New Debate"
          >
            <Plus size={18} />
            {!isCollapsed && <span>New Debate</span>}
          </button>
        </div>

        {/* Search Bar */}
        {!isCollapsed && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={14} />
            <input 
              type="text"
              placeholder="Search debates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface/50 border border-border rounded-lg py-2 pl-9 pr-3 text-xs text-text-primary outline-none focus:border-accent transition-colors"
            />
          </div>
        )}

        {/* History List */}
        <div className="flex-1 overflow-y-auto pr-1 -mr-1 scrollbar-thin">
          {!isCollapsed && (
            <>
              {filteredHistory.length === 0 ? (
                <div className="text-xs text-text-secondary text-center mt-4 italic">
                  {searchQuery ? 'No matches found' : 'No debates yet'}
                </div>
              ) : (
                <motion.ul 
                  className="flex flex-col gap-1"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {filteredHistory.map((debate) => {
                    const isActive = debate.id === activeId;
                    return (
                      <motion.li
                        key={debate.id}
                        variants={itemVariants}
                        onClick={() => handleSelect(debate.id)}
                        className={`
                          group p-3 rounded-lg cursor-pointer transition-all border-l-2 text-sm relative
                          ${isActive 
                            ? 'border-accent bg-sidebar-hover text-text-primary' 
                            : 'border-transparent text-text-secondary hover:bg-sidebar-hover hover:text-text-primary'}
                        `}
                      >
                        <div className="font-medium mb-1 pr-6 truncate" title={debate.query}>
                          {debate.query}
                        </div>
                        <div className="text-[10px] opacity-60">
                          {formatRelativeTime(debate.timestamp)}
                        </div>
                        
                        <button
                          onClick={(e) => handleDelete(e, debate.id)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all p-1"
                          title="Delete debate"
                        >
                          <Trash2 size={14} />
                        </button>
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </>
          )}
        </div>

        {/* Bottom Section: Settings & Theme */}
        <div className="mt-auto pt-4 border-t border-sidebar-border relative settings-menu-container">
          <AnimatePresence>
            {showSettings && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className={`
                  absolute bottom-full left-0 mb-2 bg-surface border border-border rounded-xl shadow-xl z-[70] overflow-hidden
                  ${isCollapsed ? 'left-4 w-48' : 'w-full'}
                `}
              >
                {!showThemeMenu ? (
                  <div className="p-1.5">
                    <button
                      onClick={() => setShowThemeMenu(true)}
                      className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-sidebar-hover text-text-secondary hover:text-text-primary transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <Sun size={18} />
                        <span className="text-sm font-medium">Theme</span>
                      </div>
                      <ChevronRight size={14} />
                    </button>
                    {/* Placeholder for future settings */}
                    <div className="mt-1 pt-1 border-t border-border opacity-50 px-2.5 py-2">
                       <p className="text-[10px] uppercase tracking-wider font-bold">More coming soon</p>
                    </div>
                  </div>
                ) : (
                  <div className="p-1.5">
                    <div className="flex items-center gap-2 px-2.5 py-2 mb-1 border-b border-border">
                       <button onClick={() => setShowThemeMenu(false)} className="p-1 hover:bg-sidebar-hover rounded text-text-secondary">
                          <ChevronLeft size={14} />
                       </button>
                       <span className="text-xs font-bold uppercase tracking-wider">Select Theme</span>
                    </div>
                    {[
                      { id: 'light', label: 'Light', icon: Sun },
                      { id: 'dark', label: 'Dark', icon: Moon },
                    ].map((mode) => (
                      <button
                        key={mode.id}
                        onClick={() => {
                          setTheme(mode.id);
                          setShowSettings(false);
                          setShowThemeMenu(false);
                        }}
                        className={`
                          w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-sidebar-hover transition-all
                          ${theme === mode.id ? 'text-accent' : 'text-text-secondary hover:text-text-primary'}
                        `}
                      >
                        <div className="flex items-center gap-3">
                          <mode.icon size={18} />
                          <span className="text-sm font-medium">{mode.label}</span>
                        </div>
                        {theme === mode.id && <Check size={14} />}
                      </button>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setShowSettings(!showSettings);
              setShowThemeMenu(false);
            }}
            className={`
              w-full flex items-center gap-3 p-3 rounded-xl hover:bg-sidebar-hover text-text-secondary hover:text-text-primary transition-all
              ${isCollapsed ? 'justify-center' : ''}
              ${showSettings ? 'bg-sidebar-hover text-text-primary' : ''}
            `}
            title="Settings"
          >
            <Settings size={18} />
            {!isCollapsed && <span className="text-sm font-medium">Settings</span>}
          </button>
          
          {/* User Section */}
          <div className={`mt-2 flex items-center gap-3 p-2 rounded-xl transition-all ${isCollapsed ? 'justify-center' : 'bg-surface/30 border border-border/30'}`}>
            <UserButton afterSignOutUrl="/" />
            {!isCollapsed && isLoaded && user && (
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-medium text-text-primary truncate">Hi, {user.firstName || 'User'}</span>
                <span className="text-[10px] text-text-secondary truncate">{user.primaryEmailAddress?.emailAddress}</span>
              </div>
            )}
          </div>
          
          {!isCollapsed && (
            <p className="text-[10px] text-text-secondary text-center mt-4 opacity-50">
              Powered by 4 AI models
            </p>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}

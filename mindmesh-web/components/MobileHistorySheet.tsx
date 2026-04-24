'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import { getHistory, deleteDebate, clearHistory, SavedDebate } from '@/lib/storage';

interface MobileHistorySheetProps {
  isOpen: boolean;
  onClose: () => void;
  activeId: string | null;
  onSelect: (id: string) => void;
  onNewDebate: () => void;
  refreshTrigger: number;
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

export default function MobileHistorySheet({
  isOpen,
  onClose,
  activeId,
  onSelect,
  onNewDebate,
  refreshTrigger,
}: MobileHistorySheetProps) {
  const [history, setHistory] = useState<SavedDebate[]>([]);

  const loadHistory = () => {
    setHistory(getHistory());
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [refreshTrigger, isOpen]);

  const handleDelete = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    deleteDebate(id);
    loadHistory();
    if (activeId === id) {
      onNewDebate();
    }
  };

  const handleClearAll = () => {
    clearHistory();
    loadHistory();
    onNewDebate();
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[60] md:hidden"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 w-full h-[85vh] bg-surface rounded-t-3xl z-[70] md:hidden flex flex-col shadow-2xl"
          >
            {/* Drag Handle */}
            <div className="w-full py-4 flex justify-center items-center shrink-0 cursor-grab active:cursor-grabbing">
              <div className="w-12 h-1.5 bg-border rounded-full" />
            </div>

            {/* Header */}
            <div className="px-6 pb-4 border-b border-border flex justify-between items-center shrink-0">
              <h2 className="text-lg font-bold text-text-primary">History</h2>
              <button onClick={onClose} className="p-2 -mr-2 text-text-secondary hover:text-text-primary rounded-full bg-black/5 dark:bg-white/5">
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-4 py-2 pb-[80px]">
              {history.length === 0 ? (
                <div className="text-center text-text-secondary py-10">
                  No debates yet
                </div>
              ) : (
                <ul className="flex flex-col gap-2 mt-2">
                  {history.map((debate) => {
                    const isActive = debate.id === activeId;
                    return (
                      <li
                        key={debate.id}
                        onClick={() => {
                          onSelect(debate.id);
                          onClose();
                        }}
                        className={`
                          group p-4 rounded-xl cursor-pointer transition-all border text-sm relative flex justify-between items-center
                          ${isActive 
                            ? 'border-accent bg-sidebar-hover text-text-primary' 
                            : 'border-border text-text-secondary bg-background'}
                        `}
                      >
                        <div className="flex-1 pr-4">
                          <div className="font-medium mb-1 text-text-primary line-clamp-2">
                            {debate.query}
                          </div>
                          <div className="text-xs opacity-60">
                            {formatRelativeTime(debate.timestamp)}
                          </div>
                        </div>
                        
                        <button
                          onClick={(e) => handleDelete(e, debate.id)}
                          className="p-2 text-text-secondary hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-colors shrink-0"
                        >
                          <Trash2 size={18} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {history.length > 0 && (
              <div className="absolute bottom-0 left-0 w-full p-4 border-t border-border bg-surface shrink-0 pb-safe">
                <button
                  onClick={() => {
                    handleClearAll();
                    onClose();
                  }}
                  className="w-full py-3 text-sm font-medium text-red-400 bg-red-400/10 rounded-xl hover:bg-red-400/20 transition-colors"
                >
                  Clear All History
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

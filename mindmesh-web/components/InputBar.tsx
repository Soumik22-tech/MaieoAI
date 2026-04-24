'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

interface InputBarProps {
  onSubmit: (query: string) => void;
  disabled: boolean;
  placeholder?: string;
}

export default function InputBar({ onSubmit, disabled, placeholder = 'Enter a topic to debate...' }: InputBarProps) {
  const [query, setQuery] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const el = textareaRef.current;
    if (!el) return;
    const scrollHeight = el.scrollHeight;
    const maxHeight = 200;
    el.style.height = `${Math.min(Math.max(scrollHeight, 52), maxHeight)}px`;
    el.style.overflowY = scrollHeight > maxHeight ? 'auto' : 'hidden';
  }, []);

  useEffect(() => {
    autoResize();
  }, [query, autoResize]);

  // Cmd/Ctrl + K to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSubmit = () => {
    if (!disabled && query.trim()) {
      onSubmit(query.trim());
      setQuery('');
      // Reset height after clearing
      if (textareaRef.current) {
        textareaRef.current.style.height = '52px';
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="bg-background border-t border-border py-3 px-3 md:py-4 md:px-6 shrink-0 w-full">
      <div className="max-w-[800px] mx-auto flex flex-col gap-2 relative">
        <div className="flex flex-row items-end gap-3">
          <textarea
            ref={textareaRef}
            rows={1}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={500}
            className="flex-1 bg-surface border border-border rounded-2xl py-3 px-4 md:py-3.5 md:px-5 text-text-primary placeholder-gray-500 outline-none transition-all focus:border-accent focus:shadow-[0_0_0_3px_rgba(124,106,247,0.15)] disabled:opacity-50 resize-none overflow-hidden leading-relaxed text-sm md:text-base"
            style={{ minHeight: '52px', maxHeight: '200px' }}
          />
          <button
            onClick={handleSubmit}
            disabled={disabled || !query.trim()}
            className="bg-accent text-white rounded-full py-3 px-4 min-w-[110px] md:py-3.5 md:px-6 font-medium transition-colors hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center md:min-w-[140px] text-sm md:text-base shrink-0 self-end mb-0"
          >
            {disabled ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Debating...
              </>
            ) : (
              'Start Debate'
            )}
          </button>
        </div>

        {/* Hints Row */}
        <div className="flex justify-between items-center px-1">
          <div className="flex items-center gap-3 text-[11px] text-text-secondary">
            <span>Shift+Enter for new line</span>
            <span className="hidden md:flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px] font-mono">⌘K</kbd>
              <span>to focus</span>
            </span>
          </div>
          {query.length > 0 && (
            <span className={`text-[11px] ${query.length > 400 ? 'text-[#ef4444]' : 'text-text-secondary'}`}>
              {query.length} / 500
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

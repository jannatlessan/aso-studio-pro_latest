import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface ToolHeaderProps {
  toolName: string;
  isToolUsed: boolean;
  onBackClick: () => void;
  statusBadge?: React.ReactNode;
}

/**
 * Reusable tool header component with smart navigation
 * Shows "Back to Tools" when tool is in default state
 * Shows tool name when tool has been used (clicking resets tool)
 */
export const ToolHeader = ({ toolName, isToolUsed, onBackClick, statusBadge }: ToolHeaderProps) => {
  return (
    <nav className="sticky top-0 z-50 bg-white shadow-[0_1px_0_rgba(16,19,18,0.06)] px-4 sm:px-8 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <button
          onClick={onBackClick}
          className="inline-flex items-center gap-2 text-sm text-[#55605B] hover:text-primary transition-colors group"
          title={isToolUsed ? `Reset ${toolName} and stay on page` : 'Back to Tools'}
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {isToolUsed ? (
            <span>
              {toolName}
              <span className="text-xs text-[#8B958F] ml-2">(Reset)</span>
            </span>
          ) : (
            'Back to Tools'
          )}
        </button>
        {statusBadge}
      </div>
    </nav>
  );
};

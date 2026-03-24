import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface UseToolNavigationProps {
  toolName: string;
  isToolUsed: boolean;
  onReset?: () => void;
}

/**
 * Custom hook for smart tool navigation behavior
 * - If tool is in default/reset state: navigate to /tools
 * - If tool has been used: reset the tool and stay on the page
 */
export const useToolNavigation = ({ toolName, isToolUsed, onReset }: UseToolNavigationProps) => {
  const navigate = useNavigate();

  const handleBackClick = useCallback(() => {
    if (isToolUsed) {
      // Tool has been used - reset it and stay on page
      onReset?.();
    } else {
      // Tool is in default state - navigate back to tools
      navigate('/tools');
    }
  }, [isToolUsed, onReset, navigate]);

  return {
    handleBackClick,
    shouldShowToolName: isToolUsed,
  };
};

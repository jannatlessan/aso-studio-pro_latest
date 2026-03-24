# Smart Tool Navigation Implementation Guide

## Overview
Implemented conditional navigation for tools:
- **Default state** (tool unused): "Back to Tools" button → navigates to `/tools`
- **Active state** (tool being used): Shows tool name → clicking resets tool and stays on page

## Files Created

### 1. `/src/hooks/useToolNavigation.ts`
Custom hook that manages the navigation logic based on tool state.
- Returns `handleBackClick` function
- Returns `shouldShowToolName` boolean

### 2. `/src/components/ToolHeader.tsx`
Reusable tool header component with smart navigation.
- Replaces repetitive header code across tools
- Accepts `toolName`, `isToolUsed`, `onBackClick`, and optional `statusBadge`
- Shows different text and tooltip based on state

## How to Apply to Other Tools

### Example Pattern (QRCodeGenerator):

```typescript
import { useToolNavigation } from '../../hooks/useToolNavigation';
import { ToolHeader } from '../../components/ToolHeader';

const DEFAULT_VALUE = 'initial-value';

export default function MyTool() {
  const [value, setValue] = useState(DEFAULT_VALUE);
  
  // Track if tool has been modified
  const isToolUsed = value !== DEFAULT_VALUE;

  // Use the hook
  const { handleBackClick } = useToolNavigation({
    toolName: 'Tool Name',
    isToolUsed,
    onReset: () => setValue(DEFAULT_VALUE),
  });

  // Use the header component
  return (
    <ToolHeader 
      toolName="Tool Name"
      isToolUsed={isToolUsed}
      onBackClick={handleBackClick}
      statusBadge={<YourStatusBadge />}
    />
  );
}
```

### For Tools with Custom Headers (like BackgroundRemover):

```typescript
import { useToolNavigation } from '../../hooks/useToolNavigation';
import { useNavigate } from 'react-router-dom';

export default function CustomHeaderTool() {
  const navigate = useNavigate();
  // ... your state
  
  const isToolUsed = sourceImage !== null; // Determine when tool is "used"

  const handleReset = () => {
    // Reset all state here
    setSourceImage(null);
    // ... other resets
  };

  const { handleBackClick } = useToolNavigation({
    toolName: 'Tool Name',
    isToolUsed,
    onReset: handleReset,
  });

  // In your custom header:
  // Replace: <Link to="/tools" ...> with:
  //   <button onClick={handleBackClick} ...>
  //     <ChevronLeft ... />
  //   </button>
  
  // Update header text:
  // Show tool name when isToolUsed is true, with "(Click back to reset)" hint
}
```

## Tools Updated

1. **QRCodeGenerator** - Uses ToolHeader component
2. **BackgroundRemover** - Custom header with smart navigation

## Benefits

✅ Consistent UX across all tools  
✅ Users understand the two-mode behavior  
✅ Clicking back in active state resets tool (doesn't navigate away)  
✅ Default state allows quick return to tools list  
✅ Reusable code reduces duplication  

## Next Steps

Apply this pattern to remaining tools:
- Age Calculator
- Pomodoro Timer
- Unit Converter
- Color Palette Generator
- CSS Gradient Generator
- Lorem Ipsum Generator
- Markdown to HTML
- Percentage Calculator
- YouTube Thumbnail Saver
- ASO Screenshot Pro
- Password Generator
- JSON Formatter
- Text Utilities
- Image Resizer
- Image Compressor
- Image Enhancer
- Audio Merger Pro
- PDF Merger
- Video to GIF Maker
- GIF Viewer

Each tool should:
1. Import the hook and component
2. Define what "tool is used" means for that specific tool
3. Implement a reset function
4. Replace the header navigation logic

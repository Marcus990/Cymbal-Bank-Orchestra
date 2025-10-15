# JSON Table Integration

This document explains how the JSON detection and table rendering system works in the Cymbal Bank application.

## Overview

The application automatically detects JSON responses from AI agents and renders them as structured, styled tables in a dedicated panel on the right side of the interface. This provides users with a clear view of structured data without cluttering the chat transcripts.

## Features

### 🔍 **Automatic JSON Detection**
- **Real-time Detection**: Scans all agent responses for JSON patterns
- **Smart Parsing**: Handles both objects `{}` and arrays `[]`
- **Markdown Support**: Recognizes JSON wrapped in code blocks (```json)
- **Content Validation**: Only displays meaningful, non-empty JSON structures

### 🎨 **Styled Table Rendering**
- **Responsive Design**: Adapts to different screen sizes
- **Consistent Styling**: Matches the application's design system
- **Interactive Elements**: Hover effects and clear visual hierarchy
- **Scrollable Content**: Handles large datasets gracefully

### 🗂️ **Data Management**
- **Timestamp Tracking**: Each JSON entry shows when it was detected
- **Individual Removal**: Remove specific entries with the × button
- **Bulk Clear**: Clear all data with the "Clear All" button
- **Persistent Display**: Data remains visible until manually removed

## How It Works

### 1. **Message Processing**
When an agent sends a response:
1. The `onText` handler receives the text
2. `detectAndExtractJson()` scans for JSON patterns
3. Valid JSON is parsed and stored in `jsonData` state
4. The original message is displayed in transcripts as usual

### 2. **JSON Detection Patterns**
The system looks for:
- **Object patterns**: `{...}` - Matches JSON objects
- **Array patterns**: `[...]` - Matches JSON arrays
- **Markdown blocks**: ```json {...} ``` - Handles formatted responses

### 3. **Table Rendering**
- **Arrays**: Shows index and value columns
- **Objects**: Shows key and value columns
- **Nested Data**: Complex objects are displayed as formatted JSON
- **Responsive**: Tables adapt to content width

## UI Layout

### **Desktop Layout (lg screens and up)**
```
┌─────────────────────────────────────────────────────────────┐
│                    Main Content Area                        │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────┬─────────────────────────────┐
│      Left Panel (2/3)       │     Right Panel (1/3)      │
│                             │                             │
│ • Transcripts toggle        │ • Structured Data Header   │
│ • Chat input                │ • JSON Tables              │
│ • Voice controls            │ • Timestamps               │
│                             │ • Remove buttons           │
└─────────────────────────────┴─────────────────────────────┘
```

### **Mobile Layout (below lg screens)**
```
┌─────────────────────────────┐
│        Main Content         │
└─────────────────────────────┘

┌─────────────────────────────┐
│      JSON Demo Section      │
└─────────────────────────────┘

┌─────────────────────────────┐
│      Left Panel (Full)      │
│                             │
│ • Transcripts toggle        │
│ • Chat input                │
│ • Voice controls            │
└─────────────────────────────┘

┌─────────────────────────────┐
│      Right Panel (Full)     │
│                             │
│ • Structured Data Header    │
│ • JSON Tables               │
│ • Timestamps                │
│ • Remove buttons            │
└─────────────────────────────┘
```

## Technical Implementation

### **State Management**
```typescript
interface JsonData {
  id: string;           // Unique identifier
  data: any;            // Parsed JSON content
  timestamp: Date;      // When detected
}

const [jsonData, setJsonData] = useState<JsonData[]>([]);
```

### **JSON Detection Function**
```typescript
const detectAndExtractJson = (text: string): any[] => {
  const jsonPatterns = [
    /\{[\s\S]*?\}/g,  // Non-greedy object matching
    /\[[\s\S]*?\]/g,  // Non-greedy array matching
  ];
  
  // Parse and validate each match
  // Return meaningful JSON structures only
};
```

### **Table Rendering**
```typescript
const renderJsonTable = (data: any): React.JSX.Element => {
  if (Array.isArray(data)) {
    // Render array as index-value table
  } else if (typeof data === 'object') {
    // Render object as key-value table
  }
};
```

## Usage Examples

### **Example 1: Financial Data**
**Agent Response:**
```
Here's your account summary:

```json
{
  "account_balance": 12500.75,
  "currency": "USD",
  "transactions": [
    {"id": 1, "amount": -45.99, "description": "Coffee Shop"},
    {"id": 2, "amount": 2500.00, "description": "Salary Deposit"}
  ]
}
```
```

**Result:** A structured table showing account balance, currency, and transactions in an organized format.

### **Example 2: Spending Analysis**
**Agent Response:**
```
Monthly spending breakdown:

```json
[
  {"month": "January", "spending": 1200.50, "budget": 1500.00},
  {"month": "February", "spending": 980.25, "budget": 1500.00}
]
```
```

**Result:** A table with month, spending, and budget columns for easy comparison.

## Demo Features

### **Sample Data Button**
- Located above the main interface
- Adds realistic financial data examples
- Demonstrates table rendering capabilities
- Useful for testing and development

### **Sample Data Includes**
1. **Account Information**: Balance, currency, transaction history
2. **Monthly Spending**: Budget vs. actual spending data
3. **Realistic Values**: Simulates actual financial data

## Styling & Design

### **Color Scheme**
- **Primary Text**: `text-cymbal-text-primary`
- **Secondary Text**: `text-cymbal-text-secondary`
- **Borders**: `border-cymbal-border`
- **Backgrounds**: `bg-slate-900/70`, `bg-slate-800/50`

### **Interactive Elements**
- **Hover Effects**: `hover:bg-slate-800/50`
- **Transitions**: `transition-colors`
- **Focus States**: `focus:ring-2 focus:ring-cymbal-accent`

### **Responsive Design**
- **Grid Layout**: `grid-cols-1 lg:grid-cols-3`
- **Flexible Sizing**: `lg:col-span-2`, `lg:col-span-1`
- **Mobile First**: Stacks vertically on small screens

## Benefits

1. **Clean Transcripts**: JSON doesn't clutter chat history
2. **Structured View**: Data is organized and easy to read
3. **Persistent Display**: Information remains visible until dismissed
4. **Professional Appearance**: Tables look polished and organized
5. **Easy Management**: Simple controls for data lifecycle

## Future Enhancements

### **Potential Improvements**
- **Data Export**: Download JSON as CSV/Excel
- **Chart Integration**: Visualize numerical data
- **Search/Filter**: Find specific data entries
- **Data Persistence**: Save important data across sessions
- **Real-time Updates**: Live data refresh capabilities

### **Advanced Features**
- **Data Validation**: Schema validation for known data types
- **Custom Renderers**: Specialized views for financial data
- **Interactive Tables**: Sortable and filterable columns
- **Data Relationships**: Link related JSON entries

## Troubleshooting

### **Common Issues**
- **JSON not detected**: Check if response contains valid JSON syntax
- **Table not rendering**: Verify data structure is object or array
- **Layout issues**: Check screen size and responsive breakpoints
- **Performance**: Large JSON objects may affect rendering speed

### **Debug Information**
- Console logs show parsing attempts
- Failed JSON parsing is logged at debug level
- State changes can be monitored in React DevTools

## Integration Points

### **With Existing Systems**
- **Permission System**: Respects user data access rights
- **WebSocket Agent**: Seamlessly integrated with message flow
- **UI Components**: Consistent with existing design patterns
- **State Management**: Uses React hooks and context

The JSON table integration provides a professional, user-friendly way to display structured data from AI agents while maintaining the clean, organized appearance of the Cymbal Bank interface.

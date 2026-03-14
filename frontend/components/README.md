# Frontend Components

React components for the Ploutos financial sandbox UI.

## Core Components

### `FinancialSandbox.tsx` — Main Canvas

The heart of the app. Implements a drag-and-drop financial modeling canvas using **React Flow**.

**Features:**
- Drag-and-drop nodes and edges
- Auto-save to backend (1.5s debounce)
- Real-time AI agent feedback
- Node creation/deletion
- Group nodes for organization
- Custom edges with styling

**Usage:**
```tsx
<FinancialSandbox sessionId={sessionId} />
```

**Props:**
- `sessionId` — Session identifier for backend sync

---

### `Navbar.jsx` — Top Navigation

Sticky header with logo, navigation links, and user menu.

**Features:**
- Auth0 user menu integration
- Active route highlighting
- Mobile hamburger menu
- Responsive design

---

### `SummarySidebar.tsx` — Financial Summary

Right sidebar showing real-time financial metrics from AI agents.

**Displays:**
- Health score (0-100)
- Burn rate / runway
- Margin trends
- Flagged risks
- Quick recommendations

Updates via WebSocket or polling from `/sync` endpoint.

---

### `Sidebar.jsx` — Node Creation

Left sidebar for creating new financial nodes.

**Features:**
- Revenue node templates (product line, service, contract)
- Expense node templates (staff, overhead, operating costs)
- Drag-to-canvas node creation
- Preset configurations

---

## Node Components

Custom React Flow node types representing financial entities.

### `nodes/SourceNode.tsx` — Revenue Streams

Represents a revenue source (product line, service tier, etc.).

**Visuals:**
- Green accent color
- Revenue icon
- Interactive label/amount editing
- Connection points for edges

**Data:**
```typescript
{
  id: "rev-1",
  type: "sourceNode",
  data: {
    label: "Product Sales",
    amount: 50000,
    frequency: "monthly"
  }
}
```

---

### `nodes/ExpenseNode.tsx` — Expense Categories

Represents an expense (staff, overhead, operating costs, etc.).

**Visuals:**
- Red/orange accent color
- Expense icon
- Interactive label/amount editing
- Connection points for edges

**Data:**
```typescript
{
  id: "exp-1",
  type: "expenseNode",
  data: {
    label: "Payroll",
    amount: 30000,
    frequency: "monthly"
  }
}
```

---

### `nodes/GroupNode.tsx` — Organization

Logical grouping of related nodes (e.g., "Operating Costs" group).

**Features:**
- Collapsible child nodes
- Hierarchical organization
- Automatic sizing based on children

---

### `nodes/ResultNode.tsx` — AI Output

Displays AI agent analysis results (health score, recommendations, etc.).

**Visuals:**
- Read-only display
- Scrollable content area
- Color-coded status indicators
- Refresh trigger button

---

## Edge Components

Custom React Flow edges for visual data flow representation.

### `edges/GradientDirectCostEdge.tsx`

Custom edge with gradient styling showing direct cost attribution.

**Features:**
- Animated gradient based on flow amount
- Label showing allocation percentage
- Hover effects with flow details
- Smooth bezier curves

**Usage:**
```tsx
<GradientDirectCostEdge
  id="edge-1"
  source="rev-1"
  target="exp-1"
  data={{ percentage: 25 }}
/>
```

---

## Layout Components

### `ExpansionMap.jsx` — Location Map

Interactive map showing expansion location scores and viability data.

**Features:**
- Mapbox integration
- Location pins with Viability Score
- Clustering for multiple locations
- Hover tooltips with details
- Click-to-expand location profile

**Integration:**
Receives data from `POST /optimize` endpoint.

---

### `FootTrafficMap.jsx` — Foot Traffic Visualization

Heatmap showing foot traffic patterns across locations.

**Features:**
- Real-time BestTime API integration
- Time-of-day filtering
- Day-of-week patterns
- Venue comparison overlay

---

### `ChartComponent.jsx` — Financial Charts

Recharts-based visualization components for metrics.

**Charts:**
- Revenue trend (line chart)
- Expense breakdown (pie chart)
- Margin analysis (area chart)
- Burn rate projection (line chart)

---

## Specialized Components

### `ImportModal.tsx` — Data Import

Modal dialog for importing financial data from CSV/Google Sheets.

**Features:**
- File upload or paste-and-paste CSV
- Column mapping UI
- Data preview
- Validation before import
- Batch node creation

**Integration:**
Uses `POST /import/sheets` endpoint.

---

### `MetricCard.jsx` — Metric Display

Reusable card for displaying single metric with label.

**Props:**
- `label` — Metric name
- `value` — Current value
- `change` — % change from previous
- `highlight` — Color indication (good/warning/bad)

---

### `LocationCard.jsx` — Location Profile

Card displaying single location details.

**Shows:**
- Viability Score (0-100)
- Population + demographics
- Estimated rent
- Foot traffic signals
- Competitor density
- AI recommendation

**Interaction:**
Click to expand full analysis; right-click to pin on map.

---

## Hooks

### `useCanvasFinancials.ts`

Custom hook for local financial calculations.

**Provides:**
```typescript
{
  totalRevenue: number;
  totalExpenses: number;
  margin: number;
  burnRate: number;
  runway: number;
}
```

**Usage:**
```tsx
const financials = useCanvasFinancials(nodes);
```

---

### `useSession.ts`

State management for user session and canvas.

**Provides:**
```typescript
{
  sessionId: string;
  user: User;
  canvasState: CanvasState;
  aiReports: AiReports;
  syncStatus: 'idle' | 'loading' | 'error';
  updateCanvas: (nodes, edges) => void;
}
```

---

### `useFinancialCalculation.ts`

Math utilities for financial computations.

**Functions:**
- `calculateBurnRate(expenses, runway)`
- `calculateMargin(revenue, expenses)`
- `projectCashFlow(months)`
- `viabilityScore(metrics)` — Simplified client-side scorer

---

## Folder Structure

```
components/
├── FinancialSandbox.tsx        # Main canvas
├── Navbar.jsx                   # Top nav
├── Sidebar.jsx                  # Creation sidebar
├── SummarySidebar.tsx           # Metrics sidebar
├── ImportModal.tsx              # Import dialog
├── MetricCard.jsx               # Metric display
├── LocationCard.jsx             # Location profile
├── ChartComponent.jsx           # Chart wrapper
├── ExpansionMap.jsx             # Location map
├── FootTrafficMap.jsx           # Traffic heatmap
├── LayoutShell.jsx              # App layout wrapper
├── nodes/
│   ├── SourceNode.tsx           # Revenue node
│   ├── ExpenseNode.tsx          # Expense node
│   ├── GroupNode.tsx            # Group node
│   └── ResultNode.tsx           # AI result display
├── edges/
│   └── GradientDirectCostEdge.tsx  # Flow visualization
└── tabs/
    ├── InsightsTab.tsx          # AI insights panel
    └── OptimizationTab.tsx      # Recommendations panel
```

---

## Best Practices

1. **React Flow Integration:**
   - Use `useNodesState` / `useEdgesState` from reactflow
   - Memoize node/edge handlers with `useCallback`
   - Keep node/edge counts under 300 for performance

2. **API Calls:**
   - Use `/services/api.js` wrapper for all backend calls
   - Implement error boundaries
   - Show loading states to user

3. **Styling:**
   - Use Tailwind CSS classes
   - Follow CSS variable names in `globals.css` (--forest, --cream, etc.)
   - Prefer dark mode for contrast on data-heavy views

4. **Performance:**
   - Memoize components receiving canvas nodes/edges
   - Debounce expensive calculations (useCanvasFinancials already has 1.5s debounce)
   - Lazy-load maps (ExpansionMap, FootTrafficMap)

5. **Accessibility:**
   - Include `aria-*` attributes for screen readers
   - Use semantic HTML (button not div)
   - Ensure color contrast ratios meet WCAG 2.1

---

## Adding New Components

1. Create `.tsx` or `.jsx` file in `components/`
2. Include TypeScript interfaces if using data from API
3. Import only what's needed
4. Add JSDoc comments for complex logic
5. Export as named export
6. Update this README

---

## Common Patterns

**Fetching from backend:**
```tsx
import { syncCanvas } from '@/services/api';

export function MyComponent() {
  const [loading, setLoading] = useState(false);
  
  async function handleSync() {
    setLoading(true);
    const report = await syncCanvas(canvasState);
    setLoading(false);
  }
}
```

**React Flow node:**
```tsx
export function CustomNode({ data, isConnected }) {
  return (
    <div className="...">
      <Handle type="target" position={Position.Top} />
      <div>{data.label}</div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
```

---

## Debugging

- **React DevTools:** [Extension](https://react-devtools-tutorial.vercel.app/)
- **Network tab:** Check `/sync`, `/optimize` calls in F12 DevTools
- **Console:** Look for React warnings and prop type mismatches
- **React Flow debug mode:** Pass `debug` prop to `<ReactFlow>`

---

Last Updated: March 2026

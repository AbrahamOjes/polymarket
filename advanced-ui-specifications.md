# Advanced UI Specifications for Prediction Markets
## Research-Based Visual Design System

**Based on:** UX Framework + Advanced UI Research  
**Version:** 1.0  
**Focus:** Visual hierarchy, Gestalt principles, fintech patterns, data visualization

---

## Part 1: Visual Hierarchy Framework

### 1.1 Eye-Tracking Patterns

**Research Basis:** Nielsen Norman Group eye-tracking studies (2006-2024)

#### F-Pattern (Content-Heavy Pages)
**Application:** Market detail pages, research sections

**Layout Structure:**
```
┌─────────────────────────────────┐
│ ████████████████████████        │ ← Primary scan (top)
│ ████                            │ ← Secondary scan
│ ████                            │
│ ████                            │ ← Tertiary scan
│ ████                            │
└─────────────────────────────────┘
```

**Implementation:**
- **Top horizontal:** Market question + probability (most important)
- **Left vertical:** Key data points, timestamps, categories
- **Content area:** Details, intelligence, research links

**Design Rules:**
1. Place critical CTAs within first 2 horizontal scans
2. Left-align key information for vertical scanning
3. Use visual breaks every 3-4 lines to reset attention

---

#### Z-Pattern (Minimal Content Pages)
**Application:** Homepage, onboarding, simple market cards

**Layout Structure:**
```
┌─────────────────────────────────┐
│ ████████████ → → → → ████████   │ ← Top scan
│         ↓                       │
│       ↓                         │ ← Diagonal
│     ↓                           │
│ ████████████ → → → → ████████   │ ← Bottom scan
└─────────────────────────────────┘
```

**Implementation:**
- **Top-left:** Logo/branding
- **Top-right:** Balance/account
- **Bottom-left:** Secondary info
- **Bottom-right:** Primary CTA

**Design Rules:**
1. Maximum 4 focal points along Z-path
2. Diagonal should be visually clear (not cluttered)
3. Primary action always bottom-right

---

### 1.2 Visual Weight Hierarchy

**Research Basis:** Gestalt psychology + typography principles

#### Size Hierarchy (1.618 Golden Ratio)
```
Display:    48px  (3.0x base)  - Hero numbers, probabilities
H1:         32px  (2.0x base)  - Market questions
H2:         24px  (1.5x base)  - Section headers
H3:         20px  (1.25x base) - Subsections
Body:       16px  (1.0x base)  - Primary content
Small:      14px  (0.875x)     - Secondary info
Caption:    12px  (0.75x)      - Metadata, timestamps
```

**Application Rules:**
- **3:1 ratio minimum** between headers and body for clarity
- **Never use more than 3 size levels** on single screen (cognitive load)
- **Probability displays:** 48-72px (dominant visual element)

---

#### Color Weight System

**Research Basis:** Color psychology in fintech (Inordo, 2024)

**Primary Hierarchy:**
```
Level 1 (Highest Attention):
- Probability percentages: #3fb950 (success green) or #f0883e (warning orange)
- Primary CTAs: Gradient overlays
- Error states: #f85149 (high contrast red)

Level 2 (Secondary Attention):
- Market categories: #3b82f6 (info blue)
- Active states: Lighter variants of primary
- Badges/labels: Muted brand colors

Level 3 (Tertiary):
- Body text: #e7e9ea (14:1 contrast)
- Borders: #2d333b (subtle separation)
- Disabled states: #8b949e (low emphasis)
```

**Fintech Color Psychology:**
- **Blue (#3b82f6):** Trust, stability, security (40% of fintech apps)
- **Green (#3fb950):** Growth, positive outcomes, success
- **Orange (#f0883e):** Caution, attention, moderate risk
- **Red (#f85149):** Danger, loss, critical actions

**Application Rules:**
1. Use green for probabilities >60% (likely outcomes)
2. Use orange for probabilities 40-60% (uncertain)
3. Use gray for probabilities <40% (unlikely)
4. Never use red for market data (only errors/warnings)

---

### 1.3 Contrast & Accessibility

**Research Basis:** WCAG 2.1 + Material Design contrast ratios

#### Contrast Ratios (Minimum Standards)
```
Text Contrast:
- Large text (≥18px): 3:1 minimum, 4.5:1 target
- Body text (16px):   4.5:1 minimum, 7:1 target
- Small text (<16px): 7:1 minimum, 10:1 target

UI Element Contrast:
- Buttons/CTAs:       3:1 minimum against background
- Form inputs:        3:1 border contrast
- Focus indicators:   3:1 minimum, 4.5:1 target
- Icons:              3:1 minimum
```

**Implementation:**
```css
/* Primary text on dark background */
color: #e7e9ea;  /* 14:1 contrast ratio */

/* Secondary text */
color: #8b949e;  /* 7:1 contrast ratio */

/* Success green (accessible) */
color: #3fb950;  /* 4.5:1 on #0f1419 background */

/* Button contrast */
background: #3fb950;
color: #0f1419;  /* 8:1 contrast */
```

---

## Part 2: Gestalt Principles Application

### 2.1 Proximity (Grouping Related Elements)

**Research Basis:** Gestalt psychology - elements close together are perceived as related

#### Spacing Rules
```
Related elements:     8-16px spacing
Unrelated elements:   24-48px spacing
Section breaks:       48-64px spacing
```

**Market Card Example:**
```
┌────────────────────────────────┐
│ ⚽ SPORTS                       │ ← Category (8px below)
│                                │
│ Will Arsenal win?              │ ← Question (16px below)
│                                │
│ ┌──────┐      ┌──────┐        │
│ │ YES  │      │  NO  │        │ ← Outcomes (8px apart)
│ │ 71%  │      │ 29%  │        │
│ └──────┘      └──────┘        │
│                                │ ← 24px spacing
│ 💰 $2.4M • 3,340 traders       │ ← Metadata (grouped)
└────────────────────────────────┘
```

**Application Rules:**
1. Group related data within 8-16px
2. Separate unrelated sections with 24-48px
3. Use consistent spacing throughout (8px grid system)

---

### 2.2 Similarity (Visual Consistency)

**Research Basis:** Similar elements are perceived as belonging to same group

#### Component Consistency
```
All CTAs:
- Same border-radius (8px)
- Same padding (16px vertical, 24px horizontal)
- Same font-weight (600)
- Same transition timing (200ms)

All Cards:
- Same elevation (2dp resting)
- Same border-radius (12px)
- Same padding (24px)
- Same hover state (4dp elevation)

All Input Fields:
- Same height (48px)
- Same border-radius (8px)
- Same border-width (2px)
- Same focus state (blue outline)
```

**Benefits:**
- Users learn patterns once, apply everywhere
- Reduces cognitive load by 30-40% (Nielsen research)
- Builds trust through consistency

---

### 2.3 Closure (Completing Shapes)

**Research Basis:** Users mentally complete incomplete shapes

#### Application in UI
```
Progress Indicators:
┌─────────────────────────┐
│ ████████░░░░░░░░░░░░░░░ │ 35% complete
└─────────────────────────┘
Users perceive full bar even though incomplete

Loading States:
⟳ (Circular spinner - users complete the circle mentally)

Probability Arcs:
◠ (Semi-circle showing 71% - users see full circle)
```

**Design Rules:**
1. Use incomplete circles for progress (users complete mentally)
2. Dotted borders suggest continuation
3. Truncated text with "..." implies more content

---

### 2.4 Figure/Ground (Foreground vs Background)

**Research Basis:** Users distinguish foreground elements from background

#### Elevation System (Material Design)
```
Background:     0dp  (#0f1419)
Surface:        1dp  (#1a1f29)
Cards:          2dp  (#1a1f29 + shadow)
Raised cards:   4dp  (hover state)
Modals:         8dp  (overlay content)
Tooltips:       16dp (highest priority)
```

**Shadow Specifications:**
```css
/* 2dp elevation (resting cards) */
box-shadow: 0 2px 4px rgba(0,0,0,0.2),
            0 1px 2px rgba(0,0,0,0.12);

/* 4dp elevation (hover/active) */
box-shadow: 0 4px 8px rgba(0,0,0,0.24),
            0 2px 4px rgba(0,0,0,0.16);

/* 8dp elevation (modals) */
box-shadow: 0 8px 16px rgba(0,0,0,0.28),
            0 4px 8px rgba(0,0,0,0.20);
```

**Application Rules:**
1. Interactive elements have higher elevation
2. Elevation increases on hover/focus
3. Maximum 3 elevation levels per screen
4. Modals always highest elevation (8-16dp)

---

### 2.5 Continuity (Following Paths)

**Research Basis:** Eyes follow continuous lines and curves

#### Visual Flow Design
```
Card Grid Layout:
┌─────┐ ┌─────┐ ┌─────┐
│  1  │ │  2  │ │  3  │ ← Horizontal flow
└─────┘ └─────┘ └─────┘
   ↓       ↓       ↓
┌─────┐ ┌─────┐ ┌─────┐
│  4  │ │  5  │ │  6  │ ← Continues down
└─────┘ └─────┘ └─────┘
```

**Application:**
- Align elements to create visual paths
- Use connecting lines for related data
- Maintain grid alignment for flow
- Break alignment intentionally for emphasis

---

## Part 3: Atomic Design System

### 3.1 Atoms (Basic Elements)

**Research Basis:** Brad Frost's Atomic Design (2013)

#### Typography Atoms
```css
/* Display Text */
.text-display {
  font-size: 48px;
  line-height: 56px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* Probability Display */
.probability {
  font-size: 72px;
  line-height: 80px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* Body Text */
.text-body {
  font-size: 16px;
  line-height: 24px;
  font-weight: 400;
  letter-spacing: 0;
}
```

#### Color Atoms
```css
/* Primary Colors */
--color-success: #3fb950;
--color-warning: #f0883e;
--color-error: #f85149;
--color-info: #3b82f6;

/* Neutral Colors */
--color-bg: #0f1419;
--color-surface: #1a1f29;
--color-border: #2d333b;
--color-text-primary: #e7e9ea;
--color-text-secondary: #8b949e;
```

#### Spacing Atoms
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
--space-3xl: 64px;
```

---

### 3.2 Molecules (Simple Components)

#### Button Molecule
```html
<button class="btn btn-primary">
  <span class="btn-icon">✓</span>
  <span class="btn-text">Predict YES</span>
</button>
```

```css
.btn {
  /* Atomic properties */
  padding: var(--space-md) var(--space-lg);
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  
  /* Interaction */
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #3fb950 0%, #2ea043 100%);
  color: #0f1419;
  box-shadow: 0 2px 4px rgba(63, 185, 80, 0.3);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(63, 185, 80, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}
```

---

#### Input Molecule
```html
<div class="input-group">
  <label class="input-label">Amount</label>
  <div class="input-wrapper">
    <span class="input-prefix">$</span>
    <input type="number" class="input-field" placeholder="10.00">
  </div>
  <span class="input-hint">Minimum $5</span>
</div>
```

```css
.input-field {
  height: 48px;
  padding: 0 var(--space-md);
  border: 2px solid var(--color-border);
  border-radius: 8px;
  background: var(--color-surface);
  color: var(--color-text-primary);
  font-size: 16px;
  transition: border-color 200ms;
}

.input-field:focus {
  outline: none;
  border-color: var(--color-info);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}
```

---

### 3.3 Organisms (Complex Components)

#### Market Card Organism
```html
<article class="market-card">
  <!-- Header -->
  <header class="market-header">
    <span class="market-category">⚽ SPORTS</span>
    <span class="market-status">LIVE</span>
  </header>
  
  <!-- Question -->
  <h2 class="market-question">Will Arsenal win vs Chelsea?</h2>
  
  <!-- Outcomes -->
  <div class="market-outcomes">
    <button class="outcome outcome-yes">
      <span class="outcome-label">YES</span>
      <span class="outcome-probability">71%</span>
    </button>
    <button class="outcome outcome-no">
      <span class="outcome-label">NO</span>
      <span class="outcome-probability">29%</span>
    </button>
  </div>
  
  <!-- Intelligence (Progressive Disclosure) -->
  <details class="market-intelligence">
    <summary>Why 71%?</summary>
    <ul class="intelligence-list">
      <li>✓ Arsenal ranked 2nd in league</li>
      <li>✓ Strong away record (8-2-1)</li>
      <li>✓ Chelsea missing key players</li>
    </ul>
  </details>
  
  <!-- Metadata -->
  <footer class="market-footer">
    <span>💰 $2.4M volume</span>
    <span>👥 3,340 traders</span>
  </footer>
</article>
```

```css
.market-card {
  /* Atomic foundation */
  padding: var(--space-lg);
  border-radius: 12px;
  background: var(--color-surface);
  
  /* Elevation */
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
  
  /* Interaction */
  transition: all 200ms;
  cursor: pointer;
}

.market-card:hover {
  box-shadow: 0 4px 8px rgba(0,0,0,0.24);
  transform: translateY(-2px);
}

/* Probability display (dominant element) */
.outcome-probability {
  font-size: 48px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
```

---

## Part 4: Data Visualization Patterns

### 4.1 Probability Display

**Research Basis:** Financial data visualization best practices

#### Primary Display (Large, Dominant)
```
┌──────────────────┐
│                  │
│       71%        │ ← 72px, bold, green
│   likely YES     │ ← 16px, secondary text
│                  │
└──────────────────┘
```

**Design Specifications:**
- **Size:** 72px (4.5x base) - commands immediate attention
- **Weight:** 700 (bold) - visual dominance
- **Color:** Semantic (green >60%, orange 40-60%, gray <40%)
- **Spacing:** 48px padding around - breathing room

---

#### Secondary Display (Compact)
```
YES 71%  |  NO 29%
```

**Design Specifications:**
- **Size:** 24px (1.5x base)
- **Weight:** 600 (semibold)
- **Spacing:** 16px between outcomes
- **Alignment:** Horizontal, equal width

---

### 4.2 Trend Visualization

**Research Basis:** Candlestick charts + time series best practices

#### Sparkline (Micro Chart)
```
Price trend: ▁▂▃▅▆▇█▇▆
```

**Specifications:**
- **Height:** 32px
- **Width:** 120px
- **Line weight:** 2px
- **Color:** Gradient (red to green based on direction)
- **No axes:** Simplified for glanceability

---

#### Full Chart (Detailed View)
```
┌────────────────────────────────┐
│ 100%─                      ●   │
│  75%─              ●───●       │
│  50%─      ●───●               │
│  25%─  ●                       │
│   0%─┴───┴───┴───┴───┴───┴───┘│
│     Mon Tue Wed Thu Fri Sat Sun│
└────────────────────────────────┘
```

**Specifications:**
- **Height:** 240px
- **Annotations:** Key events marked
- **Interaction:** Hover shows exact values
- **Grid:** Subtle (10% opacity)
- **Axes:** Labeled clearly

---

### 4.3 Volume Indicators

**Research Basis:** Trading interface patterns

#### Bar Representation
```
Volume: ████████░░ $2.4M
```

**Specifications:**
- **Height:** 8px
- **Max width:** 200px
- **Color:** Gradient based on magnitude
- **Label:** Always show absolute value

---

## Part 5: Micro-Interactions

### 5.1 Animation Principles

**Research Basis:** 12 Principles of UX Animation (UXinMotion.net)

#### Easing Functions
```css
/* Natural movement (most common) */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* Entering screen */
--ease-decelerate: cubic-bezier(0, 0, 0.2, 1);

/* Exiting screen */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);

/* Sharp movement */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
```

#### Duration Standards
```
Micro-interactions:  100-200ms  (button hover, focus)
Small movements:     200-300ms  (card expand, tooltip)
Medium transitions:  300-400ms  (page transitions)
Large animations:    400-500ms  (modal open/close)
```

**Rule:** Never exceed 500ms - feels sluggish

---

### 5.2 Button States

```css
/* Resting */
.btn {
  transform: scale(1);
  opacity: 1;
}

/* Hover */
.btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.24);
  transition: all 200ms var(--ease-standard);
}

/* Active (pressed) */
.btn:active {
  transform: translateY(0) scale(0.98);
  transition: all 100ms var(--ease-sharp);
}

/* Focus (keyboard) */
.btn:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Loading */
.btn.loading {
  pointer-events: none;
  opacity: 0.6;
}

.btn.loading::after {
  content: "";
  animation: spin 1s linear infinite;
}
```

---

### 5.3 Card Interactions

```css
.market-card {
  transition: all 200ms var(--ease-standard);
}

/* Hover - elevate */
.market-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0,0,0,0.28);
}

/* Active - press down */
.market-card:active {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.24);
}

/* Expand (progressive disclosure) */
.market-card[aria-expanded="true"] {
  /* Smooth height transition */
  max-height: 600px;
  transition: max-height 300ms var(--ease-decelerate);
}
```

---

## Part 6: Mobile-Specific UI Patterns

### 6.1 Touch Target Sizing

**Research Basis:** Apple HIG + Material Design guidelines

```
Minimum:     44×44px (WCAG AAA)
Recommended: 48×48px (Material Design)
Optimal:     56×56px (primary actions)
Spacing:     8px minimum between targets
```

**Implementation:**
```css
/* Primary CTA (mobile) */
.btn-primary-mobile {
  min-height: 56px;
  min-width: 56px;
  padding: 16px 24px;
  font-size: 18px;
}

/* Touch target expansion (invisible) */
.btn::after {
  content: "";
  position: absolute;
  inset: -8px; /* Expands hit area */
}
```

---

### 6.2 Bottom Sheet Pattern

**Research Basis:** Mobile UI best practices

```
┌─────────────────────────────┐
│                             │
│  Market Content (scrollable)│
│                             │
│                             │
├─────────────────────────────┤
│ ═══ (drag handle)           │ ← Swipeable
│                             │
│ YOUR PREDICTION             │
│ Arsenal to Win              │
│                             │
│ ┌─────────────────────────┐│
│ │   MARKET SAYS 71%       ││
│ └─────────────────────────┘│
│                             │
│ [Amount Selection]          │
│ [Confirm Button]            │
└─────────────────────────────┘
```

**Specifications:**
```css
.bottom-sheet {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: var(--color-surface);
  border-radius: 24px 24px 0 0;
  padding: 24px;
  
  /* Elevation */
  box-shadow: 0 -4px 16px rgba(0,0,0,0.3);
  
  /* Animation */
  transform: translateY(100%);
  transition: transform 300ms var(--ease-decelerate);
}

.bottom-sheet.open {
  transform: translateY(0);
}

/* Drag handle */
.bottom-sheet::before {
  content: "";
  width: 40px;
  height: 4px;
  background: var(--color-border);
  border-radius: 2px;
  position: absolute;
  top: 12px;
  left: 50%;
  transform: translateX(-50%);
}
```

---

### 6.3 Swipe Gestures

**Implementation:**
```javascript
// Swipe to dismiss
let startX, startY;

element.addEventListener('touchstart', (e) => {
  startX = e.touches[0].clientX;
  startY = e.touches[0].clientY;
});

element.addEventListener('touchmove', (e) => {
  const deltaX = e.touches[0].clientX - startX;
  const deltaY = e.touches[0].clientY - startY;
  
  // Horizontal swipe (dismiss card)
  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    element.style.transform = `translateX(${deltaX}px)`;
    element.style.opacity = 1 - Math.abs(deltaX) / 300;
  }
});

element.addEventListener('touchend', (e) => {
  const deltaX = e.changedTouches[0].clientX - startX;
  
  // Threshold: 100px
  if (Math.abs(deltaX) > 100) {
    // Dismiss
    element.style.transform = `translateX(${deltaX > 0 ? '100%' : '-100%'})`;
    element.style.opacity = 0;
  } else {
    // Reset
    element.style.transform = '';
    element.style.opacity = 1;
  }
});
```

---

## Part 7: Implementation Checklist

### Visual Hierarchy
- [ ] F-pattern layout for content pages
- [ ] Z-pattern layout for landing pages
- [ ] 3:1 size ratio between headers and body
- [ ] Probability displays 48-72px (dominant)
- [ ] Maximum 3 size levels per screen

### Gestalt Principles
- [ ] 8-16px spacing for related elements
- [ ] 24-48px spacing for unrelated elements
- [ ] Consistent component styling (similarity)
- [ ] 2dp elevation for cards (figure/ground)
- [ ] Grid alignment for visual flow (continuity)

### Color & Contrast
- [ ] 4.5:1 contrast minimum for text
- [ ] 3:1 contrast minimum for UI elements
- [ ] Semantic colors (green >60%, orange 40-60%)
- [ ] Color-independent information (accessibility)

### Atomic Design
- [ ] Reusable atoms (typography, colors, spacing)
- [ ] Functional molecules (buttons, inputs)
- [ ] Complex organisms (market cards, forms)
- [ ] Consistent component library

### Micro-Interactions
- [ ] 200ms transitions for most interactions
- [ ] Hover states elevate elements
- [ ] Focus states have 3px outline
- [ ] Loading states disable interaction
- [ ] Success/error feedback animations

### Mobile Optimization
- [ ] 48×48px minimum touch targets
- [ ] Bottom sheet for primary actions
- [ ] Swipe gestures for navigation
- [ ] Thumb-zone optimization
- [ ] Pull-to-refresh support

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Next Review:** Post-implementation

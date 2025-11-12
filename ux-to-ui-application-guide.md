# UX Framework to UI Implementation Guide
## Applying Research to Visual Design

**Purpose:** Bridge UX principles with concrete UI specifications  
**Audience:** Designers implementing the research-backed system

---

## Quick Reference: UX Principle → UI Implementation

### 1. Cognitive Load Reduction → Visual Hierarchy

**UX Principle:** Limit to 4 information chunks per screen

**UI Implementation:**
```
Market Card (4 chunks):
1. Market Question     → H1, 32px, top position
2. Probability         → 72px, center, dominant color
3. Your Position       → 16px, secondary text
4. Action Button       → 56×56px, bottom-right (Z-pattern)
```

**Visual Weight Distribution:**
- **70% attention:** Probability (size + color + position)
- **20% attention:** Market question (size + hierarchy)
- **10% attention:** Metadata (small, muted)

---

### 2. Choice Architecture → Card Layout

**UX Principle:** Show 3-5 markets maximum (Iyengar's research)

**UI Implementation:**
```css
.market-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 24px;
  max-width: 1200px;
}

/* Limit visible cards */
.market-grid > .market-card:nth-child(n+6) {
  display: none; /* Hide beyond 5 cards */
}
```

**Visual Cues for "More":**
- "View 45 more markets" button
- Subtle fade at bottom of visible cards
- Scroll indicator if applicable

---

### 3. Progressive Disclosure → Expandable Sections

**UX Principle:** 3-tier information disclosure

**UI Implementation:**

**Tier 1 (Always Visible):**
```html
<div class="market-card-compact">
  <h2>Market Question</h2>
  <div class="probability-large">71%</div>
  <button class="cta-primary">Predict</button>
</div>
```

**Tier 2 (Expandable):**
```html
<details class="market-intelligence">
  <summary>
    <span>Why 71%?</span>
    <svg class="chevron">...</svg>
  </summary>
  <div class="intelligence-content">
    <!-- Market intelligence here -->
  </div>
</details>
```

**CSS Animation:**
```css
details[open] .intelligence-content {
  animation: slideDown 300ms ease-out;
  max-height: 400px;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 400px;
  }
}
```

---

### 4. Loss Aversion → Visual Emphasis

**UX Principle:** Show loss before gain (2.5x emotional impact)

**UI Implementation:**
```html
<div class="trade-preview">
  <!-- Loss shown first, larger -->
  <div class="risk-display">
    <span class="label">You Risk</span>
    <span class="amount-large">$25.00</span>
  </div>
  
  <!-- Gain shown second, smaller -->
  <div class="reward-display">
    <span class="label">Potential Win</span>
    <span class="amount-medium">+$10.21</span>
  </div>
</div>
```

**Visual Hierarchy:**
- Risk: 32px, bold, top position
- Reward: 24px, regular, below risk
- Color: Both neutral (not green for reward - avoid manipulation)

---

### 5. Social Proof → Visual Indicators

**UX Principle:** 88% trust peer recommendations

**UI Implementation:**
```html
<div class="social-proof">
  <div class="trader-count">
    <svg class="icon-users">👥</svg>
    <span class="count-large">3,340</span>
    <span class="label">forecasters</span>
  </div>
  
  <div class="consensus">
    <div class="consensus-bar">
      <div class="consensus-fill" style="width: 71%"></div>
    </div>
    <span class="consensus-text">71% predict YES</span>
  </div>
</div>
```

**Visual Design:**
- Icon: 24×24px, muted color
- Count: 24px, bold, prominent
- Bar: 8px height, full width, gradient fill

---

### 6. Trust Building → Elevation & Shadow

**UX Principle:** Perceived competence through professional design

**UI Implementation:**
```css
/* Resting state - professional, stable */
.market-card {
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    0 1px 2px rgba(0,0,0,0.12);
}

/* Hover state - responsive, interactive */
.market-card:hover {
  box-shadow: 
    0 4px 8px rgba(0,0,0,0.24),
    0 2px 4px rgba(0,0,0,0.16);
  transform: translateY(-2px);
  transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
}

/* Active state - tactile feedback */
.market-card:active {
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2);
  transform: translateY(0);
}
```

**Psychology:** Smooth, predictable animations = competent, trustworthy platform

---

### 7. Accessibility (WCAG 2.1 AA) → Color Contrast

**UX Principle:** 4.5:1 minimum contrast for text

**UI Implementation:**
```css
/* Passing combinations */
:root {
  --bg-dark: #0f1419;
  --text-primary: #e7e9ea;    /* 14:1 ratio ✓ */
  --text-secondary: #8b949e;  /* 7:1 ratio ✓ */
  --success: #3fb950;         /* 4.5:1 ratio ✓ */
  --warning: #f0883e;         /* 4.5:1 ratio ✓ */
}

/* Failing combinations (avoid) */
.bad-contrast {
  background: #0f1419;
  color: #3d444d;  /* 2.8:1 ratio ✗ */
}
```

**Testing Tool:**
```javascript
// Check contrast ratio
function getContrastRatio(color1, color2) {
  const l1 = getLuminance(color1);
  const l2 = getLuminance(color2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// Must return ≥4.5 for text
```

---

### 8. Mobile-First → Touch Targets

**UX Principle:** 44×44px minimum (WCAG AAA)

**UI Implementation:**
```css
/* Mobile primary button */
.btn-mobile {
  min-height: 56px;
  min-width: 56px;
  padding: 16px 24px;
  font-size: 18px;
  
  /* Expand hit area invisibly */
  position: relative;
}

.btn-mobile::after {
  content: "";
  position: absolute;
  inset: -8px;  /* Adds 16px to all sides */
}
```

**Visual Result:**
- Button appears 56×56px
- Actual touch target: 72×72px
- Prevents mis-taps, reduces frustration

---

## Complete Component Example: Market Card

### UX Requirements Applied
1. ✓ Cognitive load: 4 chunks (question, probability, metadata, CTA)
2. ✓ Progressive disclosure: Expandable intelligence section
3. ✓ Social proof: Trader count visible
4. ✓ Trust: Professional elevation and shadows
5. ✓ Accessibility: 4.5:1 contrast ratios
6. ✓ Mobile: 48×48px touch targets

### Complete Implementation

```html
<article class="market-card" role="article" aria-labelledby="market-123">
  <!-- Header: Category + Status -->
  <header class="market-header">
    <span class="category" aria-label="Category">
      <svg class="icon">⚽</svg>
      <span>SPORTS</span>
    </span>
    <span class="status status-live" aria-label="Status">LIVE</span>
  </header>
  
  <!-- Question (Chunk 1) -->
  <h2 id="market-123" class="market-question">
    Will Arsenal win vs Chelsea?
  </h2>
  
  <!-- Probability (Chunk 2) - Dominant element -->
  <div class="probability-display" aria-label="Current probability">
    <div class="probability-value" data-value="71">71%</div>
    <div class="probability-label">likely YES</div>
  </div>
  
  <!-- Progressive Disclosure: Intelligence -->
  <details class="market-intelligence">
    <summary>
      <span>Why 71%?</span>
      <svg class="chevron" aria-hidden="true">
        <use href="#icon-chevron-down"></use>
      </svg>
    </summary>
    <ul class="intelligence-list">
      <li>
        <svg class="icon-check">✓</svg>
        <span>Arsenal ranked 2nd in league</span>
      </li>
      <li>
        <svg class="icon-check">✓</svg>
        <span>Strong away record (8-2-1)</span>
      </li>
      <li>
        <svg class="icon-check">✓</svg>
        <span>Chelsea missing key players</span>
      </li>
    </ul>
  </details>
  
  <!-- Social Proof (Chunk 3) -->
  <footer class="market-footer">
    <div class="metadata">
      <span class="volume" aria-label="Trading volume">
        <svg class="icon">💰</svg>
        <span>$2.4M</span>
      </span>
      <span class="traders" aria-label="Number of traders">
        <svg class="icon">👥</svg>
        <span>3,340 traders</span>
      </span>
    </div>
    
    <!-- CTA (Chunk 4) -->
    <button 
      class="btn-predict" 
      aria-label="Make prediction on this market"
    >
      Predict
    </button>
  </footer>
</article>
```

### Complete CSS

```css
.market-card {
  /* Layout */
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  padding: var(--space-lg);
  
  /* Visual */
  background: var(--color-surface);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  
  /* Elevation (Trust signal) */
  box-shadow: 
    0 2px 4px rgba(0,0,0,0.2),
    0 1px 2px rgba(0,0,0,0.12);
  
  /* Interaction */
  cursor: pointer;
  transition: all 200ms var(--ease-standard);
}

/* Hover: Elevate (Competence signal) */
.market-card:hover {
  transform: translateY(-4px);
  box-shadow: 
    0 8px 16px rgba(0,0,0,0.28),
    0 4px 8px rgba(0,0,0,0.20);
}

/* Focus: Accessibility */
.market-card:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Header */
.market-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-sm);
}

.category {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.status-live {
  padding: 4px 8px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

/* Question (Chunk 1) */
.market-question {
  font-size: 24px;
  font-weight: 600;
  line-height: 1.3;
  color: var(--color-text-primary);
  margin: 0;
}

/* Probability (Chunk 2) - DOMINANT */
.probability-display {
  text-align: center;
  padding: var(--space-lg) 0;
}

.probability-value {
  font-size: 72px;
  font-weight: 700;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  
  /* Semantic color based on value */
  color: var(--color-success);  /* >60% */
}

.probability-value[data-value^="5"],
.probability-value[data-value^="4"] {
  color: var(--color-warning);  /* 40-60% */
}

.probability-value[data-value^="3"],
.probability-value[data-value^="2"],
.probability-value[data-value^="1"],
.probability-value[data-value^="0"] {
  color: var(--color-text-secondary);  /* <40% */
}

.probability-label {
  font-size: 16px;
  color: var(--color-text-secondary);
  margin-top: var(--space-xs);
}

/* Progressive Disclosure */
.market-intelligence {
  border-top: 1px solid var(--color-border);
  padding-top: var(--space-md);
}

.market-intelligence summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-info);
  padding: var(--space-sm);
  border-radius: 6px;
  transition: background 200ms;
}

.market-intelligence summary:hover {
  background: rgba(59, 130, 246, 0.1);
}

.market-intelligence[open] .chevron {
  transform: rotate(180deg);
}

.intelligence-list {
  list-style: none;
  padding: var(--space-md) 0 0 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  
  /* Animation */
  animation: slideDown 300ms ease-out;
}

.intelligence-list li {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* Social Proof (Chunk 3) */
.market-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}

.metadata {
  display: flex;
  gap: var(--space-md);
  font-size: 14px;
  color: var(--color-text-secondary);
}

.metadata > span {
  display: flex;
  align-items: center;
  gap: var(--space-xs);
}

/* CTA (Chunk 4) */
.btn-predict {
  /* Size (Mobile-optimized) */
  min-height: 48px;
  padding: 12px 24px;
  
  /* Visual */
  background: linear-gradient(135deg, #3fb950 0%, #2ea043 100%);
  color: #0f1419;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  
  /* Interaction */
  cursor: pointer;
  transition: all 200ms var(--ease-standard);
  
  /* Accessibility: Expand hit area */
  position: relative;
}

.btn-predict::after {
  content: "";
  position: absolute;
  inset: -8px;
}

.btn-predict:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(63, 185, 80, 0.4);
}

.btn-predict:active {
  transform: translateY(0);
}

.btn-predict:focus-visible {
  outline: 3px solid var(--color-info);
  outline-offset: 2px;
}

/* Animations */
@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 640px) {
  .market-card {
    padding: var(--space-md);
  }
  
  .probability-value {
    font-size: 56px;  /* Slightly smaller on mobile */
  }
  
  .market-footer {
    flex-direction: column;
    align-items: stretch;
  }
  
  .btn-predict {
    width: 100%;
    min-height: 56px;  /* Larger on mobile */
  }
}
```

---

## Design Tokens Reference

### Spacing (8px Grid)
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;
  --space-3xl: 64px;
}
```

### Typography
```css
:root {
  --font-size-xs: 12px;
  --font-size-sm: 14px;
  --font-size-base: 16px;
  --font-size-lg: 20px;
  --font-size-xl: 24px;
  --font-size-2xl: 32px;
  --font-size-3xl: 48px;
  --font-size-4xl: 72px;
  
  --font-weight-normal: 400;
  --font-weight-medium: 500;
  --font-weight-semibold: 600;
  --font-weight-bold: 700;
}
```

### Colors
```css
:root {
  /* Semantic */
  --color-success: #3fb950;
  --color-warning: #f0883e;
  --color-error: #f85149;
  --color-info: #3b82f6;
  
  /* Neutral */
  --color-bg: #0f1419;
  --color-surface: #1a1f29;
  --color-border: #2d333b;
  --color-text-primary: #e7e9ea;
  --color-text-secondary: #8b949e;
}
```

### Transitions
```css
:root {
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-decelerate: cubic-bezier(0, 0, 0.2, 1);
  --ease-accelerate: cubic-bezier(0.4, 0, 1, 1);
  --ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
  
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;
}
```

---

## Testing Checklist

### Visual Hierarchy
- [ ] Probability is largest element (72px)
- [ ] Question is second largest (24px)
- [ ] Metadata is smallest (14px)
- [ ] Clear visual flow (Z or F pattern)

### Gestalt Principles
- [ ] Related elements grouped (8-16px spacing)
- [ ] Unrelated elements separated (24-48px)
- [ ] Consistent styling across similar elements
- [ ] Clear figure/ground separation (elevation)

### Accessibility
- [ ] 4.5:1 contrast for all text
- [ ] 48×48px minimum touch targets
- [ ] Keyboard navigable
- [ ] Screen reader tested
- [ ] Focus indicators visible (3px outline)

### Micro-Interactions
- [ ] Hover states animate smoothly (200ms)
- [ ] Active states provide feedback
- [ ] Loading states disable interaction
- [ ] Transitions use proper easing

### Performance
- [ ] No layout shifts (CLS < 0.1)
- [ ] Fast interaction response (<100ms)
- [ ] Smooth 60fps animations
- [ ] Optimized shadows (GPU-accelerated)

---

**Document Version:** 1.0  
**Last Updated:** November 2024  
**Purpose:** Bridge UX research with UI implementation

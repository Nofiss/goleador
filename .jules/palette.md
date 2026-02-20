## 2025-05-27 - [Standardized EmptyState Component]
**Learning:** Manual implementations of empty states lead to visual inconsistency and higher maintenance overhead. Unifying these into a single, animated `EmptyState` component with a clear Title-Description-Action hierarchy not only improves visual polish but also makes the application's "no-data" states feel intentional and helpful rather than like an error or a blank page.
**Action:** Use the standardized `EmptyState` component (`src/frontend/src/components/ui/empty-state.tsx`) for all features. Ensure a relevant icon, a friendly title, and a clear call-to-action (where applicable) are provided to maintain the "Palette" UX standard.

## 2025-05-28 - [Interactive Feedback & Global Consistency]
**Learning:** Micro-interactions (like a subtle rotation on a swap button) combined with global visual consistency (standardized empty states) significantly increase the perceived quality of the application. Standardizing empty states across different views (Matches, Standings, Players) makes the app feel cohesive, while small animations provide immediate, delightful feedback that makes the interface feel alive.
**Action:** Always look for opportunities to replace manual "no-data" states with the `EmptyState` component. When adding icon-only buttons, include a native `title` for tooltips and consider a simple `framer-motion` animation for hover/active states.

## 2025-06-02 - [Icon-Only Button Accessibility and Interaction Polish]
**Learning:** Icon-only buttons often suffer from missing accessibility labels, especially for primary navigation ("Back") or destructive actions ("Delete"). Unifying the "Swap" interaction pattern with `framer-motion` animations across different forms (Match Create vs. Match Result) while simultaneously fixing ARIA labels creates a more inclusive and professional experience.
**Action:** Audit all icon-only buttons for `aria-label`. Use the `asChild` pattern with Radix buttons to ensure labels propagate correctly to links. Consistently apply the `ArrowLeftRight` rotation animation to all swap-like interactions for visual delight.

## 2025-06-05 - [Consistent Interaction & Informational Tooltips]
**Learning:** Standardizing asynchronous button states (using a `loading` prop) and providing discoverable tooltips for informational icons significantly reduces cognitive load. Users benefit from immediate, predictable feedback during actions and clear context for visual symbols (like status badges or card usage icons) that would otherwise remain ambiguous.
**Action:** Always prefer the `loading` prop on `Button` components for async operations. To provide tooltips for Lucide icons without build errors, wrap them in a container (e.g., `<span title="...">`) and ensure `aria-hidden="true"` is set on the icon itself.

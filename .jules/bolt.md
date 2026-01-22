## 2025-05-21 - [React Rendering Optimization]
**Learning:** In list-heavy applications, re-renders of the entire list are common when parent state changes (e.g., toggling a dialog). Extracting rows into separate components and using `React.memo` combined with `useCallback` for event handlers is a highly effective way to prevent this.
**Action:** Always check for list components and extract/memoize rows if the list is potentially long or the parent has frequent state updates.

## 2025-05-21 - [Backend Test Environment Limitation]
**Learning:** The current sandbox environment does not have `dotnet` installed, making it impossible to run or verify C# tests or builds directly.
**Action:** Prioritize frontend performance optimizations when backend verification is not possible, or rely on manual code review for very safe backend changes.

## 2026-01-22 - [Responsive Layout Optimization]
**Learning:** Using 'window.matchMedia' instead of 'window.resize' listeners for responsive logic (like calculating grid columns) significantly reduces the number of re-renders and CPU usage during window resizing.
**Action:** Prefer 'matchMedia' listeners for breakpoint-based state updates.

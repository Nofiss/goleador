## 2025-05-14 - [Same-Player Validation in Match Creation]
**Learning:** In competitive sports apps, users might accidentally select the same participant for both sides. Providing immediate visual feedback and disabling the action button is more helpful than letting the submission fail silently or after the fact.
**Action:** Always implement cross-field validation for "vs" scenarios and use aria-live regions (like role="alert") to notify users of the conflict.

## 2025-05-14 - [Shadcn/Radix Select Accessibility]
**Learning:** Shadcn/Radix Select components require explicit association between Label and SelectTrigger using htmlFor and id, as they don't automatically link. Screen readers also benefit from aria-labels on numerical inputs even when a section label exists.
**Action:** Ensure SelectTrigger has an id and its corresponding Label has htmlFor. Use aria-label on inputs that lack specific direct labels.

## 2025-05-15 - [Skeleton Loaders for List Pages]
**Learning:** Replacing text-based loading indicators (e.g., "Caricamento...") with Skeleton loaders that mimic the final component's layout significantly improves perceived performance and reduces layout shift. Skeletons should be grouped in a grid if the final content is a grid.
**Action:** Always prefer Skeletons for main content loading states. Use a grid of skeletons for list pages.

## 2025-05-15 - [Aria-label for Icon-only Navigation Buttons]
**Learning:** Mobile menu triggers using only icons are completely inaccessible to screen readers without an explicit aria-label.
**Action:** Ensure every icon-only button, especially for navigation, has a descriptive `aria-label`.

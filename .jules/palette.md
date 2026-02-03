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

## 2025-05-16 - [Keyboard Accessibility for Hover-only Actions]
**Learning:** Buttons that only appear on parent hover (e.g., in a table row) are unreachable for keyboard users. Adding `focus-visible:opacity-100` ensures they become visible when tabbed into.
**Action:** Always pair `group-hover:opacity-100` with `focus-visible:opacity-100` for action buttons.

## 2025-05-16 - [Semantic ARIA for Visual Data]
**Learning:** Purely visual data indicators like color-coded form dots or progress circles are invisible to screen readers. Using `role="progressbar"` or `role="img"` with descriptive `aria-label` makes this data accessible.
**Action:** Enhance visual-only data representations with semantic ARIA roles and labels.

## 2025-05-17 - [Password Visibility Toggles and Input Consistency]
**Learning:** Inconsistent placement of icons in authentication forms can lead to a disjointed user experience. Moving semantic icons (like Lock) to the left ensures they don't clash with functional icons (like Password Visibility Toggles) on the right. Toggles must have clear `aria-label` for screen readers.
**Action:** Always place decorative/semantic icons on the left and interactive toggles on the right. Provide `aria-label` for all icon-only buttons.

## 2025-05-20 - [Enhanced Match Registration UX]
**Learning:** For forms involving participant selection and scoring (like match results), adding a "Swap" feature provides a significant delight for users who might have entered data in the wrong columns. Preventing same-player selection by disabling options in the UI is superior to showing error messages after selection.
**Action:** Implement "Swap" buttons for bi-directional data forms. Disable already-selected options in cross-dependent dropdowns to prevent invalid states.

## 2025-05-22 - [Form Component Consistency and Accessibility]
**Learning:** Legacy forms often contain raw HTML elements (like `<input type="checkbox">`) that clash with the design system. Replacing them with library components (like `<Checkbox />`) while ensuring all labels are linked via `htmlFor` and `id` significantly improves both visual polish and accessibility.
**Action:** Audit forms for raw HTML inputs and replace with Shadcn components. Always link Labels to their respective inputs.

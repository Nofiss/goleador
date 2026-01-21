## 2025-05-14 - [Same-Player Validation in Match Creation]
**Learning:** In competitive sports apps, users might accidentally select the same participant for both sides. Providing immediate visual feedback and disabling the action button is more helpful than letting the submission fail silently or after the fact.
**Action:** Always implement cross-field validation for "vs" scenarios and use aria-live regions (like role="alert") to notify users of the conflict.

## 2025-05-14 - [Shadcn/Radix Select Accessibility]
**Learning:** Shadcn/Radix Select components require explicit association between Label and SelectTrigger using htmlFor and id, as they don't automatically link. Screen readers also benefit from aria-labels on numerical inputs even when a section label exists.
**Action:** Ensure SelectTrigger has an id and its corresponding Label has htmlFor. Use aria-label on inputs that lack specific direct labels.

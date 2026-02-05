# Warden's Journal

## 2026-02-05 - Cognitive Complexity in Handlers
**Learning:** Core logic for standings and statistics often ends up in a single, massive MediatR `Handle` method, exceeding cognitive complexity limits (e.g., 55 vs 15).
**Action:** Proactively extract logical steps (data loading, map building, processing, projections, ranking) into private methods within the handler class to maintain readability and testability.

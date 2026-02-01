## 2025-01-27 - [LINQ Loop & Cartesian Product Optimization]
**Learning:** Found that using LINQ `Where(...).Select(...).ToList()` inside a frequent loop (like standings calculation) creates significant allocation overhead. Also, multiple `Include` calls in EF Core can lead to a Cartesian product, slowing down queries.
**Action:** Replace nested LINQ patterns with single-pass `foreach` loops and use `.AsSplitQuery()` when loading multiple collections in a single entity.

## 2025-01-31 - [Dictionary-based Relational Mapping in Projection]
**Learning:** In-memory projections (using `.Select` after `ToListAsync`) that perform multiple nested LINQ queries on related collections (like `Tournament.Teams.Any(...)`) lead to $O(N \times M)$ complexity.
**Action:** Pre-build a dictionary with composite keys (e.g., `(TournamentId, PlayerId)`) in a single pass before the projection loop to achieve $O(1)$ lookups and significantly reduce CPU time for large datasets.

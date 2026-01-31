## 2025-01-27 - [LINQ Loop & Cartesian Product Optimization]
**Learning:** Found that using LINQ `Where(...).Select(...).ToList()` inside a frequent loop (like standings calculation) creates significant allocation overhead. Also, multiple `Include` calls in EF Core can lead to a Cartesian product, slowing down queries.
**Action:** Replace nested LINQ patterns with single-pass `foreach` loops and use `.AsSplitQuery()` when loading multiple collections in a single entity.

## 2025-01-28 - [Memory Projection with Composite Keys]
**Learning:** In queries like `GetMyPendingMatches`, resolving relational names (like Team names) in memory using nested LINQ `FirstOrDefault(Any)` inside a `.Select` call leads to O(N*M) complexity. Even with small datasets, this is an anti-pattern.
**Action:** Pre-calculate a lookup dictionary with composite keys `(TournamentId, PlayerId)` to achieve O(1) lookups during result projection, and always pair it with `.AsSplitQuery()` when the graph involves multiple collection includes.

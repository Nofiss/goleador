## 2025-01-27 - [LINQ Loop & Cartesian Product Optimization]
**Learning:** Found that using LINQ `Where(...).Select(...).ToList()` inside a frequent loop (like standings calculation) creates significant allocation overhead. Also, multiple `Include` calls in EF Core can lead to a Cartesian product, slowing down queries.
**Action:** Replace nested LINQ patterns with single-pass `foreach` loops and use `.AsSplitQuery()` when loading multiple collections in a single entity.

## 2025-01-27 - [Database-Side Aggregation vs Memory Loading]
**Learning:** For statistics and aggregate data (counts, sums, averages), loading all related entities into memory (O(N) transfer) becomes a bottleneck as the dataset grows. EF Core can translate `GroupBy` and aggregate functions (`Sum`, `Count`) into efficient SQL.
**Action:** Use database-side aggregation via `.GroupBy` and limited `.Take()` queries to calculate statistics, avoiding unbounded result sets and excessive memory allocations.

## 2025-01-28 - [Memory Projection with Composite Keys]
**Learning:** In queries like `GetMyPendingMatches`, resolving relational names (like Team names) in memory using nested LINQ `FirstOrDefault(Any)` inside a `.Select` call leads to O(N*M) complexity. Even with small datasets, this is an anti-pattern.
**Action:** Pre-calculate a lookup dictionary with composite keys `(TournamentId, PlayerId)` to achieve O(1) lookups during result projection, and always pair it with `.AsSplitQuery()` when the graph involves multiple collection includes.

## 2025-01-31 - [Dictionary-based Relational Mapping in Projection]
**Learning:** In-memory projections (using `.Select` after `ToListAsync`) that perform multiple nested LINQ queries on related collections (like `Tournament.Teams.Any(...)`) lead to $O(N \times M)$ complexity.
**Action:** Pre-build a dictionary with composite keys (e.g., `(TournamentId, PlayerId)`) in a single pass before the projection loop to achieve $O(1)$ lookups and significantly reduce CPU time for large datasets.

## 2025-02-03 - [Player Statistics Retrieval Optimization]
**Learning:** Over-fetching in many-to-many relationships (Player -> MatchParticipant -> Match) can be a major bottleneck. The original code loaded all participants for every match where a player was present.
**Action:** Use `.SelectMany(m => m.Participants)` followed by filtering and projection to fetch only the 4-5 scalar properties needed for calculation. This reduces data transfer and memory pressure, leading to a ~42% performance improvement in processing large datasets.

## 2025-02-12 - [Database-Side Aggregation for Social Features]
**Learning:** Calculating "Nemesis" and "Best Partner" by loading all historical matches into memory is an $O(N)$ anti-pattern. Even if N is matches, the materialization of full entity graphs (Matches + Participants) is expensive.
**Action:** Use targeted database queries with `.Select()`, `.SelectMany()`, and `.GroupBy()` to calculate these relationships. Fetch only required scalar fields (Ids, Nicknames) and aggregate in memory only if the LINQ-to-SQL translation becomes too complex, ensuring that the heavy data lifting remains on the database side.

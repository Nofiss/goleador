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

## 2026-02-09 - [Identity N+1 Role Retrieval Optimization]
**Learning:** Found that `IdentityService.GetAllUsersAsync` was performing a separate database query for each user to fetch their roles (N+1 problem). `UserManager` methods are often atomic and don't support batching role retrieval out-of-the-box.
**Action:** Injected `ApplicationDbContext` into `IdentityService` and used a LINQ projection with joins on `Users`, `UserRoles`, and `Roles` to fetch all data in a single roundtrip, reducing complexity from O(N) to O(1) queries.

## 2025-02-13 - [Tournament Detail Caching & Comprehensive Invalidation]
**Learning:** Caching the complex `GetTournamentById` query significantly reduces database load and frontend latency for the most frequently visited page. However, caching requires a rigorous invalidation strategy.
**Action:** Implemented `ICacheableQuery` for `GetTournamentByIdQuery` with a 30s TTL. Added explicit `cache.Remove($"TournamentDetail-{id}")` calls to all command handlers that modify tournament state (Matches, Teams, Status, Table Assignments) to ensure strict data consistency.

## 2025-02-14 - [React Query Global Configuration & Cache Sharing]
**Learning:** Found that multiple components (Dashboard, Matches List) were fetching the same "Recent Matches" data using different query keys, leading to redundant API calls. Also, the default `staleTime` of 0 caused frequent unnecessary refetches.
**Action:** Unified the query key for recent matches to `["recent-matches"]` across all components and set a global `staleTime` of 30s in `QueryClient` to maximize cache reuse and reduce server load.

## 2025-02-14 - [DbContext Concurrency and Sequential Async Execution]
**Learning:** When refactoring a single complex O(N) query into multiple efficient O(1) database queries (e.g., in `GetPlayerProfileQueryHandler`), it's tempting to use `Task.WhenAll` for parallel execution. However, EF Core `DbContext` is not thread-safe and will throw a concurrency exception if multiple queries are executed simultaneously on the same instance.
**Action:** Execute granular database queries sequentially using `await` within the same handler to respect `DbContext` thread-safety while still benefiting from the O(N) to O(1) data transfer reduction.

## 2025-05-15 - [Global API Response Compression]
**Learning:** Found that while individual CQRS handlers were optimized for O(1) data transfer, the API lacked global response compression. Large JSON payloads (Standings, Rankings, Profiles) were being transmitted in raw format, consuming more bandwidth than necessary.
**Action:** Implemented `AddResponseCompression` with Brotli and Gzip providers in `Program.cs`. Enabled compression for HTTPS to ensure that all data-heavy responses are minimized before transmission.

## 2025-05-16 - [Tournament Standings Projection Optimization]
**Learning:** Found that `GetTournamentStandingsQueryHandler` was using `Include` with `AsSplitQuery` to load full entity graphs for Teams, Players, and Matches. This resulted in over-fetching hundreds of unnecessary fields (Names, Emails, Dates) just to calculate a few scalar statistics.
**Action:** Replaced eager loading with a targeted LINQ projection (`.Select()`) into private records. This reduced data transfer significantly by fetching only the minimal IDs and scores required for the standings algorithm, while maintaining O(1) in-memory resolution via dictionaries.

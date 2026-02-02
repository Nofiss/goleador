## 2025-01-27 - [LINQ Loop & Cartesian Product Optimization]
**Learning:** Found that using LINQ `Where(...).Select(...).ToList()` inside a frequent loop (like standings calculation) creates significant allocation overhead. Also, multiple `Include` calls in EF Core can lead to a Cartesian product, slowing down queries.
**Action:** Replace nested LINQ patterns with single-pass `foreach` loops and use `.AsSplitQuery()` when loading multiple collections in a single entity.

## 2025-01-27 - [Database-Side Aggregation vs Memory Loading]
**Learning:** For statistics and aggregate data (counts, sums, averages), loading all related entities into memory (O(N) transfer) becomes a bottleneck as the dataset grows. EF Core can translate `GroupBy` and aggregate functions (`Sum`, `Count`) into efficient SQL.
**Action:** Use database-side aggregation via `.GroupBy` and limited `.Take()` queries to calculate statistics, avoiding unbounded result sets and excessive memory allocations.

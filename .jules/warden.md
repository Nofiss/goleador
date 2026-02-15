# Warden's Journal

## 2026-02-05 - Cognitive Complexity in Handlers
**Learning:** Core logic for standings and statistics often ends up in a single, massive MediatR `Handle` method, exceeding cognitive complexity limits (e.g., 55 vs 15).
**Action:** Proactively extract logical steps (data loading, map building, processing, projections, ranking) into private methods within the handler class to maintain readability and testability.

## 2026-02-08 - Side Effect Anti-pattern in Utility Services
**Learning:** Utility services (like `RoundRobinScheduler`) that modify input collections can lead to brittle tests and unexpected `NullReferenceException` in downstream logic if they add dummy entries (e.g., nulls for odd teams).
**Action:** Always operate on a copy of the input collection (`new List<T>(input)`) within the service method to ensure immutability of the caller's data.

## 2026-02-15 - [Backend Parameter Naming Consistency (S927)]
**Learning:** The codebase frequently uses short parameter names like 'token' for CancellationToken in MediatR handlers, which conflicts with the 'cancellationToken' naming in the 'IRequestHandler' interface. While technically valid in C#, SonarQube flags this as a CRITICAL code smell (S927) for consistency across the inheritance hierarchy.
**Action:** Always name the CancellationToken parameter as 'cancellationToken' when implementing interfaces from MediatR or other libraries to ensure compliance with S927 and maintain codebase consistency.

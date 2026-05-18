# [Frontend Area] Route and Data Contracts

| Field           | Value                                                                              |
| --------------- | ---------------------------------------------------------------------------------- |
| Audience        | Frontend developers, backend/API consumers, reviewers                              |
| Scope           | [Route group, domain system, app, or integration]                                  |
| Last reviewed   | YYYY-MM-DD                                                                         |
| Contract source | [Route files, query options, adapters, schemas, tests, generated route tree, etc.] |

## Summary

[Describe what user flows this route/data surface enables and which systems consume or own it.]

## Route Standards

| Standard                | Current behavior                            | Evidence |
| ----------------------- | ------------------------------------------- | -------- |
| Route style             | [File-based / code-based / other]           | `path`   |
| Router/Vite setup       | [Plugin, generated tree, type registration] | `path`   |
| Route guards            | [Auth/permission behavior]                  | `path`   |
| Search params           | [Validation/source]                         | `path`   |
| Loading/error/not-found | [Observed behavior]                         | `path`   |
| Data loading            | [Loader/query strategy]                     | `path`   |

## Route Inventory

| Route   | Purpose   | Guard         | Loader/search | UI states | Evidence              |
| ------- | --------- | ------------- | ------------- | --------- | --------------------- |
| `/path` | [Purpose] | [Requirement] | [Source]      | [States]  | `path/to/route.tsx:1` |

## Data Contracts

| Contract                    | Owner    | Query key or state key | Source           | Invalidated by    | Evidence |
| --------------------------- | -------- | ---------------------- | ---------------- | ----------------- | -------- |
| [Query/mutation/store/form] | [System] | [Key]                  | [Adapter/schema] | [Mutation/action] | `path`   |

## Feature System Data Ownership

| Layer                | Expected owner                                 | Observed owner | Evidence | Gap           |
| -------------------- | ---------------------------------------------- | -------------- | -------- | ------------- |
| API adapter          | `systems/<domain>/adapters/`                   | [Owner]        | `path`   | [Gap or none] |
| Query keys           | `systems/<domain>/lib/query-keys.ts`           | [Owner]        | `path`   | [Gap or none] |
| Query options        | `systems/<domain>/lib/query-options.ts`        | [Owner]        | `path`   | [Gap or none] |
| Query/mutation hooks | `systems/<domain>/hooks/`                      | [Owner]        | `path`   | [Gap or none] |
| Schemas/contracts    | `systems/<domain>/lib/` or API contract source | [Owner]        | `path`   | [Gap or none] |
| Route guards         | `systems/<domain>/guards/` or route owner      | [Owner]        | `path`   | [Gap or none] |

## Cache and Cancellation

| Concern                   | Current behavior | Evidence | Gap           |
| ------------------------- | ---------------- | -------- | ------------- |
| Scoped query keys         | [Observed]       | `path`   | [Gap or none] |
| `queryOptions` reuse      | [Observed]       | `path`   | [Gap or none] |
| `AbortSignal` propagation | [Observed]       | `path`   | [Gap or none] |
| Mutation invalidation     | [Observed]       | `path`   | [Gap or none] |
| Optimistic rollback       | [Observed]       | `path`   | [Gap or none] |

## Flow Details

### [Flow Name]

- **Trigger**: [Navigation, user action, route loader, form submit, background refetch]
- **Route owner**: `path`
- **Data owner**: `path`
- **Adapter/API source**: `path`
- **Auth/scope**: [User/org/tenant/filter/search scope]

#### Request or Input

```json
{
  "field": "example"
}
```

#### Response or View Model

```json
{
  "field": "example"
}
```

#### States

| State   | UI behavior | Evidence |
| ------- | ----------- | -------- |
| Loading | [Behavior]  | `path`   |
| Empty   | [Behavior]  | `path`   |
| Error   | [Behavior]  | `path`   |
| Success | [Behavior]  | `path`   |

#### Side Effects

| Side effect                                                             | Evidence |
| ----------------------------------------------------------------------- | -------- |
| [Cache invalidation, navigation, toast, optimistic update, store write] | `path`   |

## Contract Gaps

| Gap   | Evidence | Impact   | Recommendation |
| ----- | -------- | -------- | -------------- |
| [Gap] | `path`   | [Impact] | [Action]       |

## Maintenance

Update this document when routes, loaders, search params, query keys, adapters, schemas, mutations, invalidation, or user-visible states change.

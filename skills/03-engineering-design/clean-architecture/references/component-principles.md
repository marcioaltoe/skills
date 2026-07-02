# Component Principles

Components are the smallest units of deployment in a system — JAR files, DLLs, shared libraries, or independently deployable services. In Clean Architecture, designing components well ensures that changes are localized, teams can work independently, and releases stay manageable.

This reference covers the six component principles — three cohesion and three coupling — plus the stability and abstraction metrics that quantify component design.

## Table of Contents
1. [Component Cohesion](#component-cohesion)
2. [Component Coupling](#component-coupling)
3. [Stability and Abstraction Metrics](#stability-and-abstraction-metrics)

---

## Component Cohesion

These three principles decide which classes belong in the same component.

### REP: The Reuse/Release Equivalence Principle

**"The granule of reuse is the granule of release."**

Classes that are reused together should be released together as a single component. If you want to reuse classes from a component, you must be able to track that component's releases and version them.

**In practice:**
- A component should have a coherent release policy
- All classes in a component should be versioned together
- Users of a component should expect compatible releases

**Violation example:**
Putting a frequently-changing utility class in the same component as a stable business rule class. Users of the business rule class are forced to accept updates (and potential breakage) from the utility class's changes.

### CCP: The Common Closure Principle

**"Classes that change for the same reason and at the same time should be together."**

This is the SRP for components: gather together everything that changes for the same reason, and separate things that change for different reasons.

**In practice:**
- If a change request touches multiple classes, those classes should be in the same component
- A component should have one primary reason to change
- CCP is what drives the dependency rule in Clean Architecture: business rules and infrastructure change for different reasons, so they belong in different components

**Violation example:**
Changing an XML parser class and a pricing rule class because both are in the same component named "utilities." A pricing change forces redeployment of the XML parser, even though the parser didn't change.

### CRP: The Common Reuse Principle

**"Don't force users of a component to depend on things they don't need."**

This is the ISP for components: classes that are used together should be in the same component. A user of a component should not be forced to depend on classes within that component that they never use.

**In practice:**
- If a component contains classes A, B, and C, and a user only needs A, they should not have to deploy B and C
- CRP balances CCP: CCP groups things that change together; CRP separates things that are used independently

**Violation example:**
A component contains `Order` and `ShippingLabelPrinter`. A user who only needs `Order` must still deploy `ShippingLabelPrinter`, which has transitive dependencies on a print subsystem.

### Tension Between the Three

```
          CCP ──── REP
         /               \
        /                 \
       /                   \
      CRP ────────────────── (too fine-grained)
```

- **CRP** wants tiny components (few classes, loosely coupled)
- **CCP** wants larger components (related classes together)
- **REP** wants even larger components (versioned together)

The sweet spot depends on the project's maturity. Early in a project, CCP dominates (you want things that change together to be together). Later, as reuse patterns emerge, you might split components along CRP lines.

---

## Component Coupling

These three principles govern the relationships between components.

### ADP: The Acyclic Dependencies Principle

**"The dependency graph of components must have no cycles."**

A cycle occurs when component A depends on B, B depends on C, and C depends on A (directly or transitively). Cycles make the system impossible to reason about: a change anywhere in the cycle can affect everything in the cycle, and there is no natural build or deployment order.

**How to break cycles:**

1. **Apply DIP:** Convert the cyclic dependency into an inverted dependency by defining an interface in the component that should not depend on the other.
2. **Extract a new component:** Move the shared dependency into a new component that both original components depend on.

**Example of breaking a cycle:**

Before (cycle): `Orders` → `Notifications` → `Templates` → `Orders`

After (DIP breaks the cycle):
- `Orders` → `NotificationPort` (interface in Orders)
- `Notifications` → `NotificationPort` (implements it)
- `Templates` → `Notifications` (unchanged)

### SDP: The Stable Dependencies Principle

**"Depend in the direction of stability."**

A component should only depend on components that are more stable than itself. Stable components are hard to change; they should be depended on by many other components. Unstable components are easy to change; they should depend on stable ones.

**Measuring stability:**
```
Instability (I) = Ce / (Ca + Ce)
```
- **Ca** (afferent couplings): number of components outside this one that depend on it
- **Ce** (efferent couplings): number of components outside this one that this one depends on
- **I = 0**: maximally stable (many incoming, few outgoing deps)
- **I = 1**: maximally unstable (few incoming, many outgoing deps)

**Violation example:**
An unstable utility component (I=0.9) that many business components depend on makes the business components fragile — a change in the utility can ripple through many dependents.

### SAP: The Stable Abstractions Principle

**"A stable component should be abstract; an unstable component should be concrete."**

Stable components (I near 0) are hard to change, so they should be abstract enough to be extensible without modification. Unstable components (I near 1) can be concrete because they are easy to change.

**Measuring abstraction:**
```
Abstractness (A) = Na / Nc
```
- **Na**: number of abstract classes/interfaces in the component
- **Nc**: total number of classes in the component
- **A = 0**: maximally concrete
- **A = 1**: maximally abstract

### The Main Sequence

The ideal components lie on or near the "main sequence" — a line from (I=1, A=0) to (I=0, A=1). Components far from this line are either:

- **The zone of pain** (I=0, A=0): Very stable and very concrete. Cannot be extended easily and is impossible to change without pain. Examples: database schemas, concrete utility libraries.
- **The zone of uselessness** (I=1, A=1): Very abstract but nobody depends on it. The abstractions serve no purpose. Example: a purely abstract library with no concrete consumers.

The distance from the main sequence (D) can be calculated:
```
D = |A + I - 1|
```

Values near 0 are ideal. Values far from 0 indicate design problems worth investigating.

## Practical Application

### Component Design Checklist

- [ ] Do classes that change together live in the same component? (CCP)
- [ ] Are classes that are reused independently in separate components? (CRP)
- [ ] Can each component be versioned and released independently? (REP)
- [ ] Is the component dependency graph acyclic? (ADP)
- [ ] Do unstable components depend on stable ones? (SDP)
- [ ] Are stable components sufficiently abstract? (SAP)
- [ ] Are components near the main sequence? (Metrics)

### Component Smells

| Smell | Sign | Fix |
|-------|------|-----|
| **God component** | Huge component with unrelated classes | Split by CCP (different change reasons) |
| **Tiny component** | Single-class component with no dependents | Merge into a related component |
| **Cyclic dependency** | A → B → C → A | Apply DIP or extract an abstraction |
| **Component in the zone of pain** | I near 0, A near 0 | Extract abstractions to make it extensible |
| **Component in the zone of uselessness** | I near 1, A near 1 | Find consumers or merge into using components |
| **Fat interface component** | CRP violation — users depend on unused classes | Split by usage patterns |

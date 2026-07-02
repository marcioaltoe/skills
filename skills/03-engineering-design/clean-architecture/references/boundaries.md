# Boundaries and Boundary Anatomy

Boundaries are where the architecture earns its keep. A boundary is a line drawn between things that matter and things that are details. The cost of drawing a boundary is polymorphism (interfaces, function pointers, dependency injection). The payoff is the ability to defer and swap decisions about frameworks, databases, and delivery mechanisms.

This reference covers the anatomy of boundaries, full vs. partial boundaries, the Humble Object pattern, services as boundaries, test boundaries, and the Main component as the ultimate plugin.

## Table of Contents
1. [What Is a Boundary?](#what-is-a-boundary)
2. [Full vs. Partial Boundaries](#full-vs-partial-boundaries)
3. [The Humble Object Pattern](#the-humble-object-pattern)
4. [Services as Boundaries](#services-as-boundaries)
5. [Test Boundaries](#test-boundaries)
6. [Main as the Ultimate Plugin](#main-as-the-ultimate-plugin)

---

## What Is a Boundary?

A boundary separates two layers of the system. On one side are things that matter (business rules). On the other side are details (databases, frameworks, delivery mechanisms). The boundary is enforced through dependency inversion: the side of the boundary that depends on the interface is the side that implements it; the side that defines the interface is the side that calls it.

### Boundary Anatomy

Every boundary has the same anatomy:

```
[Client Side]  →  [Boundary Interface]  ←  [Server Side]
   (inner)                                 (outer)
```

- The **client side** (inner circle) defines the interface
- The **server side** (outer circle) implements the interface
- The client side calls through the interface
- The server side never calls the client side — dependencies flow inward

### The Cost and Benefit of Boundaries

**Cost:** Every boundary requires an interface, an implementation, and a wiring point (DI). This is ceremony. For simple boundaries, it feels like overhead.

**Benefit:** Boundaries make the system resilient. When a detail changes (new database, new framework, new API), only the server side of the boundary changes. The client side (business rules) is untouched.

The art is placing boundaries where the benefit exceeds the cost — at points of likely volatility.

### When to Draw a Boundary

| Draw a boundary when... | Don't draw a boundary when... |
|------------------------|------------------------------|
| The detail is likely to change | The detail never changes |
| The detail has many possible implementations | There is one obvious implementation |
| The detail is a third-party dependency | The abstraction is standard library |
| Testing requires mocking the detail | Testing works fine with the real detail |

## Full vs. Partial Boundaries

### Full Boundary

A full boundary implements both input and output ports with reciprocal interfaces on both sides. It provides maximum isolation but requires the most ceremony.

```
[Client] → [Input Boundary] → [Interactor] → [Output Boundary] → [Server]
```

A full boundary is appropriate when:
- The two sides are likely to evolve independently
- The boundary represents a major architectural seam
- The server side has multiple implementations now or in the future

### Partial Boundaries

Partial boundaries reduce ceremony while preserving the option to go full boundary later.

**1. Strategy Pattern (Simplest)**

Instead of defining both input and output ports, use a simple strategy interface:

```python
class ShippingStrategy(ABC):
    @abstractmethod
    def calculate(self, order: Order) -> Money:
        pass
```

This is a partial boundary because the `OrderService` depends on the strategy (inward), but there is only one crossing point. It preserves the option to add the output port later.

**2. Facade**

A facade hides the entire outer circle behind a single class:

```python
class OrderFacade:
    def __init__(self):
        self._repo = PostgresOrderRepository()
        self._email = SendGridEmailService()
        self._payment = StripePaymentGateway()

    def place_order(self, request: PlaceOrderRequest) -> OrderResponse:
        interactor = PlaceOrderInteractor(self._repo, self._email, self._payment)
        return interactor.execute(request)
```

The facade is a partial boundary: it's not truly inverted (the facade creates concrete implementations), but it localizes the coupling. When you're ready, you can invert each dependency.

**3. Abstract Base (One-Sided Boundary)**

Define an abstract base class in the inner circle. The outer circle extends it:

```python
# Inner circle
class OrderExporter(ABC):
    @abstractmethod
    def export(self, orders: list[Order]) -> bytes:
        pass

# Outer circle
class CsvOrderExporter(OrderExporter):
    def export(self, orders: list[Order]) -> bytes:
        # CSV implementation
        ...
```

This is a one-sided partial boundary: the inner circle defines the contract, but only one crossing point exists.

### Choosing the Right Level

| Situation | Boundary Level |
|-----------|---------------|
| Simple abstraction (one interface, one implementation) | Strategy pattern |
| Wrapping a well-known library that won't change | Facade |
| Framework or volatile infrastructure | Full boundary |
| A detail you're uncertain about | Partial boundary (easy to upgrade) |

## The Humble Object Pattern

The Humble Object pattern separates code that is difficult to test (because it sits at a boundary) from code that is easy to test (pure logic). It is the pattern that makes the boundaries work in practice.

### Pattern Structure

```
[BOUNDARY]
    |
    ├── Humble Object (hard to test)
    │   - Does I/O
    │   - Calls framework APIs
    │   - Delegates logic to...
    │
    └── Logic Object (easy to test)
        - Pure transformations
        - No I/O
        - Deterministic
```

### Examples by Layer

**1. Presenter Boundary:**

```python
# Humble: View (renders output, hard to test without UI framework)
class OrderView:
    def render(self, view_model: OrderViewModel) -> str:
        return self._template.render(view_model.to_dict())

# Logic: Presenter (pure transformation, fully testable)
class OrderPresenter:
    def present(self, response: OrderResponse) -> OrderViewModel:
        return OrderViewModel(
            order_id=response.order_id,
            total=f"${response.total:.2f}",
            status=response.status.capitalize(),
        )
```

**2. Controller Boundary:**

```python
# Humble: HTTP handler (hard to test without HTTP server)
def order_handler(request):
    controller = OrderController(place_order_interactor)
    controller.create(request.parsed_body)

# Logic: Controller (pure transformation, testable)
class OrderController:
    def create(self, http_body: dict) -> None:
        request = PlaceOrderRequest(
            customer_id=http_body["customer_id"],
            items=[...],
        )
        self._place_order.execute(request)
```

**3. Gateway Boundary:**

```python
# Humble: Database driver (hard to test without database)
class PostgresGateway:
    def __init__(self, pool):
        self._pool = pool

    def save(self, order: Order) -> None:
        with self._pool.cursor() as cur:
            cur.execute("INSERT INTO orders ...")

# Logic: Repository interface is pure abstraction (testable via mock)
```

### Testing with Humble Objects

The hypothesis is: "Any code that crosses a boundary can be split into a hard-to-test part and a testable part." In practice, you test:
- The **logic object** thoroughly (it contains all the decisions)
- The **humble object** minimally (it just delegates to the logic object)

```python
# Test the logic object (Presenter)
def test_order_presenter_formats_total():
    presenter = OrderPresenter()
    response = OrderResponse(order_id="123", total=Money("42.50"), status="completed")
    view_model = presenter.present(response)
    assert view_model.total == "$42.50"

# Test the humble object (View) — thin test
def test_order_view_renders():
    view = OrderView(template)
    result = view.render(OrderViewModel(order_id="123", total="$42.50", status="Completed"))
    assert "123" in result
    assert "$42.50" in result
```

## Services as Boundaries

### Are Microservices Always Good Boundaries?

No. A microservice that shares a database schema with other services is not a clean architectural boundary — it's a distributed monolith. The database schema is the coupling point that crosses the boundary in the wrong direction.

### When Services Are Real Boundaries

A service becomes a real boundary when:
- The service has its own database with its own schema
- The service communicates through messages or API calls that carry DTOs, not shared domain objects
- The service can be developed, deployed, and scaled independently
- The service does not share memory or modules with other services

### When Services Are False Boundaries

- Shared database with other services (the boundary is at the wrong layer)
- Shared domain model classes across services (coupling at the data level)
- Shared framework configuration (changes ripple across services)
- Tight release coordination (services are not independently deployable)

### The SDP Test for Services

Apply the Stable Dependencies Principle: if service A depends on service B, then B should be more stable than A. A common failure pattern is the "god service" (stable, concrete, hard to change) that every service depends on.

## Test Boundaries

Tests are the most isolated component in the system. They depend on everything (they must instantiate the entire system), but nothing depends on them. This means tests should be outside all circles.

### Test Boundary Anatomy

```
[Tests] → [Business Rules] → [Test Doubles]
                           ↘ [Real Adapters] (for integration tests)
```

Tests depend inward: they call business rules directly and mock at boundaries. They never depend on infrastructure details in a way that leaks into test design.

### Test Organization

| Test Type | What It Tests | Boundary Location |
|-----------|--------------|-------------------|
| **Unit tests** | Entities, Use Cases in isolation | Mock at Use Case boundaries |
| **Integration tests** | Use Cases + Gateways | Use real infrastructure at Adapter boundaries |
| **End-to-end tests** | Full system | Through delivery mechanism (outermost boundary) |

## Main as the Ultimate Plugin

### The Role of Main

Main is the dirtiest component in the system. It knows about every other component because it creates them and wires them together. But nothing depends on Main. It is the ultimate plugin — a function that assembles the system and starts it.

### Main's Responsibilities

1. **Create concrete instances** of all components
2. **Wire dependencies** — inject concrete implementations into abstractions
3. **Configure the system** — read environment variables and pass them to constructors
4. **Start the system** — start the web server, message consumer, or CLI

### Main Is a Plugin

Because nothing depends on Main, you can have multiple Main components for different environments:

- `main_dev.py` — wires in-memory repositories and console presenters
- `main_test.py` — wires test doubles and test configurations
- `main_prod.py` — wires real PostgreSQL, Stripe, and cloud services

Each Main is a plugin that assembles the system in a different configuration. The business rules don't change — only the outer circle adapters.

### The Dependency Injection Framework Question

Frameworks like Spring, Guice, and Dagger automate what Main does manually. Should you use them?

**Yes, if:** The framework stays in Main and doesn't leak into inner circles.

**No, if:** The framework requires annotations on domain classes or injects itself into business logic.

The rule: if you can delete the DI framework file and manually wire everything in a `main()` function without changing any inner circle code, you're fine. If deleting the DI framework would break your business classes, the framework has crossed the boundary.

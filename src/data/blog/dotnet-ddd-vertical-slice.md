---
author: Evgeni Rusev
pubDatetime: 2024-06-22T12:00:00Z
title: ".NET Domain-Driven Design Template with a Vertical Slice architecture"
slug: dotnet-ddd-vertical-slice
featured: true
draft: false
tags:
  - dotnet
  - ddd
  - clean-architecture
  - vertical-slice
  - architecture
ogImage: "https://miro.medium.com/v2/resize:fit:1400/format:webp/1*q5fCIRCN4lx_7-qSvmFDvA.png"
description: "A Domain-Driven Design template for .NET using Vertical Slice architecture — build highly decoupled monolithic applications with a clear path to microservices when you need it."
---

> Originally published on [Medium](https://medium.com/@evgeni.n.rusev/net-domain-driven-design-template-with-a-vertical-slice-architecture-33812c22b509), June 2024.

## Table of contents

## Introduction

In this article, we will explore the use of a **Domain-Driven Design (DDD)** template with a **Vertical Slice architecture**.

The approach aims to facilitate the development of highly decoupled monolithic .NET applications, while providing the flexibility to transition to microservices as your business needs evolve.

[Link to source code](https://github.com/evgenirusev/.NET-Domain-Driven-Design-Template)

![DDD Vertical Slice overview](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*q5fCIRCN4lx_7-qSvmFDvA.png)

## Case Study

### Starting with the WHY

We are a mid-sized team of developers who have been working on a Legal Tech application for about two years using the traditional **N-tier** architecture. As we enter a phase of considerable growth and see increasing usage across various business domains, we recognize the potential need to further decouple these domains, with a future transition to microservices in mind.

After careful consideration, we have determined that adopting Domain-Driven Design (DDD) with a Vertical Slice approach is our best option to achieve this goal.

### Microservices or Modular Monolith

Our team is reluctant to migrate to microservices at this stage due to the additional DevOps overhead it would entail. Our immediate goal is to reduce coupling between business domains, minimize the probability of introducing bugs, and simplify the process of extending each bounded context, while deploying all bounded contexts through a single release pipeline.

By achieving a higher level of decoupling, we aim to enhance the maintainability and scalability of our application, preparing for a potential transition to microservices when it becomes more feasible.

## Solution

### Clean Architecture with a Modular Vertical Slice monolith

Implementing Domain-Driven Design (DDD) presents several notable challenges, with the primary one for us being the prevention of domain coupling within a dynamic team working on multiple domains in a single solution. Ensuring domains remain decoupled is crucial. The template offers the following solution:

**Bounded context separation by solution directory**

![Bounded context separation by solution directory](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*ZyVeO0QOD3BwZTZ8uUm8hQ.png)

Each bounded context will be contained within a solution directory which corresponds to the name of the domain, and each domain will have a project split based on the popular **Clean Architecture**. Essentially each domain will represent your business vertical slices.

**Why does this structure address the DDD domain coupling problem?** Because it is introducing significant friction to cross-reference domains. This friction discourages developers from coupling domains, as it becomes apparent that referencing another project simply to use a service is incorrect, regardless of the developers' experience with DDD. The structure effectively discourages attempts to cross-reference domains, promoting the use of the other intended tools to communicate with the other domains — mainly via **API calls** or **Event Sourcing**.

### Streamlined Development via the ProjectStartup

By consolidating all contexts into a single binary via the **StartupProject**, we can deploy all bounded contexts with a single release pipeline. This approach avoids the complexity of managing multiple microservice deployments at early stages of the project, enabling quicker development progress by minimizing the overhead associated with DevOps tasks such as service orchestration, service discovery, and common NuGet package management.

The **ProjectStartup** acts as a root orchestrator solution that aggregates all the controllers from the Web layer of each project and runs them:

```csharp
var builder = WebApplication.CreateBuilder(args);

builder
    .Services
    .AddProductCatalogDomain()
    .AddProductCatalogApplication(builder.Configuration)
    .AddProductCatalogInfrastructure(builder.Configuration)
    .AddProductCatalogWebComponents();

builder
    .Services
    .AddOrderManagementDomain()
    .AddOrderManagementApplication(builder.Configuration)
    .AddOrderManagementInfrastructure(builder.Configuration)
    .AddOrderManagementWebComponents();

builder
    .Services
    .AddStatisticsDomain()
    .AddStatisticsApplication(builder.Configuration)
    .AddStatisticsInfrastructure(builder.Configuration)
    .AddStatisticsWebComponents();

builder.Services
    .AddTokenAuthentication(builder.Configuration)
    .AddEventSourcing()
    .AddModelBinders()
    .AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new() { Title = "Web API", Version = "v1" });
    })
    .AddHttpClient();

var app = builder.Build();

app
    .UseWebService(app.Environment)
    .Initialize();

app.Run();
```

![ProjectStartup as root orchestrator](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*oLEJZvSVPB9CHyS_jm2ekw.png)

## Domain Modeling and Development Process

To start with Domain-Driven Design (DDD), it's crucial to engage deeply with your customers to grasp the intricacies of the business domain and use cases. This initial step is pivotal for defining your bounded contexts, aggregate roots, and value objects.

When designing your bounded contexts, prioritize their ability to function autonomously. If you find that two domains are consistently used together, consider merging them. Conversely, if specific use cases from one domain are frequently utilized independently, consider splitting them into distinct domains.

> Explicitly define the context within which a model applies. Explicitly set boundaries in terms of team organization, usage within specific parts of the application, and physical manifestations such as code bases and database schemas. Keep the model strictly consistent within these bounds, but don't be distracted or confused by issues outside.
>
> — Eric Evans

## Data Storage

You have two primary options for data storage:

- **Use a single database for all domains, with each domain having its own bounded context** — this approach simplifies development and speeds up the process. Transitioning to microservices later will require only a migration script for the data.
- **Use a separate database for each domain** — this simplifies the transition to microservices since you only need to split the domain into a separate repository. However, managing multiple databases from the beginning can slow down development somewhat.

### Repositories in .NET

In .NET, repositories primarily act as anti-corruption layers for aggregate roots or for implementing CQRS, especially if you're looking to decouple from Entity Framework (such as moving READ operations to Dapper). If your project doesn't leverage these benefits, using DbContext directly can simplify development.

Consider organizing your repositories into **Query** and **Domain** repositories: Query repositories return response objects and are typically housed in the Application project, while Domain repositories return Domain objects and are defined within the Domain project.

## Communication Between Bounded Contexts

Bounded contexts communicate either through **Event Sourcing** or **API calls**.

For instance, if you need to keep track of statistics such as the number of orders placed in a day, a solution could involve triggering an `OrderCreated` **Domain Event** within the **OrderManagement** domain, which would then be captured and processed by the **Statistics Domain**.

### How to use Domain Events

All entities extend the `Entity` class, which contains the interface for raising events:

```csharp
public abstract class Entity : IEntity
{
    private readonly ICollection<IDomainEvent> events;

    protected Entity() => events = new List<IDomainEvent>();

    public IReadOnlyCollection<IDomainEvent> Events
        => events.ToList().AsReadOnly();

    public void ClearEvents() => events.Clear();

    protected void RaiseEvent(IDomainEvent domainEvent)
        => events.Add(domainEvent);

    // ...
}
```

How to raise an event:

```csharp
public class Order : Entity, IAggregateRoot
{
    public Order(Guid customerId, DateTime orderDate)
    {
        // ...

        RaiseEvent(new OrderAddedEvent());
    }
}
```

Example event handler:

```csharp
public class OrderAddedEventHandler : IEventHandler<OrderAddedEvent>
{
    private readonly IStatisticsDomainRepository statistics;

    public OrderAddedEventHandler(IStatisticsDomainRepository statistics)
        => this.statistics = statistics;

    public Task Handle(OrderAddedEvent domainEvent)
        => statistics.IncrementProducts();
}
```

All event handlers extend the `IEventHandler` interface, which gets automatically registered into DI via the assembly scanner in .NET.

### Use cases spanning multiple bounded contexts

If you encounter a use case that spans across multiple bounded contexts and doesn't fit into an existing one, consider creating a new bounded context.

## Validation and consistent state

### Anti-corruption layers and validation

Factories and Repositories serve as anti-corruption layers, complementing fluent validations.

Domain objects are internal and should only be created through Factories. Validation is implemented across all layers, with a particular emphasis on the domain layer. Ensuring the core domain is properly validated and bug-free is essential, as invalid state or bugs at this level will propagate to the rest of the layers.

### Validation across different layers

**Domain Layer** — Each domain model encapsulates its own validation using Guard classes. For an example, see the `Product.cs` file, where the `Validate` method is called for each property related to the product. Similarly, **Value objects** encapsulate their own validation to ensure consistent state regardless of usage. Refer to the `Address.cs` class for an example of this approach. In addition to these tools, **Factory Builders** are used to instantiate complex **aggregate root** models in a consistent and unified way.

**Application Layer** — using the **FluentValidation** NuGet package to streamline request validation. In the `ApplicationConfiguration.cs` file, the `AddCommonApplication` method adds a pipeline behavior that scans each assembly for request validators and automatically registers them into Dependency Injection (DI). This setup ensures that any validators you create for your projects are automatically integrated and functional. For an example, refer to `ProductCommandValidator.cs`:

```csharp
public class ProductCommandValidator : AbstractValidator<ProductCommand>
{
    public ProductCommandValidator()
    {
        RuleFor(b => b.Name)
            .NotEmpty().WithMessage("Name is required.")
            .Length(ProductModelConstants.Product.MinNameLength, ProductModelConstants.Product.MaxNameLength)
            .WithMessage($"Name must be between {ProductModelConstants.Product.MinNameLength} and {ProductModelConstants.Product.MaxNameLength} characters.");

        RuleFor(b => b.Description)
            .NotEmpty().WithMessage("Description is required.")
            .Length(ProductModelConstants.Product.MinDescriptionLength, ProductModelConstants.Product.MaxDescriptionLength)
            .WithMessage($"Description must be between {ProductModelConstants.Product.MinDescriptionLength} and {ProductModelConstants.Product.MaxDescriptionLength} characters.");

        RuleFor(b => b.Price.Amount)
            .NotEmpty().WithMessage("Price amount is required.")
            .GreaterThan(CommonModelConstants.Common.Zero).WithMessage("Price amount must be greater than zero.")
            .ScalePrecision(2, ProductModelConstants.Price.MaxAmountDigits)
            .WithMessage($"Price amount must have at most {ProductModelConstants.Price.MaxAmountDigits} digits.");

        RuleFor(b => b.Price.Currency)
            .NotEmpty().WithMessage("Price currency is required.")
            .MaximumLength(ProductModelConstants.Price.MaxCurrencyLength)
            .WithMessage($"Price currency must have at most {ProductModelConstants.Price.MaxCurrencyLength} characters.");

        RuleFor(b => b.Weight.Value)
            .NotEmpty().WithMessage("Weight value is required.")
            .GreaterThan(CommonModelConstants.Common.Zero).WithMessage("Weight value must be greater than zero.")
            .ScalePrecision(2, ProductModelConstants.Weight.MaxValueDigits)
            .WithMessage($"Weight value must have at most {ProductModelConstants.Weight.MaxValueDigits} digits.");

        RuleFor(b => b.Weight.Unit)
            .NotEmpty().WithMessage("Weight unit is required.")
            .MaximumLength(ProductModelConstants.Weight.MaxUnitLength)
            .WithMessage($"Weight unit must have at most {ProductModelConstants.Weight.MaxUnitLength} characters.");
    }
}
```

**Infrastructure Layer** — Validation in the infrastructure layer is implemented using the Fluent API. Refer to the `ProductConfiguration.cs` file for details.

To prevent duplication of validation rules, it's recommended to define them in a Constants class within the Common project. This approach allows for easy reuse across the application.

## Clean Architecture Layers

### The Domain Layer

Responsibilities include:

- Domain models / entities
- Value objects
- Enumerations
- Exceptions
- Domain events
- Core domain business logic
- Domain Factories/Builders

The key principle in working with the domain is ensuring that no details from other layers are coupled with it.

**Example Domain layer structure:**

![Domain layer structure](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*43Teyicja1utMgwNLROzBw.png)

### The Application Layer

Responsibilities include:

- Interfaces
- Request/Response Models
- Use cases
- Commands & Queries
- Validators
- Mapping

The application layer is responsible for managing use cases, serving as an orchestration layer for domains. Use cases involving interactions across multiple domains are handled at the application layer, which orchestrates them. For instance, when creating an order through an **OrderManagement** domain, the application layer may interact with a **ProductCatalog** domain via API calls to verify the products included in the order.

**Example Application layer structure:**

![Application layer structure](https://miro.medium.com/v2/resize:fit:1100/format:webp/1*X0IbAAYQWH9WTyTfHn0CoA.png)

**Example Application layer Use Case/Command:**

```csharp
using MediatR;

public class CreateProductCommand : ProductCommand, IRequest<CreateProductResponse>
{
    public class CreateProductCommandHandler : IRequestHandler<CreateProductCommand, CreateProductResponse>
    {
        private readonly IProductDomainRepository productRepository;
        private readonly IProductFactory productFactory;

        public CreateProductCommandHandler(
            IProductDomainRepository productRepository,
            IProductFactory productFactory)
        {
            this.productRepository = productRepository;
            this.productFactory = productFactory;
        }

        public async Task<CreateProductResponse> Handle(
            CreateProductCommand request,
            CancellationToken cancellationToken)
        {
            var product = productFactory
                .WithName(request.Name)
                .WithDescription(request.Description)
                .WithProductType(Enumeration.FromValue<ProductType>(request.ProductType))
                .WithPrice(request.Price.Amount, request.Price.Currency)
                .WithWeight(request.Weight.Value, request.Weight.Unit)
                .Build();

            await productRepository.Save(product, cancellationToken);

            return new CreateProductResponse(product.Id);
        }
    }
}
```

### The Infrastructure Layer

Responsibilities include:

- Persistence
- Identity
- File system
- API clients
- E-mails

The infrastructure layer is responsible for handling the details of how data is stored, retrieved, and communicated with external systems. This is where your Entity Framework `DbContext`s will reside.

### The Web Layer

Responsibilities include:

- Controllers
- Swagger
- Middleware
- Interceptors

In the context of Clean Architecture, the web layer is responsible for handling the interface between the external world (typically users or external systems) and the application's core business logic.

## Migrating Bounded Contexts to Microservices

When transitioning a domain to microservices, the process can be straightforward. Simply create a migration script to transfer your database tables, relocate the .NET solution folder to a new repository, and your migration is complete.

## Conclusion

By leveraging Domain-Driven Design (DDD), we can optimize our .NET development and strategically position ourselves for sustained growth. This approach enhances our agility, allowing us to better handle evolving business requirements and providing the flexibility needed for a seamless future migration to microservices.

---

If you found this article useful and want to discuss further, feel free to reach out on [LinkedIn](https://www.linkedin.com/in/evgeni-rusev-24636017b/) — happy to chat about DDD, Clean Architecture, or anything in between.

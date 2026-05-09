---
layout: ../../layouts/AboutLayout.astro
title: "Legal OS for Startups: From Foundation to AI Layer"
---

![Building a Legal OS for Startups — the startup legal lifecycle (incorporation, fundraising, cap table, employment, compliance), an AI legal assistant, and the underlying tech (DDD architecture, Azure AI integration, 80% faster onboarding, end-to-end platform, Angular + .NET)](../../assets/images/posts/legal-saas-startups.png)

<div class="not-prose my-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
  <div class="rounded-lg border border-border p-5 text-center">
    <div class="text-xl font-bold text-accent">80%+</div>
    <div class="mt-2 text-sm opacity-80">Faster fundraising rounds</div>
  </div>
  <div class="rounded-lg border border-border p-5 text-center">
    <div class="text-xl font-bold text-accent">Lawyer-grade</div>
    <div class="mt-2 text-sm opacity-80">Tier-1 UK law firm partnership</div>
  </div>
  <div class="rounded-lg border border-border p-5 text-center">
    <div class="text-xl font-bold text-accent">Multi-persona</div>
    <div class="mt-2 text-sm opacity-80">Founders, lawyers, investors on one platform</div>
  </div>
  <div class="rounded-lg border border-border p-5 text-center">
    <div class="text-xl font-bold text-accent">Production AI</div>
    <div class="mt-2 text-sm opacity-80">Azure AI Foundry + AI Search deployment</div>
  </div>
</div>

**Client:** A legal SaaS platform for startups, backed by a tier-1 UK law firm.

**Industry:** Legal tech, SaaS.

**My Role:** Technical Team Lead at Tecknoworks, 2021–2025. Led a team of 6 engineers (4 developers, 2 QAs).

---

Most startup founders hit the same wall in the first year: legal work is essential, expensive, and slow. The good lawyers are out of budget. The cheap ones are out of depth. The cap table that looked simple at incorporation gets fragile by the second SAFE. The board pack is overdue. Compliance is whatever the latest founder Slack thread happened to mention.

This platform was built to fix that — a legal product for startups, covering incorporation through fundraising and growth, backed by a tier-1 UK law firm but priced and delivered like a SaaS product.

## The challenge: legal infrastructure across multiple stages of a startup

The product wasn't a single tool. It was an end-to-end **legal operating system** spanning the major surfaces a startup needs:

- **Incorporation** — Companies House filings, founder agreements
- **Fundraising** — SAFEs, ASAs, bridging rounds, priced rounds, term sheets
- **Cap table management** — tracking through multiple rounds, secondary sales, conversions
- **Employment & equity** — employment contracts, option schemes (ESOPs), vesting
- **Compliance & governance** — board management, IP protection, data protection
- **Integrations** — Companies House for electronic filing, integrated e-signing for deal closure

Each surface had its own document templates, workflow logic, regulatory requirements, and edge cases. The platform had to support founders going through it self-service, lawyers stepping in mid-flow, and investors viewing portfolio-level data — all on the same data model.

Beyond the obvious complexity of building this, the harder problem was **trust**. Founders use these documents to raise money. A wrong field on a SAFE doesn't just look bad — it costs equity. Investors won't underwrite documents they can't trust. The platform had to be SaaS-fast in delivery and lawyer-grade in correctness.

## Impact

For founders using the platform:

- **Incorporation** completed in days, not weeks
- **Fundraising rounds** — SAFEs, ASAs, priced rounds — typically run **80%+ faster** than via traditional law firm engagement
- **Cap tables, ESOPs, and board management** all live on one platform instead of scattered across spreadsheets and email threads

For the legal team operating the platform:

- **AI document onboarding** (added 2025) cut template ingestion time by **80%+**
- New round types, jurisdictions, and document classes reach production faster
- Coverage scales without proportional headcount growth

## The AI layer (2025)

By 2025, generative AI had matured into something dependable enough to ship to real users — not just a demo. With the platform's foundations solid after four years of domain work, we started looking at where AI could add real value *on top of* the existing UI.

### AI-accelerated document onboarding

A recurring friction in legal SaaS is **getting documents into the platform** in the first place. Lawyers and operations teams had been spending significant time onboarding new templates — mapping fields, structuring metadata, validating output. The slower this process, the longer it took to support a new round type, jurisdiction, or document class.

We built an AI-accelerated document onboarding workflow. The system reads incoming legal documents, extracts the structural skeleton (clauses, fields, conditional logic), and pre-fills the template authoring environment. Lawyers review and edit, but they don't start from scratch.

The result: **document onboarding speed increased by up to 80%**, significantly reducing friction for adoption.

### AI assistant: a lawyer on demand

Founders using the platform routinely have legal questions that don't quite warrant calling a lawyer but matter enough that they can't afford to guess wrong:

- *"What's the difference between a SAFE and an ASA for this round?"*
- *"Can I add new shareholders without re-running the cap table?"*
- *"What does this employment clause actually mean for my company?"*

Traditionally those questions go to a lawyer — and most early-stage founders can't afford one for casual queries.

We built an AI assistant that acts as a lawyer-on-demand inside the platform. Founders ask in natural language; the assistant answers, grounded in the platform's document corpus and the legal templates curated by the partner firm. Source citations point back to the actual documents the answer came from — so founders can verify, not just trust.

The assistant uses hybrid search (vector + keyword) over the platform's document library and template metadata, suited for the kind of fuzzy semantic queries that don't fit clean SQL.

## What I learned from this

Four years on a single platform teaches things you can't learn in shorter rotations:

- **Domain depth compounds.** The team's understanding of startup legal flows in year four was a technical product moat — far more than the code.
- **Lawyer-grade and SaaS-grade aren't a tradeoff.** With the right architecture, you get both. The friction was always cultural, not technical.
- **AI integration only worked because the platform foundations were solid.** The 2025 Azure AI Foundry + AI Search work succeeded because the document data model from 2021–2024 had been modeled cleanly. Bolting AI onto a messy foundation rarely works.
- **End-to-end ownership matters for product depth.** Leading the same platform from inception to production produces a quality of decision-making that rotating engagements rarely match.

## How

The platform was built end-to-end — from product inception through market launch and stable production operations.

**Architecture:** Domain-Driven Design throughout the .NET backend — bounded contexts for fundraising, cap table, employment, and compliance, each with its own domain model and ubiquitous language shared with the legal team. Clean separation of legal logic from UI. A role-based permissions layer that worked across founder, lawyer, and investor personas through the domain model rather than scattered through the codebase.

**Tech stack:**

- **Frontend:** Angular — the founder-, lawyer-, and investor-facing UI
- **Backend:** .NET with DDD — domain logic, document generation orchestration, integration layer
- **Infrastructure:** Microsoft Azure — App Services, SQL, Storage, Application Insights, Key Vault for secrets
- **Document automation:** [Contract Express](https://legal.thomsonreuters.com/en/products/contract-express) (Thomson Reuters) — Q&A-driven document automation for the lawyer-curated templates
- **AI (added 2025):** Microsoft Azure AI Foundry + Azure AI Search
- **CI/CD:** Azure DevOps pipelines, multi-environment provisioning via Terraform

The same code path supported three different usage modes — founder self-service, lawyer-supervised, and investor read-only. That meant strong domain modeling, clean separation of legal logic from UI, and permissions that lived in the domain model rather than scattered through if-statements that break at audit time.

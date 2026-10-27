# ADR 0001: Multi-company marketplace

## Status
Accepted

## Context
The app could serve a single rental company or connect several companies.

## Decision
Build a marketplace data model (every vehicle and location belongs to a
company) but ship v1 with two seeded companies and no company self-signup.

## Consequences
+ Demonstrates multi-tenancy, roles and richer search/map features
+ Can grow from one company to many without a database rewrite
- Slightly more complex schema than a single-company app
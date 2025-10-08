<!-- 38080596-619b-4161-9633-2e0781fe8683 5c6512c5-fdf1-4c5b-8782-c3d359a370ac -->
# Finish Full App Pages

## Objectives

- Implement detailed invoice and client views under the dashboard layout
- Build out payments and analytics pages with live backend data
- Update documentation/feature brief to reflect completed pages

## Implementation Todos

- routes-update — Extend `src/router.tsx` with routes for payments, analytics, invoice detail, and client detail screens; ensure navigation covers new paths
- invoice-detail — Create UI under dashboard for viewing a single invoice with line items, actions (status change, send/download placeholders)
- client-detail — Create UI for viewing a single client, summary details, and associated invoices with actions
- payments-page — Implement payments listing page with TanStack Table and API integration (or placeholder wiring if backend incomplete)
- analytics-page — Implement analytics dashboard (charts/cards) using available stats endpoints; reuse hooks or add new ones if needed
- brief-update — Update `specs/active/full-app-pages/feature-brief.md` to capture new pages, architecture decisions, and remaining enhancements


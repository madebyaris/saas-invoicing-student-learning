# pgAdmin Configuration

This directory contains the configuration for pgAdmin 4, the database administration tool for the Invoicing SaaS application.

## Quick Start

```bash
# Start pgAdmin with PostgreSQL
make db-admin

# Access pgAdmin in your browser
open http://localhost:5050
```

## Access Information

- **URL**: http://localhost:5050
- **Email**: admin@invoicing.com
- **Password**: admin123

## Pre-configured Server

The pgAdmin instance comes with a pre-configured server connection:

- **Name**: Invoicing SaaS PostgreSQL
- **Host**: postgres
- **Port**: 5432
- **Database**: invoicing
- **Username**: postgres
- **Password**: password

## Files

- `servers.json` - Pre-configured server connections for pgAdmin
- This file is mounted into the pgAdmin container for automatic server setup

## Usage

1. Start pgAdmin: `make db-admin`
2. Open http://localhost:5050 in your browser
3. Login with the credentials above
4. The PostgreSQL server connection will be automatically available
5. Browse the `invoicing` database to view:
   - Tables: users, clients, invoices, invoice_items
   - Schema and relationships
   - Execute queries and manage data

## Stopping pgAdmin

```bash
make db-admin-stop
```

## Notes

- pgAdmin data is persisted in a Docker volume `saas-invoicing_pgadmin_data`
- The server configuration is read-only and cannot be modified from the UI
- For security, use proper credentials in production environments

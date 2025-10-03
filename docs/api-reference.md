# Invoicing SaaS API Reference

**Version**: 1.0  
**Base URL**: `http://localhost:8080`  
**Authentication**: JWT Bearer Token  

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
  - [User Registration](#user-registration)
  - [User Login](#user-login)
  - [JWT Token Usage](#jwt-token-usage)
- [Client Management](#client-management)
  - [Create Client](#create-client)
  - [List Clients](#list-clients)
  - [Get Client](#get-client)
  - [Update Client](#update-client)
  - [Delete Client](#delete-client)
- [Invoice Management](#invoice-management)
  - [Create Invoice](#create-invoice)
  - [List Invoices](#list-invoices)
  - [Get Invoice](#get-invoice)
  - [Update Invoice](#update-invoice)
  - [Update Invoice Status](#update-invoice-status)
  - [Delete Invoice](#delete-invoice)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples & Integration](#examples--integration)

## Overview

The Invoicing SaaS API is a RESTful service that provides complete invoice and client management functionality. All endpoints return JSON responses and use standard HTTP status codes.

### Base Information
- **Protocol**: HTTP/HTTPS
- **Content-Type**: `application/json`
- **Authentication**: JWT Bearer token (except auth endpoints)
- **Rate Limiting**: Not implemented (development)

### Health Check

Check API availability and status.

**Endpoint**: `GET /health`

**Response**:
```json
{
  "status": "ok",
  "service": "invoicing-backend"
}
```

---

## Authentication

### User Registration

Register a new user account.

**Endpoint**: `POST /api/auth/register`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required, minimum 8 characters
- `first_name`: Required, 1-100 characters
- `last_name`: Required, 1-100 characters

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "",
      "timezone": "UTC",
      "created_at": "2025-09-29T10:00:00Z",
      "updated_at": "2025-09-29T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (409):
```json
{
  "success": false,
  "error": "User already exists"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### User Login

Authenticate existing user and receive JWT token.

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "company_name": "",
      "timezone": "UTC",
      "created_at": "2025-09-29T10:00:00Z",
      "updated_at": "2025-09-29T10:00:00Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Error Response** (401):
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### JWT Token Usage

All protected endpoints require a JWT token in the Authorization header.

**Header Format**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Token Expiration**: 24 hours (configurable)

---

## Client Management

All client endpoints require JWT authentication.

### Create Client

Create a new client for the authenticated user.

**Endpoint**: `POST /api/clients`  
**Authentication**: Required

**Request Body**:
```json
{
  "name": "Acme Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-0123",
  "company_name": "Acme Corporation",
  "address_line1": "123 Business St",
  "address_line2": "Suite 100",
  "city": "New York",
  "state": "NY",
  "postal_code": "10001",
  "country": "United States",
  "tax_id": "12-3456789"
}
```

**Required Fields**:
- `name`: Client contact name (1-255 characters)
- `email`: Valid email address

**Optional Fields**:
- `phone`: Phone number (max 50 characters)
- `company_name`: Company name (max 255 characters)
- `address_line1`, `address_line2`: Address (max 255 characters)
- `city`: City (max 100 characters)
- `state`: State/Province (max 100 characters)
- `postal_code`: Postal/ZIP code (max 20 characters)
- `country`: Country (max 100 characters)
- `tax_id`: Tax ID/VAT number (max 50 characters)

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "company_name": "Acme Corporation",
    "address_line1": "123 Business St",
    "address_line2": "Suite 100",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States",
    "tax_id": "12-3456789",
    "created_at": "2025-09-29T10:00:00Z",
    "updated_at": "2025-09-29T10:00:00Z"
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "company_name": "Acme Corporation",
    "address_line1": "123 Business St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States"
  }'
```

### List Clients

Get all clients for the authenticated user.

**Endpoint**: `GET /api/clients`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "phone": "+1-555-0123",
      "company_name": "Acme Corporation",
      "address_line1": "123 Business St",
      "city": "New York",
      "state": "NY",
      "postal_code": "10001",
      "country": "United States",
      "tax_id": "12-3456789",
      "created_at": "2025-09-29T10:00:00Z",
      "updated_at": "2025-09-29T10:00:00Z"
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Client

Get a specific client by ID.

**Endpoint**: `GET /api/clients/:id`  
**Authentication**: Required

**Parameters**:
- `id` (path): Client UUID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "id": "456e7890-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "name": "Acme Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "company_name": "Acme Corporation",
    "address_line1": "123 Business St",
    "city": "New York",
    "state": "NY",
    "postal_code": "10001",
    "country": "United States",
    "tax_id": "12-3456789",
    "created_at": "2025-09-29T10:00:00Z",
    "updated_at": "2025-09-29T10:00:00Z"
  }
}
```

**Error Response** (404):
```json
{
  "success": false,
  "error": "Client not found"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/clients/456e7890-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Client

Update an existing client.

**Endpoint**: `PUT /api/clients/:id`  
**Authentication**: Required

**Parameters**:
- `id` (path): Client UUID

**Request Body**: Same as Create Client (partial updates supported)

**Success Response** (200): Same as Get Client

**cURL Example**:
```bash
curl -X PUT http://localhost:8080/api/clients/456e7890-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Acme Corporation Updated",
    "phone": "+1-555-9999"
  }'
```

### Delete Client

Delete a client (soft delete).

**Endpoint**: `DELETE /api/clients/:id`  
**Authentication**: Required

**Parameters**:
- `id` (path): Client UUID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Client deleted successfully"
  }
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:8080/api/clients/456e7890-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Invoice Management

All invoice endpoints require JWT authentication.

### Create Invoice

Create a new invoice for the authenticated user.

**Endpoint**: `POST /api/invoices`  
**Authentication**: Required

**Request Body**:
```json
{
  "client_id": "456e7890-e89b-12d3-a456-426614174000",
  "invoice_number": "INV-2025-001",
  "issue_date": "2025-09-29T00:00:00Z",
  "due_date": "2025-10-29T00:00:00Z",
  "currency": "USD",
  "tax_rate": 0.08,
  "notes": "Payment due within 30 days",
  "terms": "Net 30",
  "invoice_items": [
    {
      "description": "Website Development",
      "quantity": 1,
      "unit_price": 5000.00
    },
    {
      "description": "Monthly Maintenance",
      "quantity": 3,
      "unit_price": 500.00
    }
  ]
}
```

**Required Fields**:
- `client_id`: UUID of existing client
- `invoice_number`: Unique invoice number
- `issue_date`: Invoice issue date (ISO 8601)
- `due_date`: Payment due date (ISO 8601)

**Optional Fields**:
- `currency`: 3-letter currency code (default: "USD")
- `tax_rate`: Tax rate as decimal (0.08 = 8%)
- `notes`: Additional notes
- `terms`: Payment terms
- `invoice_items`: Array of line items

**Invoice Item Fields**:
- `description`: Required, item description
- `quantity`: Required, quantity (must be > 0)
- `unit_price`: Required, price per unit (>= 0)

**Success Response** (201):
```json
{
  "success": true,
  "data": {
    "id": "789e1234-e89b-12d3-a456-426614174000",
    "user_id": "123e4567-e89b-12d3-a456-426614174000",
    "client_id": "456e7890-e89b-12d3-a456-426614174000",
    "invoice_number": "INV-2025-001",
    "issue_date": "2025-09-29T00:00:00Z",
    "due_date": "2025-10-29T00:00:00Z",
    "status": "draft",
    "currency": "USD",
    "subtotal": 6500.00,
    "tax_rate": 0.08,
    "tax_amount": 520.00,
    "total_amount": 7020.00,
    "notes": "Payment due within 30 days",
    "terms": "Net 30",
    "created_at": "2025-09-29T10:00:00Z",
    "updated_at": "2025-09-29T10:00:00Z",
    "client": {
      "id": "456e7890-e89b-12d3-a456-426614174000",
      "name": "Acme Corporation",
      "email": "contact@acme.com"
    },
    "invoice_items": [
      {
        "id": "abc1234-e89b-12d3-a456-426614174000",
        "invoice_id": "789e1234-e89b-12d3-a456-426614174000",
        "description": "Website Development",
        "quantity": 1,
        "unit_price": 5000.00,
        "total_price": 5000.00,
        "sort_order": 0
      },
      {
        "id": "def5678-e89b-12d3-a456-426614174000",
        "invoice_id": "789e1234-e89b-12d3-a456-426614174000",
        "description": "Monthly Maintenance",
        "quantity": 3,
        "unit_price": 500.00,
        "total_price": 1500.00,
        "sort_order": 1
      }
    ]
  }
}
```

**cURL Example**:
```bash
curl -X POST http://localhost:8080/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "client_id": "456e7890-e89b-12d3-a456-426614174000",
    "invoice_number": "INV-2025-001",
    "issue_date": "2025-09-29T00:00:00Z",
    "due_date": "2025-10-29T00:00:00Z",
    "currency": "USD",
    "tax_rate": 0.08,
    "invoice_items": [
      {
        "description": "Website Development",
        "quantity": 1,
        "unit_price": 5000.00
      }
    ]
  }'
```

### List Invoices

Get all invoices for the authenticated user.

**Endpoint**: `GET /api/invoices`  
**Authentication**: Required

**Success Response** (200):
```json
{
  "success": true,
  "data": [
    {
      "id": "789e1234-e89b-12d3-a456-426614174000",
      "user_id": "123e4567-e89b-12d3-a456-426614174000",
      "client_id": "456e7890-e89b-12d3-a456-426614174000",
      "invoice_number": "INV-2025-001",
      "issue_date": "2025-09-29T00:00:00Z",
      "due_date": "2025-10-29T00:00:00Z",
      "status": "draft",
      "currency": "USD",
      "subtotal": 6500.00,
      "tax_rate": 0.08,
      "tax_amount": 520.00,
      "total_amount": 7020.00,
      "notes": "Payment due within 30 days",
      "terms": "Net 30",
      "created_at": "2025-09-29T10:00:00Z",
      "updated_at": "2025-09-29T10:00:00Z",
      "client": {
        "id": "456e7890-e89b-12d3-a456-426614174000",
        "name": "Acme Corporation",
        "email": "contact@acme.com"
      },
      "invoice_items": [...]
    }
  ]
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/invoices \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Get Invoice

Get a specific invoice by ID.

**Endpoint**: `GET /api/invoices/:id`  
**Authentication**: Required

**Parameters**:
- `id` (path): Invoice UUID

**Success Response** (200): Same as Create Invoice response

**Error Response** (404):
```json
{
  "success": false,
  "error": "Invoice not found"
}
```

**cURL Example**:
```bash
curl -X GET http://localhost:8080/api/invoices/789e1234-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Update Invoice

Update an existing invoice.

**Endpoint**: `PUT /api/invoices/:id`  
**Authentication**: Required

**Parameters**:
- `id` (path): Invoice UUID

**Request Body**: Same as Create Invoice (partial updates supported)

**Success Response** (200): Same as Get Invoice

**cURL Example**:
```bash
curl -X PUT http://localhost:8080/api/invoices/789e1234-e89b-12d3-a456-426614174000 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "notes": "Updated payment terms",
    "due_date": "2025-11-15T00:00:00Z"
  }'
```

### Update Invoice Status

Update only the status of an invoice.

**Endpoint**: `PUT /api/invoices/:id/status`  
**Authentication**: Required

**Parameters**:
- `id` (path): Invoice UUID

**Request Body**:
```json
{
  "status": "sent"
}
```

**Valid Status Values**:
- `draft`: Invoice created but not sent
- `sent`: Invoice sent to client
- `paid`: Payment received
- `overdue`: Past due date
- `cancelled`: Invoice cancelled

**Success Response** (200): Same as Get Invoice

**cURL Example**:
```bash
curl -X PUT http://localhost:8080/api/invoices/789e1234-e89b-12d3-a456-426614174000/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "sent"
  }'
```

### Delete Invoice

Delete an invoice (soft delete).

**Endpoint**: `DELETE /api/invoices/:id`  
**Authentication**: Required

**Parameters**:
- `id` (path): Invoice UUID

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "message": "Invoice deleted successfully"
  }
}
```

**cURL Example**:
```bash
curl -X DELETE http://localhost:8080/api/invoices/789e1234-e89b-12d3-a456-426614174000 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Data Models

### User Schema

```json
{
  "id": "uuid",
  "email": "string (required, unique)",
  "first_name": "string (required, 1-100 chars)",
  "last_name": "string (required, 1-100 chars)",
  "company_name": "string (optional, max 255 chars)",
  "timezone": "string (default: UTC)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Client Schema

```json
{
  "id": "uuid",
  "user_id": "uuid (foreign key)",
  "name": "string (required, 1-255 chars)",
  "email": "string (required, valid email)",
  "phone": "string (optional, max 50 chars)",
  "company_name": "string (optional, max 255 chars)",
  "address_line1": "string (optional, max 255 chars)",
  "address_line2": "string (optional, max 255 chars)",
  "city": "string (optional, max 100 chars)",
  "state": "string (optional, max 100 chars)",
  "postal_code": "string (optional, max 20 chars)",
  "country": "string (optional, max 100 chars)",
  "tax_id": "string (optional, max 50 chars)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Invoice Schema

```json
{
  "id": "uuid",
  "user_id": "uuid (foreign key)",
  "client_id": "uuid (foreign key)",
  "invoice_number": "string (required, unique per user)",
  "issue_date": "timestamp (required)",
  "due_date": "timestamp (required)",
  "status": "enum (draft|sent|paid|overdue|cancelled)",
  "currency": "string (3 chars, default: USD)",
  "subtotal": "decimal(12,2) (calculated)",
  "tax_rate": "decimal(5,4) (default: 0)",
  "tax_amount": "decimal(12,2) (calculated)",
  "total_amount": "decimal(12,2) (calculated)",
  "notes": "text (optional)",
  "terms": "text (optional)",
  "created_at": "timestamp",
  "updated_at": "timestamp",
  "client": "Client object",
  "invoice_items": "array of InvoiceItem objects"
}
```

### InvoiceItem Schema

```json
{
  "id": "uuid",
  "invoice_id": "uuid (foreign key)",
  "description": "text (required)",
  "quantity": "decimal(10,2) (required, > 0)",
  "unit_price": "decimal(12,2) (required, >= 0)",
  "total_price": "decimal(12,2) (calculated: quantity * unit_price)",
  "sort_order": "integer (default: 0)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

---

## Error Handling

### Standard Error Response Format

All API errors follow this consistent format:

```json
{
  "success": false,
  "error": "Error message description"
}
```

### HTTP Status Codes

- **200 OK**: Successful GET, PUT, DELETE requests
- **201 Created**: Successful POST requests
- **400 Bad Request**: Invalid request data, validation errors
- **401 Unauthorized**: Missing, invalid, or expired JWT token
- **404 Not Found**: Resource not found or user doesn't have access
- **409 Conflict**: Resource already exists (e.g., duplicate email)
- **500 Internal Server Error**: Server-side errors

### Common Error Scenarios

#### Authentication Errors

**Missing Authorization Header**:
```json
{
  "success": false,
  "error": "Authorization header required"
}
```

**Invalid Token Format**:
```json
{
  "success": false,
  "error": "Invalid authorization header format"
}
```

**Expired Token**:
```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

#### Validation Errors

**Invalid Request Body**:
```json
{
  "success": false,
  "error": "Invalid request body"
}
```

**Missing Required Fields**: (Specific field validation handled by validator)

#### Resource Errors

**Resource Not Found**:
```json
{
  "success": false,
  "error": "Client not found"
}
```

**Invalid UUID**:
```json
{
  "success": false,
  "error": "Invalid client ID"
}
```

---

## Examples & Integration

### Complete Authentication Flow

1. **Register a new user**:
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "developer@example.com",
    "password": "securepassword123",
    "first_name": "Jane",
    "last_name": "Developer"
  }'
```

2. **Save the JWT token from response**

3. **Create a client**:
```bash
curl -X POST http://localhost:8080/api/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "name": "Tech Startup Inc",
    "email": "billing@techstartup.com",
    "company_name": "Tech Startup Inc"
  }'
```

4. **Create an invoice**:
```bash
curl -X POST http://localhost:8080/api/invoices \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "client_id": "CLIENT_ID_FROM_STEP_3",
    "invoice_number": "INV-001",
    "issue_date": "2025-09-29T00:00:00Z",
    "due_date": "2025-10-29T00:00:00Z",
    "invoice_items": [
      {
        "description": "API Development",
        "quantity": 1,
        "unit_price": 10000.00
      }
    ]
  }'
```

5. **Update invoice status**:
```bash
curl -X PUT http://localhost:8080/api/invoices/INVOICE_ID/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "status": "sent"
  }'
```

### Frontend Integration Example (JavaScript)

```javascript
class InvoicingAPI {
  constructor(baseURL = 'http://localhost:8080') {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('jwt_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }

    return data;
  }

  // Auth methods
  async register(userData) {
    const response = await this.request('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    this.token = response.data.token;
    localStorage.setItem('jwt_token', this.token);
    return response.data;
  }

  async login(email, password) {
    const response = await this.request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.token = response.data.token;
    localStorage.setItem('jwt_token', this.token);
    return response.data;
  }

  // Client methods
  async getClients() {
    const response = await this.request('/api/clients');
    return response.data;
  }

  async createClient(clientData) {
    const response = await this.request('/api/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
    return response.data;
  }

  // Invoice methods
  async getInvoices() {
    const response = await this.request('/api/invoices');
    return response.data;
  }

  async createInvoice(invoiceData) {
    const response = await this.request('/api/invoices', {
      method: 'POST',
      body: JSON.stringify(invoiceData),
    });
    return response.data;
  }

  async updateInvoiceStatus(invoiceId, status) {
    const response = await this.request(`/api/invoices/${invoiceId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
    return response.data;
  }
}

// Usage
const api = new InvoicingAPI();

// Login and create invoice
async function example() {
  try {
    await api.login('user@example.com', 'password');
    const clients = await api.getClients();
    const invoice = await api.createInvoice({
      client_id: clients[0].id,
      invoice_number: 'INV-002',
      issue_date: new Date().toISOString(),
      due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      invoice_items: [
        {
          description: 'Consulting Services',
          quantity: 10,
          unit_price: 150.00
        }
      ]
    });
    console.log('Invoice created:', invoice);
  } catch (error) {
    console.error('API Error:', error.message);
  }
}
```

### Development Setup

1. **Start the API server**:
```bash
cd invoicing-backend
make dev  # or go run cmd/server/main.go
```

2. **Health check**:
```bash
curl http://localhost:8080/health
```

3. **Test authentication**:
```bash
# Register
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### Best Practices

1. **Always include proper error handling** in your client applications
2. **Store JWT tokens securely** (consider using HTTP-only cookies for web apps)
3. **Implement token refresh logic** for long-running applications
4. **Validate data on the frontend** before sending to API
5. **Use environment variables** for API URLs in different environments
6. **Implement proper loading states** for better UX
7. **Log API errors** for debugging purposes

---

## Rate Limiting & Security

**Current Implementation**: Not implemented (development environment)

**Production Recommendations**:
- Implement rate limiting (e.g., 100 requests per minute per user)
- Use HTTPS in production
- Implement proper CORS policies
- Add request/response logging
- Consider implementing API versioning
- Add input sanitization for XSS prevention

---

**Last Updated**: September 29, 2025  
**API Version**: 1.0  
**Documentation Version**: 1.0  

For questions or support, please contact the development team.

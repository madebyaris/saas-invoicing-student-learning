# Technical Implementation Guide - Invoicing SaaS Application

## 1. Architecture Overview

### 1.1 System Architecture
```
┌─────────────────┐    HTTP/HTTPS    ┌──────────────────┐
│   React SPA     │◄─────────────────┤   Go API Server   │
│   (Frontend)    │                  │    (Backend)     │
│   Port: 3000    │                  │    Port: 8080    │
└─────────────────┘                  └──────────────────┘
                                               │
                                               ▼
                                     ┌──────────────────┐
                                     │  PostgreSQL 18   │
                                     │   Database       │
                                     │   Port: 5432     │
                                     └──────────────────┘
```

### 1.2 Technology Stack Summary

**Backend:**
- **Language**: Go 1.21+
- **Web Framework**: Gin (HTTP router and middleware)
- **ORM**: GORM v2 (database operations)
- **Database**: PostgreSQL 18
- **Authentication**: JWT with golang-jwt/jwt v5
- **Validation**: go-playground/validator v10
- **CORS**: jub0bs/cors (modern CORS middleware)
- **Migration**: golang-migrate (database migrations)
- **Configuration**: viper (configuration management)
- **Logging**: logrus or slog (structured logging)

**Frontend:**
- **Build Tool**: Vite 5+
- **Framework**: React 18+ with TypeScript
- **Routing**: TanStack Router v1 (file-based routing)
- **State Management**: TanStack Query v5 (server state)
- **Authentication**: Better Auth (latest auth solution)
- **Forms**: React Hook Form + Zod validation
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI or Radix UI + custom components
- **Data Tables**: TanStack Table v8 (for invoice/client lists)

## 2. Backend Implementation

### 2.1 Project Structure
```
invoicing-backend/
├── cmd/
│   └── server/
│       └── main.go                 # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go              # Configuration management
│   ├── database/
│   │   ├── connection.go          # Database connection
│   │   └── migrations.go          # Migration runner
│   ├── models/
│   │   ├── user.go               # User model
│   │   ├── client.go             # Client model
│   │   └── invoice.go            # Invoice model
│   ├── handlers/
│   │   ├── auth.go               # Authentication handlers
│   │   ├── client.go             # Client CRUD handlers
│   │   └── invoice.go            # Invoice CRUD handlers
│   ├── middleware/
│   │   ├── auth.go               # JWT authentication middleware
│   │   ├── cors.go               # CORS configuration
│   │   └── validation.go         # Request validation
│   ├── services/
│   │   ├── auth.go               # Authentication business logic
│   │   ├── client.go             # Client business logic
│   │   └── invoice.go            # Invoice business logic
│   └── utils/
│       ├── jwt.go                # JWT utilities
│       ├── password.go           # Password hashing
│       └── response.go           # Response utilities
├── migrations/
│   ├── 001_create_users_table.up.sql
│   ├── 001_create_users_table.down.sql
│   ├── 002_create_clients_table.up.sql
│   ├── 002_create_clients_table.down.sql
│   ├── 003_create_invoices_table.up.sql
│   ├── 003_create_invoices_table.down.sql
│   ├── 004_create_invoice_items_table.up.sql
│   └── 004_create_invoice_items_table.down.sql
├── go.mod
├── go.sum
├── Dockerfile
├── docker-compose.yml
└── README.md
```

### 2.2 Core Dependencies (go.mod)
```go
module github.com/yourusername/invoicing-backend

go 1.21

require (
    github.com/gin-gonic/gin v1.10.0
    github.com/golang-jwt/jwt/v5 v5.2.0
    github.com/jub0bs/cors v0.2.0
    gorm.io/gorm v1.25.5
    gorm.io/driver/postgres v1.5.4
    github.com/golang-migrate/migrate/v4 v4.17.0
    github.com/go-playground/validator/v10 v10.16.0
    github.com/spf13/viper v1.18.2
    github.com/sirupsen/logrus v1.9.3
    golang.org/x/crypto v0.17.0
)
```

### 2.3 Database Schema Design

#### 2.3.1 Users Table
```sql
-- 001_create_users_table.up.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company_name VARCHAR(255),
    timezone VARCHAR(50) DEFAULT 'UTC',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_deleted_at ON users(deleted_at);
```

#### 2.3.2 Clients Table
```sql
-- 002_create_clients_table.up.sql
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    company_name VARCHAR(255),
    address_line1 VARCHAR(255),
    address_line2 VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),
    postal_code VARCHAR(20),
    country VARCHAR(100),
    tax_id VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_clients_deleted_at ON clients(deleted_at);
```

#### 2.3.3 Invoices Table
```sql
-- 003_create_invoices_table.up.sql
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');

CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
    invoice_number VARCHAR(50) NOT NULL,
    issue_date DATE NOT NULL,
    due_date DATE NOT NULL,
    status invoice_status NOT NULL DEFAULT 'draft',
    currency VARCHAR(3) DEFAULT 'USD',
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    tax_rate DECIMAL(5,4) DEFAULT 0,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    notes TEXT,
    terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

CREATE UNIQUE INDEX idx_invoices_user_invoice_number ON invoices(user_id, invoice_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_invoices_client_id ON invoices(client_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_deleted_at ON invoices(deleted_at);
```

#### 2.3.4 Invoice Items Table
```sql
-- 004_create_invoice_items_table.up.sql
CREATE TABLE invoice_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_invoice_items_invoice_id ON invoice_items(invoice_id);
CREATE INDEX idx_invoice_items_sort_order ON invoice_items(invoice_id, sort_order);
```

### 2.4 Go Models (GORM)

#### 2.4.1 Base Model
```go
// internal/models/base.go
package models

import (
    "time"
    "github.com/google/uuid"
    "gorm.io/gorm"
)

type Base struct {
    ID        uuid.UUID      `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    CreatedAt time.Time      `json:"created_at"`
    UpdatedAt time.Time      `json:"updated_at"`
    DeletedAt gorm.DeletedAt `json:"-" gorm:"index"`
}

func (b *Base) BeforeCreate(tx *gorm.DB) (err error) {
    if b.ID == uuid.Nil {
        b.ID = uuid.New()
    }
    return
}
```

#### 2.4.2 User Model
```go
// internal/models/user.go
package models

import (
    "golang.org/x/crypto/bcrypt"
    "gorm.io/gorm"
)

type User struct {
    Base
    Email       string `json:"email" gorm:"uniqueIndex;not null" validate:"required,email"`
    PasswordHash string `json:"-" gorm:"not null"`
    FirstName   string `json:"first_name" gorm:"not null" validate:"required,min=1,max=100"`
    LastName    string `json:"last_name" gorm:"not null" validate:"required,min=1,max=100"`
    CompanyName string `json:"company_name" gorm:"size:255"`
    Timezone    string `json:"timezone" gorm:"default:UTC"`
    
    // Relationships
    Clients  []Client  `json:"clients" gorm:"constraint:OnDelete:CASCADE;"`
    Invoices []Invoice `json:"invoices" gorm:"constraint:OnDelete:CASCADE;"`
}

func (u *User) SetPassword(password string) error {
    hashedPassword, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    if err != nil {
        return err
    }
    u.PasswordHash = string(hashedPassword)
    return nil
}

func (u *User) CheckPassword(password string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(u.PasswordHash), []byte(password))
    return err == nil
}
```

#### 2.4.3 Client Model
```go
// internal/models/client.go
package models

import "github.com/google/uuid"

type Client struct {
    Base
    UserID       uuid.UUID `json:"user_id" gorm:"not null;index"`
    Name         string    `json:"name" gorm:"not null" validate:"required,min=1,max=255"`
    Email        string    `json:"email" gorm:"not null;index" validate:"required,email"`
    Phone        string    `json:"phone" gorm:"size:50"`
    CompanyName  string    `json:"company_name" gorm:"size:255"`
    AddressLine1 string    `json:"address_line1" gorm:"size:255"`
    AddressLine2 string    `json:"address_line2" gorm:"size:255"`
    City         string    `json:"city" gorm:"size:100"`
    State        string    `json:"state" gorm:"size:100"`
    PostalCode   string    `json:"postal_code" gorm:"size:20"`
    Country      string    `json:"country" gorm:"size:100"`
    TaxID        string    `json:"tax_id" gorm:"size:50"`
    
    // Relationships
    User     User      `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
    Invoices []Invoice `json:"invoices" gorm:"constraint:OnDelete:RESTRICT;"`
}
```

#### 2.4.4 Invoice Models
```go
// internal/models/invoice.go
package models

import (
    "github.com/google/uuid"
    "time"
)

type InvoiceStatus string

const (
    InvoiceStatusDraft     InvoiceStatus = "draft"
    InvoiceStatusSent      InvoiceStatus = "sent"
    InvoiceStatusPaid      InvoiceStatus = "paid"
    InvoiceStatusOverdue   InvoiceStatus = "overdue"
    InvoiceStatusCancelled InvoiceStatus = "cancelled"
)

type Invoice struct {
    Base
    UserID        uuid.UUID     `json:"user_id" gorm:"not null;index"`
    ClientID      uuid.UUID     `json:"client_id" gorm:"not null;index"`
    InvoiceNumber string        `json:"invoice_number" gorm:"not null"`
    IssueDate     time.Time     `json:"issue_date" gorm:"not null"`
    DueDate       time.Time     `json:"due_date" gorm:"not null"`
    Status        InvoiceStatus `json:"status" gorm:"not null;default:draft;index"`
    Currency      string        `json:"currency" gorm:"default:USD;size:3"`
    Subtotal      float64       `json:"subtotal" gorm:"type:decimal(12,2);not null;default:0"`
    TaxRate       float64       `json:"tax_rate" gorm:"type:decimal(5,4);default:0"`
    TaxAmount     float64       `json:"tax_amount" gorm:"type:decimal(12,2);not null;default:0"`
    TotalAmount   float64       `json:"total_amount" gorm:"type:decimal(12,2);not null;default:0"`
    Notes         string        `json:"notes" gorm:"type:text"`
    Terms         string        `json:"terms" gorm:"type:text"`
    
    // Relationships
    User        User          `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
    Client      Client        `json:"client" gorm:"constraint:OnDelete:RESTRICT;"`
    InvoiceItems []InvoiceItem `json:"invoice_items" gorm:"constraint:OnDelete:CASCADE;"`
}

type InvoiceItem struct {
    ID          uuid.UUID `json:"id" gorm:"type:uuid;primary_key;default:gen_random_uuid()"`
    InvoiceID   uuid.UUID `json:"invoice_id" gorm:"not null;index"`
    Description string    `json:"description" gorm:"type:text;not null" validate:"required"`
    Quantity    float64   `json:"quantity" gorm:"type:decimal(10,2);not null;default:1" validate:"gt=0"`
    UnitPrice   float64   `json:"unit_price" gorm:"type:decimal(12,2);not null" validate:"gte=0"`
    TotalPrice  float64   `json:"total_price" gorm:"type:decimal(12,2);not null"`
    SortOrder   int       `json:"sort_order" gorm:"default:0"`
    CreatedAt   time.Time `json:"created_at"`
    UpdatedAt   time.Time `json:"updated_at"`
    
    // Relationships
    Invoice Invoice `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
}

func (ii *InvoiceItem) BeforeCreate(tx *gorm.DB) (err error) {
    if ii.ID == uuid.Nil {
        ii.ID = uuid.New()
    }
    ii.TotalPrice = ii.Quantity * ii.UnitPrice
    return
}

func (ii *InvoiceItem) BeforeUpdate(tx *gorm.DB) (err error) {
    ii.TotalPrice = ii.Quantity * ii.UnitPrice
    return
}
```

### 2.5 API Handlers Implementation

#### 2.5.1 Authentication Handler
```go
// internal/handlers/auth.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/go-playground/validator/v10"
    "your-app/internal/models"
    "your-app/internal/services"
    "your-app/internal/utils"
)

type AuthHandler struct {
    authService *services.AuthService
    validator   *validator.Validate
}

func NewAuthHandler(authService *services.AuthService) *AuthHandler {
    return &AuthHandler{
        authService: authService,
        validator:   validator.New(),
    }
}

type RegisterRequest struct {
    Email     string `json:"email" validate:"required,email"`
    Password  string `json:"password" validate:"required,min=8"`
    FirstName string `json:"first_name" validate:"required,min=1,max=100"`
    LastName  string `json:"last_name" validate:"required,min=1,max=100"`
}

type LoginRequest struct {
    Email    string `json:"email" validate:"required,email"`
    Password string `json:"password" validate:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
    var req RegisterRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
        return
    }

    if err := h.validator.Struct(req); err != nil {
        utils.ValidationErrorResponse(c, err)
        return
    }

    user, err := h.authService.Register(req.Email, req.Password, req.FirstName, req.LastName)
    if err != nil {
        utils.ErrorResponse(c, http.StatusConflict, "User already exists")
        return
    }

    token, err := utils.GenerateJWT(user.ID)
    if err != nil {
        utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate token")
        return
    }

    utils.SuccessResponse(c, http.StatusCreated, gin.H{
        "user":  user,
        "token": token,
    })
}

func (h *AuthHandler) Login(c *gin.Context) {
    var req LoginRequest
    if err := c.ShouldBindJSON(&req); err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
        return
    }

    if err := h.validator.Struct(req); err != nil {
        utils.ValidationErrorResponse(c, err)
        return
    }

    user, err := h.authService.Login(req.Email, req.Password)
    if err != nil {
        utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid credentials")
        return
    }

    token, err := utils.GenerateJWT(user.ID)
    if err != nil {
        utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to generate token")
        return
    }

    utils.SuccessResponse(c, http.StatusOK, gin.H{
        "user":  user,
        "token": token,
    })
}
```

#### 2.5.2 Client Handler
```go
// internal/handlers/client.go
package handlers

import (
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/google/uuid"
    "your-app/internal/services"
    "your-app/internal/utils"
)

type ClientHandler struct {
    clientService *services.ClientService
}

func NewClientHandler(clientService *services.ClientService) *ClientHandler {
    return &ClientHandler{clientService: clientService}
}

func (h *ClientHandler) CreateClient(c *gin.Context) {
    userID := utils.GetUserIDFromContext(c)
    
    var client models.Client
    if err := c.ShouldBindJSON(&client); err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
        return
    }

    client.UserID = userID
    createdClient, err := h.clientService.CreateClient(&client)
    if err != nil {
        utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create client")
        return
    }

    utils.SuccessResponse(c, http.StatusCreated, createdClient)
}

func (h *ClientHandler) GetClients(c *gin.Context) {
    userID := utils.GetUserIDFromContext(c)
    
    clients, err := h.clientService.GetClientsByUserID(userID)
    if err != nil {
        utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch clients")
        return
    }

    utils.SuccessResponse(c, http.StatusOK, clients)
}

func (h *ClientHandler) GetClient(c *gin.Context) {
    userID := utils.GetUserIDFromContext(c)
    clientID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid client ID")
        return
    }

    client, err := h.clientService.GetClientByID(clientID, userID)
    if err != nil {
        utils.ErrorResponse(c, http.StatusNotFound, "Client not found")
        return
    }

    utils.SuccessResponse(c, http.StatusOK, client)
}

func (h *ClientHandler) UpdateClient(c *gin.Context) {
    userID := utils.GetUserIDFromContext(c)
    clientID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid client ID")
        return
    }

    var updateData models.Client
    if err := c.ShouldBindJSON(&updateData); err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
        return
    }

    client, err := h.clientService.UpdateClient(clientID, userID, &updateData)
    if err != nil {
        utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update client")
        return
    }

    utils.SuccessResponse(c, http.StatusOK, client)
}

func (h *ClientHandler) DeleteClient(c *gin.Context) {
    userID := utils.GetUserIDFromContext(c)
    clientID, err := uuid.Parse(c.Param("id"))
    if err != nil {
        utils.ErrorResponse(c, http.StatusBadRequest, "Invalid client ID")
        return
    }

    err = h.clientService.DeleteClient(clientID, userID)
    if err != nil {
        utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete client")
        return
    }

    utils.SuccessResponse(c, http.StatusOK, gin.H{"message": "Client deleted successfully"})
}
```

### 2.6 JWT Middleware Implementation
```go
// internal/middleware/auth.go
package middleware

import (
    "net/http"
    "strings"
    "github.com/gin-gonic/gin"
    "github.com/golang-jwt/jwt/v5"
    "github.com/google/uuid"
    "your-app/internal/utils"
)

func JWTAuthMiddleware() gin.HandlerFunc {
    return func(c *gin.Context) {
        authHeader := c.GetHeader("Authorization")
        if authHeader == "" {
            utils.ErrorResponse(c, http.StatusUnauthorized, "Authorization header required")
            c.Abort()
            return
        }

        tokenString := strings.TrimPrefix(authHeader, "Bearer ")
        if tokenString == authHeader {
            utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid authorization header format")
            c.Abort()
            return
        }

        token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
            if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
                return nil, jwt.ErrSignatureInvalid
            }
            return []byte(utils.GetJWTSecret()), nil
        })

        if err != nil || !token.Valid {
            utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token")
            c.Abort()
            return
        }

        claims, ok := token.Claims.(jwt.MapClaims)
        if !ok {
            utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid token claims")
            c.Abort()
            return
        }

        userIDStr, ok := claims["user_id"].(string)
        if !ok {
            utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID in token")
            c.Abort()
            return
        }

        userID, err := uuid.Parse(userIDStr)
        if err != nil {
            utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid user ID format")
            c.Abort()
            return
        }

        c.Set("user_id", userID)
        c.Next()
    }
}
```

## 3. Frontend Implementation

### 3.1 Project Structure
```
invoicing-frontend/
├── src/
│   ├── components/
│   │   ├── ui/                    # Base UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Table.tsx
│   │   ├── forms/                 # Form components
│   │   │   ├── ClientForm.tsx
│   │   │   ├── InvoiceForm.tsx
│   │   │   └── LoginForm.tsx
│   │   ├── layout/                # Layout components
│   │   │   ├── Header.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── Layout.tsx
│   │   └── features/              # Feature-specific components
│   │       ├── clients/
│   │       ├── invoices/
│   │       └── dashboard/
│   ├── hooks/                     # Custom React hooks
│   │   ├── useAuth.ts
│   │   ├── useClients.ts
│   │   └── useInvoices.ts
│   ├── lib/                       # Utility libraries
│   │   ├── api.ts                # API client setup
│   │   ├── auth.ts               # Better Auth configuration
│   │   ├── utils.ts              # General utilities
│   │   └── validations.ts        # Zod schemas
│   ├── pages/                    # Route pages
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── invoices/
│   │   └── dashboard.tsx
│   ├── styles/                   # CSS files
│   │   └── globals.css
│   ├── types/                    # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── client.ts
│   │   └── invoice.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── router.tsx               # TanStack Router setup
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
├── vite.config.ts
└── README.md
```

### 3.2 Package Dependencies (package.json)
```json
{
  "name": "invoicing-frontend",
  "private": true,
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-router": "^1.45.0",
    "@tanstack/react-query": "^5.48.0",
    "@tanstack/react-table": "^8.17.0",
    "better-auth": "^1.0.0",
    "react-hook-form": "^7.52.0",
    "zod": "^3.23.0",
    "@hookform/resolvers": "^3.6.0",
    "axios": "^1.7.0",
    "date-fns": "^3.6.0",
    "lucide-react": "^0.395.0",
    "@headlessui/react": "^2.1.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "@vitejs/plugin-react": "^4.3.0",
    "autoprefixer": "^10.4.19",
    "eslint": "^8.57.0",
    "eslint-plugin-react-hooks": "^4.6.2",
    "eslint-plugin-react-refresh": "^0.4.7",
    "postcss": "^8.4.39",
    "tailwindcss": "^4.0.0-alpha.15",
    "typescript": "^5.2.2",
    "vite": "^5.3.0"
  }
}
```

### 3.3 Better Auth Configuration
```typescript
// src/lib/auth.ts
import { betterAuth } from "better-auth"
import { organization } from "better-auth/plugins"

export const auth = betterAuth({
  baseURL: "http://localhost:3000", // Your frontend URL
  database: {
    // This points to your Go backend API
    provider: "custom",
    customProvider: {
      async create(data: any) {
        const response = await fetch("http://localhost:8080/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        })
        return response.json()
      },
      async authenticate(email: string, password: string) {
        const response = await fetch("http://localhost:8080/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        })
        return response.json()
      }
    }
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Enable in production
  },
  plugins: [
    // Add plugins as needed
  ]
})

// Auth client for components
export const authClient = auth.createAuthClient()
```

### 3.4 API Client Setup
```typescript
// src/lib/api.ts
import axios from 'axios'
import { authClient } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080'

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const session = await authClient.getSession()
    if (session?.token) {
      config.headers.Authorization = `Bearer ${session.token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await authClient.signOut()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

### 3.5 TanStack Query Setup
```typescript
// src/hooks/useClients.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../lib/api'
import type { Client } from '../types/client'

export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data } = await apiClient.get<{ data: Client[] }>('/api/clients')
      return data.data
    },
  })
}

export const useCreateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (clientData: Partial<Client>) => {
      const { data } = await apiClient.post<{ data: Client }>('/api/clients', clientData)
      return data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useUpdateClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const response = await apiClient.put<{ data: Client }>(`/api/clients/${id}`, data)
      return response.data.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}

export const useDeleteClient = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/clients/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] })
    },
  })
}
```

### 3.6 Form Implementation with React Hook Form + Zod
```typescript
// src/lib/validations.ts
import { z } from 'zod'

export const clientSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email address'),
  phone: z.string().max(50).optional(),
  company_name: z.string().max(255).optional(),
  address_line1: z.string().max(255).optional(),
  address_line2: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  postal_code: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  tax_id: z.string().max(50).optional(),
})

export type ClientFormData = z.infer<typeof clientSchema>

// src/components/forms/ClientForm.tsx
import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { clientSchema, type ClientFormData } from '../../lib/validations'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'

interface ClientFormProps {
  onSubmit: (data: ClientFormData) => void
  defaultValues?: Partial<ClientFormData>
  isLoading?: boolean
}

export const ClientForm: React.FC<ClientFormProps> = ({
  onSubmit,
  defaultValues,
  isLoading = false
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Name *"
          {...register('name')}
          error={errors.name?.message}
        />
        <Input
          label="Email *"
          type="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          label="Phone"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <Input
          label="Company Name"
          {...register('company_name')}
          error={errors.company_name?.message}
        />
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Address</h3>
        <Input
          label="Address Line 1"
          {...register('address_line1')}
          error={errors.address_line1?.message}
        />
        <Input
          label="Address Line 2"
          {...register('address_line2')}
          error={errors.address_line2?.message}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="City"
            {...register('city')}
            error={errors.city?.message}
          />
          <Input
            label="State"
            {...register('state')}
            error={errors.state?.message}
          />
          <Input
            label="Postal Code"
            {...register('postal_code')}
            error={errors.postal_code?.message}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Country"
            {...register('country')}
            error={errors.country?.message}
          />
          <Input
            label="Tax ID"
            {...register('tax_id')}
            error={errors.tax_id?.message}
          />
        </div>
      </div>
      
      <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
        Save Client
      </Button>
    </form>
  )
}
```

### 3.7 TanStack Table Implementation
```typescript
// src/components/features/clients/ClientsTable.tsx
import React from 'react'
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getSortedRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { Client } from '../../../types/client'
import { Button } from '../../ui/Button'

const columnHelper = createColumnHelper<Client>()

interface ClientsTableProps {
  clients: Client[]
  onEdit: (client: Client) => void
  onDelete: (client: Client) => void
}

export const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  onEdit,
  onDelete
}) => {
  const columns = React.useMemo(() => [
    columnHelper.accessor('name', {
      header: 'Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('email', {
      header: 'Email',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('company_name', {
      header: 'Company',
      cell: info => info.getValue() || '—',
    }),
    columnHelper.accessor('created_at', {
      header: 'Created',
      cell: info => new Date(info.getValue()).toLocaleDateString(),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex space-x-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(row.original)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => onDelete(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    }),
  ], [onEdit, onDelete])

  const table = useReactTable({
    data: clients,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  })

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {table.getRowModel().rows.map(row => (
            <tr key={row.id}>
              {row.getVisibleCells().map(cell => (
                <td
                  key={cell.id}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## 4. Development Setup

### 4.1 Development Environment
```bash
# Backend setup
cd invoicing-backend
go mod init github.com/yourusername/invoicing-backend
go mod tidy

# Install golang-migrate for database migrations
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create and run database migrations
migrate create -ext sql -dir migrations -seq create_users_table
migrate -path migrations -database "postgres://user:password@localhost:5432/invoicing?sslmode=disable" up

# Frontend setup
cd ../invoicing-frontend
npm create vite@latest . --template react-ts
npm install

# Install additional dependencies
npm install @tanstack/react-router @tanstack/react-query @tanstack/react-table
npm install better-auth react-hook-form @hookform/resolvers zod
npm install axios date-fns lucide-react @headlessui/react
npm install -D tailwindcss autoprefixer postcss
```

### 4.2 Docker Development Setup
```yaml
# docker-compose.yml
version: '3.8'

services:
  postgres:
    image: postgres:18-alpine
    environment:
      POSTGRES_DB: invoicing
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./invoicing-backend
    ports:
      - "8080:8080"
    depends_on:
      - postgres
    environment:
      - DATABASE_URL=postgres://postgres:password@postgres:5432/invoicing?sslmode=disable
      - JWT_SECRET=your-jwt-secret-key
      - PORT=8080
    volumes:
      - ./invoicing-backend:/app

  frontend:
    build: ./invoicing-frontend
    ports:
      - "3000:3000"
    volumes:
      - ./invoicing-frontend:/app
    environment:
      - VITE_API_URL=http://localhost:8080

volumes:
  postgres_data:
```

### 4.3 Environment Configuration
```bash
# Backend .env
DATABASE_URL=postgres://postgres:password@localhost:5432/invoicing?sslmode=disable
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h
PORT=8080
GIN_MODE=debug

# Frontend .env
VITE_API_URL=http://localhost:8080
VITE_APP_NAME=Invoicing SaaS
```

## 5. Testing Strategy

### 5.1 Backend Testing
```go
// tests/handlers/auth_test.go
package handlers_test

import (
    "testing"
    "github.com/stretchr/testify/assert"
    // Add your test implementations
)

func TestUserRegistration(t *testing.T) {
    // Test user registration endpoint
}

func TestUserLogin(t *testing.T) {
    // Test user login endpoint
}
```

### 5.2 Frontend Testing
```typescript
// src/__tests__/components/ClientForm.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ClientForm } from '../components/forms/ClientForm'

test('renders client form with required fields', () => {
  render(<ClientForm onSubmit={() => {}} />)
  
  expect(screen.getByLabelText(/name/i)).toBeInTheDocument()
  expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
})
```

## 6. Deployment Considerations

### 6.1 Production Environment Variables
```bash
# Backend production .env
DATABASE_URL=postgres://user:password@prod-db-host:5432/invoicing?sslmode=require
JWT_SECRET=very-long-random-secret-key-for-production
JWT_EXPIRES_IN=7d
PORT=8080
GIN_MODE=release
LOG_LEVEL=info

# Frontend production .env
VITE_API_URL=https://api.yourapp.com
VITE_APP_NAME=Invoicing SaaS
```

### 6.2 Docker Production Setup
```dockerfile
# Backend Dockerfile
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.* ./
RUN go mod download
COPY . .
RUN go build -o main cmd/server/main.go

FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /app/main ./
CMD ["./main"]

# Frontend Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

This technical implementation guide provides a comprehensive foundation for building your invoicing SaaS application with modern Go and React technologies. The architecture is designed to be simple yet scalable, following current best practices for both backend and frontend development.
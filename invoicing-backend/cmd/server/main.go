package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/yourusername/invoicing-backend/internal/config"
	"github.com/yourusername/invoicing-backend/internal/database"
	"github.com/yourusername/invoicing-backend/internal/handlers"
	"github.com/yourusername/invoicing-backend/internal/middleware"
	"github.com/yourusername/invoicing-backend/internal/services"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}

	// Load configuration
	cfg := config.Load()

	// Initialize database
	db, err := database.Initialize(cfg.DatabaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Run migrations
	if err := database.RunMigrations(cfg.DatabaseURL); err != nil {
		log.Fatal("Failed to run migrations:", err)
	}

	// Initialize Gin router
	if cfg.Environment == "production" {
		gin.SetMode(gin.ReleaseMode)
	}

	r := gin.Default()

	// Add CORS middleware
	r.Use(middleware.CORSMiddleware())

	// Health check endpoint
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status":  "ok",
			"service": "invoicing-backend",
		})
	})

	// Initialize services
	authService := services.NewAuthService(db)
	clientService := services.NewClientService(db)
	invoiceService := services.NewInvoiceService(db)

	// Initialize middleware
	authMiddleware := middleware.NewAuthMiddleware(db)
	rbacMiddleware := middleware.NewRBACMiddleware(db)

	// Initialize handlers
	authHandler := handlers.NewAuthHandler(authService)
	clientHandler := handlers.NewClientHandler(clientService)
	invoiceHandler := handlers.NewInvoiceHandler(invoiceService)

	// API routes
	api := r.Group("/api")
	{
		// Authentication routes
		api.POST("/auth/register", authHandler.Register)
		api.POST("/auth/login", authHandler.Login)

		// Protected routes with RBAC
		protected := api.Group("/")
		protected.Use(authMiddleware.JWTAuthMiddleware())
		protected.Use(rbacMiddleware.OrganizationContextMiddleware())
		protected.Use(rbacMiddleware.RequireActiveSubscription())
		{
			// Client management routes
			protected.POST("/clients",
				rbacMiddleware.RequirePermission("clients", "create"),
				rbacMiddleware.EnforceUsageLimits("clients"),
				clientHandler.CreateClient)
			protected.GET("/clients",
				rbacMiddleware.RequirePermission("clients", "read"),
				clientHandler.GetClients)
			protected.GET("/clients/:id",
				rbacMiddleware.RequirePermission("clients", "read"),
				clientHandler.GetClient)
			protected.PUT("/clients/:id",
				rbacMiddleware.RequireOwnershipOrPermission("clients", "update", "user_id"),
				clientHandler.UpdateClient)
			protected.DELETE("/clients/:id",
				rbacMiddleware.RequireOwnershipOrPermission("clients", "delete", "user_id"),
				clientHandler.DeleteClient)

			// Invoice management routes
			protected.POST("/invoices",
				rbacMiddleware.RequirePermission("invoices", "create"),
				rbacMiddleware.EnforceUsageLimits("invoices"),
				invoiceHandler.CreateInvoice)
			protected.GET("/invoices",
				rbacMiddleware.RequirePermission("invoices", "read"),
				invoiceHandler.GetInvoices)
			protected.GET("/invoices/:id",
				rbacMiddleware.RequirePermission("invoices", "read"),
				invoiceHandler.GetInvoice)
			protected.PUT("/invoices/:id",
				rbacMiddleware.RequireOwnershipOrPermission("invoices", "update", "user_id"),
				invoiceHandler.UpdateInvoice)
			protected.PUT("/invoices/:id/status",
				rbacMiddleware.RequireOwnershipOrPermission("invoices", "update", "user_id"),
				invoiceHandler.UpdateInvoiceStatus)
			protected.DELETE("/invoices/:id",
				rbacMiddleware.RequireOwnershipOrPermission("invoices", "delete", "user_id"),
				invoiceHandler.DeleteInvoice)

			// Organization management routes (for future implementation)
			protected.GET("/organizations",
				rbacMiddleware.RequireRole("platform_admin", "org_admin"),
				func(c *gin.Context) { c.JSON(200, gin.H{"message": "Organizations endpoint - to be implemented"}) })

			// User management routes (for future implementation)
			protected.GET("/users",
				rbacMiddleware.RequirePermission("users", "read"),
				func(c *gin.Context) { c.JSON(200, gin.H{"message": "Users endpoint - to be implemented"}) })

			// Current user context route
			protected.GET("/me", func(c *gin.Context) {
				userID, _ := c.Get("user_id")
				orgID, _ := c.Get("organization_id")
				userRole, _ := c.Get("user_role")
				c.JSON(200, gin.H{
					"user_id":         userID,
					"organization_id": orgID,
					"role":            userRole,
				})
			})
		}
	}

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Starting server on port %s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatal("Failed to start server:", err)
	}
}

package middleware

import (
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/invoicing-backend/internal/models"
	"github.com/yourusername/invoicing-backend/internal/utils"
	"gorm.io/gorm"
)

// AuthMiddleware provides authentication functionality
type AuthMiddleware struct {
	db *gorm.DB
}

// NewAuthMiddleware creates a new auth middleware instance
func NewAuthMiddleware(db *gorm.DB) *AuthMiddleware {
	return &AuthMiddleware{db: db}
}

// JWTAuthMiddleware validates JWT tokens and loads user context
func (auth *AuthMiddleware) JWTAuthMiddleware() gin.HandlerFunc {
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

		userID, err := utils.ValidateJWT(tokenString)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		// Load user with organization roles for context
		var user models.User
		if err := auth.db.Preload("UserOrganizationRoles.Role").
			Preload("UserOrganizationRoles.Organization").
			Preload("CurrentOrganization").
			First(&user, "id = ?", userID).Error; err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User not found")
			c.Abort()
			return
		}

		// Set user context
		c.Set("user_id", userID.String())
		c.Set("user", user)
		c.Next()
	}
}

// Legacy function for backwards compatibility
func JWTAuthMiddleware() gin.HandlerFunc {
	// This will require database access to be fully functional
	// For now, it maintains the basic JWT validation
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

		userID, err := utils.ValidateJWT(tokenString)
		if err != nil {
			utils.ErrorResponse(c, http.StatusUnauthorized, "Invalid or expired token")
			c.Abort()
			return
		}

		c.Set("user_id", userID.String())
		c.Next()
	}
}

// OptionalAuth middleware for endpoints that work with or without authentication
func (auth *AuthMiddleware) OptionalAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			// No auth header, continue without setting user context
			c.Next()
			return
		}

		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader {
			// Invalid format, continue without setting user context
			c.Next()
			return
		}

		userID, err := utils.ValidateJWT(tokenString)
		if err != nil {
			// Invalid token, continue without setting user context
			c.Next()
			return
		}

		// Valid token, set user context
		c.Set("user_id", userID.String())

		// Load user data if needed
		var user models.User
		if err := auth.db.Preload("UserOrganizationRoles.Role").
			Preload("UserOrganizationRoles.Organization").
			First(&user, "id = ?", userID).Error; err == nil {
			c.Set("user", user)
		}

		c.Next()
	}
}

package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/invoicing-backend/internal/models"
	"github.com/yourusername/invoicing-backend/internal/utils"
	"gorm.io/gorm"
)

// RBACMiddleware provides role-based access control functionality
type RBACMiddleware struct {
	db *gorm.DB
}

// NewRBACMiddleware creates a new RBAC middleware instance
func NewRBACMiddleware(db *gorm.DB) *RBACMiddleware {
	return &RBACMiddleware{db: db}
}

// OrganizationContextMiddleware extracts and validates organization context
func (rbac *RBACMiddleware) OrganizationContextMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		userIDStr, exists := c.Get("user_id")
		if !exists {
			utils.ErrorResponse(c, http.StatusUnauthorized, "User ID not found in context")
			c.Abort()
			return
		}

		userID := userIDStr.(string)

		// Get organization ID from header, query param, or path param
		orgID := rbac.extractOrganizationID(c)
		if orgID == "" {
			// If no org ID specified, use user's current organization
			var user models.User
			if err := rbac.db.Preload("UserOrganizationRoles.Role").
				Preload("UserOrganizationRoles.Organization").
				First(&user, "id = ?", userID).Error; err != nil {
				utils.ErrorResponse(c, http.StatusUnauthorized, "User not found")
				c.Abort()
				return
			}

			orgID = user.GetDefaultOrganizationID()
			if orgID == "" {
				utils.ErrorResponse(c, http.StatusForbidden, "No organization access")
				c.Abort()
				return
			}
		}

		// Verify user has access to this organization
		var userOrgRole models.UserOrganizationRole
		if err := rbac.db.Preload("Role").Preload("Organization").
			Where("user_id = ? AND organization_id = ?", userID, orgID).
			First(&userOrgRole).Error; err != nil {
			utils.ErrorResponse(c, http.StatusForbidden, "Access denied to organization")
			c.Abort()
			return
		}

		// Set context variables
		c.Set("organization_id", orgID)
		c.Set("user_role", userOrgRole.Role.Name)
		c.Set("role_permissions", userOrgRole.Role.Permissions)
		c.Set("user_org_role", userOrgRole)

		c.Next()
	}
}

// RequirePermission creates middleware that checks specific resource/action permissions
func (rbac *RBACMiddleware) RequirePermission(resource, action string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userOrgRoleInterface, exists := c.Get("user_org_role")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "User role not found in context")
			c.Abort()
			return
		}

		userOrgRole := userOrgRoleInterface.(models.UserOrganizationRole)

		// Check if user has permission
		if !userOrgRole.Role.HasPermission(resource, action) {
			utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
			c.Abort()
			return
		}

		c.Next()
	}
}

// RequireOwnershipOrPermission checks if user owns the resource OR has the required permission
func (rbac *RBACMiddleware) RequireOwnershipOrPermission(resource, action string, ownerField string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userID, _ := c.Get("user_id")
		userOrgRoleInterface, exists := c.Get("user_org_role")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "User role not found in context")
			c.Abort()
			return
		}

		userOrgRole := userOrgRoleInterface.(models.UserOrganizationRole)

		// If user has the permission globally, allow access
		if userOrgRole.Role.HasPermission(resource, action) {
			c.Next()
			return
		}

		// Check ownership-based permissions
		resourceID := c.Param("id")
		if resourceID != "" {
			isOwner := rbac.checkResourceOwnership(userID.(string), resource, resourceID, ownerField)
			ownResource := "own_" + resource
			if isOwner && userOrgRole.Role.HasPermission(ownResource, action) {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Insufficient permissions")
		c.Abort()
	}
}

// RequireRole creates middleware that checks for specific roles
func (rbac *RBACMiddleware) RequireRole(allowedRoles ...string) gin.HandlerFunc {
	return func(c *gin.Context) {
		userRole, exists := c.Get("user_role")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "User role not found in context")
			c.Abort()
			return
		}

		userRoleStr := userRole.(string)
		for _, role := range allowedRoles {
			if userRoleStr == role {
				c.Next()
				return
			}
		}

		utils.ErrorResponse(c, http.StatusForbidden, "Insufficient role permissions")
		c.Abort()
	}
}

// RequirePlatformAdmin ensures only platform admins can access the endpoint
func (rbac *RBACMiddleware) RequirePlatformAdmin() gin.HandlerFunc {
	return rbac.RequireRole(models.RolePlatformAdmin)
}

// RequireOrgAdmin ensures only organization admins (or platform admins) can access
func (rbac *RBACMiddleware) RequireOrgAdmin() gin.HandlerFunc {
	return rbac.RequireRole(models.RolePlatformAdmin, models.RoleOrgAdmin)
}

// RequireActiveSubscription ensures the organization has an active subscription
func (rbac *RBACMiddleware) RequireActiveSubscription() gin.HandlerFunc {
	return func(c *gin.Context) {
		orgID, exists := c.Get("organization_id")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
			c.Abort()
			return
		}

		var subscription models.Subscription
		if err := rbac.db.Where("organization_id = ? AND status = ?",
			orgID, models.SubscriptionStatusActive).First(&subscription).Error; err != nil {
			utils.ErrorResponse(c, http.StatusForbidden, "Active subscription required")
			c.Abort()
			return
		}

		// Check if subscription is expired
		if subscription.IsExpired() {
			utils.ErrorResponse(c, http.StatusForbidden, "Subscription expired")
			c.Abort()
			return
		}

		c.Set("subscription", subscription)
		c.Next()
	}
}

// EnforceUsageLimits middleware that checks subscription limits before allowing resource creation
func (rbac *RBACMiddleware) EnforceUsageLimits(resourceType string) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Only enforce limits on POST/CREATE requests
		if c.Request.Method != "POST" {
			c.Next()
			return
		}

		subscriptionInterface, exists := c.Get("subscription")
		if !exists {
			utils.ErrorResponse(c, http.StatusForbidden, "Subscription context required")
			c.Abort()
			return
		}

		subscription := subscriptionInterface.(models.Subscription)
		orgID, _ := c.Get("organization_id")

		switch resourceType {
		case "invoices":
			if !rbac.checkInvoiceLimit(subscription, orgID.(string)) {
				utils.ErrorResponse(c, http.StatusForbidden, "Monthly invoice limit reached")
				c.Abort()
				return
			}
		case "clients":
			if !rbac.checkClientLimit(subscription, orgID.(string)) {
				utils.ErrorResponse(c, http.StatusForbidden, "Client limit reached")
				c.Abort()
				return
			}
		case "users":
			if !rbac.checkUserLimit(subscription, orgID.(string)) {
				utils.ErrorResponse(c, http.StatusForbidden, "User limit reached")
				c.Abort()
				return
			}
		}

		c.Next()
	}
}

// Helper methods

func (rbac *RBACMiddleware) extractOrganizationID(c *gin.Context) string {
	// Try header first (preferred for API clients)
	if orgID := c.GetHeader("X-Organization-ID"); orgID != "" {
		return orgID
	}

	// Try query parameter
	if orgID := c.Query("organization_id"); orgID != "" {
		return orgID
	}

	// Try path parameter for nested routes
	if orgID := c.Param("organization_id"); orgID != "" {
		return orgID
	}

	return ""
}

func (rbac *RBACMiddleware) checkResourceOwnership(userID, resourceType, resourceID, ownerField string) bool {
	var count int64

	switch resourceType {
	case "invoices":
		rbac.db.Model(&models.Invoice{}).Where("id = ? AND user_id = ?", resourceID, userID).Count(&count)
	case "clients":
		rbac.db.Model(&models.Client{}).Where("id = ? AND user_id = ?", resourceID, userID).Count(&count)
	default:
		return false
	}

	return count > 0
}

func (rbac *RBACMiddleware) checkInvoiceLimit(subscription models.Subscription, orgID string) bool {
	var count int64
	rbac.db.Model(&models.Invoice{}).
		Where("organization_id = ? AND EXTRACT(MONTH FROM created_at) = EXTRACT(MONTH FROM CURRENT_DATE) AND EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE)", orgID).
		Count(&count)

	return subscription.CanCreateInvoices(int(count))
}

func (rbac *RBACMiddleware) checkClientLimit(subscription models.Subscription, orgID string) bool {
	var count int64
	rbac.db.Model(&models.Client{}).Where("organization_id = ?", orgID).Count(&count)
	return subscription.CanCreateClients(int(count))
}

func (rbac *RBACMiddleware) checkUserLimit(subscription models.Subscription, orgID string) bool {
	var count int64
	rbac.db.Model(&models.UserOrganizationRole{}).Where("organization_id = ?", orgID).Count(&count)
	return subscription.CanAddUsers(int(count))
}

package models

import (
	"time"
)

type UserOrganizationRole struct {
	ID             string    `json:"id" gorm:"primarykey;type:uuid;default:gen_random_uuid()"`
	UserID         string    `json:"user_id" gorm:"not null;index"`
	OrganizationID string    `json:"organization_id" gorm:"not null;index"`
	RoleID         string    `json:"role_id" gorm:"not null;index"`
	AssignedBy     *string   `json:"assigned_by" gorm:"index"` // UUID of user who assigned this role
	AssignedAt     time.Time `json:"assigned_at" gorm:"not null;default:CURRENT_TIMESTAMP"`
	CreatedAt      time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt      time.Time `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships (without soft deletes)
	User           User         `json:"user" gorm:"constraint:OnDelete:CASCADE;"`
	Organization   Organization `json:"organization" gorm:"constraint:OnDelete:CASCADE;"`
	Role           Role         `json:"role" gorm:"constraint:OnDelete:CASCADE;"`
	AssignedByUser *User        `json:"assigned_by_user" gorm:"foreignKey:AssignedBy;constraint:OnDelete:SET NULL;"`
}

// UserPermissionContext represents the context for checking user permissions
type UserPermissionContext struct {
	UserID         string
	OrganizationID string
	Role           *Role
	IsOwner        bool // True if the user owns the resource being accessed
}

// GetUserRoleInOrganization retrieves the user's role in a specific organization
func GetUserRoleInOrganization(db interface{}, userID, organizationID string) (*Role, error) {
	// This will be implemented in the service layer
	// Returning nil for now as it needs database connection
	return nil, nil
}

// HasPermissionInOrganization checks if a user has specific permission in an organization
func (uor *UserOrganizationRole) HasPermissionInOrganization(resource, action string) bool {
	if uor.Role.ID == "" || uor.Role.Name == "" {
		return false
	}
	return uor.Role.HasPermission(resource, action)
}

// GetPermissionContext creates a permission context for a user in an organization
func GetPermissionContext(userID, organizationID string, role *Role, isOwner bool) *UserPermissionContext {
	return &UserPermissionContext{
		UserID:         userID,
		OrganizationID: organizationID,
		Role:           role,
		IsOwner:        isOwner,
	}
}

// CanPerformAction checks if the user can perform a specific action based on their role and ownership
func (ctx *UserPermissionContext) CanPerformAction(resource, action string) bool {
	if ctx.Role == nil {
		return false
	}

	// Check if user has direct permission for the resource
	if ctx.Role.HasPermission(resource, action) {
		return true
	}

	// Check ownership-based permissions (e.g., delete own invoices)
	if ctx.IsOwner {
		ownResource := "own_" + resource
		if ctx.Role.HasPermission(ownResource, action) {
			return true
		}
	}

	return false
}

// IsPlatformAdmin checks if the user is a platform administrator
func (ctx *UserPermissionContext) IsPlatformAdmin() bool {
	return ctx.Role != nil && ctx.Role.Name == RolePlatformAdmin
}

// IsOrgAdmin checks if the user is an organization administrator
func (ctx *UserPermissionContext) IsOrgAdmin() bool {
	return ctx.Role != nil && ctx.Role.Name == RoleOrgAdmin
}

// IsOrgUser checks if the user is an organization user (can create/edit content)
func (ctx *UserPermissionContext) IsOrgUser() bool {
	return ctx.Role != nil && (ctx.Role.Name == RoleOrgUser || ctx.IsOrgAdmin() || ctx.IsPlatformAdmin())
}

// CanManageUsers checks if the user can manage other users in the organization
func (ctx *UserPermissionContext) CanManageUsers() bool {
	return ctx.CanPerformAction(ResourceUsers, PermissionManage) ||
		ctx.CanPerformAction(ResourceUsers, PermissionCreate)
}

// CanManageSubscription checks if the user can manage the organization's subscription
func (ctx *UserPermissionContext) CanManageSubscription() bool {
	return ctx.CanPerformAction(ResourceSubscription, PermissionUpdate) ||
		ctx.CanPerformAction(ResourceSubscriptions, PermissionManage)
}

package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
	"time"
)

type Role struct {
	ID           string          `json:"id" gorm:"primarykey;type:uuid;default:gen_random_uuid()"`
	Name         string          `json:"name" gorm:"unique;not null;size:100;index" validate:"required"`
	Description  string          `json:"description" gorm:"type:text"`
	Permissions  RolePermissions `json:"permissions" gorm:"type:jsonb;not null;default:'{}'"`
	IsSystemRole bool            `json:"is_system_role" gorm:"not null;default:false;index"`
	CreatedAt    time.Time       `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt    time.Time       `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships (without soft deletes for system roles)
	UserOrganizationRoles []UserOrganizationRole `json:"user_organization_roles" gorm:"constraint:OnDelete:RESTRICT;"`
}

// RolePermissions represents the JSON permissions structure for a role
type RolePermissions struct {
	Organizations []string `json:"organizations,omitempty"` // ["create", "read", "update", "delete"]
	Users         []string `json:"users,omitempty"`         // ["create", "read", "update", "delete"]
	Invoices      []string `json:"invoices,omitempty"`      // ["create", "read", "update", "delete"]
	Clients       []string `json:"clients,omitempty"`       // ["create", "read", "update", "delete"]
	Subscriptions []string `json:"subscriptions,omitempty"` // ["create", "read", "update", "delete"]
	OwnInvoices   []string `json:"own_invoices,omitempty"`  // ["delete"] - for own content only
	OwnClients    []string `json:"own_clients,omitempty"`   // ["delete"] - for own content only
	Organization  []string `json:"organization,omitempty"`  // ["read", "update"] - current org
	Subscription  []string `json:"subscription,omitempty"`  // ["read", "update"] - current org subscription
}

// System role constants
const (
	RolePlatformAdmin = "platform_admin"
	RoleOrgAdmin      = "org_admin"
	RoleOrgUser       = "org_user"
	RoleOrgViewer     = "org_viewer"
)

// Permission action constants
const (
	PermissionCreate = "create"
	PermissionRead   = "read"
	PermissionUpdate = "update"
	PermissionDelete = "delete"
	PermissionManage = "manage" // Special permission that includes all CRUD operations
)

// Resource constants
const (
	ResourceOrganizations = "organizations"
	ResourceUsers         = "users"
	ResourceInvoices      = "invoices"
	ResourceClients       = "clients"
	ResourceSubscriptions = "subscriptions"
	ResourceOwnInvoices   = "own_invoices"
	ResourceOwnClients    = "own_clients"
	ResourceOrganization  = "organization"
	ResourceSubscription  = "subscription"
)

// Implement the driver.Valuer interface for GORM JSONB support
func (rp RolePermissions) Value() (driver.Value, error) {
	return json.Marshal(rp)
}

// Implement the sql.Scanner interface for GORM JSONB support
func (rp *RolePermissions) Scan(value interface{}) error {
	if value == nil {
		*rp = RolePermissions{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal RolePermissions value: %v", value)
	}

	return json.Unmarshal(bytes, rp)
}

// HasPermission checks if the role has a specific permission for a resource
func (r *Role) HasPermission(resource, action string) bool {
	var permissions []string

	switch resource {
	case ResourceOrganizations:
		permissions = r.Permissions.Organizations
	case ResourceUsers:
		permissions = r.Permissions.Users
	case ResourceInvoices:
		permissions = r.Permissions.Invoices
	case ResourceClients:
		permissions = r.Permissions.Clients
	case ResourceSubscriptions:
		permissions = r.Permissions.Subscriptions
	case ResourceOwnInvoices:
		permissions = r.Permissions.OwnInvoices
	case ResourceOwnClients:
		permissions = r.Permissions.OwnClients
	case ResourceOrganization:
		permissions = r.Permissions.Organization
	case ResourceSubscription:
		permissions = r.Permissions.Subscription
	default:
		return false
	}

	// Check for specific permission or manage permission (which includes all)
	for _, perm := range permissions {
		if perm == action || perm == PermissionManage {
			return true
		}
	}

	return false
}

// GetDefaultPermissions returns the default permissions for system roles
func GetDefaultPermissions(roleName string) RolePermissions {
	switch roleName {
	case RolePlatformAdmin:
		return RolePermissions{
			Organizations: []string{PermissionManage},
			Users:         []string{PermissionManage},
			Subscriptions: []string{PermissionManage},
			Invoices:      []string{PermissionRead, PermissionUpdate, PermissionDelete},
			Clients:       []string{PermissionRead, PermissionUpdate, PermissionDelete},
		}
	case RoleOrgAdmin:
		return RolePermissions{
			Organization: []string{PermissionRead, PermissionUpdate},
			Users:        []string{PermissionManage},
			Invoices:     []string{PermissionManage},
			Clients:      []string{PermissionManage},
			Subscription: []string{PermissionRead, PermissionUpdate},
		}
	case RoleOrgUser:
		return RolePermissions{
			Invoices:    []string{PermissionCreate, PermissionRead, PermissionUpdate},
			Clients:     []string{PermissionCreate, PermissionRead, PermissionUpdate},
			OwnInvoices: []string{PermissionDelete},
			OwnClients:  []string{PermissionDelete},
		}
	case RoleOrgViewer:
		return RolePermissions{
			Invoices: []string{PermissionRead},
			Clients:  []string{PermissionRead},
		}
	default:
		return RolePermissions{}
	}
}

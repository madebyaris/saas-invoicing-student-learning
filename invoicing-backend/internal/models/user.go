package models

import (
	"golang.org/x/crypto/bcrypt"
)

type User struct {
	Base
	Email                 string  `json:"email" gorm:"uniqueIndex;not null" validate:"required,email"`
	PasswordHash          string  `json:"-" gorm:"not null"`
	FirstName             string  `json:"first_name" gorm:"not null" validate:"required,min=1,max=100"`
	LastName              string  `json:"last_name" gorm:"not null" validate:"required,min=1,max=100"`
	CompanyName           string  `json:"company_name" gorm:"size:255"`
	Timezone              string  `json:"timezone" gorm:"default:UTC"`
	CurrentOrganizationID *string `json:"current_organization_id" gorm:"index"`

	// Relationships
	CurrentOrganization   *Organization          `json:"current_organization" gorm:"foreignKey:CurrentOrganizationID;constraint:OnDelete:SET NULL;"`
	Organizations         []Organization         `json:"organizations" gorm:"many2many:user_organization_roles;"`
	UserOrganizationRoles []UserOrganizationRole `json:"user_organization_roles" gorm:"constraint:OnDelete:CASCADE;"`
	Clients               []Client               `json:"clients" gorm:"constraint:OnDelete:CASCADE;"`
	Invoices              []Invoice              `json:"invoices" gorm:"constraint:OnDelete:CASCADE;"`
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

// GetFullName returns the user's full name
func (u *User) GetFullName() string {
	return u.FirstName + " " + u.LastName
}

// GetRoleInOrganization returns the user's role in a specific organization
func (u *User) GetRoleInOrganization(organizationID string) *Role {
	for _, uor := range u.UserOrganizationRoles {
		if uor.OrganizationID == organizationID {
			return &uor.Role
		}
	}
	return nil
}

// HasAccessToOrganization checks if the user has access to a specific organization
func (u *User) HasAccessToOrganization(organizationID string) bool {
	for _, uor := range u.UserOrganizationRoles {
		if uor.OrganizationID == organizationID {
			return true
		}
	}
	return false
}

// GetPermissionContext returns the permission context for the user in the current organization
func (u *User) GetPermissionContext(organizationID string, isOwner bool) *UserPermissionContext {
	role := u.GetRoleInOrganization(organizationID)
	return GetPermissionContext(u.ID.String(), organizationID, role, isOwner)
}

// CanPerformActionInOrganization checks if the user can perform a specific action in an organization
func (u *User) CanPerformActionInOrganization(organizationID, resource, action string, isOwner bool) bool {
	ctx := u.GetPermissionContext(organizationID, isOwner)
	return ctx.CanPerformAction(resource, action)
}

// IsPlatformAdminInAnyOrg checks if the user is a platform admin in any organization
func (u *User) IsPlatformAdminInAnyOrg() bool {
	for _, uor := range u.UserOrganizationRoles {
		if uor.Role.Name == RolePlatformAdmin {
			return true
		}
	}
	return false
}

// GetDefaultOrganizationID returns the user's current organization ID or the first organization they belong to
func (u *User) GetDefaultOrganizationID() string {
	if u.CurrentOrganizationID != nil {
		return *u.CurrentOrganizationID
	}

	if len(u.UserOrganizationRoles) > 0 {
		return u.UserOrganizationRoles[0].OrganizationID
	}

	return ""
}

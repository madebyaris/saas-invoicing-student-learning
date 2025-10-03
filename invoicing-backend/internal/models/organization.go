package models

import (
	"database/sql/driver"
	"encoding/json"
	"fmt"
)

type Organization struct {
	Base
	Name      string               `json:"name" gorm:"not null;index" validate:"required,min=1,max=255"`
	Subdomain string               `json:"subdomain" gorm:"unique;size:100"`
	Settings  OrganizationSettings `json:"settings" gorm:"type:jsonb;not null;default:'{}'"`

	// Relationships
	Subscription          *Subscription          `json:"subscription" gorm:"constraint:OnDelete:SET NULL;"`
	Users                 []User                 `json:"users" gorm:"many2many:user_organization_roles;"`
	UserOrganizationRoles []UserOrganizationRole `json:"user_organization_roles" gorm:"constraint:OnDelete:CASCADE;"`
	Clients               []Client               `json:"clients" gorm:"constraint:OnDelete:CASCADE;"`
	Invoices              []Invoice              `json:"invoices" gorm:"constraint:OnDelete:CASCADE;"`
}

// OrganizationSettings represents the JSON settings for an organization
type OrganizationSettings struct {
	IsDefault              bool `json:"is_default,omitempty"`
	CreatedDuringMigration bool `json:"created_during_migration,omitempty"`
	CompanyAddress         struct {
		AddressLine1 string `json:"address_line1,omitempty"`
		AddressLine2 string `json:"address_line2,omitempty"`
		City         string `json:"city,omitempty"`
		State        string `json:"state,omitempty"`
		PostalCode   string `json:"postal_code,omitempty"`
		Country      string `json:"country,omitempty"`
	} `json:"company_address,omitempty"`
	BrandingSettings struct {
		LogoURL      string `json:"logo_url,omitempty"`
		PrimaryColor string `json:"primary_color,omitempty"`
		Theme        string `json:"theme,omitempty"`
	} `json:"branding_settings,omitempty"`
	InvoiceSettings struct {
		DefaultCurrency     string  `json:"default_currency,omitempty"`
		DefaultTaxRate      float64 `json:"default_tax_rate,omitempty"`
		InvoiceNumberPrefix string  `json:"invoice_number_prefix,omitempty"`
		PaymentTermsDays    int     `json:"payment_terms_days,omitempty"`
	} `json:"invoice_settings,omitempty"`
	NotificationSettings struct {
		EmailNotifications bool `json:"email_notifications,omitempty"`
		SlackIntegration   bool `json:"slack_integration,omitempty"`
	} `json:"notification_settings,omitempty"`
}

// Implement the driver.Valuer interface for GORM JSONB support
func (os OrganizationSettings) Value() (driver.Value, error) {
	return json.Marshal(os)
}

// Implement the sql.Scanner interface for GORM JSONB support
func (os *OrganizationSettings) Scan(value interface{}) error {
	if value == nil {
		*os = OrganizationSettings{}
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return fmt.Errorf("failed to unmarshal OrganizationSettings value: %v", value)
	}

	return json.Unmarshal(bytes, os)
}

package models

type Client struct {
	Base
	UserID         string `json:"user_id" gorm:"not null;index"`
	OrganizationID string `json:"organization_id" gorm:"not null;index"`
	Name           string `json:"name" gorm:"not null" validate:"required,min=1,max=255"`
	Email          string `json:"email" gorm:"not null;index" validate:"required,email"`
	Phone          string `json:"phone" gorm:"size:50"`
	CompanyName    string `json:"company_name" gorm:"size:255"`
	AddressLine1   string `json:"address_line1" gorm:"size:255"`
	AddressLine2   string `json:"address_line2" gorm:"size:255"`
	City           string `json:"city" gorm:"size:100"`
	State          string `json:"state" gorm:"size:100"`
	PostalCode     string `json:"postal_code" gorm:"size:20"`
	Country        string `json:"country" gorm:"size:100"`
	TaxID          string `json:"tax_id" gorm:"size:50"`

	// Relationships
	User         User         `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
	Organization Organization `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
	Invoices     []Invoice    `json:"invoices" gorm:"constraint:OnDelete:RESTRICT;"`
}

package models

import (
	"time"

	"gorm.io/gorm"
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
	UserID         string        `json:"user_id" gorm:"not null;index"`
	OrganizationID string        `json:"organization_id" gorm:"not null;index"`
	ClientID       string        `json:"client_id" gorm:"not null;index"`
	InvoiceNumber  string        `json:"invoice_number" gorm:"not null"`
	IssueDate      time.Time     `json:"issue_date" gorm:"not null"`
	DueDate        time.Time     `json:"due_date" gorm:"not null"`
	Status         InvoiceStatus `json:"status" gorm:"not null;default:draft;index"`
	Currency       string        `json:"currency" gorm:"default:USD;size:3"`
	Subtotal       float64       `json:"subtotal" gorm:"type:decimal(12,2);not null;default:0"`
	TaxRate        float64       `json:"tax_rate" gorm:"type:decimal(5,4);default:0"`
	TaxAmount      float64       `json:"tax_amount" gorm:"type:decimal(12,2);not null;default:0"`
	TotalAmount    float64       `json:"total_amount" gorm:"type:decimal(12,2);not null;default:0"`
	Notes          string        `json:"notes" gorm:"type:text"`
	Terms          string        `json:"terms" gorm:"type:text"`

	// Relationships
	User         User          `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
	Organization Organization  `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
	Client       Client        `json:"client" gorm:"constraint:OnDelete:RESTRICT;"`
	InvoiceItems []InvoiceItem `json:"invoice_items" gorm:"constraint:OnDelete:CASCADE;"`
}

type InvoiceItem struct {
	Base
	InvoiceID   string  `json:"invoice_id" gorm:"not null;index"`
	Description string  `json:"description" gorm:"type:text;not null" validate:"required"`
	Quantity    float64 `json:"quantity" gorm:"type:decimal(10,2);not null;default:1" validate:"gt=0"`
	UnitPrice   float64 `json:"unit_price" gorm:"type:decimal(12,2);not null" validate:"gte=0"`
	TotalPrice  float64 `json:"total_price" gorm:"type:decimal(12,2);not null"`
	SortOrder   int     `json:"sort_order" gorm:"default:0"`

	// Relationships
	Invoice Invoice `json:"-" gorm:"constraint:OnDelete:CASCADE;"`
}

func (ii *InvoiceItem) BeforeCreate(tx *gorm.DB) (err error) {
	ii.TotalPrice = ii.Quantity * ii.UnitPrice
	return
}

func (ii *InvoiceItem) BeforeUpdate(tx *gorm.DB) (err error) {
	ii.TotalPrice = ii.Quantity * ii.UnitPrice
	return
}

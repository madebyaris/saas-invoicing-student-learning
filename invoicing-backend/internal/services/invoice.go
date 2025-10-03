package services

import (
	"fmt"
	"time"

	"github.com/yourusername/invoicing-backend/internal/models"
	"gorm.io/gorm"
)

type InvoiceService struct {
	db *gorm.DB
}

func NewInvoiceService(db *gorm.DB) *InvoiceService {
	return &InvoiceService{db: db}
}

func (s *InvoiceService) CreateInvoice(userID, organizationID string, invoiceData *models.Invoice) (*models.Invoice, error) {
	// Generate invoice number
	invoiceNumber, err := s.generateInvoiceNumber(userID, organizationID)
	if err != nil {
		return nil, fmt.Errorf("failed to generate invoice number: %w", err)
	}

	// Calculate totals
	subtotal := 0.0
	for _, item := range invoiceData.InvoiceItems {
		subtotal += item.TotalPrice
	}

	taxAmount := subtotal * invoiceData.TaxRate
	totalAmount := subtotal + taxAmount

	invoice := &models.Invoice{
		UserID:         userID,
		OrganizationID: organizationID,
		ClientID:       invoiceData.ClientID,
		InvoiceNumber:  invoiceNumber,
		IssueDate:      time.Now(),
		DueDate:        invoiceData.DueDate,
		Status:         models.InvoiceStatusDraft,
		Currency:       invoiceData.Currency,
		Subtotal:       subtotal,
		TaxRate:        invoiceData.TaxRate,
		TaxAmount:      taxAmount,
		TotalAmount:    totalAmount,
		Notes:          invoiceData.Notes,
		Terms:          invoiceData.Terms,
		InvoiceItems:   invoiceData.InvoiceItems,
	}

	if err := s.db.Create(invoice).Error; err != nil {
		return nil, fmt.Errorf("failed to create invoice: %w", err)
	}

	return invoice, nil
}

func (s *InvoiceService) GetInvoicesByOrganization(userID, organizationID string) ([]models.Invoice, error) {
	var invoices []models.Invoice
	// Filter by organization_id for multi-tenant isolation
	if err := s.db.Preload("Client").Preload("InvoiceItems").
		Where("organization_id = ? AND deleted_at IS NULL", organizationID).
		Order("created_at DESC").Find(&invoices).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch invoices: %w", err)
	}
	return invoices, nil
}

func (s *InvoiceService) GetInvoiceByID(invoiceID, userID, organizationID string) (*models.Invoice, error) {
	var invoice models.Invoice
	// Filter by organization_id for multi-tenant isolation
	if err := s.db.Preload("Client").Preload("InvoiceItems").
		Where("id = ? AND organization_id = ? AND deleted_at IS NULL", invoiceID, organizationID).
		First(&invoice).Error; err != nil {
		return nil, fmt.Errorf("invoice not found")
	}
	return &invoice, nil
}

func (s *InvoiceService) UpdateInvoice(invoiceID, userID, organizationID string, updateData *models.Invoice) (*models.Invoice, error) {
	invoice, err := s.GetInvoiceByID(invoiceID, userID, organizationID)
	if err != nil {
		return nil, err
	}

	// Only allow updates for draft invoices
	if invoice.Status != models.InvoiceStatusDraft {
		return nil, fmt.Errorf("can only update draft invoices")
	}

	// Update fields
	invoice.ClientID = updateData.ClientID
	invoice.DueDate = updateData.DueDate
	invoice.Currency = updateData.Currency
	invoice.TaxRate = updateData.TaxRate
	invoice.Notes = updateData.Notes
	invoice.Terms = updateData.Terms

	// Update invoice items
	if err := s.db.Where("invoice_id = ?", invoiceID).Delete(&models.InvoiceItem{}).Error; err != nil {
		return nil, fmt.Errorf("failed to update invoice items: %w", err)
	}

	invoice.InvoiceItems = updateData.InvoiceItems

	// Recalculate totals
	subtotal := 0.0
	for _, item := range invoice.InvoiceItems {
		subtotal += item.TotalPrice
	}
	invoice.Subtotal = subtotal
	invoice.TaxAmount = subtotal * invoice.TaxRate
	invoice.TotalAmount = subtotal + invoice.TaxAmount

	if err := s.db.Save(invoice).Error; err != nil {
		return nil, fmt.Errorf("failed to update invoice: %w", err)
	}

	return invoice, nil
}

func (s *InvoiceService) UpdateInvoiceStatus(invoiceID, userID, organizationID string, status models.InvoiceStatus) (*models.Invoice, error) {
	invoice, err := s.GetInvoiceByID(invoiceID, userID, organizationID)
	if err != nil {
		return nil, err
	}

	invoice.Status = status
	if err := s.db.Save(invoice).Error; err != nil {
		return nil, fmt.Errorf("failed to update invoice status: %w", err)
	}

	return invoice, nil
}

func (s *InvoiceService) DeleteInvoice(invoiceID, userID, organizationID string) error {
	invoice, err := s.GetInvoiceByID(invoiceID, userID, organizationID)
	if err != nil {
		return err
	}

	if err := s.db.Delete(invoice).Error; err != nil {
		return fmt.Errorf("failed to delete invoice: %w", err)
	}

	return nil
}

func (s *InvoiceService) generateInvoiceNumber(userID, organizationID string) (string, error) {
	var count int64
	// Count invoices within the organization for proper numbering
	if err := s.db.Model(&models.Invoice{}).Where("organization_id = ?", organizationID).Count(&count).Error; err != nil {
		return "", err
	}

	// Format: INV-20240001 (year + sequential number per organization)
	return fmt.Sprintf("INV-%d%04d", time.Now().Year(), count+1), nil
}

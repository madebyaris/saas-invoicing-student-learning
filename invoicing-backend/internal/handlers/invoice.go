package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
	"github.com/yourusername/invoicing-backend/internal/models"
	"github.com/yourusername/invoicing-backend/internal/services"
	"github.com/yourusername/invoicing-backend/internal/utils"
)

type InvoiceHandler struct {
	invoiceService *services.InvoiceService
	validator      *validator.Validate
}

func NewInvoiceHandler(invoiceService *services.InvoiceService) *InvoiceHandler {
	return &InvoiceHandler{
		invoiceService: invoiceService,
		validator:      validator.New(),
	}
}

func (h *InvoiceHandler) CreateInvoice(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	var invoice models.Invoice
	if err := c.ShouldBindJSON(&invoice); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	createdInvoice, err := h.invoiceService.CreateInvoice(userID, organizationID.(string), &invoice)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create invoice")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, createdInvoice)
}

func (h *InvoiceHandler) GetInvoices(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	invoices, err := h.invoiceService.GetInvoicesByOrganization(userID, organizationID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch invoices")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, invoices)
}

func (h *InvoiceHandler) GetInvoice(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	invoiceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid invoice ID")
		return
	}

	invoice, err := h.invoiceService.GetInvoiceByID(invoiceID.String(), userID, organizationID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Invoice not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, invoice)
}

func (h *InvoiceHandler) UpdateInvoice(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	invoiceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid invoice ID")
		return
	}

	var updateData models.Invoice
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	invoice, err := h.invoiceService.UpdateInvoice(invoiceID.String(), userID, organizationID.(string), &updateData)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update invoice")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, invoice)
}

func (h *InvoiceHandler) UpdateInvoiceStatus(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	invoiceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid invoice ID")
		return
	}

	var request struct {
		Status models.InvoiceStatus `json:"status" validate:"required"`
	}
	if err := c.ShouldBindJSON(&request); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	invoice, err := h.invoiceService.UpdateInvoiceStatus(invoiceID.String(), userID, organizationID.(string), request.Status)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update invoice status")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, invoice)
}

func (h *InvoiceHandler) DeleteInvoice(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	invoiceID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid invoice ID")
		return
	}

	err = h.invoiceService.DeleteInvoice(invoiceID.String(), userID, organizationID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete invoice")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"message": "Invoice deleted successfully"})
}

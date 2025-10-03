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

type ClientHandler struct {
	clientService *services.ClientService
	validator     *validator.Validate
}

func NewClientHandler(clientService *services.ClientService) *ClientHandler {
	return &ClientHandler{
		clientService: clientService,
		validator:     validator.New(),
	}
}

func (h *ClientHandler) CreateClient(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	var client models.Client
	if err := c.ShouldBindJSON(&client); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	createdClient, err := h.clientService.CreateClient(userID, organizationID.(string), &client)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to create client")
		return
	}

	utils.SuccessResponse(c, http.StatusCreated, createdClient)
}

func (h *ClientHandler) GetClients(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	clients, err := h.clientService.GetClientsByOrganization(userID, organizationID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to fetch clients")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, clients)
}

func (h *ClientHandler) GetClient(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid client ID")
		return
	}

	client, err := h.clientService.GetClientByID(clientID.String(), userID, organizationID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusNotFound, "Client not found")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, client)
}

func (h *ClientHandler) UpdateClient(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid client ID")
		return
	}

	var updateData models.Client
	if err := c.ShouldBindJSON(&updateData); err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid request body")
		return
	}

	client, err := h.clientService.UpdateClient(clientID.String(), userID, organizationID.(string), &updateData)
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to update client")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, client)
}

func (h *ClientHandler) DeleteClient(c *gin.Context) {
	userID := utils.GetUserIDFromContext(c)

	// Get organization ID from RBAC middleware context
	organizationID, exists := c.Get("organization_id")
	if !exists {
		utils.ErrorResponse(c, http.StatusForbidden, "Organization context required")
		return
	}

	clientID, err := uuid.Parse(c.Param("id"))
	if err != nil {
		utils.ErrorResponse(c, http.StatusBadRequest, "Invalid client ID")
		return
	}

	err = h.clientService.DeleteClient(clientID.String(), userID, organizationID.(string))
	if err != nil {
		utils.ErrorResponse(c, http.StatusInternalServerError, "Failed to delete client")
		return
	}

	utils.SuccessResponse(c, http.StatusOK, gin.H{"message": "Client deleted successfully"})
}

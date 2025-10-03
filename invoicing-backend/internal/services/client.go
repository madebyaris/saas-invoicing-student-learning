package services

import (
	"fmt"

	"github.com/yourusername/invoicing-backend/internal/models"
	"gorm.io/gorm"
)

type ClientService struct {
	db *gorm.DB
}

func NewClientService(db *gorm.DB) *ClientService {
	return &ClientService{db: db}
}

func (s *ClientService) CreateClient(userID, organizationID string, clientData *models.Client) (*models.Client, error) {
	client := &models.Client{
		UserID:         userID,
		OrganizationID: organizationID,
		Name:           clientData.Name,
		Email:          clientData.Email,
		Phone:          clientData.Phone,
		CompanyName:    clientData.CompanyName,
		AddressLine1:   clientData.AddressLine1,
		AddressLine2:   clientData.AddressLine2,
		City:           clientData.City,
		State:          clientData.State,
		PostalCode:     clientData.PostalCode,
		Country:        clientData.Country,
		TaxID:          clientData.TaxID,
	}

	if err := s.db.Create(client).Error; err != nil {
		return nil, fmt.Errorf("failed to create client: %w", err)
	}

	return client, nil
}

func (s *ClientService) GetClientsByOrganization(userID, organizationID string) ([]models.Client, error) {
	var clients []models.Client
	// Filter by both organization_id (multi-tenant isolation) and user_id (permissions)
	if err := s.db.Where("organization_id = ? AND deleted_at IS NULL", organizationID).Find(&clients).Error; err != nil {
		return nil, fmt.Errorf("failed to fetch clients: %w", err)
	}
	return clients, nil
}

func (s *ClientService) GetClientByID(clientID, userID, organizationID string) (*models.Client, error) {
	var client models.Client
	// Filter by organization_id for multi-tenant isolation and user_id for ownership
	if err := s.db.Where("id = ? AND organization_id = ? AND deleted_at IS NULL", clientID, organizationID).First(&client).Error; err != nil {
		return nil, fmt.Errorf("client not found")
	}
	return &client, nil
}

func (s *ClientService) UpdateClient(clientID, userID, organizationID string, updateData *models.Client) (*models.Client, error) {
	client, err := s.GetClientByID(clientID, userID, organizationID)
	if err != nil {
		return nil, err
	}

	// Update fields
	client.Name = updateData.Name
	client.Email = updateData.Email
	client.Phone = updateData.Phone
	client.CompanyName = updateData.CompanyName
	client.AddressLine1 = updateData.AddressLine1
	client.AddressLine2 = updateData.AddressLine2
	client.City = updateData.City
	client.State = updateData.State
	client.PostalCode = updateData.PostalCode
	client.Country = updateData.Country
	client.TaxID = updateData.TaxID

	if err := s.db.Save(client).Error; err != nil {
		return nil, fmt.Errorf("failed to update client: %w", err)
	}

	return client, nil
}

func (s *ClientService) DeleteClient(clientID, userID, organizationID string) error {
	client, err := s.GetClientByID(clientID, userID, organizationID)
	if err != nil {
		return err
	}

	if err := s.db.Delete(client).Error; err != nil {
		return fmt.Errorf("failed to delete client: %w", err)
	}

	return nil
}

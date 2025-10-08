package services

import (
	"fmt"

	"github.com/yourusername/invoicing-backend/internal/models"
	"gorm.io/gorm"
)

type AuthService struct {
	db *gorm.DB
}

func NewAuthService(db *gorm.DB) *AuthService {
	return &AuthService{db: db}
}

type RegisterRequest struct {
	Email     string `json:"email" validate:"required,email"`
	Password  string `json:"password" validate:"required,min=8"`
	FirstName string `json:"first_name" validate:"required,min=1,max=100"`
	LastName  string `json:"last_name" validate:"required,min=1,max=100"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

func (s *AuthService) Register(email, password, firstName, lastName string) (*models.User, error) {
	// Check if user already exists
	var existingUser models.User
	if err := s.db.Where("email = ?", email).First(&existingUser).Error; err == nil {
		return nil, fmt.Errorf("user already exists")
	}

	// Start a transaction to create user, organization, role, and subscription
	tx := s.db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create new user
	user := models.User{
		Email:     email,
		FirstName: firstName,
		LastName:  lastName,
	}

	if err := user.SetPassword(password); err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to hash password: %w", err)
	}

	if err := tx.Create(&user).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create user: %w", err)
	}

	// Create organization for the user
	orgName := fmt.Sprintf("%s %s's Organization", firstName, lastName)
	organization := models.Organization{
		Name:     orgName,
		Settings: models.OrganizationSettings{IsDefault: true},
	}

	if err := tx.Create(&organization).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create organization: %w", err)
	}

	// Get or create org_admin role
	var orgAdminRole models.Role
	if err := tx.Where("name = ?", models.RoleOrgAdmin).First(&orgAdminRole).Error; err != nil {
		// Create default role if it doesn't exist
		orgAdminRole = models.Role{
			Name:         models.RoleOrgAdmin,
			Description:  "Organization Administrator",
			Permissions:  models.GetDefaultPermissions(models.RoleOrgAdmin),
			IsSystemRole: true,
		}
		if err := tx.Create(&orgAdminRole).Error; err != nil {
			tx.Rollback()
			return nil, fmt.Errorf("failed to create role: %w", err)
		}
	}

	// Assign user to organization with org_admin role
	userOrgRole := models.UserOrganizationRole{
		UserID:         user.ID,
		OrganizationID: organization.ID,
		RoleID:         orgAdminRole.ID,
	}

	if err := tx.Create(&userOrgRole).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to assign user to organization: %w", err)
	}

	// Create a free trial subscription
	subscription := models.Subscription{
		OrganizationID:      organization.ID,
		PlanType:            models.SubscriptionPlanFree,
		Status:              models.SubscriptionStatusActive,
		MonthlyInvoiceLimit: 10,
		MonthlyClientLimit:  50,
		MonthlyUserLimit:    3,
	}

	if err := tx.Create(&subscription).Error; err != nil {
		tx.Rollback()
		return nil, fmt.Errorf("failed to create subscription: %w", err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return &user, nil
}

func (s *AuthService) Login(email, password string) (*models.User, error) {
	var user models.User
	if err := s.db.Where("email = ?", email).First(&user).Error; err != nil {
		return nil, fmt.Errorf("invalid credentials")
	}

	if !user.CheckPassword(password) {
		return nil, fmt.Errorf("invalid credentials")
	}

	return &user, nil
}

func (s *AuthService) GetUserByID(userID string) (*models.User, error) {
	var user models.User
	if err := s.db.First(&user, "id = ?", userID).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return &user, nil
}

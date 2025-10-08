package main

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"github.com/yourusername/invoicing-backend/internal/database"
	"github.com/yourusername/invoicing-backend/internal/models"
	"gorm.io/gorm"
)

func main() {
	// Load environment variables
	if err := godotenv.Load("../.env"); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Get database URL from environment
	databaseURL := os.Getenv("DATABASE_URL")
	if databaseURL == "" {
		log.Fatal("DATABASE_URL environment variable not set")
	}

	// Connect to database
	db, err := database.Initialize(databaseURL)
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Get all users
	var users []models.User
	if err := db.Find(&users).Error; err != nil {
		log.Fatal("Failed to fetch users:", err)
	}

	log.Printf("Found %d users to check\n", len(users))

	// Check each user for organization membership
	for _, user := range users {
		var userOrgRoles []models.UserOrganizationRole
		if err := db.Where("user_id = ?", user.ID).Find(&userOrgRoles).Error; err != nil {
			log.Printf("Error checking user %s: %v\n", user.Email, err)
			continue
		}

		if len(userOrgRoles) > 0 {
			log.Printf("✓ User %s already has organization\n", user.Email)
			continue
		}

		log.Printf("→ Creating organization for user %s...\n", user.Email)

		// Create organization for user
		if err := createUserOrganization(db, &user); err != nil {
			log.Printf("✗ Failed to create organization for %s: %v\n", user.Email, err)
			continue
		}

		log.Printf("✓ Created organization for user %s\n", user.Email)
	}

	log.Println("✅ All users processed!")
}

func createUserOrganization(db *gorm.DB, user *models.User) error {
	// Start transaction
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Create organization
	orgName := fmt.Sprintf("%s %s's Organization", user.FirstName, user.LastName)
	subdomain := fmt.Sprintf("org-%s", user.ID.String()[:8]) // Use first 8 chars of user ID for unique subdomain
	organization := models.Organization{
		Name:      orgName,
		Subdomain: subdomain,
		Settings:  models.OrganizationSettings{IsDefault: true, CreatedDuringMigration: true},
	}

	if err := tx.Create(&organization).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create organization: %w", err)
	}

	// Get or create org_admin role
	var orgAdminRole models.Role
	if err := tx.Where("name = ?", models.RoleOrgAdmin).First(&orgAdminRole).Error; err != nil {
		// Create default role
		orgAdminRole = models.Role{
			Name:         models.RoleOrgAdmin,
			Description:  "Organization Administrator",
			Permissions:  models.GetDefaultPermissions(models.RoleOrgAdmin),
			IsSystemRole: true,
		}
		if err := tx.Create(&orgAdminRole).Error; err != nil {
			tx.Rollback()
			return fmt.Errorf("failed to create role: %w", err)
		}
	}

	// Assign user to organization
	userOrgRole := models.UserOrganizationRole{
		UserID:         user.ID.String(),
		OrganizationID: organization.ID.String(),
		RoleID:         orgAdminRole.ID,
	}

	if err := tx.Create(&userOrgRole).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to assign user to organization: %w", err)
	}

	// Create free subscription
	subscription := models.Subscription{
		OrganizationID:      organization.ID.String(),
		PlanType:            models.SubscriptionPlanFree,
		Status:              models.SubscriptionStatusActive,
		MonthlyInvoiceLimit: 10,
		MonthlyClientLimit:  50,
		MonthlyUserLimit:    3,
	}

	if err := tx.Create(&subscription).Error; err != nil {
		tx.Rollback()
		return fmt.Errorf("failed to create subscription: %w", err)
	}

	// Update existing clients and invoices to belong to this organization
	if err := tx.Model(&models.Client{}).Where("user_id = ?", user.ID.String()).Update("organization_id", organization.ID.String()).Error; err != nil {
		log.Printf("Warning: Failed to update clients for user %s: %v\n", user.Email, err)
	}

	if err := tx.Model(&models.Invoice{}).Where("user_id = ?", user.ID.String()).Update("organization_id", organization.ID.String()).Error; err != nil {
		log.Printf("Warning: Failed to update invoices for user %s: %v\n", user.Email, err)
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		return fmt.Errorf("failed to commit transaction: %w", err)
	}

	return nil
}

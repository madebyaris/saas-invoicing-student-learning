package models

import (
	"time"
)

type SubscriptionPlan string
type SubscriptionStatus string

const (
	SubscriptionPlanFree     SubscriptionPlan = "free"
	SubscriptionPlanPro      SubscriptionPlan = "pro"
	SubscriptionPlanBusiness SubscriptionPlan = "business"
)

const (
	SubscriptionStatusActive    SubscriptionStatus = "active"
	SubscriptionStatusCancelled SubscriptionStatus = "cancelled"
	SubscriptionStatusExpired   SubscriptionStatus = "expired"
	SubscriptionStatusPastDue   SubscriptionStatus = "past_due"
	SubscriptionStatusUnpaid    SubscriptionStatus = "unpaid"
)

type Subscription struct {
	ID                   string             `json:"id" gorm:"primarykey;type:uuid;default:gen_random_uuid()"`
	OrganizationID       string             `json:"organization_id" gorm:"not null;index"`
	PlanType             SubscriptionPlan   `json:"plan_type" gorm:"not null;default:free;index"`
	Status               SubscriptionStatus `json:"status" gorm:"not null;default:active;index"`
	PayPalSubscriptionID string             `json:"paypal_subscription_id" gorm:"size:255;index"`
	PayPalPlanID         string             `json:"paypal_plan_id" gorm:"size:255"`
	CurrentPeriodStart   *time.Time         `json:"current_period_start"`
	CurrentPeriodEnd     *time.Time         `json:"current_period_end"`
	TrialEnd             *time.Time         `json:"trial_end"`
	MonthlyInvoiceLimit  int                `json:"monthly_invoice_limit" gorm:"not null;default:5"`
	MonthlyClientLimit   int                `json:"monthly_client_limit" gorm:"not null;default:2"`
	MonthlyUserLimit     int                `json:"monthly_user_limit" gorm:"not null;default:1"`
	CreatedAt            time.Time          `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt            time.Time          `json:"updated_at" gorm:"autoUpdateTime"`

	// Relationships (without soft deletes for active subscriptions)
	Organization Organization `json:"organization" gorm:"constraint:OnDelete:CASCADE;"`
}

// GetPlanLimits returns the limits for a given subscription plan
func GetPlanLimits(plan SubscriptionPlan) (invoiceLimit, clientLimit, userLimit int) {
	switch plan {
	case SubscriptionPlanFree:
		return 5, 2, 1
	case SubscriptionPlanPro:
		return 100, -1, 5 // -1 means unlimited
	case SubscriptionPlanBusiness:
		return -1, -1, -1 // -1 means unlimited
	default:
		return 5, 2, 1 // Default to free plan limits
	}
}

// GetPlanPrice returns the monthly price for a given subscription plan in USD
func GetPlanPrice(plan SubscriptionPlan) float64 {
	switch plan {
	case SubscriptionPlanFree:
		return 0.0
	case SubscriptionPlanPro:
		return 15.0
	case SubscriptionPlanBusiness:
		return 50.0
	default:
		return 0.0
	}
}

// IsActive returns true if the subscription is currently active
func (s *Subscription) IsActive() bool {
	return s.Status == SubscriptionStatusActive
}

// IsExpired returns true if the subscription is expired
func (s *Subscription) IsExpired() bool {
	if s.CurrentPeriodEnd == nil {
		return false
	}
	return s.CurrentPeriodEnd.Before(time.Now())
}

// DaysUntilExpiry returns the number of days until the subscription expires
func (s *Subscription) DaysUntilExpiry() int {
	if s.CurrentPeriodEnd == nil {
		return 0
	}
	days := int(time.Until(*s.CurrentPeriodEnd).Hours() / 24)
	if days < 0 {
		return 0
	}
	return days
}

// CanCreateInvoices checks if the organization can create more invoices this month
func (s *Subscription) CanCreateInvoices(currentMonthCount int) bool {
	if s.MonthlyInvoiceLimit == -1 {
		return true // Unlimited
	}
	return currentMonthCount < s.MonthlyInvoiceLimit
}

// CanCreateClients checks if the organization can create more clients
func (s *Subscription) CanCreateClients(currentCount int) bool {
	if s.MonthlyClientLimit == -1 {
		return true // Unlimited
	}
	return currentCount < s.MonthlyClientLimit
}

// CanAddUsers checks if the organization can add more users
func (s *Subscription) CanAddUsers(currentCount int) bool {
	if s.MonthlyUserLimit == -1 {
		return true // Unlimited
	}
	return currentCount < s.MonthlyUserLimit
}

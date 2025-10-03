-- Create subscription plan enum
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'business');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'expired', 'past_due', 'unpaid');

-- Create subscriptions table for PayPal integration
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    plan_type subscription_plan NOT NULL DEFAULT 'free',
    status subscription_status NOT NULL DEFAULT 'active',
    paypal_subscription_id VARCHAR(255),
    paypal_plan_id VARCHAR(255),
    current_period_start DATE,
    current_period_end DATE,
    trial_end DATE,
    monthly_invoice_limit INTEGER NOT NULL DEFAULT 5,
    monthly_client_limit INTEGER NOT NULL DEFAULT 2,
    monthly_user_limit INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_paypal_subscription_id ON subscriptions(paypal_subscription_id);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- Ensure one active subscription per organization
CREATE UNIQUE INDEX idx_subscriptions_organization_active ON subscriptions(organization_id) 
WHERE status = 'active';



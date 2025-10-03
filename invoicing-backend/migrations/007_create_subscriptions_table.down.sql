-- Drop subscriptions table and related types
DROP INDEX IF EXISTS idx_subscriptions_organization_active;
DROP INDEX IF EXISTS idx_subscriptions_current_period_end;
DROP INDEX IF EXISTS idx_subscriptions_paypal_subscription_id;
DROP INDEX IF EXISTS idx_subscriptions_status;
DROP INDEX IF EXISTS idx_subscriptions_organization_id;
DROP TABLE IF EXISTS subscriptions;
DROP TYPE IF EXISTS subscription_status;
DROP TYPE IF EXISTS subscription_plan;



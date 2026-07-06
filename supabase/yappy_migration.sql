-- Yappy payment integration migration
-- Adds 'pending' status to subscriptions for orders awaiting payment confirmation

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'expired', 'cancelled', 'pending'));

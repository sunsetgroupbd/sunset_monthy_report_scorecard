-- Migration 005: Scorecard updates (Target, Lead metrics, CX type, Payment type)

ALTER TABLE manual_scorecards ADD COLUMN IF NOT EXISTS target numeric(15, 2) NOT NULL DEFAULT 0.00;

ALTER TABLE manual_scorecard_periods ADD COLUMN IF NOT EXISTS hold integer NOT NULL DEFAULT 0;
ALTER TABLE manual_scorecard_periods ADD COLUMN IF NOT EXISTS cancel integer NOT NULL DEFAULT 0;
ALTER TABLE manual_scorecard_periods ADD COLUMN IF NOT EXISTS sold_fair_leads integer NOT NULL DEFAULT 0;
ALTER TABLE manual_scorecard_periods ADD COLUMN IF NOT EXISTS sold_fb_leads integer NOT NULL DEFAULT 0;
ALTER TABLE manual_scorecard_periods ADD COLUMN IF NOT EXISTS sold_other_leads integer NOT NULL DEFAULT 0;

ALTER TABLE manual_scorecard_customers ADD COLUMN IF NOT EXISTS cx_type varchar(50) NOT NULL DEFAULT 'New Sales';
ALTER TABLE manual_scorecard_customers ADD COLUMN IF NOT EXISTS payment_type varchar(50) NOT NULL DEFAULT 'Paid';
ALTER TABLE manual_scorecard_customers ADD COLUMN IF NOT EXISTS amount numeric(15, 2) NOT NULL DEFAULT 0.00;
ALTER TABLE manual_scorecard_customers ADD COLUMN IF NOT EXISTS payment_date date;
ALTER TABLE manual_scorecard_customers ADD COLUMN IF NOT EXISTS payment_status varchar(50) NOT NULL DEFAULT 'Paid';
ALTER TABLE manual_scorecard_customers ADD COLUMN IF NOT EXISTS next_collection_date_2 date;

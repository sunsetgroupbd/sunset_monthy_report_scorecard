import test from 'node:test';
import assert from 'node:assert/strict';

// Calculations module test
import { 
  calculatePeriodTotalCollection, 
  calculateCustomerTotalCollection, 
  calculateCustomerSummary, 
  calculateTotalAchieved, 
  calculateAchievementPct,
  formatBDT 
} from '../lib/calculations.js';

test('formatBDT formats amounts in Bangladeshi Taka currency format', () => {
  assert.equal(formatBDT(150000), '৳ 1,50,000.00');
  assert.equal(formatBDT(0), '৳ 0.00');
  assert.equal(formatBDT(null), '৳ 0.00');
});

test('calculatePeriodTotalCollection sums new_sales, tb_amount, and emi_amount', () => {
  const period = {
    period_index: 1,
    new_sales: 100000,
    tb_amount: 50000,
    emi_amount: 25000,
    total_collection: 0,
    total_leads: 0,
    fair_leads: 0,
    fb_leads: 0,
    hp: 0,
    p: 0,
    fup: 0,
    dialed_calls: 0,
    connected_calls: 0,
    outdoor_visits: 0,
    indoor_cx: 0,
    meeting_hours: 0,
  };

  const total = calculatePeriodTotalCollection(period);
  assert.equal(total, 175000);
});

test('calculatePeriodTotalCollection respects manual override if present', () => {
  const period = {
    period_index: 1,
    new_sales: 100000,
    tb_amount: 50000,
    emi_amount: 25000,
    total_collection_override: 200000,
    total_collection: 0,
    total_leads: 0,
    fair_leads: 0,
    fb_leads: 0,
    hp: 0,
    p: 0,
    fup: 0,
    dialed_calls: 0,
    connected_calls: 0,
    outdoor_visits: 0,
    indoor_cx: 0,
    meeting_hours: 0,
  };

  const total = calculatePeriodTotalCollection(period);
  assert.equal(total, 200000);
});

test('calculateCustomerTotalCollection and customer summary calculation', () => {
  const customers = [
    {
      customer_name: 'Customer A',
      paid_amount: 50000,
      unpaid_amount: 20000,
      new_sales_amount: 40000,
      tb_amount: 15000,
      emi_amount: 15000,
      total_collection: 70000,
      lead_status: 'HP',
      collection_probability: 80,
    },
    {
      customer_name: 'Customer B',
      paid_amount: 30000,
      unpaid_amount: 10000,
      new_sales_amount: 20000,
      tb_amount: 10000,
      emi_amount: 0,
      total_collection: 30000,
      lead_status: 'P',
      collection_probability: 50,
    }
  ];

  const summary = calculateCustomerSummary(customers);
  assert.equal(summary.total_paid, 80000);
  assert.equal(summary.total_unpaid, 30000);
  // Expected = (70000 * 0.8) + (30000 * 0.5) = 56000 + 15000 = 71000
  assert.equal(summary.total_expected_collection, 71000);
});

test('calculateTotalAchieved sums weekly periods 1 to 5', () => {
  const periods = [
    { period_index: 0, new_sales: 1000000, tb_amount: 500000, emi_amount: 500000 },
    { period_index: 1, new_sales: 100000, tb_amount: 50000, emi_amount: 20000, dialed_calls: 20, meeting_hours: 5 },
    { period_index: 2, new_sales: 150000, tb_amount: 50000, emi_amount: 30000, dialed_calls: 25, meeting_hours: 4.5 },
    { period_index: 3, new_sales: 200000, tb_amount: 50000, emi_amount: 40000, dialed_calls: 30, meeting_hours: 6 },
    { period_index: 4, new_sales: 100000, tb_amount: 50000, emi_amount: 20000, dialed_calls: 15, meeting_hours: 3 },
    { period_index: 5, new_sales: 50000, tb_amount: 20000, emi_amount: 10000, dialed_calls: 10, meeting_hours: 2 }
  ];

  const achieved = calculateTotalAchieved(periods);
  assert.equal(achieved.new_sales, 600000);
  assert.equal(achieved.tb_amount, 220000);
  assert.equal(achieved.emi_amount, 120000);
  assert.equal(achieved.total_collection, 940000);
  assert.equal(achieved.dialed_calls, 100);
  assert.equal(achieved.meeting_hours, 20.5);
});

test('calculateAchievementPct handles target division safely and handles zero target', () => {
  const target = { period_index: 0, new_sales: 1000000, tb_amount: 0, emi_amount: 200000, dialed_calls: 100 };
  const achieved = {
    new_sales: 850000,
    tb_amount: 50000,
    emi_amount: 200000,
    total_collection: 1100000,
    dialed_calls: 120,
    total_leads: 0,
    fair_leads: 0,
    fb_leads: 0,
    hp: 0,
    p: 0,
    fup: 0,
    connected_calls: 0,
    outdoor_visits: 0,
    indoor_cx: 0,
    meeting_hours: 0,
  };

  const pct = calculateAchievementPct(achieved, target);
  assert.equal(pct.new_sales, 85.0);
  assert.equal(pct.tb_amount, 0); // Zero target handled safely without division by zero
  assert.equal(pct.emi_amount, 100.0);
  assert.equal(pct.dialed_calls, 120);
});

import { PeriodItem, CustomerItem, CustomerSummary, PeriodMetrics } from '../types/scorecard';

export function formatBDT(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null || isNaN(Number(amount))) return '৳ 0.00';
  const num = Number(amount);
  return '৳ ' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatNumber(val: number | string | undefined | null): string {
  if (val === undefined || val === null || isNaN(Number(val))) return '0';
  const num = Number(val);
  return num.toLocaleString('en-IN');
}

export function calculatePeriodTotalCollection(period: PeriodItem): number {
  if (period.total_collection_override !== null && period.total_collection_override !== undefined) {
    return Number(period.total_collection_override);
  }
  const ns = Number(period.new_sales || 0);
  const tb = Number(period.tb_amount || 0);
  const emi = Number(period.emi_amount || 0);
  return ns + tb + emi;
}

export function calculatePeriodTotalLeads(period?: Partial<PeriodItem> | null): number {
  if (!period) return 0;
  return Number(period.fair_leads || 0) +
    Number(period.fb_leads || 0) +
    Number(period.hp || 0) +
    Number(period.p || 0) +
    Number(period.fup || 0);
}

export function calculateCustomerTotalCollection(customer: CustomerItem): number {
  const ns = Number(customer.new_sales_amount || 0);
  const tb = Number(customer.tb_amount || 0);
  const emi = Number(customer.emi_amount || 0);
  return ns + tb + emi;
}

export function calculateCustomerSummary(customers: CustomerItem[]): CustomerSummary {
  let total_paid = 0;
  let total_unpaid = 0;
  let total_expected = 0;

  for (const c of customers) {
    const paid = Number(c.paid_amount || 0);
    const unpaid = Number(c.unpaid_amount || 0);
    const prob = Number(c.collection_probability || 0) / 100.0;
    const tc = calculateCustomerTotalCollection(c);

    total_paid += paid;
    total_unpaid += unpaid;
    total_expected += (tc * prob);
  }

  return {
    total_paid: Math.round(total_paid * 100) / 100,
    total_unpaid: Math.round(total_unpaid * 100) / 100,
    total_expected_collection: Math.round(total_expected * 100) / 100,
  };
}

export function calculateTotalAchieved(periods: PeriodItem[]): PeriodMetrics {
  const weekly = periods.filter(p => p.period_index >= 1 && p.period_index <= 6);

  const target = weekly.reduce((sum, p) => sum + Number(p.target || 0), 0);
  const new_sales = weekly.reduce((sum, p) => sum + Number(p.new_sales || 0), 0);
  const tb_amount = weekly.reduce((sum, p) => sum + Number(p.tb_amount || 0), 0);
  const emi_amount = weekly.reduce((sum, p) => sum + Number(p.emi_amount || 0), 0);
  const total_collection = weekly.reduce((sum, p) => sum + calculatePeriodTotalCollection(p), 0);

  return {
    target,
    new_sales,
    tb_amount,
    emi_amount,
    total_collection,
    total_leads: weekly.reduce((sum, p) => {
      const sumLeads = calculatePeriodTotalLeads(p);
      return sum + (sumLeads > 0 ? sumLeads : Number(p.total_leads || 0));
    }, 0),
    fair_leads: weekly.reduce((sum, p) => sum + Number(p.fair_leads || 0), 0),
    fb_leads: weekly.reduce((sum, p) => sum + Number(p.fb_leads || 0), 0),
    hp: weekly.reduce((sum, p) => sum + Number(p.hp || 0), 0),
    p: weekly.reduce((sum, p) => sum + Number(p.p || 0), 0),
    fup: weekly.reduce((sum, p) => sum + Number(p.fup || 0), 0),
    dialed_calls: weekly.reduce((sum, p) => sum + Number(p.dialed_calls || 0), 0),
    connected_calls: weekly.reduce((sum, p) => sum + Number(p.connected_calls || 0), 0),
    outdoor_visits: weekly.reduce((sum, p) => sum + Number(p.outdoor_visits || 0), 0),
    indoor_cx: weekly.reduce((sum, p) => sum + Number(p.indoor_cx || 0), 0),
    meeting_hours: Math.round(weekly.reduce((sum, p) => sum + Number(p.meeting_hours || 0), 0) * 10) / 10,
    hold: weekly.reduce((sum, p) => sum + Number(p.hold || 0), 0),
    cancel: weekly.reduce((sum, p) => sum + Number(p.cancel || 0), 0),
    sold_fair_leads: weekly.reduce((sum, p) => sum + Number(p.sold_fair_leads || 0), 0),
    sold_fb_leads: weekly.reduce((sum, p) => sum + Number(p.sold_fb_leads || 0), 0),
    sold_other_leads: weekly.reduce((sum, p) => sum + Number(p.sold_other_leads || 0), 0),
  };
}

export function calculateAchievementPct(achieved: PeriodMetrics, target?: PeriodItem): PeriodMetrics {
  const safePct = (ach: number, tgt: number): number => {
    if (!tgt || tgt <= 0) return 0;
    return Math.round((ach / tgt) * 10000) / 100;
  };

  const targetTotalCollection = target
    ? (target.total_collection_override ?? (Number(target.new_sales || 0) + Number(target.tb_amount || 0) + Number(target.emi_amount || 0)))
    : 0;

  return {
    target: safePct(achieved.target || 0, Number(target?.target || 0)),
    new_sales: safePct(achieved.new_sales, Number(target?.new_sales || 0)),
    tb_amount: safePct(achieved.tb_amount, Number(target?.tb_amount || 0)),
    emi_amount: safePct(achieved.emi_amount, Number(target?.emi_amount || 0)),
    total_collection: safePct(achieved.total_collection, targetTotalCollection),
    total_leads: safePct(achieved.total_leads || 0, Number(target?.total_leads || 0)),
    fair_leads: safePct(achieved.fair_leads, Number(target?.fair_leads || 0)),
    fb_leads: safePct(achieved.fb_leads, Number(target?.fb_leads || 0)),
    hp: safePct(achieved.hp, Number(target?.hp || 0)),
    p: safePct(achieved.p, Number(target?.p || 0)),
    fup: safePct(achieved.fup, Number(target?.fup || 0)),
    dialed_calls: safePct(achieved.dialed_calls, Number(target?.dialed_calls || 0)),
    connected_calls: safePct(achieved.connected_calls || 0, Number(target?.connected_calls || 0)),
    outdoor_visits: safePct(achieved.outdoor_visits, Number(target?.outdoor_visits || 0)),
    indoor_cx: safePct(achieved.indoor_cx, Number(target?.indoor_cx || 0)),
    meeting_hours: safePct(achieved.meeting_hours || 0, Number(target?.meeting_hours || 0)),
    hold: safePct(achieved.hold || 0, Number(target?.hold || 0)),
    cancel: safePct(achieved.cancel || 0, Number(target?.cancel || 0)),
    sold_fair_leads: safePct(achieved.sold_fair_leads || 0, Number(target?.sold_fair_leads || 0)),
    sold_fb_leads: safePct(achieved.sold_fb_leads || 0, Number(target?.sold_fb_leads || 0)),
    sold_other_leads: safePct(achieved.sold_other_leads || 0, Number(target?.sold_other_leads || 0)),
  };
}

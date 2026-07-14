import type { TaxOutcome } from 'country-data-ts/tax';
import { Text, View } from 'react-native';

// Tax outcome → display category, and the colored summary panel that renders it.

type TaxCategory =
  | 'reverse-charge'
  | 'standard'
  | 'zero-rated'
  | 'regional-local-surcharge'
  | 'regional'
  | 'outside'
  | 'no-nexus'
  | 'none';

function categorize(o: TaxOutcome): TaxCategory {
  if (o.taxSystem === null) return 'none';
  if (o.taxSystem === 'oss') return o.flags.buyerSelfAccounts ? 'reverse-charge' : 'standard';
  if (o.flags.buyerSelfAccounts) return 'zero-rated';
  if (o.flags.localSurcharge) return 'regional-local-surcharge';
  if (o.flags.regionalRates) return 'regional';
  return 'outside';
}

const CATEGORY_COLORS: Record<TaxCategory, { bg: string; border: string; text: string }> = {
  'reverse-charge': { bg: '#d1fae5', border: '#10b981', text: '#065f46' },
  standard: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
  'zero-rated': { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af' },
  'regional-local-surcharge': { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
  regional: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
  outside: { bg: '#f3f4f6', border: '#9ca3af', text: '#374151' },
  'no-nexus': { bg: '#fdf4ff', border: '#a855f7', text: '#6b21a8' },
  none: { bg: '#f9fafb', border: '#e5e7eb', text: '#9ca3af' },
};

function formatRate(rate: number | null): string {
  return rate === null ? '—' : `${rate}%`;
}

function formatTaxLabel(o: TaxOutcome): string | null {
  const { taxLabel: en, localTaxLabel: local } = o;
  if (!(en || local)) return null;
  if (!en) return local;
  if (!local || en === local) return en;
  return `${en} / ${local}`;
}

function buildHeadline(category: TaxCategory, o: TaxOutcome, state?: string): string {
  const { taxLabel: name, effectiveTax: rate } = o;
  switch (category) {
    case 'none':
      return 'No country selected';
    case 'no-nexus':
      return 'No nexus — not collecting';
    case 'reverse-charge':
      return 'Reverse Charge';
    case 'zero-rated':
      return 'Zero-rated Export';
    case 'standard':
      return `Standard ${name} — ${rate}%`;
    case 'regional-local-surcharge':
      if (!state) return 'US Sales Tax — select state';
      return rate === null ? `No ${name} — ${state}` : `${name} — ${state} ${rate}%`;
    case 'regional':
      if (!state) return 'Canadian GST/HST — select province';
      return rate === null ? `${name} — ${state}` : `${name} — ${state} ${rate}%`;
    default:
      if (!name) return 'Outside EU';
      return rate === null ? `Outside EU — ${name}` : `Outside EU — ${name} ${rate}%`;
  }
}

type TaxPanelProps = { outcome: TaxOutcome; state?: string; noNexus?: boolean };

export function TaxPanel({ outcome, state, noNexus }: TaxPanelProps) {
  const category: TaxCategory = noNexus ? 'no-nexus' : categorize(outcome);
  const c = CATEGORY_COLORS[category];
  const label = formatTaxLabel(outcome);
  return (
    <View style={{ backgroundColor: c.bg, borderColor: c.border, borderWidth: 1, borderRadius: 8, padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <Text style={{ fontWeight: '600', color: c.text, fontSize: 14, flexShrink: 1 }}>
          {buildHeadline(category, outcome, state)}
        </Text>
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ fontWeight: '700', fontSize: 18, color: c.text }}>{formatRate(outcome.effectiveTax)}</Text>
          {label ? <Text style={{ fontSize: 10, fontWeight: '600', color: c.text, opacity: 0.75 }}>{label}</Text> : null}
        </View>
      </View>
    </View>
  );
}

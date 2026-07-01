---
"react-address-tax": major
---

Rename `ConsumptionTax` to `Tax` across the public API to shorten names. This is
a breaking change for consumers using the affected exports.

Renamed functions:

- `computeConsumptionTaxOutcome` → `computeTaxOutcome`
- `computeConsumerConsumptionTaxOutcome` → `computeConsumerTaxOutcome`
- `getConsumptionTaxLabel` → `getTaxLabel`
- `getLocalConsumptionTaxLabel` → `getLocalTaxLabel`
- `normalizeConsumptionTax` → `normalizeTax`
- `validateConsumptionTax` → `validateTax`

Renamed types:

- `ConsumptionTaxLabels` → `TaxLabels`
- `ConsumptionTaxValue` → `TaxValue`
- `ConsumptionTaxOutcome` → `TaxOutcome`

The `AddressTaxInput` `onConsumptionTaxChange` prop is now `onTaxChange`, and
the emitted value fields `consumptionTaxLabel` / `localConsumptionTaxLabel` are
now `taxLabel` / `localTaxLabel`. The rendered tax input DOM id changed from
`rav-consumptionTaxId` to `rav-taxId`.

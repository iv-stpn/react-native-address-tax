// Re-exposes the tax domain of country-data-ts as the package's own
// `react-native-address-tax/tax` subpath, so consumers reach the tax API
// (types, rate computation, label helpers) through this package.
// biome-ignore lint/performance/noBarrelFile: re-expose country-data-ts/tax for convenience.
export {
  type ComputeConsumerTaxOutcomeParams,
  type ComputeTaxOutcomeParams,
  type CountryTaxEntry,
  computeConsumerTaxOutcome,
  computeTaxOutcome,
  getBusinessTaxNumberLabel,
  getLocalTaxLabel,
  getTaxConfig,
  getTaxLabel,
  hasRegionalTax,
  isRegionalCountryCode,
  normalizeTax,
  REGIONAL_TAX_COUNTRY_CODES,
  REGIONAL_TAX_COUNTRY_REGIONS,
  type RegionalTaxCountryCode,
  TAX_CONFIG,
  type TaxConfig,
  type TaxLabels,
  type TaxOutcome,
  type TaxOutcomeFlags,
  type TaxSystem,
  type TaxType,
  type TaxValue,
  validateTax,
} from 'country-data-ts/tax';

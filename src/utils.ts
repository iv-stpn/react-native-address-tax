// Public, component-free utility surface, importable from "react-native-address-tax/utils".
// Address config/types, tax computation, and validation helpers — everything in
// the library that doesn't pull in React.

export type {
  AddressCollectionMode,
  AddressFieldKey,
  AddressValue,
  CountryAddressConfig,
  CountryCode,
  ResolvedAddressField,
  ValidationMode,
} from "./utils/address";
export {
  ALL_COUNTRY_OPTIONS,
  addressFieldLabel,
  COUNTRIES_ADDRESSES,
  COUNTRIES_ADDRESSES as COUNTRIES,
  COUNTRY_CODES,
  COUNTRY_LIST,
  getCountryConfig,
  isAddressFieldRequired,
  isEUCountry,
  resolveAddressField,
} from "./utils/address";
export type {
  CountryTaxEntry,
  TaxConfig,
  TaxLabels,
  TaxOutcome,
  TaxOutcomeFlags,
  TaxSystem,
  TaxType,
  TaxValue,
} from "./utils/tax";
export {
  computeConsumerTaxOutcome,
  computeTaxOutcome,
  getBusinessTaxNumberLabel,
  getLocalTaxLabel,
  getTaxConfig,
  getTaxLabel,
  hasRegionalTax,
} from "./utils/tax";
export type { ValidationError, ValidationResult } from "./utils/validation";
export {
  computeEffectiveFields,
  isValidAddress,
  normalizeTax,
  validateAddress,
  validatePostalCode,
  validateTax,
} from "./utils/validation";

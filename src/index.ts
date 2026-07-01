export {
  AddressInput,
  type AddressInputHandle,
  type AddressInputProps,
} from "./components/AddressInput/index";
export {
  AddressTaxInput,
  type AddressTaxInputProps,
} from "./components/AddressTaxInput/index";
export type {
  AddressCollectionMode,
  AddressFieldKey,
  AddressInputClassNames,
  AddressValue,
  AddressValueInput,
  CountryAddressConfig,
  CountryCode,
  ValidationMode,
} from "./utils/address";
export {
  COUNTRIES_ADDRESSES as COUNTRIES,
  COUNTRY_CODES,
  COUNTRY_LIST,
  getCountryConfig,
} from "./utils/address";
export type { TaxLabels, TaxType, TaxValue } from "./utils/tax";
export { getBusinessTaxNumberLabel, getLocalTaxLabel, getTaxLabel } from "./utils/tax";
export type { ValidationError, ValidationResult } from "./utils/validation";
export {
  computeEffectiveFields,
  isValidAddress,
  normalizeTax,
  validateAddress,
  validatePostalCode,
  validateTax,
} from "./utils/validation";

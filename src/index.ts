export {
  AddressInput,
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
  CountryAddressConfig,
  SupportedCountryCode as CountryCode,
} from "./utils/address";
export {
  COUNTRIES_ADDRESSES as COUNTRIES,
  COUNTRY_LIST,
  getConsumptionTaxLabel,
  getCountryConfig,
  SUPPORTED_COUNTRY_CODES as COUNTRY_CODES,
} from "./utils/address";
export type { ConsumptionTaxValue, TaxType } from "./utils/tax";
export type { ValidationError, ValidationResult } from "./utils/validation";
export {
  normalizeConsumptionTax,
  validateAddress,
  validateConsumptionTax,
  validatePostalCode,
} from "./utils/validation";

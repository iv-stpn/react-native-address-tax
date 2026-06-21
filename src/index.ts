export { AddressInput } from "./components/AddressInput/index.js";
export type {
	AddressInputClassNames,
	AddressInputLabels,
	AddressInputProps,
	AddressValue,
} from "./types.js";
export type {
	AddressFieldConfig,
	AddressFieldKey,
	CountryConfig,
} from "./utils/countries.js";
export {
	COUNTRIES,
	COUNTRY_LIST,
	getCountryConfig,
	getVatLabel,
} from "./utils/countries.js";
export type { ValidationError, ValidationResult } from "./utils/validation.js";
export {
	normalizeVat,
	validateAddress,
	validatePostalCode,
	validateVat,
} from "./utils/validation.js";

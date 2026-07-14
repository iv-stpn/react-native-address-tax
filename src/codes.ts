// Country-code list, CountryCode union type, country data object and CountryData type — forwarded from country-data-ts.
// Use this lightweight subpath when you only need country codes and data, without the tax API.
// biome-ignore lint/performance/noBarrelFile: re-expose country-data-ts/countries for convenience.
export { COUNTRY_CODES, COUNTRY_DATA, type CountryCode, type CountryData, isCountryCode } from 'country-data-ts/countries';

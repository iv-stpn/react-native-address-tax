// Re-exposes the tax domain of country-data-ts as the package's own
// `react-native-address-tax/tax` subpath, so consumers reach the tax API
// (types, rate computation, label helpers) through this package.
export * from "country-data-ts/tax";

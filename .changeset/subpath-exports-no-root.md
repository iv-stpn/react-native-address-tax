---
"react-native-address-tax": major
---

Drop the aggregating barrels in favour of per-module subpath exports.

`react-native-address-tax` no longer has a root entry or a `./utils` export, and
no longer aggregates `country-data-ts` symbols into a single surface. Import each
component from its own subpath. The tax and country-code domains are re-exposed
as `./tax` and `./codes` subpaths; address types come directly from
`country-data-ts/address`.

**Breaking changes**

- `import { ... } from "react-native-address-tax"` (the bare package) and the
  `react-native-address-tax/utils` subpath are removed.
- Subpaths: `react-native-address-tax/AddressInput`,
  `react-native-address-tax/AddressTaxInput`, `react-native-address-tax/types`,
  `react-native-address-tax/validation`, `react-native-address-tax/tax`
  (re-exposes `country-data-ts/tax`), and `react-native-address-tax/codes`
  (re-exposes `country-data-ts/countries`).
- Address symbols previously re-exported from the root (`AddressValue`,
  `COUNTRY_LIST`, `getCountryConfig`, etc.) must now be imported from
  `country-data-ts/address`.

**Migration**

```diff
-import { AddressTaxInput, AddressValue, validateTax } from "react-native-address-tax";
+import { AddressTaxInput } from "react-native-address-tax/AddressTaxInput";
+import type { AddressValue } from "country-data-ts/address";
+import { validateTax } from "react-native-address-tax/tax";
```

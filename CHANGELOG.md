# react-native-address-tax

## 2.1.0

### Minor Changes

- [`4e3465f`](https://github.com/iv-stpn/react-native-address-tax/commit/4e3465f0c3dfb01aaa14736193bae052e2d5a73f) Thanks [@iv-stpn](https://github.com/iv-stpn)! - Re-export the `AddressValue` type from the `./validation` entry point so downstream consumers can import it directly.

## 2.0.0

### Major Changes

- [#4](https://github.com/iv-stpn/react-native-address-tax/pull/4) [`5b247dc`](https://github.com/iv-stpn/react-native-address-tax/commit/5b247dcb239f7521457ae122aa9e01034933f589) Thanks [@iv-stpn](https://github.com/iv-stpn)! - Drop the aggregating barrels in favour of per-module subpath exports.

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

### Patch Changes

- [#5](https://github.com/iv-stpn/react-native-address-tax/pull/5) [`05fe396`](https://github.com/iv-stpn/react-native-address-tax/commit/05fe3969bdf5df800c9c764831cc3714ca22cdd0) Thanks [@iv-stpn](https://github.com/iv-stpn)! - Refactor component internals into focused modules.

  `AddressTaxInput` and `AddressInput` were split into smaller, single-responsibility files to stay under cognitive-complexity budgets and make the tax math independently testable:

  - `addressTaxLogic.ts` — pure helpers (`computeTaxRates`, `resolveIsBusiness`, `computeInNexus`) with no render dependency.
  - `useAddressTaxState.ts` — state hook that owns all tax event handlers; the component body is now a thin render layer.
  - `addressTaxFields.tsx` / `addressInputFields.tsx` — field-node builders extracted from JSX.
  - `hooks.ts` — intention-revealing wrappers over `useEffect` (`useMountEffect`, `useReactiveEffect`).

  `interface` declarations in `types.ts` and component prop types converted to `type` aliases (non-breaking for consumers).

  Dev tooling: pinned dependency versions, added `biome-react-best-practices-plugin`, `biome-typescript-best-practices-plugin`, and `biome-drizzle-best-practices-plugin`; updated `react-native` to `0.86.0` and `typescript` to `^7`.

- [#5](https://github.com/iv-stpn/react-native-address-tax/pull/5) [`c0cabe3`](https://github.com/iv-stpn/react-native-address-tax/commit/c0cabe3dffeb97c6ae4c4f1962b0f4a7472d2285) Thanks [@iv-stpn](https://github.com/iv-stpn)! - Generate type declarations with `tsc` instead of tsup's bundled
  `rollup-plugin-dts`, which crashes against the TypeScript 7 native compiler
  (`Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')`).

  The build now runs `tsup` (JS only) followed by `tsc --emitDeclarationOnly`.
  Since `tsc` emits a single `.d.ts` per module, each subpath export collapses to
  one flat `types` condition serving both `import` and `require`. No consumer-facing
  API change.

## 1.0.1

### Patch Changes

- [#1](https://github.com/iv-stpn/react-native-address-tax/pull/1) [`bbf0ee6`](https://github.com/iv-stpn/react-native-address-tax/commit/bbf0ee6fb1087162603029ddb175eaf007de570b) Thanks [@iv-stpn](https://github.com/iv-stpn)! - Flatten the components directory by inlining component files directly under `src/components/` instead of nesting each in its own subfolder. Internal-only change; the public API is unchanged.

## 1.0.0

### Major Changes

- Initial release.

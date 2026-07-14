---
"react-native-address-tax": patch
---

Refactor component internals into focused modules.

`AddressTaxInput` and `AddressInput` were split into smaller, single-responsibility files to stay under cognitive-complexity budgets and make the tax math independently testable:

- `addressTaxLogic.ts` — pure helpers (`computeTaxRates`, `resolveIsBusiness`, `computeInNexus`) with no render dependency.
- `useAddressTaxState.ts` — state hook that owns all tax event handlers; the component body is now a thin render layer.
- `addressTaxFields.tsx` / `addressInputFields.tsx` — field-node builders extracted from JSX.
- `hooks.ts` — intention-revealing wrappers over `useEffect` (`useMountEffect`, `useReactiveEffect`).

`interface` declarations in `types.ts` and component prop types converted to `type` aliases (non-breaking for consumers).

Dev tooling: pinned dependency versions, added `biome-react-best-practices-plugin`, `biome-typescript-best-practices-plugin`, and `biome-drizzle-best-practices-plugin`; updated `react-native` to `0.86.0` and `typescript` to `^7`.

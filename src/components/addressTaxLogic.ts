import { isEUCountry } from 'country-data-ts/address';
import type { TaxType } from 'country-data-ts/tax';
import { computeTaxOutcome } from 'country-data-ts/tax';

// Pure, render-free helpers backing AddressTaxInput. Kept out of the component
// so the component body stays under the cognitive-complexity budget and the
// tax math can be unit-tested in isolation.

/** The two resolved tax-rate states plus their display labels. */
type TaxRates = {
  baseTax: number;
  effectiveTax: number;
  taxLabel: string | null;
  localTaxLabel: string | null;
};

type ComputeTaxRatesOptions = {
  country: string;
  level1: string | undefined;
  isBusiness: boolean;
  hasTaxIdentifier: boolean;
  isInNexus: boolean;
};

/**
 * Resolve the two tax-rate states for a given buyer/jurisdiction:
 * - `baseTax`: the rate that would apply if the seller had a nexus here (the
 *   headline rate for the buyer, accounting for B2B reverse charge).
 * - `effectiveTax`: `baseTax` when the seller actually has a nexus, else 0.
 *
 * The rate is computed under the hypothetical "seller has nexus" assumption, so
 * `hasTaxIdentifier` only gates the reverse-charge treatment — not collection.
 */
function computeTaxRates(opts: ComputeTaxRatesOptions): TaxRates {
  const { country, level1, isBusiness, hasTaxIdentifier, isInNexus } = opts;
  const outcome = computeTaxOutcome({
    country,
    isBusiness,
    hasTaxId: isBusiness && hasTaxIdentifier,
    hasNexus: isInNexus,
    state: level1,
  });
  return {
    baseTax: outcome.baseTax ?? 0,
    effectiveTax: outcome.effectiveTax ?? 0,
    taxLabel: outcome.taxLabel,
    localTaxLabel: outcome.localTaxLabel,
  };
}

/**
 * Resolve the effective "is business" state from the tax type and the
 * controlled/internal business flags. "business"/"individual" pin the answer;
 * "either" defers to the controlled prop, then the internal state.
 */
function resolveIsBusiness(taxType: TaxType, isBusinessProp: boolean | undefined, internalIsBusiness: boolean): boolean {
  if (taxType === 'business') return true;
  if (taxType === 'individual') return false;
  return isBusinessProp ?? internalIsBusiness;
}

/**
 * Whether the seller collects consumption tax in `country`. EU member states
 * always carry an obligation, so they count as in-nexus even when the nexus
 * list is empty or omits them.
 */
function computeInNexus(country: string, nexusList: string[] | undefined): boolean {
  return !nexusList || nexusList.includes(country) || isEUCountry(country);
}

export type { ComputeTaxRatesOptions, TaxRates };
export { computeInNexus, computeTaxRates, resolveIsBusiness };

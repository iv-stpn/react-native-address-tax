import type { AddressValue } from 'country-data-ts/address';
import type { TaxConfig, TaxType, TaxValue } from 'country-data-ts/tax';
import { getBusinessTaxNumberLabel, getTaxConfig, normalizeTax, validateTax } from 'country-data-ts/tax';
import { useState } from 'react';
import { computeInNexus, computeTaxRates, resolveIsBusiness } from './addressTaxLogic';
import { useMountEffect } from './hooks';

// State + event handlers for AddressTaxInput, extracted from the component so
// the component body stays a thin render layer under the cognitive-complexity
// budget. The branchy handlers live at module scope (each counted on its own)
// and the hook wires them to the current render's state via a context object.

/** Parent callbacks that fire as the tax state changes. */
type TaxStateCallbacks = {
  onAddressChange: (value: AddressValue) => void;
  onTaxChange?: (value: TaxValue) => void;
  onBusinessChange?: (isBusiness: boolean) => void;
  onHasTaxIdentifierChange?: (hasTaxIdentifier: boolean) => void;
  onTaxIdentifierChange?: (taxIdentifier: string) => void;
};

type UseAddressTaxStateOptions = {
  addressValue: AddressValue;
  taxType: TaxType;
  isBusinessProp?: boolean;
  hasTaxIdentifierProp?: boolean;
  taxIdentifierProp?: string;
  nexusList?: string[];
  defaultCountry?: string;
  callbacks: TaxStateCallbacks;
};

/** Everything AddressTaxInput needs to render, plus the field event handlers. */
type AddressTaxState = {
  country: string;
  isBusiness: boolean;
  hasTaxIdentifier: boolean;
  taxId: string;
  showTaxFields: boolean;
  businessTaxNumberLabel: string;
  taxConfig: TaxConfig | undefined;
  taxInvalid: boolean;
  taxError: string | undefined;
  handleBusinessChange: (val: boolean) => void;
  handleHasTaxIdentifierChange: (checked: boolean) => void;
  handleAddressChange: (newAddress: AddressValue) => void;
  handleTaxChange: (text: string) => void;
  handleTaxBlur: () => void;
};

// Snapshot of the current render's state that the handlers read and write.
// Bundled so each handler stays a single-parameter module function.
type HandlerContext = {
  setInternalIsBusiness: (v: boolean) => void;
  setInternalHasTaxIdentifier: (v: boolean) => void;
  setInternalTaxIdentifier: (v: string) => void;
  setTaxTouched: (v: boolean) => void;
  callbacks: TaxStateCallbacks;
  country: string;
  level1: string | undefined;
  isBusiness: boolean;
  hasTaxIdentifier: boolean;
  taxId: string;
  isInNexus: boolean;
  showTaxFields: boolean;
  hasIdentifier: boolean;
  baseTax: number;
  effectiveTax: number;
  taxLabel: string | null;
  localTaxLabel: string | null;
  nexusList?: string[];
  defaultCountry?: string;
};

// Mirror a tax-id edit into internal state and the controlled callback.
function setTaxId(ctx: HandlerContext, value: string): void {
  ctx.setInternalTaxIdentifier(value);
  ctx.callbacks.onTaxIdentifierChange?.(value);
}

function handleBusinessChange(ctx: HandlerContext, val: boolean): void {
  ctx.setInternalIsBusiness(val);
  ctx.callbacks.onBusinessChange?.(val);
  const rates = computeTaxRates({
    country: ctx.country,
    level1: ctx.level1,
    isBusiness: val,
    hasTaxIdentifier: ctx.hasTaxIdentifier,
    isInNexus: ctx.isInNexus,
  });
  if (val) {
    const hasIdentifier = ctx.isInNexus && Boolean(ctx.country) && ctx.hasTaxIdentifier;
    ctx.callbacks.onTaxChange?.({ taxId: ctx.taxId || undefined, hasIdentifier, ...rates });
    return;
  }
  ctx.setInternalHasTaxIdentifier(true);
  ctx.callbacks.onHasTaxIdentifierChange?.(true);
  ctx.callbacks.onTaxChange?.({ taxId: ctx.taxId || undefined, hasIdentifier: false, ...rates });
}

function handleHasTaxIdentifierChange(ctx: HandlerContext, checked: boolean): void {
  // The checkbox is "I don't have a …", so its checked state is the inverse.
  const val = !checked;
  ctx.setInternalHasTaxIdentifier(val);
  ctx.callbacks.onHasTaxIdentifierChange?.(val);
  if (val) {
    ctx.callbacks.onTaxChange?.({
      taxId: ctx.taxId || undefined,
      hasIdentifier: ctx.showTaxFields,
      ...computeTaxRates({
        country: ctx.country,
        level1: ctx.level1,
        isBusiness: ctx.isBusiness,
        hasTaxIdentifier: true,
        isInNexus: ctx.isInNexus,
      }),
    });
    return;
  }
  setTaxId(ctx, '');
  ctx.callbacks.onTaxChange?.({
    taxId: undefined,
    hasIdentifier: false,
    ...computeTaxRates({
      country: ctx.country,
      level1: ctx.level1,
      isBusiness: ctx.isBusiness,
      hasTaxIdentifier: false,
      isInNexus: ctx.isInNexus,
    }),
  });
}

function handleAddressChange(ctx: HandlerContext, newAddress: AddressValue): void {
  ctx.callbacks.onAddressChange(newAddress);
  const newCountry = newAddress.country || ctx.defaultCountry || '';
  const newInNexus = computeInNexus(newCountry, ctx.nexusList);
  const newHasIdentifier = ctx.isBusiness && newInNexus && Boolean(newCountry) && ctx.hasTaxIdentifier;
  const rates = computeTaxRates({
    country: newCountry,
    level1: newAddress.level1,
    isBusiness: ctx.isBusiness,
    hasTaxIdentifier: ctx.hasTaxIdentifier,
    isInNexus: newInNexus,
  });
  if (newHasIdentifier !== ctx.hasIdentifier || rates.baseTax !== ctx.baseTax || rates.effectiveTax !== ctx.effectiveTax)
    ctx.callbacks.onTaxChange?.({ taxId: ctx.taxId || undefined, hasIdentifier: newHasIdentifier, ...rates });
}

function handleTaxChange(ctx: HandlerContext, text: string): void {
  setTaxId(ctx, text);
  ctx.callbacks.onTaxChange?.({
    taxId: text || undefined,
    hasIdentifier: ctx.hasIdentifier,
    baseTax: ctx.baseTax,
    effectiveTax: ctx.effectiveTax,
    taxLabel: ctx.taxLabel,
    localTaxLabel: ctx.localTaxLabel,
  });
  ctx.setTaxTouched(true);
}

function handleTaxBlur(ctx: HandlerContext): void {
  const normalized = normalizeTax(ctx.taxId);
  if (normalized !== ctx.taxId) {
    setTaxId(ctx, normalized);
    ctx.callbacks.onTaxChange?.({
      taxId: normalized || undefined,
      hasIdentifier: ctx.hasIdentifier,
      baseTax: ctx.baseTax,
      effectiveTax: ctx.effectiveTax,
      taxLabel: ctx.taxLabel,
      localTaxLabel: ctx.localTaxLabel,
    });
  }
  ctx.setTaxTouched(true);
}
// Derived, render-time view of the tax state. Pure so the hook body stays a
// thin wiring layer under the cognitive-complexity budget.
type TaxView = {
  country: string;
  isBusiness: boolean;
  hasTaxIdentifier: boolean;
  taxId: string;
  isInNexus: boolean;
  showTaxFields: boolean;
  businessTaxNumberLabel: string;
  taxConfig: TaxConfig | undefined;
  hasIdentifier: boolean;
  rates: ReturnType<typeof computeTaxRates>;
  taxInvalid: boolean;
  taxError: string | undefined;
};

type InternalState = {
  internalIsBusiness: boolean;
  internalHasTaxIdentifier: boolean;
  internalTaxIdentifier: string;
  taxTouched: boolean;
};

function deriveTaxView(opts: UseAddressTaxStateOptions, state: InternalState): TaxView {
  const isBusiness = resolveIsBusiness(opts.taxType, opts.isBusinessProp, state.internalIsBusiness);
  const hasTaxIdentifier = opts.hasTaxIdentifierProp ?? state.internalHasTaxIdentifier;
  const taxId = opts.taxIdentifierProp ?? state.internalTaxIdentifier;
  const country = opts.addressValue.country || opts.defaultCountry || '';
  const isInNexus = computeInNexus(country, opts.nexusList);
  const showTaxFields = isBusiness && isInNexus && Boolean(country);
  const businessTaxNumberLabel = (country ? getBusinessTaxNumberLabel(country) : null) ?? 'Tax ID';
  const hasIdentifier = showTaxFields && hasTaxIdentifier;
  const rates = computeTaxRates({ country, level1: opts.addressValue.level1, isBusiness, hasTaxIdentifier, isInNexus });
  const taxConfig = getTaxConfig(country);
  const taxInvalid = state.taxTouched && taxId ? !validateTax(taxId, country) : false;
  const taxError = taxInvalid ? `Invalid ${businessTaxNumberLabel} format. Expected: ${taxConfig?.taxExample ?? ''}.` : undefined;
  return {
    country,
    isBusiness,
    hasTaxIdentifier,
    taxId,
    isInNexus,
    showTaxFields,
    businessTaxNumberLabel,
    taxConfig,
    hasIdentifier,
    rates,
    taxInvalid,
    taxError,
  };
}

function useAddressTaxState(opts: UseAddressTaxStateOptions): AddressTaxState {
  const [internalIsBusiness, setInternalIsBusiness] = useState(false);
  const [internalHasTaxIdentifier, setInternalHasTaxIdentifier] = useState(true);
  const [internalTaxIdentifier, setInternalTaxIdentifier] = useState('');
  const [taxTouched, setTaxTouched] = useState(false);

  const view = deriveTaxView(opts, { internalIsBusiness, internalHasTaxIdentifier, internalTaxIdentifier, taxTouched });

  const ctx: HandlerContext = {
    setInternalIsBusiness,
    setInternalHasTaxIdentifier,
    setInternalTaxIdentifier,
    setTaxTouched,
    callbacks: opts.callbacks,
    country: view.country,
    level1: opts.addressValue.level1,
    isBusiness: view.isBusiness,
    hasTaxIdentifier: view.hasTaxIdentifier,
    taxId: view.taxId,
    isInNexus: view.isInNexus,
    showTaxFields: view.showTaxFields,
    hasIdentifier: view.hasIdentifier,
    baseTax: view.rates.baseTax,
    effectiveTax: view.rates.effectiveTax,
    taxLabel: view.rates.taxLabel,
    localTaxLabel: view.rates.localTaxLabel,
    nexusList: opts.nexusList,
    defaultCountry: opts.defaultCountry,
  };

  // Mount-only: emit the initial computed tax state; handlers cover changes.
  useMountEffect(() => {
    opts.callbacks.onTaxChange?.({
      taxId: view.taxId || undefined,
      hasIdentifier: view.hasIdentifier,
      baseTax: view.rates.baseTax,
      effectiveTax: view.rates.effectiveTax,
      taxLabel: view.rates.taxLabel,
      localTaxLabel: view.rates.localTaxLabel,
    });
  });

  return {
    country: view.country,
    isBusiness: view.isBusiness,
    hasTaxIdentifier: view.hasTaxIdentifier,
    taxId: view.taxId,
    showTaxFields: view.showTaxFields,
    businessTaxNumberLabel: view.businessTaxNumberLabel,
    taxConfig: view.taxConfig,
    taxInvalid: view.taxInvalid,
    taxError: view.taxError,
    handleBusinessChange: (val) => handleBusinessChange(ctx, val),
    handleHasTaxIdentifierChange: (checked) => handleHasTaxIdentifierChange(ctx, checked),
    handleAddressChange: (newAddress) => handleAddressChange(ctx, newAddress),
    handleTaxChange: (text) => handleTaxChange(ctx, text),
    handleTaxBlur: () => handleTaxBlur(ctx),
  };
}

export type { AddressTaxState, UseAddressTaxStateOptions };
export { useAddressTaxState };

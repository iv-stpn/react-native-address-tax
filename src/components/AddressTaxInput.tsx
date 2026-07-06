import { forwardRef, type ReactNode, useEffect, useState } from "react";
import { type StyleProp, Text, TextInput, type TextStyle, View } from "react-native";
import type { AddressCollectionMode, AddressValue, ValidationMode } from "../utils/address";
import type { TaxType, TaxValue } from "../utils/tax";
import { computeTaxOutcome, getBusinessTaxNumberLabel, getTaxConfig, hasRegionalTax, isEUCountry } from "../utils/tax";
import type { ValidationError } from "../utils/validation";
import { normalizeTax, validateTax } from "../utils/validation";
import { AddressInput, type AddressInputHandle } from "./AddressInput";
import { Checkbox } from "./Checkbox";
import { defaultStyles } from "./styles";
import type { RenderCheckboxProps, RenderContainerProps, RenderFieldEntry, RenderInputProps, RenderSelectProps } from "./types";

export interface AddressTaxInputProps {
  addressValue: AddressValue;
  /**
   * Whether the payer is always a business, always an individual, or lets the user either.
   * - "business": treats as business with no toggle; shows tax identifier fields.
   * - "individual": treats as individual with no toggle; hides tax identifier fields.
   * - "either" (default): shows the Business account checkbox.
   */
  taxType?: TaxType;
  /** Controlled business state. Only meaningful when taxType is "either". When undefined, managed internally. */
  isBusiness?: boolean;
  /** Controlled "I have a tax identifier" state. When undefined, managed internally. */
  hasTaxIdentifier?: boolean;
  /** Controlled consumption tax identifier value. When undefined, managed internally. */
  taxIdentifier?: string;
  /**
   * Countries where you have a tax nexus and must collect consumption tax.
   * When provided, the tax identifier field is only shown for countries in this list.
   * When omitted, the tax identifier field is shown for all countries (when business).
   */
  nexusList?: string[];
  /** Whether the consumption tax identifier field is required. */
  taxRequired?: boolean;
  onAddressChange: (value: AddressValue) => void;
  onTaxChange?: (value: TaxValue) => void;
  onBusinessChange?: (isBusiness: boolean) => void;
  onHasTaxIdentifierChange?: (hasTaxIdentifier: boolean) => void;
  onTaxIdentifierChange?: (taxIdentifier: string) => void;
  onValidationChange?: (valid: boolean, errors: ValidationError[]) => void;
  mode?: AddressCollectionMode;
  /**
   * Controls when address validation errors become visible. Defaults to
   * "onType". With "onSubmit", call the component's ref `validate()` to reveal
   * errors. Forwarded to the underlying AddressInput.
   */
  validationMode?: ValidationMode;
  defaultCountry?: string;
  defaultRegion?: string;
  /** Placeholder shown in the country selector when nothing is selected. Defaults to "Select country". */
  countryPlaceholder?: string;
  /** Placeholder shown in the level-1 administrative selector, as a function of the field's label. */
  level1AdministrativePlaceholder?: (label: string) => string;
  disabled?: boolean;
  /** Style applied to the root View. */
  style?: RenderContainerProps["style"];
  renderInput?: (props: RenderInputProps) => ReactNode;
  renderCheckbox?: (props: RenderCheckboxProps) => ReactNode;
  /** Custom renderer for the country selector. */
  renderCountrySelect?: (props: RenderSelectProps) => ReactNode;
  /** Custom renderer for the level-1 administrative selector. */
  renderLevel1AdministrativeSelect?: (props: RenderSelectProps) => ReactNode;
  /** Custom renderer for the container including the input, input label and field error. */
  renderContainer?: (props: RenderContainerProps) => ReactNode;
  /**
   * Custom layout for the fields. Receives the list of rendered field nodes
   * (each tagged with its `type`) in display order, and returns the node to
   * render in place of the default column layout.
   *
   * The `type` is "business" for the Business account checkbox, "country" or an
   * address field key (line1, line2, city, level1, postalCode) for address
   * fields, "noTaxIdentifier" for the "I don't have a tax id" checkbox, and
   * "taxId" for the tax identifier input.
   */
  renderFields?: (fields: RenderFieldEntry[]) => ReactNode;
}

/**
 * Resolve the two tax-rate states for a given buyer/jurisdiction:
 * - `baseTax`: the rate that would apply if the seller had a nexus here (the
 *   headline rate for the buyer, accounting for B2B reverse charge).
 * - `effectiveTax`: `baseTax` when the seller actually has a nexus, else 0.
 *
 * The rate is computed under the hypothetical "seller has nexus" assumption, so
 * `hasTaxIdentifier` only gates the reverse-charge treatment — not collection.
 */
function computeTaxRates(
  country: string,
  level1: string | undefined,
  isBusiness: boolean,
  hasTaxIdentifier: boolean,
  isInNexus: boolean,
): { baseTax: number; effectiveTax: number; taxLabel: string | null; localTaxLabel: string | null } {
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

export const AddressTaxInput = forwardRef<AddressInputHandle, AddressTaxInputProps>(function AddressTaxInput(
  {
    addressValue,
    taxType = "either",
    isBusiness: isBusinessProp,
    hasTaxIdentifier: hasTaxIdentifierProp,
    taxIdentifier: taxIdentifierProp,
    nexusList,
    taxRequired = false,
    onAddressChange,
    onTaxChange,
    onBusinessChange,
    onHasTaxIdentifierChange,
    onTaxIdentifierChange,
    onValidationChange,
    mode,
    validationMode,
    defaultCountry,
    defaultRegion,
    countryPlaceholder,
    level1AdministrativePlaceholder,
    disabled = false,
    style,
    renderInput,
    renderCheckbox,
    renderCountrySelect,
    renderLevel1AdministrativeSelect,
    renderContainer,
    renderFields,
  }: AddressTaxInputProps,
  ref,
) {
  const [internalIsBusiness, setInternalIsBusiness] = useState(false);
  const [internalHasTaxIdentifier, setInternalHasTaxIdentifier] = useState(true);
  const [internalTaxIdentifier, setInternalTaxIdentifier] = useState("");
  const [taxTouched, setTaxTouched] = useState(false);

  const isBusiness =
    taxType === "business"
      ? true
      : taxType === "individual"
        ? false
        : isBusinessProp !== undefined
          ? isBusinessProp
          : internalIsBusiness;
  const hasTaxIdentifier = hasTaxIdentifierProp !== undefined ? hasTaxIdentifierProp : internalHasTaxIdentifier;
  const taxId = taxIdentifierProp !== undefined ? taxIdentifierProp : internalTaxIdentifier;
  const setTaxId = (value: string) => {
    setInternalTaxIdentifier(value);
    onTaxIdentifierChange?.(value);
  };

  const country = addressValue.country || defaultCountry || "";
  const taxConfig = getTaxConfig(country);
  // EU member states always carry a consumption-tax obligation, so they count
  // as in-nexus even when the nexus list is empty or omits them.
  const isInNexus = !nexusList || nexusList.includes(country) || isEUCountry(country);
  const showTaxFields = isBusiness && isInNexus && !!country;

  const businessTaxNumberLabel = (country ? getBusinessTaxNumberLabel(country) : null) ?? "Tax ID";

  const hasIdentifier = showTaxFields && hasTaxIdentifier;

  const { baseTax, effectiveTax, taxLabel, localTaxLabel } = computeTaxRates(
    country,
    addressValue.level1,
    isBusiness,
    hasTaxIdentifier,
    isInNexus,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: mount-only — emit initial computed state; handlers cover subsequent changes
  useEffect(() => {
    onTaxChange?.({
      taxId: taxId || undefined,
      hasIdentifier,
      baseTax,
      effectiveTax,
      taxLabel,
      localTaxLabel,
    });
  }, []);

  const taxInvalid = taxTouched && !!taxId ? !validateTax(taxId, country) : false;
  const taxError = taxInvalid ? `Invalid ${businessTaxNumberLabel} format. Expected: ${taxConfig?.taxExample ?? ""}.` : undefined;

  function handleBusinessChange(val: boolean) {
    setInternalIsBusiness(val);
    onBusinessChange?.(val);
    if (!val) {
      setInternalHasTaxIdentifier(true);
      onHasTaxIdentifierChange?.(true);
      onTaxChange?.({
        taxId: taxId || undefined,
        hasIdentifier: false,
        ...computeTaxRates(country, addressValue.level1, false, hasTaxIdentifier, isInNexus),
      });
    } else {
      const newHasIdentifier = isInNexus && !!country && hasTaxIdentifier;
      onTaxChange?.({
        taxId: taxId || undefined,
        hasIdentifier: newHasIdentifier,
        ...computeTaxRates(country, addressValue.level1, true, hasTaxIdentifier, isInNexus),
      });
    }
  }

  function handleHasTaxIdentifierChange(checked: boolean) {
    // The checkbox is "I don't have a …", so its checked state is the inverse.
    const val = !checked;
    setInternalHasTaxIdentifier(val);
    onHasTaxIdentifierChange?.(val);
    if (!val) {
      setTaxId("");
      onTaxChange?.({
        taxId: undefined,
        hasIdentifier: false,
        ...computeTaxRates(country, addressValue.level1, isBusiness, false, isInNexus),
      });
    } else {
      onTaxChange?.({
        taxId: taxId || undefined,
        hasIdentifier: showTaxFields,
        ...computeTaxRates(country, addressValue.level1, isBusiness, true, isInNexus),
      });
    }
  }

  function handleAddressChange(newAddress: AddressValue) {
    onAddressChange(newAddress);
    const newCountry = newAddress.country || defaultCountry || "";
    const newInNexus = !nexusList || nexusList.includes(newCountry) || isEUCountry(newCountry);
    const newHasIdentifier = isBusiness && newInNexus && !!newCountry && hasTaxIdentifier;
    const rates = computeTaxRates(newCountry, newAddress.level1, isBusiness, hasTaxIdentifier, newInNexus);
    if (newHasIdentifier !== hasIdentifier || rates.baseTax !== baseTax || rates.effectiveTax !== effectiveTax) {
      onTaxChange?.({
        taxId: taxId || undefined,
        hasIdentifier: newHasIdentifier,
        ...rates,
      });
    }
  }

  function handleTaxChange(text: string) {
    setTaxId(text);
    onTaxChange?.({
      taxId: text || undefined,
      hasIdentifier,
      baseTax,
      effectiveTax,
      taxLabel,
      localTaxLabel,
    });
    setTaxTouched(true);
  }

  function handleTaxBlur() {
    const normalized = normalizeTax(taxId);
    if (normalized !== taxId) {
      setTaxId(normalized);
      onTaxChange?.({
        taxId: normalized || undefined,
        hasIdentifier,
        baseTax,
        effectiveTax,
        taxLabel,
        localTaxLabel,
      });
    }
    setTaxTouched(true);
  }

  // --- Default render helpers ---

  function renderCheckboxEl(props: RenderCheckboxProps) {
    if (renderCheckbox) return renderCheckbox(props);
    return <Checkbox {...props} />;
  }

  function renderInputEl(props: RenderInputProps) {
    if (renderInput) return renderInput(props);
    const inputStyle: StyleProp<TextStyle> = [
      defaultStyles.input,
      props.invalid && defaultStyles.inputInvalid,
      props.disabled && defaultStyles.inputDisabled,
      props.style,
    ];
    return (
      <TextInput
        testID={props.id}
        nativeID={props.id}
        style={inputStyle}
        value={props.value}
        onChangeText={props.onChangeText}
        onBlur={props.onBlur}
        placeholder={props.placeholder}
        placeholderTextColor="#94a3b8"
        editable={!props.disabled}
        accessibilityLabel={props.accessibilityLabel}
        aria-label={props.accessibilityLabel}
        aria-required={props.required}
        aria-invalid={props.invalid}
      />
    );
  }

  function renderContainerEl(containerProps: RenderContainerProps) {
    if (renderContainer) return renderContainer(containerProps);
    return (
      <View style={[defaultStyles.field, containerProps.style]}>
        <Text nativeID={`${containerProps.id}-label`} style={defaultStyles.label}>
          {containerProps.label}
          {containerProps.required ? <Text style={defaultStyles.required}> *</Text> : null}
        </Text>
        {containerProps.children}
        {containerProps.error ? (
          <Text testID={`${containerProps.id}-error`} role="alert" style={defaultStyles.error}>
            {containerProps.error}
          </Text>
        ) : null}
      </View>
    );
  }

  const taxInputId = "rav-taxId";

  const businessCheckboxNode =
    taxType === "either" ? (
      <View style={defaultStyles.field}>
        {renderCheckboxEl({
          checked: isBusiness,
          onValueChange: handleBusinessChange,
          disabled,
          label: "Business account",
        })}
      </View>
    ) : null;

  const noTaxIdentifierNode = showTaxFields ? (
    <View style={defaultStyles.field}>
      {renderCheckboxEl({
        checked: !hasTaxIdentifier,
        onValueChange: handleHasTaxIdentifierChange,
        disabled,
        label: `I don't have a ${businessTaxNumberLabel}`,
      })}
    </View>
  ) : null;

  const taxIdNode =
    showTaxFields && hasTaxIdentifier
      ? renderContainerEl({
          id: taxInputId,
          fieldKey: "taxId",
          label: businessTaxNumberLabel,
          required: taxRequired,
          error: taxError,
          children: renderInputEl({
            id: taxInputId,
            value: taxId,
            onChangeText: handleTaxChange,
            onBlur: handleTaxBlur,
            placeholder: taxConfig?.taxExample,
            disabled,
            required: taxRequired,
            invalid: taxInvalid,
            accessibilityLabel: businessTaxNumberLabel,
          }),
        })
      : null;

  // Entries that bracket the address fields, in display order.
  const beforeEntries: RenderFieldEntry[] = businessCheckboxNode ? [{ type: "business", node: businessCheckboxNode }] : [];
  const afterEntries: RenderFieldEntry[] = [];
  if (noTaxIdentifierNode) afterEntries.push({ type: "noTaxIdentifier", node: noTaxIdentifierNode });
  if (taxIdNode) afterEntries.push({ type: "taxId", node: taxIdNode });

  return (
    <View style={[defaultStyles.root, style]}>
      {!renderFields && businessCheckboxNode}

      <AddressInput
        ref={ref}
        value={addressValue}
        onChange={handleAddressChange}
        onValidationChange={onValidationChange}
        mode={hasRegionalTax(country) && mode !== "region" ? "fullRegion" : mode}
        validationMode={validationMode}
        inline
        defaultCountry={defaultCountry}
        defaultRegion={defaultRegion}
        countryPlaceholder={countryPlaceholder}
        level1AdministrativePlaceholder={level1AdministrativePlaceholder}
        disabled={disabled}
        renderInput={renderInput}
        renderCountrySelect={renderCountrySelect}
        renderLevel1AdministrativeSelect={renderLevel1AdministrativeSelect}
        renderContainer={renderContainer}
        renderFields={
          renderFields ? (addressEntries) => renderFields([...beforeEntries, ...addressEntries, ...afterEntries]) : undefined
        }
      />

      {!renderFields && showTaxFields ? (
        <>
          {noTaxIdentifierNode}
          {taxIdNode}
        </>
      ) : null}
    </View>
  );
});

import type { AddressCollectionMode, AddressValue, ValidationMode } from 'country-data-ts/address';
import type { TaxType, TaxValue } from 'country-data-ts/tax';
import { hasRegionalTax } from 'country-data-ts/tax';
import type { ReactNode } from 'react';
import { View } from 'react-native';
import type { ValidationError } from '../validation';
import { AddressInput } from './AddressInput';
import { buildTaxNodes } from './addressTaxFields';
import { defaultStyles } from './styles';
import type { RenderCheckboxProps, RenderContainerProps, RenderFieldEntry, RenderInputProps, RenderSelectProps } from './types';
import { useAddressTaxState } from './useAddressTaxState';

export type AddressTaxInputProps = {
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
  style?: RenderContainerProps['style'];
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
  ref?: React.Ref<import('./AddressInput').AddressInputHandle>;
};

export const AddressTaxInput = function AddressTaxInput(props: AddressTaxInputProps) {
  const { addressValue, taxType = 'either', nexusList, taxRequired = false, mode, validationMode } = props;
  const { defaultCountry, defaultRegion, countryPlaceholder, level1AdministrativePlaceholder, disabled = false } = props;
  const { style, renderInput, renderCheckbox, renderCountrySelect, renderLevel1AdministrativeSelect } = props;
  const { renderContainer, renderFields, onValidationChange, ref } = props;

  const state = useAddressTaxState({
    addressValue,
    taxType,
    isBusinessProp: props.isBusiness,
    hasTaxIdentifierProp: props.hasTaxIdentifier,
    taxIdentifierProp: props.taxIdentifier,
    nexusList,
    defaultCountry,
    callbacks: {
      onAddressChange: props.onAddressChange,
      onTaxChange: props.onTaxChange,
      onBusinessChange: props.onBusinessChange,
      onHasTaxIdentifierChange: props.onHasTaxIdentifierChange,
      onTaxIdentifierChange: props.onTaxIdentifierChange,
    },
  });

  const { businessCheckboxNode, noTaxIdentifierNode, taxIdNode, beforeEntries, afterEntries } = buildTaxNodes({
    taxType,
    isBusiness: state.isBusiness,
    hasTaxIdentifier: state.hasTaxIdentifier,
    showTaxFields: state.showTaxFields,
    disabled,
    taxRequired,
    businessTaxNumberLabel: state.businessTaxNumberLabel,
    taxId: state.taxId,
    taxExample: state.taxConfig?.taxExample,
    taxError: state.taxError,
    taxInvalid: state.taxInvalid,
    handleBusinessChange: state.handleBusinessChange,
    handleHasTaxIdentifierChange: state.handleHasTaxIdentifierChange,
    handleTaxChange: state.handleTaxChange,
    handleTaxBlur: state.handleTaxBlur,
    renderCheckbox,
    renderInput,
    renderContainer,
  });

  // Regional-tax countries (US, CA) force level-1 selection, so bump the mode to
  // "fullRegion" unless the caller explicitly asked for region-only collection.
  const effectiveMode = hasRegionalTax(state.country) && mode !== 'region' ? 'fullRegion' : mode;

  return (
    <View style={[defaultStyles.root, style]}>
      {!renderFields && businessCheckboxNode}

      <AddressInput
        ref={ref}
        value={addressValue}
        onChange={state.handleAddressChange}
        onValidationChange={onValidationChange}
        mode={effectiveMode}
        validationMode={validationMode}
        inline={true}
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

      {!renderFields && state.showTaxFields ? (
        <>
          {noTaxIdentifierNode}
          {taxIdNode}
        </>
      ) : null}
    </View>
  );
};

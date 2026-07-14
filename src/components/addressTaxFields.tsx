import type { ReactNode } from 'react';
import { View } from 'react-native';
import { renderDefaultContainer, renderDefaultInput } from './addressInputFields';
import { Checkbox } from './Checkbox';
import { defaultStyles } from './styles';
import type { RenderCheckboxProps, RenderContainerProps, RenderFieldEntry, RenderInputProps } from './types';

// Render helpers + node builder for AddressTaxInput, kept out of the component
// so its body stays a thin layer under the cognitive-complexity budget. Each
// helper falls back to the shared default renderer when no custom prop is given.

const BUSINESS_ACCOUNT_LABEL = 'Business account';
const TAX_INPUT_ID = 'rav-taxId';

function renderCheckboxEl(custom: ((props: RenderCheckboxProps) => ReactNode) | undefined, props: RenderCheckboxProps) {
  return custom ? custom(props) : <Checkbox {...props} />;
}

function renderInputEl(custom: ((props: RenderInputProps) => ReactNode) | undefined, props: RenderInputProps) {
  return custom ? custom(props) : renderDefaultInput(props);
}

function renderContainerEl(custom: ((props: RenderContainerProps) => ReactNode) | undefined, props: RenderContainerProps) {
  return custom ? custom(props) : renderDefaultContainer(props);
}

type BuildTaxNodesOptions = {
  taxType: string;
  isBusiness: boolean;
  hasTaxIdentifier: boolean;
  showTaxFields: boolean;
  disabled: boolean;
  taxRequired: boolean;
  businessTaxNumberLabel: string;
  taxId: string;
  taxExample: string | undefined;
  taxError: string | undefined;
  taxInvalid: boolean;
  handleBusinessChange: (val: boolean) => void;
  handleHasTaxIdentifierChange: (checked: boolean) => void;
  handleTaxChange: (text: string) => void;
  handleTaxBlur: () => void;
  renderCheckbox?: (props: RenderCheckboxProps) => ReactNode;
  renderInput?: (props: RenderInputProps) => ReactNode;
  renderContainer?: (props: RenderContainerProps) => ReactNode;
};

// The rendered tax-specific nodes plus the entries that bracket the address
// fields (before: business checkbox; after: no-tax-id checkbox, tax-id input).
type TaxNodes = {
  businessCheckboxNode: ReactNode;
  noTaxIdentifierNode: ReactNode;
  taxIdNode: ReactNode;
  beforeEntries: RenderFieldEntry[];
  afterEntries: RenderFieldEntry[];
};

function buildTaxNodes(opts: BuildTaxNodesOptions): TaxNodes {
  const businessCheckboxNode =
    opts.taxType === 'either' ? (
      <View style={defaultStyles.field}>
        {renderCheckboxEl(opts.renderCheckbox, {
          checked: opts.isBusiness,
          onValueChange: opts.handleBusinessChange,
          disabled: opts.disabled,
          label: BUSINESS_ACCOUNT_LABEL,
        })}
      </View>
    ) : null;

  const noTaxIdentifierNode = opts.showTaxFields ? (
    <View style={defaultStyles.field}>
      {renderCheckboxEl(opts.renderCheckbox, {
        checked: !opts.hasTaxIdentifier,
        onValueChange: opts.handleHasTaxIdentifierChange,
        disabled: opts.disabled,
        label: `I don't have a ${opts.businessTaxNumberLabel}`,
      })}
    </View>
  ) : null;

  const taxIdNode =
    opts.showTaxFields && opts.hasTaxIdentifier
      ? renderContainerEl(opts.renderContainer, {
          id: TAX_INPUT_ID,
          fieldKey: 'taxId',
          label: opts.businessTaxNumberLabel,
          required: opts.taxRequired,
          error: opts.taxError,
          children: renderInputEl(opts.renderInput, {
            id: TAX_INPUT_ID,
            value: opts.taxId,
            onChangeText: opts.handleTaxChange,
            onBlur: opts.handleTaxBlur,
            placeholder: opts.taxExample,
            disabled: opts.disabled,
            required: opts.taxRequired,
            invalid: opts.taxInvalid,
            accessibilityLabel: opts.businessTaxNumberLabel,
          }),
        })
      : null;

  const beforeEntries: RenderFieldEntry[] = businessCheckboxNode ? [{ type: 'business', node: businessCheckboxNode }] : [];
  const afterEntries: RenderFieldEntry[] = [];
  if (noTaxIdentifierNode) afterEntries.push({ type: 'noTaxIdentifier', node: noTaxIdentifierNode });
  if (taxIdNode) afterEntries.push({ type: 'taxId', node: taxIdNode });

  return { businessCheckboxNode, noTaxIdentifierNode, taxIdNode, beforeEntries, afterEntries };
}

export type { BuildTaxNodesOptions, TaxNodes };
export { buildTaxNodes };

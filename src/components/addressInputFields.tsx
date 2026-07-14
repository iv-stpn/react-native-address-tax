import type { AddressCollectionMode, AddressValue } from 'country-data-ts/address';
import { ALL_COUNTRY_OPTIONS, getCountryConfig, resolveAddressField } from 'country-data-ts/address';
import { Fragment, type ReactNode } from 'react';
import { type StyleProp, Text, TextInput, type TextStyle, View } from 'react-native';
import { computeEffectiveFields } from '../validation';
import { Select } from './Select';
import { defaultStyles } from './styles';
import type { AddressInputStyles, RenderContainerProps, RenderFieldEntry, RenderInputProps, RenderSelectProps } from './types';

// The " *" suffix appended to required-field labels, hoisted out of JSX.
const REQUIRED_MARKER = ' *';

const EMPTY_VALUE: AddressValue = {
  line1: '',
  line2: '',
  city: '',
  level1: '',
  postalCode: '',
  country: '',
};

// Default text-input renderer, used when no `renderInput` prop is supplied.
// A plain render function (not a component) so this module exports only helpers.
function renderDefaultInput(props: RenderInputProps): ReactNode {
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

// Default field container (label + control + error), used when no
// `renderContainer` prop is supplied. Carries the per-slot label/error style
// overrides that the container closure previously read from `styles`.
type DefaultFieldContainerProps = RenderContainerProps & {
  labelStyle?: StyleProp<TextStyle>;
  errorStyle?: StyleProp<TextStyle>;
};

function renderDefaultContainer(props: DefaultFieldContainerProps): ReactNode {
  return (
    <View style={[defaultStyles.field, props.style]}>
      <Text nativeID={`${props.id}-label`} style={[defaultStyles.label, props.labelStyle]}>
        {props.label}
        {props.required ? <Text style={defaultStyles.required}>{REQUIRED_MARKER}</Text> : null}
      </Text>
      {props.children}
      {props.error ? (
        <Text testID={`${props.id}-error`} role="alert" style={[defaultStyles.error, props.errorStyle]}>
          {props.error}
        </Text>
      ) : null}
    </View>
  );
}

// Everything the field-list builder needs from the component's render scope.
// Bundled into one object so the builder stays a single-parameter function.
type BuildFieldsOptions = {
  currentValue: AddressValue;
  mode: AddressCollectionMode;
  disabled: boolean;
  countryAtBottom: boolean;
  styles?: Partial<AddressInputStyles>;
  countryPlaceholder: string;
  level1AdministrativePlaceholder: (label: string) => string;
  getError: (field: string) => string | undefined;
  handleField: (field: keyof AddressValue) => (text: string) => void;
  handleBlur: (field: string) => void;
  renderInput?: (props: RenderInputProps) => ReactNode;
  renderCountrySelect?: (props: RenderSelectProps) => ReactNode;
  renderLevel1AdministrativeSelect?: (props: RenderSelectProps) => ReactNode;
  renderContainer?: (props: RenderContainerProps) => ReactNode;
};

// Builds the ordered list of rendered field entries. Pulled out of the
// component so the component body stays small; every per-render value it needs
// arrives via `opts`.
function buildFieldEntries(opts: BuildFieldsOptions): RenderFieldEntry[] {
  const { currentValue, mode, disabled, styles } = opts;

  const renderInputEl = (props: RenderInputProps) => (opts.renderInput ? opts.renderInput(props) : renderDefaultInput(props));
  const renderSelectEl = (custom: ((props: RenderSelectProps) => ReactNode) | undefined, props: RenderSelectProps) =>
    custom ? custom(props) : <Select {...props} />;
  const renderContainerEl = (props: RenderContainerProps) =>
    opts.renderContainer
      ? opts.renderContainer(props)
      : renderDefaultContainer({ ...props, labelStyle: styles?.label, errorStyle: styles?.error });

  const countryId = 'rav-country';
  const countryError = opts.getError('country');
  const countrySelector = renderContainerEl({
    id: countryId,
    fieldKey: 'country',
    label: 'Country',
    required: true,
    error: countryError,
    style: styles?.field,
    children: renderSelectEl(opts.renderCountrySelect, {
      id: countryId,
      value: currentValue.country,
      onValueChange: opts.handleField('country'),
      onBlur: () => opts.handleBlur('country'),
      disabled,
      required: true,
      invalid: countryError !== undefined,
      accessibilityLabel: 'Country',
      style: styles?.select,
      options: ALL_COUNTRY_OPTIONS.map((c) => ({ value: c.code, label: c.name })),
      placeholder: opts.countryPlaceholder,
    }),
  });

  const entries: RenderFieldEntry[] = [];
  if (!opts.countryAtBottom) entries.push({ type: 'country', node: countrySelector });

  if (getCountryConfig(currentValue.country)) {
    for (const fieldKey of computeEffectiveFields(mode, currentValue.country)) {
      const fieldCfg = resolveAddressField(currentValue.country, fieldKey, mode);
      const error = opts.getError(fieldKey);
      const inputId = `rav-${fieldKey}`;
      const currentFieldValue = currentValue[fieldKey] ?? '';

      const inputElement = fieldCfg.options
        ? renderSelectEl(opts.renderLevel1AdministrativeSelect, {
            id: inputId,
            value: currentFieldValue,
            onValueChange: opts.handleField(fieldKey),
            onBlur: () => opts.handleBlur(fieldKey),
            disabled,
            required: fieldCfg.required,
            invalid: error !== undefined,
            accessibilityLabel: fieldCfg.label,
            style: styles?.select,
            options: fieldCfg.options,
            placeholder: opts.level1AdministrativePlaceholder(fieldCfg.label),
          })
        : renderInputEl({
            id: inputId,
            value: currentFieldValue,
            onChangeText: opts.handleField(fieldKey),
            onBlur: () => opts.handleBlur(fieldKey),
            placeholder: fieldCfg.placeholder,
            disabled,
            required: fieldCfg.required,
            invalid: error !== undefined,
            accessibilityLabel: fieldCfg.label,
            style: styles?.input,
          });

      entries.push({
        type: fieldKey,
        node: (
          <Fragment key={fieldKey}>
            {renderContainerEl({
              id: inputId,
              fieldKey,
              label: fieldCfg.label,
              required: fieldCfg.required,
              error,
              style: styles?.field,
              children: inputElement,
            })}
          </Fragment>
        ),
      });
    }
  }

  if (opts.countryAtBottom) entries.push({ type: 'country', node: countrySelector });
  return entries;
}

export type { BuildFieldsOptions, DefaultFieldContainerProps };
export { buildFieldEntries, EMPTY_VALUE, renderDefaultContainer, renderDefaultInput };

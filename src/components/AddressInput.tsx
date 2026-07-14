import type { AddressCollectionMode, AddressValue, ValidationMode } from 'country-data-ts/address';
import { Fragment, type ReactNode, useCallback, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import type { ValidationError, ValidationResult } from '../validation';
import { computeEffectiveFields, validateAddress } from '../validation';
import { buildFieldEntries, EMPTY_VALUE } from './addressInputFields';
import { useReactiveEffect } from './hooks';
import { defaultStyles } from './styles';
import type { AddressInputStyles, RenderContainerProps, RenderFieldEntry, RenderInputProps, RenderSelectProps } from './types';

/** Imperative handle exposed via ref, primarily for the "onSubmit" validation mode. */
export type AddressInputHandle = {
  /**
   * Marks every collected field as touched (revealing any pending errors) and
   * returns the current validation result. Call this from a form's submit
   * handler when using `validationMode="onSubmit"`.
   */
  validate: () => ValidationResult;
};

export type AddressInputProps = {
  value: AddressValue;
  onChange: (value: AddressValue) => void;
  onValidationChange?: (valid: boolean, errors: ValidationError[]) => void;
  /** Controls which fields are shown. Defaults to "full". */
  mode?: AddressCollectionMode;
  /**
   * Controls when field-level validation errors become visible. Defaults to
   * "onType". With "onSubmit", errors stay hidden until `validate()` is called
   * via the component's ref. `onValidationChange` always fires regardless.
   */
  validationMode?: ValidationMode;
  /**
   * When true, the fields are rendered directly (in a Fragment) instead of being
   * wrapped in a root `View`. Use this when embedding AddressInput inside another
   * component that already provides the root wrapper. `style`/`styles.root` are
   * ignored in this mode.
   */
  inline?: boolean;
  /** Pre-selects a country and moves the country selector to the bottom of the form. */
  defaultCountry?: string;
  /** Pre-selects a state/region. */
  defaultRegion?: string;
  /** Placeholder shown in the country selector when nothing is selected. Defaults to "Select country". */
  countryPlaceholder?: string;
  /**
   * Placeholder shown in the level-1 (state/province/region) administrative
   * selector, as a function of the field's label.
   * Defaults to `(label) => \`Select ${label}\``.
   */
  level1AdministrativePlaceholder?: (label: string) => string;
  disabled?: boolean;
  /** Style applied to the root View (ignored when `inline`). */
  style?: AddressInputStyles['root'];
  /** Per-slot style overrides for the default-rendered fields. */
  styles?: Partial<AddressInputStyles>;
  renderInput?: (props: RenderInputProps) => ReactNode;
  /** Custom renderer for the country selector. */
  renderCountrySelect?: (props: RenderSelectProps) => ReactNode;
  /** Custom renderer for the level-1 (state/province/region) administrative selector. */
  renderLevel1AdministrativeSelect?: (props: RenderSelectProps) => ReactNode;
  renderContainer?: (props: RenderContainerProps) => ReactNode;
  /**
   * Custom layout for the fields. Receives the list of rendered field nodes
   * (each tagged with its `type`) in display order, and returns the node to
   * render in place of the default column layout.
   */
  renderFields?: (fields: RenderFieldEntry[]) => ReactNode;
  ref?: React.Ref<AddressInputHandle>;
};

export const AddressInput = function AddressInput(props: AddressInputProps) {
  const { value, onChange, onValidationChange, mode = 'full', validationMode = 'onType', inline = false } = props;
  const { disabled = false, style, styles, defaultCountry, defaultRegion, renderFields, ref } = props;
  const { countryPlaceholder = 'Select country', level1AdministrativePlaceholder = (label) => `Select ${label}` } = props;
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const currentValue: AddressValue = {
    ...EMPTY_VALUE,
    ...value,
    country: value.country || defaultCountry || '',
    level1: value.level1 || defaultRegion || '',
  };
  const countryAtBottom = Boolean(defaultCountry);

  const runValidation = useCallback(
    (val: AddressValue): ValidationResult => {
      // Only the fields actually collected for this mode/country gate validity,
      // so minimal/region modes report valid as soon as the country (and region
      // when required) are provided — even though the country's full field set
      // would otherwise be required.
      const result = validateAddress(val, mode);
      setErrors(result.errors);
      onValidationChange?.(result.valid, result.errors);
      return result;
    },
    [onValidationChange, mode],
  );

  // Re-validate (and notify the parent) whenever the selected country changes.
  useReactiveEffect(() => {
    runValidation(currentValue);
  }, [currentValue.country]);

  // Keep a closure over the latest render values so the imperative `validate()`
  // handle (used for "onSubmit") always sees the current value without making
  // the handle depend on objects that change every render.
  const validateRef = useRef<() => ValidationResult>(() => ({ valid: true, errors: [] }));
  validateRef.current = () => {
    const result = runValidation(currentValue);
    // Reveal every error by marking all collected fields (plus country) touched.
    const allFields = ['country', ...computeEffectiveFields(mode, currentValue.country)];
    setTouched((t) => ({ ...t, ...Object.fromEntries(allFields.map((f) => [f, true])) }));
    return result;
  };
  useImperativeHandle(ref, () => ({ validate: () => validateRef.current() }), []);

  const handleField = (field: keyof AddressValue) => (text: string) => {
    const next: AddressValue = { ...currentValue, [field]: text };
    if (field === 'country') {
      next.level1 = '';
      next.postalCode = '';
    }
    onChange(next);
    // "onType" reveals errors as the user edits; "onBlur"/"onSubmit" wait.
    if (validationMode === 'onType') setTouched((t) => ({ ...t, [field]: true }));
    runValidation(next);
  };

  const handleBlur = (field: string) => {
    // Blur reveals a field's error in every mode except "onSubmit", where
    // errors stay hidden until validate() is called.
    if (validationMode !== 'onSubmit') setTouched((t) => ({ ...t, [field]: true }));
  };

  const getError = (field: string): string | undefined =>
    touched[field] ? errors.find((e) => e.field === field)?.message : undefined;

  const fieldEntries = buildFieldEntries({
    currentValue,
    mode,
    disabled,
    countryAtBottom,
    styles,
    countryPlaceholder,
    level1AdministrativePlaceholder,
    getError,
    handleField,
    handleBlur,
    renderInput: props.renderInput,
    renderCountrySelect: props.renderCountrySelect,
    renderLevel1AdministrativeSelect: props.renderLevel1AdministrativeSelect,
    renderContainer: props.renderContainer,
  });

  const body = renderFields
    ? renderFields(fieldEntries)
    : fieldEntries.map((entry) => <Fragment key={entry.type}>{entry.node}</Fragment>);

  if (inline) return <>{body}</>;
  return <View style={[defaultStyles.root, style ?? styles?.root]}>{body}</View>;
};

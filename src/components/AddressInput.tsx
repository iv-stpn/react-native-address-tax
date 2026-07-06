import { Fragment, forwardRef, type ReactNode, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { type StyleProp, Text, TextInput, type TextStyle, View } from "react-native";
import type { AddressCollectionMode, AddressValue, ValidationMode } from "../utils/address";
import { ALL_COUNTRY_OPTIONS, getCountryConfig, resolveAddressField } from "../utils/address";
import type { ValidationError, ValidationResult } from "../utils/validation";
import { computeEffectiveFields, validateAddress } from "../utils/validation";
import { Select } from "./Select";
import { defaultStyles } from "./styles";
import type { AddressInputStyles, RenderContainerProps, RenderFieldEntry, RenderInputProps, RenderSelectProps } from "./types";

/** Imperative handle exposed via ref, primarily for the "onSubmit" validation mode. */
export interface AddressInputHandle {
  /**
   * Marks every collected field as touched (revealing any pending errors) and
   * returns the current validation result. Call this from a form's submit
   * handler when using `validationMode="onSubmit"`.
   */
  validate: () => ValidationResult;
}

export interface AddressInputProps {
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
  style?: AddressInputStyles["root"];
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
}

const EMPTY_VALUE: AddressValue = {
  line1: "",
  line2: "",
  city: "",
  level1: "",
  postalCode: "",
  country: "",
};

export const AddressInput = forwardRef<AddressInputHandle, AddressInputProps>(function AddressInput(
  {
    value,
    onChange,
    onValidationChange,
    mode = "full",
    validationMode = "onType",
    inline = false,
    disabled = false,
    style,
    styles,
    defaultCountry,
    defaultRegion,
    countryPlaceholder = "Select country",
    level1AdministrativePlaceholder = (label) => `Select ${label}`,
    renderInput,
    renderCountrySelect,
    renderLevel1AdministrativeSelect,
    renderContainer,
    renderFields,
  }: AddressInputProps,
  ref,
) {
  const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
  const [errors, setErrors] = useState<ValidationError[]>([]);

  const effectiveCountry = value.country || defaultCountry || "";
  const effectiveLevel1 = value.level1 || defaultRegion || "";
  const currentValue = {
    ...EMPTY_VALUE,
    ...value,
    country: effectiveCountry,
    level1: effectiveLevel1,
  };
  const countryConfig = getCountryConfig(currentValue.country);
  const countryAtBottom = !!defaultCountry;

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

  // biome-ignore lint/correctness/useExhaustiveDependencies: only re-run on country change
  useEffect(() => {
    runValidation(currentValue);
  }, [currentValue.country]);

  // Keep a closure over the latest render values so the imperative `validate()`
  // handle (used for "onSubmit") always sees the current value without making
  // the handle depend on objects that change every render.
  const validateRef = useRef<() => ValidationResult>(() => ({ valid: true, errors: [] }));
  validateRef.current = () => {
    const result = runValidation(currentValue);
    // Reveal every error by marking all collected fields (plus country) touched.
    const allFields = ["country", ...computeEffectiveFields(mode, currentValue.country)];
    setTouched((t) => ({ ...t, ...Object.fromEntries(allFields.map((f) => [f, true])) }));
    return result;
  };
  useImperativeHandle(ref, () => ({ validate: () => validateRef.current() }), []);

  function handleField(field: keyof AddressValue) {
    return (text: string) => {
      const next: AddressValue = { ...currentValue, [field]: text };
      if (field === "country") {
        next.level1 = "";
        next.postalCode = "";
      }
      onChange(next);
      // "onType" reveals errors as the user edits; "onBlur"/"onSubmit" wait.
      if (validationMode === "onType") setTouched((t) => ({ ...t, [field]: true }));
      runValidation(next);
    };
  }

  function handleBlur(field: string) {
    // Blur reveals a field's error in every mode except "onSubmit", where
    // errors stay hidden until validate() is called.
    if (validationMode === "onSubmit") return;
    setTouched((t) => ({ ...t, [field]: true }));
  }

  function getError(field: string): string | undefined {
    if (!touched[field]) return undefined;
    return errors.find((e) => e.field === field)?.message;
  }

  const effectiveFieldOrder = computeEffectiveFields(mode, currentValue.country);

  // --- Default render helpers ---

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

  function renderCountrySelectEl(props: RenderSelectProps) {
    if (renderCountrySelect) return renderCountrySelect(props);
    return <Select {...props} />;
  }

  function renderLevel1AdministrativeSelectEl(props: RenderSelectProps) {
    if (renderLevel1AdministrativeSelect) return renderLevel1AdministrativeSelect(props);
    return <Select {...props} />;
  }

  function renderContainerEl(containerProps: RenderContainerProps) {
    if (renderContainer) return renderContainer(containerProps);
    return (
      <View style={[defaultStyles.field, containerProps.style]}>
        <Text nativeID={`${containerProps.id}-label`} style={[defaultStyles.label, styles?.label]}>
          {containerProps.label}
          {containerProps.required ? <Text style={defaultStyles.required}> *</Text> : null}
        </Text>
        {containerProps.children}
        {containerProps.error ? (
          <Text testID={`${containerProps.id}-error`} role="alert" style={[defaultStyles.error, styles?.error]}>
            {containerProps.error}
          </Text>
        ) : null}
      </View>
    );
  }

  // --- Country selector ---

  const countryId = "rav-country";
  const countryError = getError("country");

  const countrySelector = renderContainerEl({
    id: countryId,
    fieldKey: "country",
    label: "Country",
    required: true,
    error: countryError,
    style: styles?.field,
    children: renderCountrySelectEl({
      id: countryId,
      value: currentValue.country,
      onValueChange: handleField("country"),
      onBlur: () => handleBlur("country"),
      disabled,
      required: true,
      invalid: countryError !== undefined,
      accessibilityLabel: "Country",
      style: styles?.select,
      options: ALL_COUNTRY_OPTIONS.map((c) => ({ value: c.code, label: c.name })),
      placeholder: countryPlaceholder,
    }),
  });

  const fieldEntries: RenderFieldEntry[] = [];

  if (!countryAtBottom) fieldEntries.push({ type: "country", node: countrySelector });

  if (countryConfig) {
    for (const fieldKey of effectiveFieldOrder) {
      const fieldCfg = resolveAddressField(currentValue.country, fieldKey, mode);
      const error = getError(fieldKey);
      const inputId = `rav-${fieldKey}`;
      const currentFieldValue = (currentValue[fieldKey as keyof AddressValue] as string | undefined) ?? "";

      const inputElement = fieldCfg.options
        ? renderLevel1AdministrativeSelectEl({
            id: inputId,
            value: currentFieldValue,
            onValueChange: handleField(fieldKey),
            onBlur: () => handleBlur(fieldKey),
            disabled,
            required: fieldCfg.required,
            invalid: error !== undefined,
            accessibilityLabel: fieldCfg.label,
            style: styles?.select,
            options: fieldCfg.options,
            placeholder: level1AdministrativePlaceholder(fieldCfg.label),
          })
        : renderInputEl({
            id: inputId,
            value: currentFieldValue,
            onChangeText: handleField(fieldKey),
            onBlur: () => handleBlur(fieldKey),
            placeholder: fieldCfg.placeholder,
            disabled,
            required: fieldCfg.required,
            invalid: error !== undefined,
            accessibilityLabel: fieldCfg.label,
            style: styles?.input,
          });

      fieldEntries.push({
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

  if (countryAtBottom) fieldEntries.push({ type: "country", node: countrySelector });

  const body = renderFields ? (
    renderFields(fieldEntries)
  ) : (
    <>
      {fieldEntries.map((entry) => (
        <Fragment key={entry.type}>{entry.node}</Fragment>
      ))}
    </>
  );

  if (inline) return <>{body}</>;

  return <View style={[defaultStyles.root, style ?? styles?.root]}>{body}</View>;
});

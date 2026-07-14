import type { AddressCollectionMode, AddressValue, ValidationMode } from 'country-data-ts/address';
import { computeTaxOutcome, type TaxType, type TaxValue } from 'country-data-ts/tax';
import { useCallback, useRef, useState } from 'react';
import { Pressable, TextInput as RNTextInput, Text, View } from 'react-native';
import { AddressInput, type AddressInputHandle } from '../src/components/AddressInput';
import { AddressTaxInput } from '../src/components/AddressTaxInput';
import type { RenderContainerProps, RenderInputProps } from '../src/components/types';
import type { ValidationError } from '../src/validation';
import { Json, RadioGroup, Toggle, ValidationStatus } from './controls';
import { custom, s } from './styles';
import { TaxPanel } from './TaxPanel';

// The three interactive showcases (plain AddressInput, AddressTaxInput, and a
// fully custom-rendered AddressInput). Each is remounted via a `key={country}`
// in App when the country picker changes, so initial state derives from the
// country prop — no set-state-during-render reset needed.

const FLAGS_LABEL = 'flags';
const VALIDATE_LABEL = 'Validate';
const ADDRESS_VALUE_LABEL = 'Address value';
const TAX_TO_COLLECT_LABEL = 'Tax to collect';
const TAX_VALUE_LABEL = 'Tax value';
const REQUIRED_MARKER = ' *';

const MODES: readonly AddressCollectionMode[] = ['minimal', 'regionMinimal', 'region', 'full', 'fullRegion'];
const VALIDATION_MODES: readonly ValidationMode[] = ['onType', 'onBlur', 'onSubmit'];

const emptyAddress = (country: string): AddressValue => ({
  line1: '',
  line2: '',
  city: '',
  level1: '',
  postalCode: '',
  country,
});

type Validity = { valid: boolean; errors: ValidationError[] };
const INITIAL_VALIDITY: Validity = { valid: true, errors: [] };

type CountryProps = { country: string };
type AddressTaxWrapperProps = { country: string; taxType: TaxType };

// Custom render props for CustomStyledWrapper, hoisted to module scope so they
// are stable references (not arrows recreated each render) and don't shadow the
// wrapper's own `value` state.
function renderCustomContainer(props: RenderContainerProps) {
  return (
    <View key={props.id} style={custom.field}>
      <Text nativeID={`${props.id}-label`} style={custom.label}>
        {props.label}
        {props.required ? REQUIRED_MARKER : ''}
      </Text>
      {props.children}
      {props.error ? (
        <Text testID={`${props.id}-error`} role="alert" style={custom.error}>
          {props.error}
        </Text>
      ) : null}
    </View>
  );
}

function renderCustomInput(props: RenderInputProps) {
  return (
    <RNTextInput
      testID={props.id}
      aria-label={props.accessibilityLabel}
      style={[custom.input, props.invalid && custom.inputInvalid]}
      value={props.value}
      onChangeText={props.onChangeText}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      placeholderTextColor="#5eead4"
    />
  );
}

function AddressWrapper({ country }: CountryProps) {
  const [value, setValue] = useState<AddressValue>(emptyAddress(country));
  const [mode, setMode] = useState<AddressCollectionMode>('full');
  const [validationMode, setValidationMode] = useState<ValidationMode>('onType');
  const [disabled, setDisabled] = useState(false);
  const [validity, setValidity] = useState<Validity>(INITIAL_VALIDITY);
  const inputRef = useRef<AddressInputHandle>(null);

  const onValidationChange = useCallback((valid: boolean, errors: ValidationError[]) => setValidity({ valid, errors }), []);
  const validate = useCallback(() => inputRef.current?.validate(), []);

  return (
    <View style={s.wrapper}>
      <View style={s.controls}>
        <RadioGroup legend="mode" value={mode} options={MODES} onChange={setMode} />
        <RadioGroup legend="validationMode" value={validationMode} options={VALIDATION_MODES} onChange={setValidationMode} />
        <View style={s.controlGroup}>
          <Text style={s.legend}>{FLAGS_LABEL}</Text>
          <Toggle label="disabled" checked={disabled} onChange={setDisabled} />
          {validationMode === 'onSubmit' ? (
            <Pressable style={s.btn} onPress={validate}>
              <Text style={s.btnText}>{VALIDATE_LABEL}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={s.card}>
        <AddressInput
          ref={inputRef}
          value={value}
          onChange={setValue}
          mode={mode}
          validationMode={validationMode}
          disabled={disabled}
          defaultCountry={country || undefined}
          onValidationChange={onValidationChange}
        />
      </View>
      <ValidationStatus valid={validity.valid} errors={validity.errors} />
      <Text style={s.sectionLabel}>{ADDRESS_VALUE_LABEL}</Text>
      <Json value={value} />
    </View>
  );
}

function resolveIsBusiness(taxType: TaxType, isBusiness: boolean): boolean {
  if (taxType === 'business') return true;
  if (taxType === 'individual') return false;
  return isBusiness;
}

function AddressTaxWrapper({ country, taxType }: AddressTaxWrapperProps) {
  const [addressValue, setAddressValue] = useState<AddressValue>(emptyAddress(country));
  const [taxValue, setTaxValue] = useState<TaxValue>({});
  const [isBusiness, setIsBusiness] = useState(false);
  const [hasNexus, setHasNexus] = useState(true);
  const [mode, setMode] = useState<AddressCollectionMode>('full');
  const [validationMode, setValidationMode] = useState<ValidationMode>('onType');
  const [taxRequired, setTaxRequired] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [validity, setValidity] = useState<Validity>(INITIAL_VALIDITY);
  const inputRef = useRef<AddressInputHandle>(null);

  const onValidationChange = useCallback((valid: boolean, errors: ValidationError[]) => setValidity({ valid, errors }), []);
  const validate = useCallback(() => inputRef.current?.validate(), []);

  const effectiveIsBusiness = resolveIsBusiness(taxType, isBusiness);
  const hasTaxId = taxValue.hasIdentifier ?? true;
  const nexusList = hasNexus ? undefined : [];
  const hasCountry = Boolean(addressValue.country || country);
  const noNexus = !hasNexus && hasCountry;

  const outcome = computeTaxOutcome({
    country: addressValue.country || country,
    isBusiness: effectiveIsBusiness,
    hasTaxId,
    hasNexus,
    state: addressValue.level1,
  });

  return (
    <View style={s.wrapper}>
      <View style={s.controls}>
        <RadioGroup legend="mode" value={mode} options={MODES} onChange={setMode} />
        <RadioGroup legend="validationMode" value={validationMode} options={VALIDATION_MODES} onChange={setValidationMode} />
        <View style={s.controlGroup}>
          <Text style={s.legend}>{FLAGS_LABEL}</Text>
          <Toggle label="taxRequired" checked={taxRequired} onChange={setTaxRequired} />
          <Toggle label="has nexus in country" checked={hasNexus} onChange={setHasNexus} />
          <Toggle label="disabled" checked={disabled} onChange={setDisabled} />
          {validationMode === 'onSubmit' ? (
            <Pressable style={s.btn} onPress={validate}>
              <Text style={s.btnText}>{VALIDATE_LABEL}</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={s.card}>
        <AddressTaxInput
          ref={inputRef}
          addressValue={addressValue}
          taxType={taxType}
          isBusiness={taxType === 'either' ? isBusiness : undefined}
          nexusList={nexusList}
          mode={mode}
          validationMode={validationMode}
          taxRequired={taxRequired}
          disabled={disabled}
          defaultCountry={country || undefined}
          onAddressChange={setAddressValue}
          onTaxChange={setTaxValue}
          onBusinessChange={taxType === 'either' ? setIsBusiness : undefined}
          onValidationChange={onValidationChange}
        />
      </View>
      <ValidationStatus valid={validity.valid} errors={validity.errors} />
      <Text style={s.sectionLabel}>{TAX_TO_COLLECT_LABEL}</Text>
      <TaxPanel outcome={outcome} state={addressValue.level1} noNexus={noNexus} />
      <Text style={s.sectionLabel}>{ADDRESS_VALUE_LABEL}</Text>
      <Json value={addressValue} />
      <Text style={s.sectionLabel}>{TAX_VALUE_LABEL}</Text>
      <Json value={{ ...taxValue, baseTax: outcome.baseTax, effectiveTax: outcome.effectiveTax }} />
    </View>
  );
}

function CustomStyledWrapper({ country }: CountryProps) {
  const [value, setValue] = useState<AddressValue>(emptyAddress(country));
  return (
    <View style={s.card}>
      <AddressInput
        value={value}
        onChange={setValue}
        mode="fullRegion"
        defaultCountry={country || undefined}
        style={custom.root}
        renderContainer={renderCustomContainer}
        renderInput={renderCustomInput}
      />
    </View>
  );
}

export { AddressTaxWrapper, AddressWrapper, CustomStyledWrapper };

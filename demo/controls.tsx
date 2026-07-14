import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { ValidationError } from '../src/validation';
import { s } from './styles';

// Demo control widgets, split out of App so each file stays small and every
// mapped/handler arrow is a stable per-component reference.

const CHECK_MARK = '✓';
const VALID_TEXT = '✓ valid';

type RadioOptionProps<T extends string> = {
  option: T;
  active: boolean;
  onSelect: (value: T) => void;
};

// One radio row. Extracted so its onPress is a stable reference instead of an
// arrow recreated inside RadioGroup's `.map`.
function RadioOption<T extends string>({ option, active, onSelect }: RadioOptionProps<T>) {
  const handlePress = useCallback(() => onSelect(option), [onSelect, option]);
  return (
    <Pressable style={s.option} onPress={handlePress}>
      <View style={[s.radioDot, active && s.radioDotOn]}>{active ? <View style={s.radioInner} /> : null}</View>
      <Text style={s.optionText}>{option}</Text>
    </Pressable>
  );
}

type RadioGroupProps<T extends string> = {
  legend: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
};

function RadioGroup<T extends string>({ legend, value, options, onChange }: RadioGroupProps<T>) {
  return (
    <View style={s.controlGroup}>
      <Text style={s.legend}>{legend}</Text>
      {options.map((opt) => (
        <RadioOption key={opt} option={opt} active={value === opt} onSelect={onChange} />
      ))}
    </View>
  );
}

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

function Toggle({ label, checked, onChange }: ToggleProps) {
  const handlePress = useCallback(() => onChange(!checked), [onChange, checked]);
  return (
    <Pressable style={s.option} onPress={handlePress}>
      <View style={[s.radioDot, s.radioSquare, checked && s.radioDotOn]}>
        {checked ? <Text style={s.toggleCheck}>{CHECK_MARK}</Text> : null}
      </View>
      <Text style={s.optionText}>{label}</Text>
    </Pressable>
  );
}

type ValidationStatusProps = {
  valid: boolean;
  errors: ValidationError[];
};

function ValidationStatus({ valid, errors }: ValidationStatusProps) {
  return (
    <View style={[s.status, valid ? s.statusValid : s.statusInvalid]}>
      <Text style={[s.statusText, valid ? s.statusTextValid : s.statusTextInvalid]}>
        {valid ? VALID_TEXT : `✗ invalid — ${errors.map((e) => e.field).join(', ')}`}
      </Text>
    </View>
  );
}

type JsonProps = {
  value: unknown;
};

function Json({ value }: JsonProps) {
  return (
    <View style={s.json}>
      <Text style={s.jsonText}>{JSON.stringify(value, null, 2)}</Text>
    </View>
  );
}

export { Json, RadioGroup, Toggle, ValidationStatus };

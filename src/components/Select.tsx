import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { defaultStyles } from './styles';
import type { RenderSelectProps } from './types';

// JSX glyphs/labels hoisted out of the tree.
const CARET = '▼';
const NO_MATCHES = 'No matches';
const DEFAULT_PLACEHOLDER = 'Select';

type SelectOption = { value: string; label: string };

// A single dropdown option. Extracted so its onPress is a stable per-row
// reference (via useCallback) instead of an arrow recreated inside a `.map`.
type OptionRowProps = {
  id: string;
  option: SelectOption;
  selected: boolean;
  onSelect: (value: string) => void;
};

function OptionRow({ id, option, selected, onSelect }: OptionRowProps) {
  const handlePress = useCallback(() => onSelect(option.value), [onSelect, option.value]);
  return (
    <Pressable
      testID={`${id}-option-${option.value}`}
      role="option"
      aria-selected={selected}
      onPress={handlePress}
      style={[defaultStyles.dropdownOption, selected && defaultStyles.dropdownOptionSelected]}
    >
      <Text style={[defaultStyles.dropdownOptionText, selected && defaultStyles.dropdownOptionTextSelected]}>{option.label}</Text>
    </Pressable>
  );
}

// Dependency-free dropdown, since React Native has no <select>. A Pressable
// trigger opens a Modal overlay with a search box and a scrollable option list.
// A ScrollView (not FlatList) renders every option up-front so tests and
// screen readers see the full list. The trigger carries `role="combobox"` and
// the accessibilityLabel/testID so Testing Library queries resolve the same way
// the web <select> did.
export function Select(props: RenderSelectProps) {
  const { id, value, onValueChange, onBlur, disabled, required, invalid, accessibilityLabel, style, options, placeholder } =
    props;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  const openDropdown = useCallback(() => {
    if (!disabled) setOpen(true);
  }, [disabled]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery('');
    onBlur?.();
  }, [onBlur]);

  const pick = useCallback(
    (next: string) => {
      onValueChange(next);
      close();
    },
    [onValueChange, close],
  );

  const swallowPress = useCallback(() => {
    // Absorb taps inside the panel so they don't reach the overlay's close handler.
  }, []);

  return (
    <View>
      <Pressable
        testID={id}
        nativeID={id}
        role="combobox"
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        aria-disabled={disabled}
        aria-required={required}
        aria-invalid={invalid}
        disabled={disabled}
        onPress={openDropdown}
        style={[defaultStyles.select, invalid && defaultStyles.selectInvalid, disabled && defaultStyles.selectDisabled, style]}
      >
        <Text numberOfLines={1} style={[defaultStyles.selectText, !selected && defaultStyles.selectPlaceholder]}>
          {selected ? selected.label : (placeholder ?? DEFAULT_PLACEHOLDER)}
        </Text>
        <Text style={defaultStyles.selectCaret}>{CARET}</Text>
      </Pressable>

      <Modal visible={open} transparent={true} animationType="none" onRequestClose={close}>
        <Pressable style={defaultStyles.dropdownOverlay} onPress={close}>
          {/* Stop propagation so taps inside the panel don't close it. */}
          <Pressable style={defaultStyles.dropdownPanel} onPress={swallowPress}>
            <TextInput
              testID={`${id}-search`}
              style={defaultStyles.dropdownSearch}
              placeholder="Search…"
              value={query}
              onChangeText={setQuery}
              autoFocus={true}
            />
            <ScrollView style={defaultStyles.dropdownList} keyboardShouldPersistTaps="handled">
              {filtered.length === 0 ? (
                <Text style={defaultStyles.dropdownEmpty}>{NO_MATCHES}</Text>
              ) : (
                filtered.map((opt) => (
                  <OptionRow key={opt.value} id={id} option={opt} selected={opt.value === value} onSelect={pick} />
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

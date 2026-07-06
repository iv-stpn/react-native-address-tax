import { useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { defaultStyles } from "./styles";
import type { RenderSelectProps } from "./types";

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
  const [query, setQuery] = useState("");

  const selected = options.find((o) => o.value === value);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query]);

  function close() {
    setOpen(false);
    setQuery("");
    onBlur?.();
  }

  function pick(next: string) {
    onValueChange(next);
    close();
  }

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
        onPress={() => !disabled && setOpen(true)}
        style={[defaultStyles.select, invalid && defaultStyles.selectInvalid, disabled && defaultStyles.selectDisabled, style]}
      >
        <Text numberOfLines={1} style={[defaultStyles.selectText, !selected && defaultStyles.selectPlaceholder]}>
          {selected ? selected.label : (placeholder ?? "Select")}
        </Text>
        <Text style={defaultStyles.selectCaret}>▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="none" onRequestClose={close}>
        <Pressable style={defaultStyles.dropdownOverlay} onPress={close}>
          {/* Stop propagation so taps inside the panel don't close it. */}
          <Pressable style={defaultStyles.dropdownPanel} onPress={() => {}}>
            <TextInput
              testID={`${id}-search`}
              style={defaultStyles.dropdownSearch}
              placeholder="Search…"
              value={query}
              onChangeText={setQuery}
              autoFocus
            />
            <ScrollView style={defaultStyles.dropdownList} keyboardShouldPersistTaps="handled">
              {filtered.length === 0 ? (
                <Text style={defaultStyles.dropdownEmpty}>No matches</Text>
              ) : (
                filtered.map((opt) => {
                  const isSelected = opt.value === value;
                  return (
                    <Pressable
                      key={opt.value}
                      testID={`${id}-option-${opt.value}`}
                      role="option"
                      aria-selected={isSelected}
                      onPress={() => pick(opt.value)}
                      style={[defaultStyles.dropdownOption, isSelected && defaultStyles.dropdownOptionSelected]}
                    >
                      <Text style={[defaultStyles.dropdownOptionText, isSelected && defaultStyles.dropdownOptionTextSelected]}>
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

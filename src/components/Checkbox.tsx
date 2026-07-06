import { Pressable, Text, View } from "react-native";
import { defaultStyles } from "./styles";
import type { RenderCheckboxProps } from "./types";

// Dependency-free checkbox: a Pressable box that shows a checkmark when on.
// Carries `role="checkbox"` + `aria-checked` and mirrors its label into
// `aria-label` so Testing Library's getByLabelText resolves it like the web
// <input type="checkbox"> did.
export function Checkbox(props: RenderCheckboxProps) {
  const { id, checked, onValueChange, disabled, label, style } = props;
  return (
    <Pressable
      testID={id}
      nativeID={id}
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      accessibilityLabel={label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={() => !disabled && onValueChange(!checked)}
      style={[defaultStyles.checkbox, style]}
    >
      <View style={[defaultStyles.checkboxBox, checked && defaultStyles.checkboxBoxChecked]}>
        {checked ? <Text style={defaultStyles.checkboxCheck}>✓</Text> : null}
      </View>
      <Text style={defaultStyles.checkboxLabel}>{label}</Text>
    </Pressable>
  );
}

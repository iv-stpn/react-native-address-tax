import type { ReactNode } from "react";
import type { StyleProp, TextStyle, ViewStyle } from "react-native";

// ---------------------------------------------------------------------------
// Shared render-prop types (used by both AddressInput and AddressTaxInput).
//
// These replace the web component's DOM-event/className surface with a
// React Native-idiomatic one: `onChangeText`/`onValueChange` instead of
// `ChangeEventHandler`, `style` (StyleProp) instead of `className`, and
// `invalid`/`accessibilityLabel` instead of `aria-*`/`id`.
// ---------------------------------------------------------------------------

/** Props passed to a custom text-input renderer. */
export interface RenderInputProps {
  /** Stable identifier, forwarded to the element's testID for querying. */
  id: string;
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  /** True when the field currently has a validation error. */
  invalid?: boolean;
  /** Accessible label, mapped to the field's rendered label. */
  accessibilityLabel?: string;
  style?: StyleProp<TextStyle>;
}

/** Props passed to a custom select (dropdown) renderer. */
export interface RenderSelectProps {
  id: string;
  value: string;
  onValueChange: (value: string) => void;
  onBlur?: () => void;
  disabled?: boolean;
  required?: boolean;
  invalid?: boolean;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  options: ReadonlyArray<{ value: string; label: string }>;
  /** Text shown when no value is selected. */
  placeholder?: string;
}

/** Props passed to a custom checkbox renderer. */
export interface RenderCheckboxProps {
  id?: string;
  checked: boolean;
  onValueChange: (checked: boolean) => void;
  disabled?: boolean;
  label: string;
  style?: StyleProp<ViewStyle>;
}

/** Props passed to a custom field-container renderer. */
export interface RenderContainerProps {
  /** Matches the input's id/testID, for associating the label. */
  id: string;
  fieldKey: string;
  label: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
}

/** A single rendered field, paired with its type, passed to `renderFields`. */
export interface RenderFieldEntry {
  /** The field's key: "country" or one of the address field keys (line1, line2, city, level1, postalCode). */
  type: string;
  node: ReactNode;
}

/** StyleProp slots for the default-rendered fields (RN equivalent of the old className map). */
export interface AddressInputStyles {
  root: StyleProp<ViewStyle>;
  row: StyleProp<ViewStyle>;
  field: StyleProp<ViewStyle>;
  label: StyleProp<TextStyle>;
  input: StyleProp<TextStyle>;
  select: StyleProp<ViewStyle>;
  error: StyleProp<TextStyle>;
}

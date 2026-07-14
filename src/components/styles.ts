import { StyleSheet } from 'react-native';

// Baked-in default styling. React Native has no cascading stylesheet, so the
// look the web version got from the `rav-*` CSS classes lives here instead.
// Consumers override per-slot via the `styles`/`style` props, or replace the
// element entirely with the render props.
export const defaultStyles = StyleSheet.create({
  root: {
    width: '100%',
    flexDirection: 'column',
    gap: 12,
  },
  field: {
    flexDirection: 'column',
    gap: 4,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
  },
  optionalHint: {
    fontWeight: '400',
    color: '#9ca3af',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0f172a',
  },
  inputInvalid: {
    borderColor: '#ef4444',
  },
  inputDisabled: {
    backgroundColor: '#f1f5f9',
    color: '#94a3b8',
  },
  select: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectInvalid: {
    borderColor: '#ef4444',
  },
  selectDisabled: {
    backgroundColor: '#f1f5f9',
  },
  selectText: {
    fontSize: 14,
    color: '#0f172a',
    flexShrink: 1,
  },
  selectPlaceholder: {
    color: '#94a3b8',
  },
  selectCaret: {
    fontSize: 10,
    color: '#64748b',
  },
  error: {
    fontSize: 12,
    color: '#ef4444',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxBox: {
    width: 18,
    height: 18,
    borderWidth: 1,
    borderColor: '#94a3b8',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
  },
  checkboxBoxChecked: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  checkboxCheck: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 14,
  },
  checkboxLabel: {
    fontSize: 13,
    color: '#374151',
  },
  // --- Dropdown overlay ---
  dropdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dropdownPanel: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '80%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  dropdownSearch: {
    borderBottomWidth: 1,
    borderColor: '#e2e8f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0f172a',
  },
  dropdownList: {
    flexGrow: 0,
  },
  dropdownOption: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
  },
  dropdownOptionSelected: {
    backgroundColor: '#eef2ff',
  },
  dropdownOptionText: {
    fontSize: 14,
    color: '#0f172a',
  },
  dropdownOptionTextSelected: {
    color: '#4f46e5',
    fontWeight: '600',
  },
  dropdownEmpty: {
    padding: 16,
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
  },
});

import type { AddressValue, ValidationMode } from 'country-data-ts/address';
import { type Ref, useState } from 'react';
import { AddressInput, type AddressInputHandle } from '../components/AddressInput';

export type HarnessProps = {
  initial: AddressValue;
  validationMode?: ValidationMode;
  inputRef?: Ref<AddressInputHandle>;
};

/** Stateful harness so typed values persist (a real controlled parent). */
export function Harness({ initial, validationMode, inputRef }: HarnessProps) {
  const [value, setValue] = useState(initial);
  return <AddressInput ref={inputRef} value={value} onChange={setValue} validationMode={validationMode} />;
}

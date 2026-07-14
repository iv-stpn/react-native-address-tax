import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AddressValue } from 'country-data-ts/address';
import { createRef } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { AddressInput, type AddressInputHandle } from '../components/AddressInput';
import { Harness } from './helpers';

const COUNTRY_RE = /country/i;
const ADDRESS_LINE_1_RE = /address line 1/i;
const CITY_RE = /city/i;
const STATE_RE = /state/i;
const STATE_OPTIONAL_RE = /state \(optional\)/i;
const ZIP_CODE_RE = /zip code/i;
const POSTAL_CODE_PLZ_RE = /postal code \(plz\)/i;
const PREFECTURE_RE = /prefecture/i;
const CALIFORNIA_RE = /california/i;
const FEDERATED_STATE_RE = /federated state/i;
const FEDERATED_STATE_OPTIONAL_RE = /federated state \(optional\)/i;

const noop = (): void => undefined;

const baseValue: AddressValue = {
  line1: '123 Main St',
  city: 'New York',
  level1: 'NY',
  postalCode: '10001',
  country: 'US',
};

/**
 * Open the country dropdown and pick an option by its visible name. The RN
 * Select has no `<select>` element, so selection is open-then-tap rather than
 * a `change` event.
 */
async function selectCountry(name: string | RegExp) {
  fireEvent.click(screen.getByLabelText(COUNTRY_RE));
  fireEvent.click(await screen.findByText(name));
}

describe('AddressInput rendering', () => {
  it('renders country selector', () => {
    render(<AddressInput value={baseValue} onChange={noop} />);
    expect(screen.getByLabelText(COUNTRY_RE)).toBeInTheDocument();
  });

  it('renders US address fields', () => {
    render(<AddressInput value={baseValue} onChange={noop} mode="fullRegion" />);
    expect(screen.getByLabelText(ADDRESS_LINE_1_RE)).toBeInTheDocument();
    expect(screen.getByLabelText(CITY_RE)).toBeInTheDocument();
    expect(screen.getByLabelText(STATE_RE)).toBeInTheDocument();
    expect(screen.getByLabelText(ZIP_CODE_RE)).toBeInTheDocument();
  });

  it('is disabled when disabled prop is set', () => {
    render(<AddressInput value={baseValue} onChange={noop} disabled={true} />);
    // RNW maps editable={false} to readOnly on the underlying inputs.
    for (const input of screen.getAllByRole('textbox')) expect(input).toHaveAttribute('readonly');
  });

  it('accepts custom styles per slot', () => {
    render(
      <AddressInput value={baseValue} onChange={noop} styles={{ error: { color: 'rgb(1, 2, 3)' } }} validationMode="onType" />,
    );
    // The custom style object is accepted without throwing and the tree renders.
    expect(screen.getByLabelText(COUNTRY_RE)).toBeInTheDocument();
  });
});

describe('AddressInput change and validation callbacks', () => {
  it('calls onChange when a field changes', () => {
    const onChange = vi.fn();
    render(<AddressInput value={baseValue} onChange={onChange} />);
    const input = screen.getByLabelText(ADDRESS_LINE_1_RE);
    fireEvent.change(input, { target: { value: '456 Elm St' } });
    expect(onChange).toHaveBeenCalled();
  });

  it('shows validation error on blur when field is empty', async () => {
    render(<AddressInput value={{ ...baseValue, line1: '' }} onChange={noop} />);
    const input = screen.getByLabelText(ADDRESS_LINE_1_RE);
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('calls onValidationChange with validity', () => {
    const onValidationChange = vi.fn();
    render(<AddressInput value={baseValue} onChange={noop} onValidationChange={onValidationChange} />);
    expect(onValidationChange).toHaveBeenCalledWith(true, []);
  });
});

describe('AddressInput country switching', () => {
  it('resets postal code and level1 on country change', async () => {
    const onChange = vi.fn<(value: AddressValue) => void>();
    render(<AddressInput value={baseValue} onChange={onChange} />);
    await selectCountry('Germany');
    const lastCall = onChange.mock.calls.at(-1)?.[0];
    expect(lastCall?.country).toBe('DE');
    expect(lastCall?.postalCode).toBe('');
    expect(lastCall?.level1).toBe('');
  });

  it('renders DE address fields after switching country', () => {
    const onChange = vi.fn();
    const { rerender } = render(<AddressInput value={baseValue} onChange={onChange} />);
    rerender(<AddressInput value={{ ...baseValue, country: 'DE', level1: '', postalCode: '' }} onChange={onChange} />);
    expect(screen.getByLabelText(POSTAL_CODE_PLZ_RE)).toBeInTheDocument();
  });
});

describe('AddressInput modes', () => {
  it('shows only state field in minimal mode for US', () => {
    render(<AddressInput value={baseValue} onChange={noop} mode="minimal" />);
    expect(screen.queryByLabelText(ADDRESS_LINE_1_RE)).not.toBeInTheDocument();
    expect(screen.getByLabelText(STATE_RE)).toBeInTheDocument();
  });

  it('shows no address fields in minimal mode for non-EU non-federal country', () => {
    render(<AddressInput value={{ ...baseValue, country: 'JP', level1: '', postalCode: '' }} onChange={noop} mode="minimal" />);
    expect(screen.queryByLabelText(ADDRESS_LINE_1_RE)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(PREFECTURE_RE)).not.toBeInTheDocument();
  });

  it('shows full address in minimal mode for EU country', () => {
    render(<AddressInput value={{ ...baseValue, country: 'DE', level1: '', postalCode: '' }} onChange={noop} mode="minimal" />);
    expect(screen.getByLabelText(ADDRESS_LINE_1_RE)).toBeInTheDocument();
  });

  it('uses defaultRegion to pre-fill state', () => {
    render(<AddressInput value={{ ...baseValue, level1: '' }} onChange={noop} defaultRegion="CA" mode="fullRegion" />);
    // The level-1 selector shows the pre-selected region's label as its value.
    const stateSelect = screen.getByLabelText(STATE_RE);
    expect(stateSelect).toHaveTextContent(CALIFORNIA_RE);
  });

  it('omits level1 in full mode and requires it in region/fullRegion modes', () => {
    const { rerender } = render(<AddressInput value={baseValue} onChange={noop} mode="full" />);
    // Absent in full mode — level1 is not included in full mode.
    expect(screen.queryByLabelText(STATE_RE)).not.toBeInTheDocument();

    rerender(<AddressInput value={baseValue} onChange={noop} mode="region" />);
    // Required in region mode: no "(optional)" suffix.
    expect(screen.queryByLabelText(STATE_OPTIONAL_RE)).not.toBeInTheDocument();
    const state = screen.getByLabelText(STATE_RE);
    expect(state).toBeInTheDocument();
    expect(state).toBeRequired();
  });

  it('shows level1 as required for a country without a level1 field in fullRegion mode', () => {
    // DE normally has no level1 field; fullRegion mode must surface it as a
    // required field rather than omitting it.
    render(
      <AddressInput value={{ ...baseValue, country: 'DE', level1: '', postalCode: '' }} onChange={noop} mode="fullRegion" />,
    );
    const region = screen.getByLabelText(FEDERATED_STATE_RE);
    expect(region).toBeInTheDocument();
    expect(region).toBeRequired();
    expect(screen.queryByLabelText(FEDERATED_STATE_OPTIONAL_RE)).not.toBeInTheDocument();
  });

  it('reports valid in minimal mode once only the country is provided (non-regional, non-EU)', () => {
    const onValidationChange = vi.fn();
    // JP in minimal mode collects only the country: no other fields required.
    render(
      <AddressInput
        value={{ line1: '', city: '', level1: '', postalCode: '', country: 'JP' }}
        onChange={noop}
        mode="minimal"
        onValidationChange={onValidationChange}
      />,
    );
    expect(onValidationChange).toHaveBeenLastCalledWith(true, []);
  });

  it('reports valid in minimal mode for the US once country and region are provided', () => {
    const onValidationChange = vi.fn();
    render(
      <AddressInput
        value={{ line1: '', city: '', level1: 'NY', postalCode: '', country: 'US' }}
        onChange={noop}
        mode="minimal"
        onValidationChange={onValidationChange}
      />,
    );
    expect(onValidationChange).toHaveBeenLastCalledWith(true, []);
  });
});

describe('AddressInput validation modes', () => {
  it('onBlur mode hides errors until the field is blurred', async () => {
    render(<Harness initial={{ ...baseValue, line1: '' }} validationMode="onBlur" />);
    const input = screen.getByLabelText(ADDRESS_LINE_1_RE);
    await userEvent.type(input, 'ab');
    await userEvent.clear(input);
    // Typing/clearing alone should not surface the error in onBlur mode.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('onType mode reveals errors as the field is edited', async () => {
    render(<Harness initial={{ ...baseValue, line1: 'x' }} validationMode="onType" />);
    const input = screen.getByLabelText(ADDRESS_LINE_1_RE);
    await userEvent.clear(input);
    // Editing to an empty value reveals the error immediately, without blur.
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('onSubmit mode hides errors until validate() is called via ref', async () => {
    const ref = createRef<AddressInputHandle>();
    render(<Harness initial={{ ...baseValue, line1: '' }} validationMode="onSubmit" inputRef={ref} />);
    const input = screen.getByLabelText(ADDRESS_LINE_1_RE);
    await userEvent.type(input, 'ab');
    await userEvent.clear(input);
    await userEvent.tab();
    // Neither typing nor blur reveals errors in onSubmit mode.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    const result = ref.current?.validate();
    expect(result?.valid).toBe(false);
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });
});

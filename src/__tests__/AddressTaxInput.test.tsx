import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { AddressValue } from 'country-data-ts/address';
import type { Ref } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { AddressInputHandle } from '../components/AddressInput';
import { AddressTaxInput } from '../components/AddressTaxInput';

const COUNTRY_RE = /country/i;
const BUSINESS_ACCOUNT_RE = /business account/i;
const NO_IDENTIFIER_RE = /I don't have a/i;
const VAT_RE = /VAT/i;
const STATE_RE = /state/i;

const noop = (): void => undefined;

const baseAddress: AddressValue = {
  line1: '123 Main St',
  city: 'New York',
  level1: 'NY',
  postalCode: '10001',
  country: 'US',
};

/** The RN tax-ID input carries nativeID="rav-taxId", which RNW maps to the DOM id. */
function taxIdInput(): HTMLInputElement | null {
  const el = document.getElementById('rav-taxId');
  return el instanceof HTMLInputElement ? el : null;
}

/** Open the country dropdown and pick an option by its visible name. */
async function selectCountry(name: string | RegExp) {
  fireEvent.click(screen.getByLabelText(COUNTRY_RE));
  fireEvent.click(await screen.findByText(name));
}

describe('AddressTaxInput business checkbox visibility', () => {
  it('renders address fields and business checkbox by default', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="either" />);
    expect(screen.getByLabelText(BUSINESS_ACCOUNT_RE)).toBeInTheDocument();
    expect(screen.getByLabelText(COUNTRY_RE)).toBeInTheDocument();
  });

  it('does not show business checkbox when taxType is business', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="business" />);
    expect(screen.queryByLabelText(BUSINESS_ACCOUNT_RE)).not.toBeInTheDocument();
  });

  it('does not show business checkbox when taxType is individual', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="individual" />);
    expect(screen.queryByLabelText(BUSINESS_ACCOUNT_RE)).not.toBeInTheDocument();
  });

  it('calls onBusinessChange when business checkbox is toggled', async () => {
    const onBusinessChange = vi.fn();
    render(
      <AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="either" onBusinessChange={onBusinessChange} />,
    );
    await userEvent.click(screen.getByLabelText(BUSINESS_ACCOUNT_RE));
    expect(onBusinessChange).toHaveBeenCalledWith(true);
  });
});

describe('AddressTaxInput tax field visibility', () => {
  it('shows tax fields when taxType is business', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="business" />);
    expect(screen.getByText(NO_IDENTIFIER_RE)).toBeInTheDocument();
    expect(taxIdInput()).not.toBeNull();
  });

  it('does not show tax fields when taxType is individual', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="individual" />);
    expect(screen.queryByText(NO_IDENTIFIER_RE)).not.toBeInTheDocument();
  });

  it('does not show tax fields when no country is set', () => {
    const emptyAddress = { ...baseAddress, country: '' };
    render(<AddressTaxInput addressValue={emptyAddress} onAddressChange={noop} taxType="business" />);
    expect(screen.queryByText(NO_IDENTIFIER_RE)).not.toBeInTheDocument();
  });

  it('only shows tax fields for countries in nexusList', () => {
    const { rerender } = render(
      <AddressTaxInput
        addressValue={{ ...baseAddress, country: 'US' }}
        onAddressChange={noop}
        taxType="business"
        nexusList={['FR', 'DE']}
      />,
    );
    // US is not in nexus list, no tax fields.
    expect(screen.queryByText(NO_IDENTIFIER_RE)).not.toBeInTheDocument();

    rerender(
      <AddressTaxInput
        addressValue={{ ...baseAddress, country: 'FR', level1: '', postalCode: '' }}
        onAddressChange={noop}
        taxType="business"
        nexusList={['FR', 'DE']}
      />,
    );
    expect(screen.getByText(NO_IDENTIFIER_RE)).toBeInTheDocument();
  });
});

describe('AddressTaxInput tax fields behavior', () => {
  it('calls onTaxChange on mount', () => {
    const onTaxChange = vi.fn();
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="business" onTaxChange={onTaxChange} />);
    expect(onTaxChange).toHaveBeenCalled();
    const call = onTaxChange.mock.calls[0]?.[0];
    expect(call).toHaveProperty('hasIdentifier');
    expect(call).toHaveProperty('baseTax');
    expect(call).toHaveProperty('effectiveTax');
  });

  it('validates tax identifier format and shows error', async () => {
    render(
      <AddressTaxInput
        addressValue={{ ...baseAddress, country: 'FR', level1: '', postalCode: '' }}
        onAddressChange={noop}
        taxType="business"
      />,
    );
    const input = taxIdInput();
    expect(input).not.toBeNull();
    if (!input) throw new Error('tax-ID input not found');
    await userEvent.type(input, 'invalid');
    await userEvent.tab();
    expect(await screen.findByRole('alert')).toBeInTheDocument();
  });

  it('shows country-specific tax label for EU countries', () => {
    render(
      <AddressTaxInput
        addressValue={{ ...baseAddress, country: 'FR', level1: '', postalCode: '' }}
        onAddressChange={noop}
        taxType="business"
      />,
    );
    expect(taxIdInput()).not.toBeNull();
    // The tax-ID field label is a Text with nativeID `rav-taxId-label`.
    const label = document.getElementById('rav-taxId-label');
    expect(label?.textContent).toMatch(VAT_RE);
  });

  it('marks tax identifier as required when taxRequired is true', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="business" taxRequired={true} />);
    expect(taxIdInput()).toBeRequired();
  });

  it('updates onTaxChange when country changes', async () => {
    const onTaxChange = vi.fn();
    const onAddressChange = vi.fn();
    render(
      <AddressTaxInput
        addressValue={baseAddress}
        onAddressChange={onAddressChange}
        taxType="business"
        onTaxChange={onTaxChange}
      />,
    );
    const initialCallCount = onTaxChange.mock.calls.length;
    await selectCountry('France');
    expect(onTaxChange.mock.calls.length).toBeGreaterThan(initialCallCount);
  });
});

describe('AddressTaxInput controlled props and modes', () => {
  it('forwards ref to AddressInput', () => {
    const ref: Ref<AddressInputHandle> = { current: null };
    render(<AddressTaxInput ref={ref} addressValue={baseAddress} onAddressChange={noop} taxType="business" />);
    expect(ref.current).not.toBeNull();
    expect(ref.current).toHaveProperty('validate');
  });

  it('disables all fields when disabled prop is set', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="either" disabled={true} />);
    // The RN checkbox is a Pressable; disabled maps to aria-disabled.
    expect(screen.getByLabelText(BUSINESS_ACCOUNT_RE)).toHaveAttribute('aria-disabled', 'true');
  });

  it('uses controlled isBusiness prop when provided', () => {
    const { rerender } = render(
      <AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="either" isBusiness={true} />,
    );
    expect(screen.getByLabelText(BUSINESS_ACCOUNT_RE)).toBeChecked();

    rerender(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="either" isBusiness={false} />);
    expect(screen.getByLabelText(BUSINESS_ACCOUNT_RE)).not.toBeChecked();
  });

  it('uses controlled hasTaxIdentifier prop when provided', () => {
    render(<AddressTaxInput addressValue={baseAddress} onAddressChange={noop} taxType="business" hasTaxIdentifier={false} />);
    // The "I don't have a …" checkbox is inverted, so it is checked here.
    expect(screen.getByLabelText(NO_IDENTIFIER_RE)).toBeChecked();
    // With no identifier, the tax-ID input is hidden.
    expect(taxIdInput()).toBeNull();
  });

  it('uses controlled taxIdentifier prop when provided', () => {
    render(
      <AddressTaxInput
        addressValue={{ ...baseAddress, country: 'FR', level1: '', postalCode: '' }}
        onAddressChange={noop}
        taxType="business"
        taxIdentifier="FR12345678901"
      />,
    );
    expect(taxIdInput()?.value).toBe('FR12345678901');
  });

  it('shows fullRegion mode for countries with regional tax', () => {
    render(
      <AddressTaxInput
        addressValue={{ ...baseAddress, country: 'US' }}
        onAddressChange={noop}
        mode="full"
        taxType="individual"
      />,
    );
    // US has regional tax, so the state field shows even in "full" mode.
    expect(screen.getByLabelText(STATE_RE)).toBeInTheDocument();
  });

  it('passes validationMode to AddressInput', () => {
    const onValidationChange = vi.fn();
    render(
      <AddressTaxInput
        addressValue={{ ...baseAddress, line1: '' }}
        onAddressChange={noop}
        validationMode="onSubmit"
        onValidationChange={onValidationChange}
        taxType="individual"
      />,
    );
    // In onSubmit mode, errors stay hidden until validate() is called.
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });
});

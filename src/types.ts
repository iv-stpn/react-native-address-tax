export interface AddressValue {
	line1: string;
	line2?: string;
	city: string;
	state?: string;
	postalCode: string;
	country: string;
	vat?: string;
}

export interface AddressInputProps {
	value: AddressValue;
	onChange: (value: AddressValue) => void;
	onValidationChange?: (
		valid: boolean,
		errors: import("./utils/validation.js").ValidationError[],
	) => void;
	showVat?: boolean;
	vatRequired?: boolean;
	disabled?: boolean;
	className?: string;
	classNames?: Partial<AddressInputClassNames>;
	labels?: Partial<AddressInputLabels>;
	/** Pre-selects a country and moves the country selector to the bottom of the form. */
	defaultCountry?: string;
	/**
	 * When true, reduces the fields collected based on the country:
	 * - EU countries: full form (all fields).
	 * - Non-EU countries with per-region tax rules (e.g. US, CA): country + state/province only.
	 * - All other countries: country only.
	 */
	minimalCollection?: boolean;
	/** Renders a "Business account" checkbox that toggles VAT field visibility. */
	showBusinessToggle?: boolean;
	/** Controlled business/individual state (used with showBusinessToggle). */
	isBusiness?: boolean;
	/** Called when the business toggle changes. */
	onBusinessChange?: (isBusiness: boolean) => void;
	/** When true the user has opted out of providing a VAT/tax number (controlled sub-toggle under showBusinessToggle). */
	lacksVatNumber?: boolean;
	/** Called when the "I don't have a VAT number" sub-toggle changes. */
	onLacksVatNumberChange?: (lacksVatNumber: boolean) => void;
}

export interface AddressInputClassNames {
	root: string;
	row: string;
	field: string;
	label: string;
	input: string;
	select: string;
	error: string;
}

export interface AddressInputLabels {
	countryLabel: string;
	vatLabel: string;
	vatPlaceholder: string;
	businessLabel: string;
}

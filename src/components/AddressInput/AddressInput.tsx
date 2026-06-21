import { type ChangeEvent, useCallback, useEffect, useState } from "react";
import type { AddressInputProps, AddressValue } from "../../types.js";
import {
	COUNTRY_LIST,
	getCountryConfig,
	getVatLabel,
	isEUCountry,
} from "../../utils/countries.js";
import type { ValidationError } from "../../utils/validation.js";
import { normalizeVat, validateAddress } from "../../utils/validation.js";

const EMPTY_VALUE: AddressValue = {
	line1: "",
	line2: "",
	city: "",
	state: "",
	postalCode: "",
	country: "",
	vat: "",
};

export function AddressInput({
	value,
	onChange,
	onValidationChange,
	showVat = false,
	vatRequired = false,
	disabled = false,
	className,
	classNames,
	labels,
	defaultCountry,
	minimalCollection = false,
	showBusinessToggle = false,
	isBusiness: isBusinessProp,
	onBusinessChange,
	lacksVatNumber: lacksVatNumberProp,
	onLacksVatNumberChange,
}: AddressInputProps) {
	const [touched, setTouched] = useState<Partial<Record<string, boolean>>>({});
	const [errors, setErrors] = useState<ValidationError[]>([]);
	const [internalIsBusiness, setInternalIsBusiness] = useState(false);
	const [internalLacksVatNumber, setInternalLacksVatNumber] = useState(false);

	const isBusiness =
		isBusinessProp !== undefined ? isBusinessProp : internalIsBusiness;
	// false = has a number (VAT shown); true = "I don't have one" (VAT hidden)
	const lacksVatNumber =
		lacksVatNumberProp !== undefined
			? lacksVatNumberProp
			: internalLacksVatNumber;

	// When defaultCountry is provided: country is pre-selected, selector moves to bottom.
	// When not provided: country starts empty and the selector is shown at top.
	const effectiveCountry = value.country || defaultCountry || "";
	const currentValue = { ...EMPTY_VALUE, ...value, country: effectiveCountry };
	const countryConfig = getCountryConfig(currentValue.country);
	const countryAtBottom = !!defaultCountry;

	// Business + not opted out → show VAT. Otherwise fall back to the showVat prop.
	const shouldShowVat = showBusinessToggle
		? isBusiness && !lacksVatNumber
		: showVat;

	const runValidation = useCallback(
		(val: AddressValue) => {
			const result = validateAddress(val);
			setErrors(result.errors);
			onValidationChange?.(result.valid, result.errors);
		},
		[onValidationChange],
	);

	// biome-ignore lint/correctness/useExhaustiveDependencies: only changes on country change
	useEffect(() => {
		runValidation(currentValue);
	}, [currentValue.country]);

	function handleField(field: keyof AddressValue) {
		return (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			const next: AddressValue = { ...currentValue, [field]: e.target.value };
			if (field === "country") {
				next.state = "";
				next.postalCode = "";
				next.vat = "";
			}
			onChange(next);
			setTouched((t) => ({ ...t, [field]: true }));
			runValidation(next);
		};
	}

	function handleVatBlur() {
		const normalized = normalizeVat(currentValue.vat ?? "");
		if (normalized !== (currentValue.vat ?? "")) {
			const next = { ...currentValue, vat: normalized };
			onChange(next);
			runValidation(next);
		}
		setTouched((t) => ({ ...t, vat: true }));
	}

	function handleBusinessToggle(e: ChangeEvent<HTMLInputElement>) {
		const val = e.target.checked;
		setInternalIsBusiness(val);
		onBusinessChange?.(val);
		if (!val) {
			setInternalLacksVatNumber(false);
			onLacksVatNumberChange?.(false);
		}
	}

	function handleLacksVatNumberToggle(e: ChangeEvent<HTMLInputElement>) {
		const val = e.target.checked;
		setInternalLacksVatNumber(val);
		onLacksVatNumberChange?.(val);
	}

	function getError(field: string): string | undefined {
		if (!touched[field]) return undefined;
		return errors.find((e) => e.field === field)?.message;
	}

	const cn = (base: string, custom?: string) =>
		[base, custom].filter(Boolean).join(" ");

	const vatLabel =
		labels?.vatLabel ??
		(countryConfig ? getVatLabel(currentValue.country) : "VAT Number");

	const fieldOrder = countryConfig?.addressFields ?? [];

	const effectiveFieldOrder = (() => {
		if (!minimalCollection || !currentValue.country) return fieldOrder;
		if (isEUCountry(currentValue.country)) return fieldOrder;
		if (countryConfig?.hasRegionalTax) return fieldOrder.filter((f) => f.field === "state");
		return [];
	})();

	const countrySelector = (
		<div className={cn("rav-field", classNames?.field)}>
			<label
				className={cn("rav-label", classNames?.label)}
				htmlFor="rav-country"
			>
				{labels?.countryLabel ?? "Country"}
				<span aria-hidden="true"> *</span>
			</label>
			<select
				id="rav-country"
				className={cn("rav-select", classNames?.select)}
				value={currentValue.country}
				onChange={handleField("country")}
				disabled={disabled}
				aria-required="true"
			>
				{!currentValue.country && (
					<option value="" disabled>
						— Select a country —
					</option>
				)}
				{COUNTRY_LIST.map((c) => (
					<option key={c.code} value={c.code}>
						{c.name}
					</option>
				))}
			</select>
			{getError("country") && (
				<span className={cn("rav-error", classNames?.error)} role="alert">
					{getError("country")}
				</span>
			)}
		</div>
	);

	return (
		<div className={cn("rav-root", className ?? classNames?.root)}>
			{showBusinessToggle && (
				<div className={cn("rav-field", classNames?.field)}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={isBusiness}
							onChange={handleBusinessToggle}
							disabled={disabled}
						/>
						<span
							className={cn("rav-label", classNames?.label)}
							style={{ margin: 0 }}
						>
							{labels?.businessLabel ?? "Business account"}
						</span>
					</label>
				</div>
			)}

			{!countryAtBottom && countrySelector}

			{countryConfig &&
				effectiveFieldOrder.map((fieldCfg) => {
					const fieldKey = fieldCfg.field as keyof AddressValue;
					const error = getError(fieldCfg.field);
					const inputId = `rav-${fieldCfg.field}`;
					const currentFieldValue =
						(currentValue[fieldKey] as string | undefined) ?? "";

					return (
						<div
							key={fieldCfg.field}
							className={cn("rav-field", classNames?.field)}
						>
							<label
								className={cn("rav-label", classNames?.label)}
								htmlFor={inputId}
							>
								{fieldCfg.label}
								{fieldCfg.required && <span aria-hidden="true"> *</span>}
							</label>
							{fieldCfg.options ? (
								<select
									id={inputId}
									className={cn("rav-select", classNames?.select)}
									value={currentFieldValue}
									onChange={handleField(fieldKey)}
									onBlur={() =>
										setTouched((t) => ({ ...t, [fieldCfg.field]: true }))
									}
									disabled={disabled}
									aria-required={fieldCfg.required}
									aria-invalid={error !== undefined}
									aria-describedby={error ? `${inputId}-error` : undefined}
								>
									<option value="">— Select {fieldCfg.label} —</option>
									{fieldCfg.options.map((opt) => (
										<option key={opt.value} value={opt.value}>
											{opt.label}
										</option>
									))}
								</select>
							) : (
								<input
									id={inputId}
									type="text"
									className={cn("rav-input", classNames?.input)}
									value={currentFieldValue}
									onChange={handleField(fieldKey)}
									onBlur={() =>
										setTouched((t) => ({ ...t, [fieldCfg.field]: true }))
									}
									placeholder={fieldCfg.placeholder}
									disabled={disabled}
									aria-required={fieldCfg.required}
									aria-invalid={error !== undefined}
									aria-describedby={error ? `${inputId}-error` : undefined}
								/>
							)}
							{error && (
								<span
									id={`${inputId}-error`}
									className={cn("rav-error", classNames?.error)}
									role="alert"
								>
									{error}
								</span>
							)}
						</div>
					);
				})}

			{countryAtBottom && countrySelector}

			{showBusinessToggle && isBusiness && currentValue.country && (
				<div className={cn("rav-field", classNames?.field)}>
					<label
						style={{
							display: "flex",
							alignItems: "center",
							gap: 6,
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							checked={lacksVatNumber}
							onChange={handleLacksVatNumberToggle}
							disabled={disabled}
						/>
						<span
							className={cn("rav-label", classNames?.label)}
							style={{ margin: 0 }}
						>
							{`I don't have a ${vatLabel}`}
						</span>
					</label>
				</div>
			)}

			{shouldShowVat && currentValue.country && (
				<div className={cn("rav-field", classNames?.field)}>
					<label
						className={cn("rav-label", classNames?.label)}
						htmlFor="rav-vat"
					>
						{vatLabel}
						{vatRequired && <span aria-hidden="true"> *</span>}
					</label>
					<input
						id="rav-vat"
						type="text"
						className={cn("rav-input", classNames?.input)}
						value={currentValue.vat ?? ""}
						onChange={handleField("vat")}
						onBlur={handleVatBlur}
						placeholder={labels?.vatPlaceholder ?? countryConfig?.vatExample}
						disabled={disabled}
						aria-required={vatRequired}
						aria-invalid={getError("vat") !== undefined}
						aria-describedby={getError("vat") ? "rav-vat-error" : undefined}
					/>
					{getError("vat") && (
						<span
							id="rav-vat-error"
							className={cn("rav-error", classNames?.error)}
							role="alert"
						>
							{getError("vat")}
						</span>
					)}
				</div>
			)}
		</div>
	);
}

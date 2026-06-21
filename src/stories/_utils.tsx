import { type CSSProperties, useState } from "react";
import { AddressInput } from "../components/AddressInput/index.js";
import type { AddressValue } from "../types.js";

// ---------------------------------------------------------------------------
// VAT outcome logic
// Assumes an EU-based seller. Shows the applicable VAT treatment for a buyer.
// ---------------------------------------------------------------------------

const EU_RATES: Record<string, { rate: number; name: string }> = {
	AT: { rate: 20, name: "MwSt" },
	BE: { rate: 21, name: "BTW/TVA" },
	DE: { rate: 19, name: "MwSt" },
	ES: { rate: 21, name: "IVA" },
	FR: { rate: 20, name: "TVA" },
	IT: { rate: 22, name: "IVA" },
	NL: { rate: 21, name: "BTW" },
	PL: { rate: 23, name: "VAT" },
};

type VatTreatment =
	| "reverse-charge"
	| "standard"
	| "zero-rated"
	| "outside-eu"
	| "no-country";

export interface VatOutcome {
	treatment: VatTreatment;
	headline: string;
	rate: string;
	detail: string;
}

export function computeVatOutcome(
	country: string,
	isBusiness: boolean,
	hasVatNumber: boolean,
): VatOutcome {
	if (!country) {
		return {
			treatment: "no-country",
			headline: "No country selected",
			rate: "—",
			detail: "Select a country to see the applicable VAT treatment.",
		};
	}

	const euEntry = EU_RATES[country];

	if (euEntry) {
		const { rate, name } = euEntry;
		if (isBusiness && hasVatNumber) {
			return {
				treatment: "reverse-charge",
				headline: "Reverse Charge",
				rate: "0%",
				detail: `Intra-EU B2B supply. Customer self-accounts for ${name} (${rate}%) in their country. You invoice at 0%.`,
			};
		}
		if (isBusiness && !hasVatNumber) {
			return {
				treatment: "standard",
				headline: `Standard ${name} — ${rate}%`,
				rate: `${rate}%`,
				detail: `Business opted out of providing a VAT number — reverse charge cannot apply. Apply ${country} ${name} at ${rate}%.`,
			};
		}
		return {
			treatment: "standard",
			headline: `Standard ${name} — ${rate}%`,
			rate: `${rate}%`,
			detail: `Consumer purchase. Apply ${country} ${name} at ${rate}% (EU OSS rules may apply).`,
		};
	}

	switch (country) {
		case "GB":
			if (isBusiness && hasVatNumber) {
				return {
					treatment: "zero-rated",
					headline: "Zero-rated Export",
					rate: "0%",
					detail:
						'Post-Brexit B2B. UK reverse charge applies on the buyer\'s side. Invoice at 0% and note "reverse charge".',
				};
			}
			return {
				treatment: "zero-rated",
				headline: "Zero-rated Export",
				rate: "0%",
				detail:
					"Post-Brexit: outside EU VAT area. UK VAT (20%) is accounted for on the buyer's side.",
			};
		case "CH":
			return {
				treatment: "outside-eu",
				headline: "Outside EU VAT — Swiss MWST/TVA/IVA",
				rate: "8.1%",
				detail:
					"Switzerland is not in the EU VAT area. Swiss tax at 8.1% may apply on the buyer's side; zero-rated export for EU VAT.",
			};
		case "US":
			return {
				treatment: "outside-eu",
				headline: "Outside EU VAT — No federal VAT",
				rate: "N/A",
				detail:
					"USA has no federal VAT. State sales tax varies (0–13%). Zero-rated export for EU VAT purposes.",
			};
		case "CA":
			return {
				treatment: "outside-eu",
				headline: "Outside EU VAT — GST/HST",
				rate: "N/A",
				detail:
					"Canada uses GST (5%) + provincial HST/PST. Zero-rated export for EU VAT purposes.",
			};
		case "AU":
			return {
				treatment: "outside-eu",
				headline: "Outside EU VAT — GST",
				rate: "10%",
				detail:
					"Australia uses GST at 10%. Zero-rated export for EU VAT purposes.",
			};
		case "JP":
			return {
				treatment: "outside-eu",
				headline: "Outside EU VAT — Consumption Tax",
				rate: "10%",
				detail:
					"Japan Consumption Tax at 10%. Zero-rated export for EU VAT purposes.",
			};
		default:
			return {
				treatment: "outside-eu",
				headline: "Outside EU VAT",
				rate: "N/A",
				detail:
					"VAT treatment depends on local regulations of the destination country.",
			};
	}
}

// ---------------------------------------------------------------------------
// VatPanel component
// ---------------------------------------------------------------------------

const COLORS: Record<
	VatTreatment,
	{ bg: string; border: string; text: string; badge: string }
> = {
	"reverse-charge": {
		bg: "#d1fae5",
		border: "#10b981",
		text: "#065f46",
		badge: "#059669",
	},
	standard: {
		bg: "#fef3c7",
		border: "#f59e0b",
		text: "#92400e",
		badge: "#d97706",
	},
	"zero-rated": {
		bg: "#dbeafe",
		border: "#3b82f6",
		text: "#1e40af",
		badge: "#2563eb",
	},
	"outside-eu": {
		bg: "#f3f4f6",
		border: "#9ca3af",
		text: "#374151",
		badge: "#6b7280",
	},
	"no-country": {
		bg: "#f9fafb",
		border: "#e5e7eb",
		text: "#9ca3af",
		badge: "#d1d5db",
	},
};

export function VatPanel({ outcome }: { outcome: VatOutcome }) {
	const c = COLORS[outcome.treatment];
	return (
		<div
			style={{
				padding: "12px 16px",
				background: c.bg,
				border: `1px solid ${c.border}`,
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: 10,
					marginBottom: 6,
				}}
			>
				<span
					style={{
						background: c.badge,
						color: "#fff",
						fontSize: 11,
						fontWeight: 700,
						padding: "2px 8px",
						letterSpacing: "0.04em",
						textTransform: "uppercase",
					}}
				>
					VAT
				</span>
				<span style={{ fontWeight: 600, color: c.text, fontSize: 14 }}>
					{outcome.headline}
				</span>
				<span
					style={{
						marginLeft: "auto",
						fontWeight: 700,
						fontSize: 18,
						color: c.badge,
						fontVariantNumeric: "tabular-nums",
					}}
				>
					{outcome.rate}
				</span>
			</div>
			<p style={{ margin: 0, fontSize: 12, color: c.text, lineHeight: 1.5 }}>
				{outcome.detail}
			</p>
		</div>
	);
}

// ---------------------------------------------------------------------------
// Shared story wrapper
// ---------------------------------------------------------------------------

export type StoryMode = "business" | "individual" | "toggle";

const containerStyle: CSSProperties = {
	maxWidth: 480,
	fontFamily: "system-ui, sans-serif",
	padding: 24,
};

const jsonStyle: CSSProperties = {
	background: "#f4f4f4",
	border: "1px solid #e5e7eb",
	padding: "10px 14px",
	fontSize: 12,
	lineHeight: 1.6,
	color: "#374151",
	overflowX: "auto",
};

const sectionLabelStyle: CSSProperties = {
	display: "block",
	marginTop: 16,
	marginBottom: 4,
	fontSize: 11,
	fontWeight: 700,
	letterSpacing: "0.06em",
	textTransform: "uppercase",
	color: "#9ca3af",
};

type StoryWrapperProps = { defaultCountry?: string; mode: StoryMode };
export function StoryWrapper({ defaultCountry, mode }: StoryWrapperProps) {
	const [value, setValue] = useState<AddressValue>({
		line1: "",
		line2: "",
		city: "",
		state: "",
		postalCode: "",
		country: defaultCountry ?? "",
		vat: "",
	});
	const [isBusiness, setIsBusiness] = useState(false);
	const [lacksVatNumber, setLacksVatNumber] = useState(false);

	const effectiveBusiness =
		mode === "business" ? true : mode === "individual" ? false : isBusiness;
	// In toggle mode, lacksVatNumber=false (default) means the user HAS a number.
	// In business mode we always treat them as having a number (VAT field is always shown).
	const effectiveHasVatNumber =
		mode === "business"
			? true
			: mode === "individual"
				? false
				: !lacksVatNumber;

	const outcome = computeVatOutcome(
		value.country,
		effectiveBusiness,
		effectiveHasVatNumber,
	);

	return (
		<div style={containerStyle}>
			<AddressInput
				value={value}
				onChange={setValue}
				defaultCountry={defaultCountry}
				showVat={mode === "business"}
				showBusinessToggle={mode === "toggle"}
				onBusinessChange={mode === "toggle" ? setIsBusiness : undefined}
				onLacksVatNumberChange={
					mode === "toggle" ? setLacksVatNumber : undefined
				}
			/>

			<span style={sectionLabelStyle}>Vat to collect</span>
			<VatPanel outcome={outcome} />
			<span style={sectionLabelStyle}>Current value</span>
			<pre style={jsonStyle}>{JSON.stringify(value, null, 2)}</pre>
		</div>
	);
}

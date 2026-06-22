// One-off generator: emits a Ladle story per country for the Address and
// Address+Tax demos, sourced from the TAX_CONFIG country list.
// Run with: node scripts/gen-stories.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const storiesDir = resolve(__dirname, "../src/stories");

// code -> display name, for every country present in TAX_CONFIG.
const NAMES = {
	AT: "Austria", BE: "Belgium", BG: "Bulgaria", CY: "Cyprus", CZ: "Czechia",
	DE: "Germany", DK: "Denmark", EE: "Estonia", ES: "Spain", FI: "Finland",
	FR: "France", GR: "Greece", HR: "Croatia", HU: "Hungary", IE: "Ireland",
	IT: "Italy", LT: "Lithuania", LU: "Luxembourg", LV: "Latvia", MT: "Malta",
	NL: "Netherlands", PL: "Poland", PT: "Portugal", RO: "Romania", SE: "Sweden",
	SI: "Slovenia", SK: "Slovakia", GB: "United Kingdom", CH: "Switzerland",
	US: "United States", CA: "Canada", AU: "Australia", JP: "Japan",
	NO: "Norway", IS: "Iceland", LI: "Liechtenstein", AD: "Andorra",
	MC: "Monaco", SM: "San Marino", AL: "Albania", BA: "Bosnia and Herzegovina",
	GE: "Georgia", MD: "Moldova", ME: "Montenegro", MK: "North Macedonia",
	RS: "Serbia", TR: "Turkey", UA: "Ukraine", XK: "Kosovo", NZ: "New Zealand",
	KR: "South Korea", SG: "Singapore", IL: "Israel", TW: "Taiwan",
	AE: "United Arab Emirates", HK: "Hong Kong", MO: "Macao", BY: "Belarus",
	RU: "Russia", JE: "Jersey", IM: "Isle of Man", GG: "Guernsey",
	GI: "Gibraltar", FO: "Faroe Islands", GL: "Greenland", VA: "Vatican City",
	DZ: "Algeria", AO: "Angola", BJ: "Benin", BW: "Botswana",
	BF: "Burkina Faso", BI: "Burundi", CM: "Cameroon", CV: "Cape Verde",
	CF: "Central African Republic", TD: "Chad", KM: "Comoros",
	CG: "Republic of the Congo", CD: "DR Congo", CI: "Côte d'Ivoire",
	DJ: "Djibouti", EG: "Egypt", GQ: "Equatorial Guinea", ER: "Eritrea",
	SZ: "Eswatini", ET: "Ethiopia", GA: "Gabon", GM: "Gambia", GH: "Ghana",
	GN: "Guinea", GW: "Guinea-Bissau", KE: "Kenya", LS: "Lesotho",
	LR: "Liberia", LY: "Libya", MG: "Madagascar", MW: "Malawi", ML: "Mali",
	MR: "Mauritania", MU: "Mauritius", MA: "Morocco", MZ: "Mozambique",
	NA: "Namibia", NE: "Niger", NG: "Nigeria", RW: "Rwanda",
	ST: "São Tomé and Príncipe", SN: "Senegal", SC: "Seychelles",
	SL: "Sierra Leone", SO: "Somalia", ZA: "South Africa", SS: "South Sudan",
	SD: "Sudan", TZ: "Tanzania", TG: "Togo", TN: "Tunisia", UG: "Uganda",
	ZM: "Zambia", ZW: "Zimbabwe", AR: "Argentina", BO: "Bolivia", BR: "Brazil",
	CL: "Chile", CO: "Colombia", CR: "Costa Rica", CU: "Cuba",
	DO: "Dominican Republic", EC: "Ecuador", SV: "El Salvador", GT: "Guatemala",
	GY: "Guyana", HT: "Haiti", HN: "Honduras", JM: "Jamaica", MX: "Mexico",
	NI: "Nicaragua", PA: "Panama", PY: "Paraguay", PE: "Peru", SR: "Suriname",
	TT: "Trinidad and Tobago", UY: "Uruguay", VE: "Venezuela", BZ: "Belize",
	BS: "Bahamas", BB: "Barbados", AG: "Antigua and Barbuda", DM: "Dominica",
	GD: "Grenada", KN: "Saint Kitts and Nevis", LC: "Saint Lucia",
	VC: "Saint Vincent and the Grenadines", AF: "Afghanistan", AM: "Armenia",
	AZ: "Azerbaijan", BH: "Bahrain", BD: "Bangladesh", BT: "Bhutan",
	BN: "Brunei", KH: "Cambodia", CN: "China", IN: "India", ID: "Indonesia",
	IR: "Iran", IQ: "Iraq", JO: "Jordan", KZ: "Kazakhstan", KW: "Kuwait",
	KG: "Kyrgyzstan", LA: "Laos", LB: "Lebanon", MY: "Malaysia",
	MV: "Maldives", MN: "Mongolia", MM: "Myanmar", NP: "Nepal", OM: "Oman",
	PK: "Pakistan", PH: "Philippines", QA: "Qatar", SA: "Saudi Arabia",
	LK: "Sri Lanka", SY: "Syria", TJ: "Tajikistan", TH: "Thailand",
	TL: "Timor-Leste", TM: "Turkmenistan", UZ: "Uzbekistan", VN: "Vietnam",
	YE: "Yemen", FJ: "Fiji", PG: "Papua New Guinea", SB: "Solomon Islands",
	VU: "Vanuatu", WS: "Samoa", TO: "Tonga", KI: "Kiribati",
	CK: "Cook Islands", PF: "French Polynesia", NC: "New Caledonia",
	FM: "Micronesia", MH: "Marshall Islands", NR: "Nauru", PW: "Palau",
	TV: "Tuvalu",
};

// Generate stories only for the codes the library currently supports, read
// straight from COUNTRY_CODES in countries.ts so the two never drift.
const countriesSrc = readFileSync(
	resolve(__dirname, "../src/utils/countries.ts"),
	"utf8",
);
const block = countriesSrc.slice(
	countriesSrc.indexOf("COUNTRY_CODES = ["),
	countriesSrc.indexOf("] as const"),
);
const supported = new Set([...block.matchAll(/"([A-Z]{2})"/g)].map((m) => m[1]));

// Sorted by display name so the Ladle sidebar reads alphabetically.
const codes = Object.keys(NAMES)
	.filter((c) => supported.has(c))
	.sort((a, b) => NAMES[a].localeCompare(NAMES[b]));

const header = (title, importName) =>
	`import type { Story, StoryDefault } from "@ladle/react";\n` +
	`import { ${importName} } from "./_utils.js";\n\n` +
	`export default {\n\ttitle: "${title}",\n} satisfies StoryDefault;\n`;

function genAddress() {
	let out = header("Address", "AddressWrapper");
	for (const code of codes) {
		out +=
			`\nexport const ${code}: Story = () => <AddressWrapper defaultCountry="${code}" />;\n` +
			`${code}.storyName = ${JSON.stringify(NAMES[code])};\n`;
	}
	return out;
}

function genTax(taxType, title) {
	let out = header(title, "AddressTaxWrapper");
	for (const code of codes) {
		out +=
			`\nexport const ${code}: Story = () => (\n` +
			`\t<AddressTaxWrapper taxType="${taxType}" defaultCountry="${code}" />\n);\n` +
			`${code}.storyName = ${JSON.stringify(NAMES[code])};\n`;
	}
	return out;
}

const files = {
	"Address.stories.tsx": genAddress(),
	"AddressTax.B2B.stories.tsx": genTax(
		"business",
		"Address+Tax / Business to business",
	),
	"AddressTax.B2C.stories.tsx": genTax(
		"individual",
		"Address+Tax / Business to consumer",
	),
	"AddressTax.Either.stories.tsx": genTax("either", "Address+Tax / Either"),
};

for (const [name, content] of Object.entries(files)) {
	writeFileSync(resolve(storiesDir, name), content);
	console.log(`wrote ${name} (${codes.length} countries)`);
}


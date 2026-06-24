# react-address-tax

> [!WARNING]
> **Work in progress — not production ready.** This project is under active
> development. The data (tax rates, address formats, VAT number patterns,
> administrative labels) is largely machine-generated and **not yet manually
> verified**. Do not rely on it for billing, tax compliance, or any
> production use. APIs, data shapes, and exports may change without notice.

A reusable React component for international structured address input with
consumption-tax (VAT/GST/sales tax) computation and business tax-ID validation.

## Install

```bash
bun install
```

## Develop

```bash
bun run ladle        # component playground / stories
bun run test         # run the test suite (vitest)
bun run typecheck    # type-check without emitting
bun run lint         # biome check
bun run build        # bundle with tsup
```

## Data generation

The reference data under `data/*.json` and the derived TypeScript in
`src/data/*` are generated from GeoNames, Wikidata, and curated tax tables.
Do not hand-edit the generated files — regenerate them instead:

```bash
bun run gen:geonames   # data/*.json from GeoNames + Wikidata
bun run gen:level1     # src/data/level1-administrative-codes.ts
bun run gen:countries  # src/data/countries.ts (COUNTRY_DATA, codes)
```

## Country coverage

The table below summarizes per-country support. It is generated from the
project data and is a starting point for manual verification.

Legend:
- ✅ supported / known
- ❌ not supported / not present
- ❓ unknown or unsure despite checking

Columns:
- **Last verified** — date a human last verified this row (`—` until reviewed).
- **Address format** — structured address layout supported.
- **Consumption tax** — standard consumption-tax rate (VAT/GST/sales tax).
- **VAT number** — business tax-ID validation: the local tax name and an
  example number, or ❌ when no format is curated.
- **Postal code** — postal-code pattern, with a generated example when supported.
- **Level 1 labels** — first-level administrative division label. ✅ only when
  both the English and local-language label are present; ❓ if either is missing.
- **Level 2 labels** — second-level administrative division label, same rule as
  Level 1.

Regional-tax countries (US, CA) list each state/province as a separate
`CC-REGION` row (e.g. `US-VA`) with its own rate; `↳` means the value is
inherited from the country row above. Regenerate the table with `bun run
gen:coverage`.

<!-- COVERAGE_TABLE_START -->

> ❗ next to a code means its data changed since it was last verified — the country/region should be reverified.

| Code | Country | Last verified | Address format | Consumption tax | VAT number | Postal code | Level 1 labels | Level 2 labels |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| AD | Andorra | — | ✅ | 4.5% ✅ | ❌ | ✅ (983) | ✅ Parish / Parròquia | ✅ Settlement / Ciutat |
| AE | United Arab Emirates | — | ✅ | 5% ✅ | ❌ | ✅ (86142-41951) | ✅ Emirate / إمارة | ❌ |
| AF | Afghanistan | — | ✅ | None ✅ | ❌ | ❌ | ✅ Province / ولایت | ✅ District / ولسوالی |
| AG | Antigua and Barbuda | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Parish / Parish | ❌ |
| AI | Anguilla | — | ✅ | 13% ✅ | ❌ | ✅ (2236) | ❌ | ❌ |
| AL | Albania | — | ✅ | 20% ✅ | ❌ | ✅ (7794) | ✅ County / Qarku | ✅ District / Rrethet |
| AM | Armenia | — | ✅ | 20% ✅ | ❌ | ✅ (912796) | ✅ Province / Մարզ | ✅ Village / Գյուղ |
| AN | Netherlands Antilles | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| AO | Angola | — | ✅ | 14% ✅ | ❌ | ❌ | ✅ Province / Província | ✅ Municipality / Município |
| AQ | Antarctica | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| AR | Argentina | — | ✅ | 21% ✅ | ❌ | ✅ (1453) | ✅ Province / Provincia | ✅ Department / Departamento |
| AS | American Samoa | — | ✅ | None ✅ | ❌ | ✅ (96799) | ✅ District / District | ✅ County / County |
| AT | Austria | — | ✅ | 20% ✅ | ✅ MwSt (ATU12345678) | ✅ (1010) | ✅ Federal state / Bundesland | ✅ District / Bezirk |
| AU | Australia | — | ✅ | 10% ✅ | ✅ GST (12345678901) | ✅ (2000) | ✅ External territory / External territory | ✅ Local government area / Local government area |
| AW | Aruba | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| AX | Aland Islands | — | ✅ | 25.5% ✅ | ❌ | ✅ (63277) | ❌ | ❌ |
| AZ | Azerbaijan | — | ✅ | 18% ✅ | ❌ | ✅ (3177) | ✅ District / Rayonu | ❌ |
| BA | Bosnia and Herzegovina | — | ✅ | 17% ✅ | ❌ | ✅ (49331) | ✅ Political division / Administrativna podjela | ✅ Region / Regije Republike Srpske |
| BB | Barbados | — | ✅ | 17.5% ✅ | ❌ | ✅ (49370) | ✅ Parish / Parish | ❌ |
| BD | Bangladesh | — | ✅ | 15% ✅ | ❌ | ✅ (2097) | ✅ Division / বিভাগ | ✅ District / জেলা |
| BE | Belgium | — | ✅ | 21% ✅ | ✅ BTW/TVA (BE0123456789) | ✅ (1000) | ✅ Region / Gewest | ✅ Province / Provincie |
| BF | Burkina Faso | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Region / Région | ✅ Province / Province |
| BG | Bulgaria | — | ✅ | 20% ✅ | ❌ | ✅ (9955) | ✅ Oblast / Oбласт | ✅ Municipality / Община |
| BH | Bahrain | — | ✅ | 10% ✅ | ❌ | ✅ (927) | ✅ Governorate / محافظة | ❌ |
| BI | Burundi | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Province / Province | ✅ Commune / Commune |
| BJ | Benin | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Department / Département | ✅ Commune / Commune |
| BL | Saint Barthelemy | — | ✅ | None ✅ | ❌ | ✅ (15215) | ❌ | ❌ |
| BM | Bermuda | — | ✅ | None ✅ | ❌ | ✅ (YK36) | ✅ Parish / Parish | ❌ |
| BN | Brunei | — | ✅ | None ✅ | ❌ | ✅ (ZT6708) | ✅ District / Daerah | ✅ Mukim / Mukim Negara |
| BO | Bolivia | — | ✅ | 13% ✅ | ❌ | ❌ | ✅ Department / Departamento | ✅ Province / Provincia |
| BQ | Bonaire, Saint Eustatius and Saba  | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| BR | Brazil | — | ✅ | 17% ✅ | ❌ | ✅ (35094-195) | ✅ Federative unit / Unidade federativa | ✅ Municipality / Município |
| BS | Bahamas | — | ✅ | 10% ✅ | ❌ | ❌ | ✅ District / District | ❌ |
| BT | Bhutan | — | ✅ | None ✅ | ❌ | ❌ | ✅ District / རྫོང་ཁག | ❓ Gewog (en only) |
| BV | Bouvet Island | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| BW | Botswana | — | ✅ | 14% ✅ | ❌ | ❌ | ✅ District / District | ❌ |
| BY | Belarus | — | ✅ | 20% ✅ | ❌ | ✅ (612330) | ✅ Region / Вобласць | ✅ District / Раён |
| BZ | Belize | — | ✅ | 12.5% ✅ | ❌ | ❌ | ✅ District / District | ❌ |
| CA | Canada | — | ✅ | 5–15% (regional) ✅ | ✅ GST/HST (123456789RT0001) | ✅ (K1A 0B1) | ✅ Province / Province | ✅ Regional district / Regional district |
| CA-AB | Canada — Alberta | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-BC | Canada — British Columbia | — | ↳ | 12% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-MB | Canada — Manitoba | — | ↳ | 12% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-NB | Canada — New Brunswick | — | ↳ | 15% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-NL | Canada — Newfoundland and Labrador | — | ↳ | 15% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-NS | Canada — Nova Scotia | — | ↳ | 15% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-NT | Canada — Northwest Territories | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-NU | Canada — Nunavut | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-ON | Canada — Ontario | — | ↳ | 13% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-PE | Canada — Prince Edward Island | — | ↳ | 15% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-QC | Canada — Quebec | — | ↳ | 14.975% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-SK | Canada — Saskatchewan | — | ↳ | 11% ✅ | ↳ | ↳ | ↳ | ↳ |
| CA-YT | Canada — Yukon | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| CC | Cocos Islands | — | ✅ | None ✅ | ❌ | ✅ (2717) | ❌ | ❌ |
| CD | Democratic Republic of the Congo | — | ✅ | 16% ✅ | ❌ | ❌ | ✅ Province / Provinces | ✅ Commune / Commune |
| CF | Central African Republic | — | ✅ | 19% ✅ | ❌ | ❌ | ✅ Prefecture / Préfecture | ❌ |
| CG | Republic of the Congo | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Department / Département | ❌ |
| CH | Switzerland | — | ✅ | 8.1% ✅ | ✅ MWST/TVA/IVA (CHE-123.456.789MWST) | ✅ (8001) | ✅ Canton / Kanton | ✅ Municipality / Gemeinde |
| CI | Ivory Coast | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Region / Région | ❌ |
| CK | Cook Islands | — | ✅ | 15% ✅ | ❌ | ❌ | ❌ | ❌ |
| CL | Chile | — | ✅ | 19% ✅ | ❌ | ✅ (9515805) | ✅ Region / Región | ✅ Province / Provincia |
| CM | Cameroon | — | ✅ | 19.25% ✅ | ❌ | ❌ | ✅ Electoral unit / Electoral unit | ✅ Department / Department |
| CN | China | — | ✅ | 13% ✅ | ❌ | ✅ (582517) | ✅ Province / 省 | ✅ Prefecture-level city / 地级市 |
| CO | Colombia | — | ✅ | 19% ✅ | ❌ | ✅ (550765) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| CR | Costa Rica | — | ✅ | 13% ✅ | ❌ | ✅ (21043) | ✅ Electoral unit / Circunscripción electoral | ✅ Canton / Cantón |
| CS | Serbia and Montenegro | — | ✅ | 20% ✅ | ❌ | ✅ (38588) | ❌ | ❌ |
| CU | Cuba | — | ✅ | None ✅ | ❌ | ✅ (CP34579) | ✅ Province / Provincia | ✅ Municipality / Municipio |
| CV | Cabo Verde | — | ✅ | 15% ✅ | ❌ | ✅ (1845) | ✅ Concelho / Municipio | ✅ Freguesia / Freguesia |
| CW | Curacao | — | ✅ | 6% ✅ | ❌ | ❌ | ❌ | ❌ |
| CX | Christmas Island | — | ✅ | None ✅ | ❌ | ✅ (9349) | ❌ | ❌ |
| CY | Cyprus | — | ✅ | 19% ✅ | ❌ | ✅ (3304) | ✅ District / Επαρχία | ✅ Community / Κοινότητα |
| CZ | Czechia | — | ✅ | 21% ✅ | ❌ | ✅ (949 09) | ✅ Region / Kraj | ✅ Municipal part / Část obce |
| DE | Germany | — | ✅ | 19% ✅ | ✅ MwSt (DE123456789) | ✅ (10115) | ✅ Federated state / Bundesland | ✅ Urban municipality / Stadt |
| DJ | Djibouti | — | ✅ | 10% ✅ | ❌ | ❌ | ✅ Region / Région | ✅ Sub-prefecture / Sous-préfecture |
| DK | Denmark | — | ✅ | 25% ✅ | ❌ | ✅ (1236) | ✅ County / Dansk amt | ✅ Municipality / Kommune |
| DM | Dominica | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Parish / Parish | ❌ |
| DO | Dominican Republic | — | ✅ | 18% ✅ | ❌ | ✅ (89829) | ✅ Province / Provincia | ❌ |
| DZ | Algeria | — | ✅ | 19% ✅ | ❌ | ✅ (21349) | ✅ Province / ولاية | ✅ District / دائرة |
| EC | Ecuador | — | ✅ | 15% ✅ | ❌ | ✅ (v5628u) | ✅ Province / Provincia | ✅ Canton / Cantón |
| EE | Estonia | — | ✅ | 22% ✅ | ❌ | ✅ (81648) | ✅ County / Maakond | ❌ |
| EG | Egypt | — | ✅ | 14% ✅ | ❌ | ✅ (18118) | ✅ Governorate / محافظة | ✅ Marka / مركز |
| EH | Western Sahara | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| ER | Eritrea | — | ✅ | None ✅ | ❌ | ❌ | ❓ Region (en only) | ❌ |
| ES | Spain | — | ✅ | 21% ✅ | ✅ IVA (ESA12345678) | ✅ (28001) | ✅ Autonomous community / Comunidad autónoma | ✅ Province / Provincia |
| ET | Ethiopia | — | ✅ | 15% ✅ | ❌ | ✅ (3965) | ❓ Region (en only) | ❓ District (en only) |
| FI | Finland | — | ✅ | 25.5% ✅ | ❌ | ✅ (67473) | ✅ Region / Maakunta | ✅ Municipality / Kunta |
| FJ | Fiji | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Division / Division | ❌ |
| FK | Falkland Islands | — | ✅ | None ✅ | ❌ | ✅ (FIQQ 1ZZ) | ❌ | ❌ |
| FM | Micronesia | — | ✅ | None ✅ | ❌ | ✅ (31730) | ✅ State / State | ❌ |
| FO | Faroe Islands | — | ✅ | 25% ✅ | ❌ | ✅ (833) | ❌ | ❌ |
| FR | France | — | ✅ | 20% ✅ | ✅ TVA (FRXX123456789) | ✅ (75001) | ✅ Region / Région | ✅ Department / Département |
| GA | Gabon | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Province / Province | ❌ |
| GB | United Kingdom | — | ✅ | 20% ✅ | ✅ VAT (GB123456789) | ✅ (SW1A 1AA) | ✅ Constituent country / Constituent country | ✅ Council area / Council area |
| GD | Grenada | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Parish / Parish | ❌ |
| GE | Georgia | — | ✅ | 18% ✅ | ❌ | ✅ (8132) | ✅ Mkhare / Მხარე | ✅ Municipality / Მუნიციპალიტეტი |
| GF | French Guiana | — | ✅ | None ✅ | ❌ | ✅ (97322) | ✅ Arrondissement / Arrondissement | ✅ Canton / Canton |
| GG | Guernsey | — | ✅ | None ✅ | ❌ | ✅ (FG9P 8XD) | ✅ Island / Island | ✅ Parish / Parish |
| GH | Ghana | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Region / Region | ✅ District / District |
| GI | Gibraltar | — | ✅ | None ✅ | ❌ | ✅ (GX11 1AA) | ❌ | ❌ |
| GL | Greenland | — | ✅ | None ✅ | ❌ | ✅ (7908) | ❓ Municipality (en only) | ❌ |
| GM | Gambia | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Region / Region | ❌ |
| GN | Guinea | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Region / Région | ✅ Prefecture / Préfecture |
| GP | Guadeloupe | — | ✅ | 8.5% ✅ | ❌ | ✅ (97180) | ✅ Commune / Commune | ✅ Canton / Canton |
| GQ | Equatorial Guinea | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Province / Provincia | ❌ |
| GR | Greece | — | ✅ | 24% ✅ | ❌ | ✅ (97100) | ✅ Monastic community / Μοναστική κοινότητα | ✅ Regional unit / Περιφερειακή ενότητα |
| GS | South Georgia and the South Sandwich Islands | — | ✅ | None ✅ | ❌ | ✅ (SIQQ 1ZZ) | ❌ | ❌ |
| GT | Guatemala | — | ✅ | 12% ✅ | ❌ | ✅ (20642) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| GU | Guam | — | ✅ | None ✅ | ❌ | ✅ (96993) | ✅ Village / Village | ✅ Village / Village |
| GW | Guinea-Bissau | — | ✅ | 17% ✅ | ❌ | ✅ (7813) | ✅ Region / Região | ❌ |
| GY | Guyana | — | ✅ | 14% ✅ | ❌ | ❌ | ✅ Region / Region | ❌ |
| HK | Hong Kong | — | ✅ | None ✅ | ❌ | ✅ (992414) | ✅ District / 香港政區 | ❌ |
| HM | Heard Island and McDonald Islands | — | ✅ | None ✅ | ❌ | ✅ (1263) | ❌ | ❌ |
| HN | Honduras | — | ✅ | 15% ✅ | ❌ | ✅ (933464) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| HR | Croatia | — | ✅ | 25% ✅ | ❌ | ✅ (56263) | ✅ County / Županija | ✅ Municipality / Općina |
| HT | Haiti | — | ✅ | 10% ✅ | ❌ | ✅ (HT1400) | ✅ Department / Depatman | ✅ Arrondissement / Lis awondisman |
| HU | Hungary | — | ✅ | 27% ✅ | ❌ | ✅ (0023) | ✅ County / Vármegye | ✅ District / Járás |
| ID | Indonesia | — | ✅ | 11% ✅ | ❌ | ✅ (99937) | ✅ Province / Provinsi | ✅ Regency / Kabupaten |
| IE | Ireland | — | ✅ | 23% ✅ | ❌ | ✅ (D6WYD66) | ✅ County / County | ✅ Municipal district / Municipal district |
| IL | Israel | — | ✅ | 18% ✅ | ❌ | ✅ (54268) | ✅ District / מחוז | ✅ Settlement / התנחלות |
| IM | Isle of Man | — | ✅ | 20% ✅ | ❌ | ✅ (GIR 0AA) | ❌ | ❌ |
| IN | India | — | ✅ | 18% ✅ | ❌ | ✅ (588228) | ✅ State / State | ✅ District / District |
| IO | British Indian Ocean Territory | — | ✅ | None ✅ | ❌ | ✅ (BBND 1ZZ) | ❌ | ❌ |
| IQ | Iraq | — | ✅ | None ✅ | ❌ | ✅ (36299) | ✅ Governorate / محافظة | ✅ District / قضاء |
| IR | Iran | — | ✅ | 10% ✅ | ❌ | ✅ (7920947046) | ✅ Province / استان | ✅ County / شهرستان |
| IS | Iceland | — | ✅ | 24% ✅ | ❌ | ✅ (506) | ✅ Constituency / Kjördæmi | ❌ |
| IT | Italy | — | ✅ | 22% ✅ | ✅ IVA (IT12345678901) | ✅ (00100) | ✅ Region / Regione | ✅ Province / Provincia |
| JE | Jersey | — | ✅ | 5% ✅ | ❌ | ✅ (M26 8YP) | ✅ Parish / Parish | ❌ |
| JM | Jamaica | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ County / County | ✅ Parish / Parish |
| JO | Jordan | — | ✅ | 16% ✅ | ❌ | ✅ (07215) | ✅ Governorate / محافظة | ❌ |
| JP | Japan | — | ✅ | 10% ✅ | ✅ Consumption Tax (T1234567890123) | ✅ (100-0001) | ✅ Prefecture / 都道府県 | ✅ City / 日本の市 |
| KE | Kenya | — | ✅ | 16% ✅ | ❌ | ✅ (89130) | ✅ Province / Province | ❌ |
| KG | Kyrgyzstan | — | ✅ | 12% ✅ | ❌ | ✅ (543637) | ❌ | ❌ |
| KH | Cambodia | — | ✅ | 10% ✅ | ❌ | ✅ (80652) | ✅ Province / ខេត្តនៃកម្ពុជា | ❓ District (en only) |
| KI | Kiribati | — | ✅ | 12.5% ✅ | ❌ | ❌ | ❌ | ❌ |
| KM | Comoros | — | ✅ | None ✅ | ❌ | ❌ | ✅ Volcanic island / جزيرة | ❌ |
| KN | Saint Kitts and Nevis | — | ✅ | 17% ✅ | ❌ | ❌ | ✅ Parish / Parish | ❌ |
| KP | North Korea | — | ✅ | None ✅ | ❌ | ✅ (042645) | ✅ Province / 도 | ✅ County / 군 |
| KR | South Korea | — | ✅ | 10% ✅ | ❌ | ✅ (80166) | ✅ Metropolitan city / 광역시 | ✅ County / 군 |
| KW | Kuwait | — | ✅ | None ✅ | ❌ | ✅ (11393) | ✅ Governorate / محافظة | ❌ |
| KY | Cayman Islands | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| KZ | Kazakhstan | — | ✅ | 12% ✅ | ❌ | ✅ (856442) | ✅ Region / Облыс | ❌ |
| LA | Laos | — | ✅ | 10% ✅ | ❌ | ✅ (09367) | ✅ Province / ແຂວງຂອງປະເທດລາວ | ✅ District / ເມືອງ |
| LB | Lebanon | — | ✅ | 11% ✅ | ❌ | ✅ (56921463) | ✅ Governorate / محافظة | ❌ |
| LC | Saint Lucia | — | ✅ | 12.5% ✅ | ❌ | ❌ | ✅ Quarter / Quarter | ❌ |
| LI | Liechtenstein | — | ✅ | 8.1% ✅ | ❌ | ✅ (3826) | ✅ Municipality / Gemeinde | ❌ |
| LK | Sri Lanka | — | ✅ | 18% ✅ | ❌ | ✅ (25913) | ✅ Province / පළාත | ✅ District / පරිපාලන දිස්ත්රික්කය |
| LR | Liberia | — | ✅ | 10% ✅ | ❌ | ✅ (5886) | ✅ County / County | ❌ |
| LS | Lesotho | — | ✅ | 15% ✅ | ❌ | ✅ (607) | ✅ District / District | ❌ |
| LT | Lithuania | — | ✅ | 21% ✅ | ❌ | ✅ (58325) | ✅ District municipality / Rajono savivaldybė | ✅ Eldership / Seniūnija |
| LU | Luxembourg | — | ✅ | 17% ✅ | ❌ | ✅ (4286) | ✅ Canton / Kanton | ✅ Municipality / Gemeng |
| LV | Latvia | — | ✅ | 21% ✅ | ❌ | ✅ (1402) | ✅ Municipality / Novads | ✅ Parish / Pagasts |
| LY | Libya | — | ✅ | None ✅ | ❌ | ❌ | ✅ District / شعبية | ❌ |
| MA | Morocco | — | ✅ | 20% ✅ | ❌ | ✅ (42905) | ✅ Region / جهة | ✅ Province / إقليم |
| MC | Monaco | — | ✅ | 20% ✅ | ❌ | ✅ (12131) | ✅ Commune / Commune | ❌ |
| MD | Moldova | — | ✅ | 20% ✅ | ❌ | ✅ (MD-4115) | ✅ District / Raion | ✅ Village / Sat |
| ME | Montenegro | — | ✅ | 21% ✅ | ❌ | ✅ (98672) | ✅ Municipality / Општина | ❌ |
| MF | Saint Martin | — | ✅ | None ✅ | ❌ | ✅ (35629) | ❌ | ❌ |
| MG | Madagascar | — | ✅ | 20% ✅ | ❌ | ✅ (868) | ✅ Province / Province | ✅ District / District |
| MH | Marshall Islands | — | ✅ | None ✅ | ❌ | ✅ (96921-7299) | ❓ Reef island (en only) | ❌ |
| MK | North Macedonia | — | ✅ | 18% ✅ | ❌ | ✅ (6836) | ✅ Municipality / Општина | ✅ Municipality / Општина |
| ML | Mali | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Region / Régions | ✅ Human settlement / Établissement humain |
| MM | Myanmar | — | ✅ | 5% ✅ | ❌ | ✅ (55253) | ✅ Region / တိုင်းဒေသကြီး | ❌ |
| MN | Mongolia | — | ✅ | 10% ✅ | ❌ | ✅ (267925) | ✅ Province / Аймаг | ✅ District / Сум |
| MO | Macao | — | ✅ | None ✅ | ❌ | ✅ (384600) | ❌ | ❌ |
| MP | Northern Mariana Islands | — | ✅ | None ✅ | ❌ | ✅ (96951) | ❓ Municipality (en only) | ❌ |
| MQ | Martinique | — | ✅ | 8.5% ✅ | ❌ | ✅ (18226) | ✅ Commune / Commune | ✅ Canton / Canton |
| MR | Mauritania | — | ✅ | 16% ✅ | ❌ | ❌ | ✅ Region / ولاية | ✅ Department / مقاطعة |
| MS | Montserrat | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| MT | Malta | — | ✅ | 18% ✅ | ❌ | ✅ (KCI 0255) | ✅ Region / Reġjuni ta | ✅ Town / Raħal |
| MU | Mauritius | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ District / District | ❌ |
| MV | Maldives | — | ✅ | 8% ✅ | ❌ | ✅ (52098) | ✅ Atoll / އަތޮޅުތައް | ❌ |
| MW | Malawi | — | ✅ | 16.5% ✅ | ❌ | ✅ (026056) | ❓ Region (en only) | ✅ District / Madera |
| MX | Mexico | — | ✅ | 16% ✅ | ❌ | ✅ (92774) | ✅ State / Estado | ✅ Municipality / Municipio |
| MY | Malaysia | — | ✅ | 8% ✅ | ❌ | ✅ (78761) | ✅ State / Negeri | ✅ Division / Bahagian |
| MZ | Mozambique | — | ✅ | 16% ✅ | ❌ | ✅ (9001) | ✅ Province / Província | ✅ District / Distritos |
| NA | Namibia | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Region / Region | ✅ Constituency / Constituency |
| NC | New Caledonia | — | ✅ | 11% ✅ | ❌ | ✅ (56308) | ✅ Commune / Commune | ❌ |
| NE | Niger | — | ✅ | 19% ✅ | ❌ | ✅ (8611) | ✅ Region / Région | ✅ Department / Département |
| NF | Norfolk Island | — | ✅ | None ✅ | ❌ | ✅ (6270) | ❌ | ❌ |
| NG | Nigeria | — | ✅ | 7.5% ✅ | ❌ | ✅ (141240) | ✅ State / State | ✅ Local government area / Local government area |
| NI | Nicaragua | — | ✅ | 15% ✅ | ❌ | ✅ (7583949) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| NL | The Netherlands | — | ✅ | 21% ✅ | ✅ BTW (NL123456789B01) | ✅ (1234 AB) | ✅ Country / Land | ✅ Province / Provincie |
| NO | Norway | — | ✅ | 25% ✅ | ❌ | ✅ (7339) | ❓ County (en only) | ❓ Municipality (en only) |
| NP | Nepal | — | ✅ | 13% ✅ | ❌ | ✅ (32877) | ✅ Province / प्रदेश | ❌ |
| NR | Nauru | — | ✅ | None ✅ | ❌ | ✅ (NRU68) | ❓ District (en only) | ❌ |
| NU | Niue | — | ✅ | None ✅ | ❌ | ✅ (0162) | ❌ | ❌ |
| NZ | New Zealand | — | ✅ | 15% ✅ | ❌ | ✅ (5465) | ✅ Region / Region | ✅ District / District |
| OM | Oman | — | ✅ | 5% ✅ | ❌ | ✅ (191) | ✅ Governorate / محافظة | ❌ |
| PA | Panama | — | ✅ | 7% ✅ | ❌ | ✅ (98175) | ✅ Province / Provincia | ✅ District / Distrito |
| PE | Peru | — | ✅ | 18% ✅ | ❌ | ✅ (38866) | ✅ Department / Departmento | ✅ Province / Provincia |
| PF | French Polynesia | — | ✅ | 16% ✅ | ❌ | ✅ (97783) | ✅ Commune / Commune | ✅ Commune / Commune |
| PG | Papua New Guinea | — | ✅ | 10% ✅ | ❌ | ✅ (844) | ✅ Province / Province | ✅ District / District |
| PH | Philippines | — | ✅ | 12% ✅ | ❌ | ✅ (0261) | ✅ Region / Rehiyon | ✅ Province / Lalawigan |
| PK | Pakistan | — | ✅ | 18% ✅ | ❌ | ✅ (03385) | ✅ Province / صوبہ | ✅ Division / ڈویژن |
| PL | Poland | — | ✅ | 23% ✅ | ✅ VAT (PL1234567890) | ✅ (00-001) | ✅ Voivodeship / Województwo | ✅ Powiat / Powiat |
| PM | Saint Pierre and Miquelon | — | ✅ | None ✅ | ❌ | ✅ (97500) | ✅ Commune / Commune | ✅ Island / Île |
| PN | Pitcairn | — | ✅ | None ✅ | ❌ | ✅ (PCRN 1ZZ) | ❌ | ❌ |
| PR | Puerto Rico | — | ✅ | 11.5% ✅ | ❌ | ✅ (00661-9185) | ✅ Municipality / Municipality | ❌ |
| PS | Palestinian Territory | — | ✅ | 16% ✅ | ❌ | ❌ | ✅ Governorate / محافظة | ✅ Governorate / محافظة |
| PT | Portugal | — | ✅ | 23% ✅ | ❌ | ✅ (4360-103lZ) | ✅ District / Distrito | ✅ Municipality / Município |
| PW | Palau | — | ✅ | 10% ✅ | ❌ | ✅ (96940) | ❓ State (en only) | ❌ |
| PY | Paraguay | — | ✅ | 10% ✅ | ❌ | ✅ (6901) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| QA | Qatar | — | ✅ | None ✅ | ❌ | ❌ | ✅ Municipality / بلدية | ✅ Village / قرية |
| RE | Reunion | — | ✅ | 8.5% ✅ | ❌ | ✅ (98897) | ✅ Arrondissement / Arrondissement | ✅ Canton / Canton |
| RO | Romania | — | ✅ | 19% ✅ | ❌ | ✅ (355006) | ✅ County / Județ | ✅ Commune / Comună |
| RS | Serbia | — | ✅ | 20% ✅ | ❌ | ✅ (04134) | ✅ District / Округ | ✅ Municipality / city / Општина / град |
| RU | Russia | — | ✅ | 20% ✅ | ❌ | ✅ (401742) | ✅ Federal subject / Субъект | ✅ Municipal district / Муниципальный район |
| RW | Rwanda | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Province / Intara | ✅ District / Uturere tw |
| SA | Saudi Arabia | — | ✅ | 15% ✅ | ❌ | ✅ (55154) | ✅ Province / منطقة | ❌ |
| SB | Solomon Islands | — | ✅ | 10% ✅ | ❌ | ❌ | ✅ Province / Province | ❌ |
| SC | Seychelles | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ District / District | ❌ |
| SD | Sudan | — | ✅ | 17% ✅ | ❌ | ✅ (36091) | ✅ State / ولاية | ❌ |
| SE | Sweden | — | ✅ | 25% ✅ | ❌ | ✅ (SE035 25) | ✅ County / Län | ✅ Municipality / Kommun |
| SG | Singapore | — | ✅ | 9% ✅ | ❌ | ✅ (833018) | ❌ | ❌ |
| SH | Saint Helena | — | ✅ | None ✅ | ❌ | ✅ (STHL1ZZ) | ✅ Island / Island | ❌ |
| SI | Slovenia | — | ✅ | 22% ✅ | ❌ | ✅ (9027) | ✅ Municipality / Občina | ❌ |
| SJ | Svalbard and Jan Mayen | — | ✅ | None ✅ | ❌ | ✅ (4802) | ❌ | ❌ |
| SK | Slovakia | — | ✅ | 23% ✅ | ❌ | ✅ (25244) | ✅ Region / Kraje | ✅ District / Okres |
| SL | Sierra Leone | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Province / Province | ❌ |
| SM | San Marino | — | ✅ | 17% ✅ | ❌ | ✅ (47891) | ✅ Municipality / Castelli | ❌ |
| SN | Senegal | — | ✅ | 18% ✅ | ❌ | ✅ (42930) | ✅ Region / Région | ✅ Department / Département |
| SO | Somalia | — | ✅ | None ✅ | ❌ | ✅ (NM05775) | ✅ Region / Gobolada | ❓ District (en only) |
| SR | Suriname | — | ✅ | 10% ✅ | ❌ | ❌ | ✅ District / District | ✅ Ressort / Ressort |
| SS | South Sudan | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ State / State | ❌ |
| ST | Sao Tome and Principe | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Electoral unit / Círculo eleitoral | ✅ District / Distritos |
| SV | El Salvador | — | ✅ | 13% ✅ | ❌ | ✅ (3083) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| SX | Sint Maarten | — | ✅ | 5% ✅ | ❌ | ❌ | ❌ | ❌ |
| SY | Syria | — | ✅ | None ✅ | ❌ | ❌ | ✅ Governorate / محافظة | ✅ District / منطقة |
| SZ | Eswatini | — | ✅ | 15% ✅ | ❌ | ✅ (C802) | ✅ Region / Region | ❌ |
| TC | Turks and Caicos Islands | — | ✅ | None ✅ | ❌ | ✅ (TKCA 1ZZ) | ❌ | ❌ |
| TD | Chad | — | ✅ | 18% ✅ | ❌ | ✅ (TKCA 1ZZ) | ✅ Province / Région | ✅ Department / Départements |
| TF | French Southern Territories | — | ✅ | None ✅ | ❌ | ❌ | ✅ District / District | ✅ Island / Île |
| TG | Togo | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Region / Région | ✅ Prefecture / Préfecture |
| TH | Thailand | — | ✅ | 7% ✅ | ❌ | ✅ (62425) | ✅ Province / จังหวัด | ✅ Amphoe / อำเภอ |
| TJ | Tajikistan | — | ✅ | 14% ✅ | ❌ | ✅ (315783) | ✅ Region / Вилоят | ✅ District / Ноҳия |
| TK | Tokelau | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| TL | Timor Leste | — | ✅ | None ✅ | ❌ | ❌ | ✅ Municipality / Munisipiu | ❌ |
| TM | Turkmenistan | — | ✅ | 15% ✅ | ❌ | ✅ (598089) | ✅ Region / Welaýatlary | ✅ District / Etraplar we şäherler |
| TN | Tunisia | — | ✅ | 19% ✅ | ❌ | ✅ (3529) | ✅ Governorate / ولاية | ✅ Delegation / معتمدية |
| TO | Tonga | — | ✅ | 15% ✅ | ❌ | ❌ | ❓ Division (en only) | ❌ |
| TR | Turkey | — | ✅ | 20% ✅ | ❌ | ✅ (95537) | ✅ Province / Il | ✅ District / Ilçe |
| TT | Trinidad and Tobago | — | ✅ | 12.5% ✅ | ❌ | ❌ | ✅ Regional corporation / Regional corporation | ❌ |
| TV | Tuvalu | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| TW | Taiwan | — | ✅ | 5% ✅ | ❌ | ✅ (76615) | ✅ City / 城市 | ✅ District / 區 |
| TZ | Tanzania | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Region / Mikoa | ✅ District / Wilaya za |
| UA | Ukraine | — | ✅ | 20% ✅ | ❌ | ✅ (84548) | ✅ Oblast / Область | ✅ Raion / Район |
| UG | Uganda | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ District / District | ❌ |
| UM | United States Minor Outlying Islands | — | ✅ | None ✅ | ❌ | ❌ | ✅ Insular area / Insular area | ❌ |
| US | United States | — | ✅ | 2.9–7.25% (regional) ✅ | ✅ Sales Tax (12-3456789) | ✅ (10001) | ✅ State / State | ✅ County / County |
| US-AL | United States — Alabama | — | ↳ | 4% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-AK | United States — Alaska | — | ↳ | None ✅ | ↳ | ↳ | ↳ | ↳ |
| US-AZ | United States — Arizona | — | ↳ | 5.6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-AR | United States — Arkansas | — | ↳ | 6.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-CA | United States — California | — | ↳ | 7.25% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-CO | United States — Colorado | — | ↳ | 2.9% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-CT | United States — Connecticut | — | ↳ | 6.35% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-DC | United States — District of Columbia | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-DE | United States — Delaware | — | ↳ | None ✅ | ↳ | ↳ | ↳ | ↳ |
| US-FL | United States — Florida | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-GA | United States — Georgia | — | ↳ | 4% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-HI | United States — Hawaii | — | ↳ | 4% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-ID | United States — Idaho | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-IL | United States — Illinois | — | ↳ | 6.25% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-IN | United States — Indiana | — | ↳ | 7% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-IA | United States — Iowa | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-KS | United States — Kansas | — | ↳ | 6.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-KY | United States — Kentucky | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-LA | United States — Louisiana | — | ↳ | 4.45% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-ME | United States — Maine | — | ↳ | 5.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MD | United States — Maryland | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MA | United States — Massachusetts | — | ↳ | 6.25% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MI | United States — Michigan | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MN | United States — Minnesota | — | ↳ | 6.875% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MS | United States — Mississippi | — | ↳ | 7% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MO | United States — Missouri | — | ↳ | 4.225% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-MT | United States — Montana | — | ↳ | None ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NE | United States — Nebraska | — | ↳ | 5.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NV | United States — Nevada | — | ↳ | 6.85% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NH | United States — New Hampshire | — | ↳ | None ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NJ | United States — New Jersey | — | ↳ | 6.625% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NM | United States — New Mexico | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NY | United States — New York | — | ↳ | 4% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-NC | United States — North Carolina | — | ↳ | 4.75% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-ND | United States — North Dakota | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-OH | United States — Ohio | — | ↳ | 5.75% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-OK | United States — Oklahoma | — | ↳ | 4.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-OR | United States — Oregon | — | ↳ | None ✅ | ↳ | ↳ | ↳ | ↳ |
| US-PA | United States — Pennsylvania | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-RI | United States — Rhode Island | — | ↳ | 7% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-SC | United States — South Carolina | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-SD | United States — South Dakota | — | ↳ | 4.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-TN | United States — Tennessee | — | ↳ | 7% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-TX | United States — Texas | — | ↳ | 6.25% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-UT | United States — Utah | — | ↳ | 4.85% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-VT | United States — Vermont | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-VA | United States — Virginia | — | ↳ | 5.3% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-WA | United States — Washington | — | ↳ | 6.5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-WV | United States — West Virginia | — | ↳ | 6% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-WI | United States — Wisconsin | — | ↳ | 5% ✅ | ↳ | ↳ | ↳ | ↳ |
| US-WY | United States — Wyoming | — | ↳ | 4% ✅ | ↳ | ↳ | ↳ | ↳ |
| UY | Uruguay | — | ✅ | 22% ✅ | ❌ | ✅ (85541) | ✅ Department / Departamento | ✅ Municipality / Municipio |
| UZ | Uzbekistan | — | ✅ | 12% ✅ | ❌ | ✅ (472091) | ✅ Region / Viloyatlari | ✅ District / Tuman |
| VA | Vatican | — | ✅ | None ✅ | ❌ | ✅ (75708) | ❌ | ❌ |
| VC | Saint Vincent and the Grenadines | — | ✅ | 16% ✅ | ❌ | ❌ | ✅ Parish / Parish | ❌ |
| VE | Venezuela | — | ✅ | 16% ✅ | ❌ | ✅ (9601) | ✅ State / Estado | ✅ Municipality / Municipio |
| VG | British Virgin Islands | — | ✅ | None ✅ | ❌ | ❌ | ❌ | ❌ |
| VI | U.S. Virgin Islands | — | ✅ | None ✅ | ❌ | ✅ (00810) | ❌ | ❌ |
| VN | Vietnam | — | ✅ | 10% ✅ | ❌ | ✅ (054651) | ✅ Province / Tỉnh | ✅ Rural district / Huyện |
| VU | Vanuatu | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Province / Provens | ❌ |
| WF | Wallis and Futuna | — | ✅ | None ✅ | ❌ | ✅ (98610) | ❓ Customary kingdom (en only) | ❌ |
| WS | Samoa | — | ✅ | 15% ✅ | ❌ | ✅ (AS 96799) | ❓ District (en only) | ❌ |
| XK | Kosovo | — | ✅ | 18% ✅ | ❌ | ❌ | ✅ Municipality / Komunat | ❌ |
| YE | Yemen | — | ✅ | 5% ✅ | ❌ | ❌ | ✅ Governorate / محافظة | ✅ District / مديرية |
| YT | Mayotte | — | ✅ | None ✅ | ❌ | ✅ (76865) | ✅ Canton / Canton | ✅ Commune / Commune |
| ZA | South Africa | — | ✅ | 15% ✅ | ❌ | ✅ (8334) | ✅ Province / Izifundazwe zaseNingizimu | ❓ District municipality (en only) |
| ZM | Zambia | — | ✅ | 16% ✅ | ❌ | ✅ (32346) | ✅ Province / Province | ❌ |
| ZW | Zimbabwe | — | ✅ | 15% ✅ | ❌ | ❌ | ✅ Province / Province | ❌ |

<!-- COVERAGE_TABLE_END -->

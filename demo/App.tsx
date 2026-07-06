// Web demo for react-native-address-tax, rendered via react-native-web.
// A country picker + tab switcher across AddressInput and the three
// AddressTaxInput tax-type variants, plus a "custom styled" showcase that
// drives the components entirely through their render props.
import { useMemo, useRef, useState } from "react";
import { Pressable, TextInput as RNTextInput, ScrollView, StyleSheet, Text, View } from "react-native";
import { Select } from "../src/components/Select";
import {
  type AddressCollectionMode,
  AddressInput,
  type AddressInputHandle,
  AddressTaxInput,
  type AddressValue,
  COUNTRY_LIST,
  type ValidationError,
  type ValidationMode,
} from "../src/index";
import { computeTaxOutcome, type TaxOutcome, type TaxType, type TaxValue } from "../src/utils";

const s = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#f8fafc" },
  container: { maxWidth: 520, width: "100%", alignSelf: "center", padding: 24, gap: 16 },
  h1: { fontSize: 22, fontWeight: "700", color: "#0f172a" },
  sub: { fontSize: 13, color: "#64748b", marginTop: -8 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  tab: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: "#e2e8f0" },
  tabActive: { backgroundColor: "#4f46e5" },
  tabText: { fontSize: 13, fontWeight: "600", color: "#475569" },
  tabTextActive: { color: "#ffffff" },
  controls: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    borderRadius: 8,
  },
  controlGroup: { gap: 4 },
  legend: { fontSize: 10, fontWeight: "700", letterSpacing: 0.6, color: "#64748b", textTransform: "uppercase" },
  option: { flexDirection: "row", alignItems: "center", gap: 6 },
  radioDot: {
    width: 14,
    height: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#94a3b8",
    alignItems: "center",
    justifyContent: "center",
  },
  radioDotOn: { borderColor: "#4f46e5" },
  radioInner: { width: 8, height: 8, borderRadius: 999, backgroundColor: "#4f46e5" },
  optionText: { fontSize: 13, color: "#334155" },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: "#9ca3af",
    textTransform: "uppercase",
    marginTop: 8,
  },
  json: { backgroundColor: "#0f172a", borderRadius: 8, padding: 12 },
  jsonText: { fontFamily: "monospace", fontSize: 12, color: "#e2e8f0" },
  card: { backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 10, padding: 16 },
  btn: { backgroundColor: "#4f46e5", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14, alignSelf: "flex-start" },
  btnText: { color: "#ffffff", fontWeight: "600", fontSize: 13 },
});
// --- Tax outcome → display category (ported from the old story _utils) -------

type TaxCategory =
  | "reverse-charge"
  | "standard"
  | "zero-rated"
  | "regional-local-surcharge"
  | "regional"
  | "outside"
  | "no-nexus"
  | "none";

function categorize(o: TaxOutcome): TaxCategory {
  if (o.taxSystem === null) return "none";
  if (o.taxSystem === "oss") return o.flags.buyerSelfAccounts ? "reverse-charge" : "standard";
  if (o.flags.buyerSelfAccounts) return "zero-rated";
  if (o.flags.localSurcharge) return "regional-local-surcharge";
  if (o.flags.regionalRates) return "regional";
  return "outside";
}

const CATEGORY_COLORS: Record<TaxCategory, { bg: string; border: string; text: string }> = {
  "reverse-charge": { bg: "#d1fae5", border: "#10b981", text: "#065f46" },
  standard: { bg: "#fef3c7", border: "#f59e0b", text: "#92400e" },
  "zero-rated": { bg: "#dbeafe", border: "#3b82f6", text: "#1e40af" },
  "regional-local-surcharge": { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
  regional: { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
  outside: { bg: "#f3f4f6", border: "#9ca3af", text: "#374151" },
  "no-nexus": { bg: "#fdf4ff", border: "#a855f7", text: "#6b21a8" },
  none: { bg: "#f9fafb", border: "#e5e7eb", text: "#9ca3af" },
};

function formatRate(rate: number | null): string {
  return rate === null ? "—" : `${rate}%`;
}

function formatTaxLabel(o: TaxOutcome): string | null {
  const { taxLabel: en, localTaxLabel: local } = o;
  if (!en && !local) return null;
  if (!en) return local;
  if (!local || en === local) return en;
  return `${en} / ${local}`;
}

function buildHeadline(category: TaxCategory, o: TaxOutcome, state?: string): string {
  const { taxLabel: name, effectiveTax: rate } = o;
  switch (category) {
    case "none":
      return "No country selected";
    case "no-nexus":
      return "No nexus — not collecting";
    case "reverse-charge":
      return "Reverse Charge";
    case "zero-rated":
      return "Zero-rated Export";
    case "standard":
      return `Standard ${name} — ${rate}%`;
    case "regional-local-surcharge":
      if (!state) return "US Sales Tax — select state";
      return rate === null ? `No ${name} — ${state}` : `${name} — ${state} ${rate}%`;
    case "regional":
      if (!state) return "Canadian GST/HST — select province";
      return rate === null ? `${name} — ${state}` : `${name} — ${state} ${rate}%`;
    default:
      if (!name) return "Outside EU";
      return rate === null ? `Outside EU — ${name}` : `Outside EU — ${name} ${rate}%`;
  }
}

function TaxPanel({ outcome, state, noNexus }: { outcome: TaxOutcome; state?: string; noNexus?: boolean }) {
  const category: TaxCategory = noNexus ? "no-nexus" : categorize(outcome);
  const c = CATEGORY_COLORS[category];
  const label = formatTaxLabel(outcome);
  return (
    <View style={{ backgroundColor: c.bg, borderColor: c.border, borderWidth: 1, borderRadius: 8, padding: 14 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
        <Text style={{ fontWeight: "600", color: c.text, fontSize: 14, flexShrink: 1 }}>
          {buildHeadline(category, outcome, state)}
        </Text>
        <View style={{ alignItems: "flex-end" }}>
          <Text style={{ fontWeight: "700", fontSize: 18, color: c.text }}>{formatRate(outcome.effectiveTax)}</Text>
          {label ? <Text style={{ fontSize: 10, fontWeight: "600", color: c.text, opacity: 0.75 }}>{label}</Text> : null}
        </View>
      </View>
    </View>
  );
}

// --- Demo control widgets -----------------------------------------------------

function RadioGroup<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: readonly T[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={s.controlGroup}>
      <Text style={s.legend}>{legend}</Text>
      {options.map((opt) => (
        <Pressable key={opt} style={s.option} onPress={() => onChange(opt)}>
          <View style={[s.radioDot, value === opt && s.radioDotOn]}>{value === opt ? <View style={s.radioInner} /> : null}</View>
          <Text style={s.optionText}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <Pressable style={s.option} onPress={() => onChange(!checked)}>
      <View style={[s.radioDot, { borderRadius: 4 }, checked && s.radioDotOn]}>
        {checked ? <Text style={{ fontSize: 10, color: "#4f46e5", fontWeight: "700" }}>✓</Text> : null}
      </View>
      <Text style={s.optionText}>{label}</Text>
    </Pressable>
  );
}

function ValidationStatus({ valid, errors }: { valid: boolean; errors: ValidationError[] }) {
  return (
    <View
      style={{
        backgroundColor: valid ? "#d1fae5" : "#fee2e2",
        borderColor: valid ? "#10b981" : "#ef4444",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
      }}
    >
      <Text style={{ fontWeight: "600", color: valid ? "#065f46" : "#991b1b", fontSize: 13 }}>
        {valid ? "✓ valid" : `✗ invalid — ${errors.map((e) => e.field).join(", ")}`}
      </Text>
    </View>
  );
}

function Json({ value }: { value: unknown }) {
  return (
    <View style={s.json}>
      <Text style={s.jsonText}>{JSON.stringify(value, null, 2)}</Text>
    </View>
  );
}

const MODES: readonly AddressCollectionMode[] = ["minimal", "regionMinimal", "region", "full", "fullRegion"];
const VALIDATION_MODES: readonly ValidationMode[] = ["onType", "onBlur", "onSubmit"];

const EMPTY_ADDRESS = (country: string): AddressValue => ({
  line1: "",
  line2: "",
  city: "",
  level1: "",
  postalCode: "",
  country,
});
// --- AddressInput demo -------------------------------------------------------

function AddressWrapper({ country }: { country: string }) {
  const [value, setValue] = useState<AddressValue>(EMPTY_ADDRESS(country));
  const [mode, setMode] = useState<AddressCollectionMode>("full");
  const [validationMode, setValidationMode] = useState<ValidationMode>("onType");
  const [disabled, setDisabled] = useState(false);
  const [validity, setValidity] = useState<{ valid: boolean; errors: ValidationError[] }>({ valid: true, errors: [] });
  const inputRef = useRef<AddressInputHandle>(null);

  // Reset the address when the country picker changes above.
  const lastCountry = useRef(country);
  if (lastCountry.current !== country) {
    lastCountry.current = country;
    setValue(EMPTY_ADDRESS(country));
  }

  return (
    <View style={{ gap: 12 }}>
      <View style={s.controls}>
        <RadioGroup legend="mode" value={mode} options={MODES} onChange={setMode} />
        <RadioGroup legend="validationMode" value={validationMode} options={VALIDATION_MODES} onChange={setValidationMode} />
        <View style={s.controlGroup}>
          <Text style={s.legend}>flags</Text>
          <Toggle label="disabled" checked={disabled} onChange={setDisabled} />
          {validationMode === "onSubmit" ? (
            <Pressable style={s.btn} onPress={() => inputRef.current?.validate()}>
              <Text style={s.btnText}>Validate</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={s.card}>
        <AddressInput
          ref={inputRef}
          value={value}
          onChange={setValue}
          mode={mode}
          validationMode={validationMode}
          disabled={disabled}
          defaultCountry={country || undefined}
          onValidationChange={(valid, errors) => setValidity({ valid, errors })}
        />
      </View>
      <ValidationStatus valid={validity.valid} errors={validity.errors} />
      <Text style={s.sectionLabel}>Address value</Text>
      <Json value={value} />
    </View>
  );
}

// --- AddressTaxInput demo -----------------------------------------------------

function AddressTaxWrapper({ country, taxType }: { country: string; taxType: TaxType }) {
  const [addressValue, setAddressValue] = useState<AddressValue>(EMPTY_ADDRESS(country));
  const [taxValue, setTaxValue] = useState<TaxValue>({});
  const [isBusiness, setIsBusiness] = useState(false);
  const [hasNexus, setHasNexus] = useState(true);
  const [mode, setMode] = useState<AddressCollectionMode>("full");
  const [validationMode, setValidationMode] = useState<ValidationMode>("onType");
  const [taxRequired, setTaxRequired] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [validity, setValidity] = useState<{ valid: boolean; errors: ValidationError[] }>({ valid: true, errors: [] });
  const inputRef = useRef<AddressInputHandle>(null);

  const lastCountry = useRef(country);
  if (lastCountry.current !== country) {
    lastCountry.current = country;
    setAddressValue(EMPTY_ADDRESS(country));
  }

  const effectiveIsBusiness = taxType === "business" ? true : taxType === "individual" ? false : isBusiness;
  const hasTaxId = taxValue.hasIdentifier ?? true;
  const nexusList = hasNexus ? undefined : [];
  const hasCountry = !!(addressValue.country || country);
  const noNexus = !hasNexus && hasCountry;

  const outcome = computeTaxOutcome({
    country: addressValue.country || country,
    isBusiness: effectiveIsBusiness,
    hasTaxId,
    hasNexus,
    state: addressValue.level1,
  });

  return (
    <View style={{ gap: 12 }}>
      <View style={s.controls}>
        <RadioGroup legend="mode" value={mode} options={MODES} onChange={setMode} />
        <RadioGroup legend="validationMode" value={validationMode} options={VALIDATION_MODES} onChange={setValidationMode} />
        <View style={s.controlGroup}>
          <Text style={s.legend}>flags</Text>
          <Toggle label="taxRequired" checked={taxRequired} onChange={setTaxRequired} />
          <Toggle label="has nexus in country" checked={hasNexus} onChange={setHasNexus} />
          <Toggle label="disabled" checked={disabled} onChange={setDisabled} />
          {validationMode === "onSubmit" ? (
            <Pressable style={s.btn} onPress={() => inputRef.current?.validate()}>
              <Text style={s.btnText}>Validate</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
      <View style={s.card}>
        <AddressTaxInput
          ref={inputRef}
          addressValue={addressValue}
          taxType={taxType}
          isBusiness={taxType === "either" ? isBusiness : undefined}
          nexusList={nexusList}
          mode={mode}
          validationMode={validationMode}
          taxRequired={taxRequired}
          disabled={disabled}
          defaultCountry={country || undefined}
          onAddressChange={setAddressValue}
          onTaxChange={setTaxValue}
          onBusinessChange={taxType === "either" ? setIsBusiness : undefined}
          onValidationChange={(valid, errors) => setValidity({ valid, errors })}
        />
      </View>
      <ValidationStatus valid={validity.valid} errors={validity.errors} />
      <Text style={s.sectionLabel}>Tax to collect</Text>
      <TaxPanel outcome={outcome} state={addressValue.level1} noNexus={noNexus} />
      <Text style={s.sectionLabel}>Address value</Text>
      <Json value={addressValue} />
      <Text style={s.sectionLabel}>Tax value</Text>
      <Json value={{ ...taxValue, baseTax: outcome.baseTax, effectiveTax: outcome.effectiveTax }} />
    </View>
  );
}
// ---------------------------------------------------------------------------
// Custom-styled showcase — drives AddressInput entirely through render props,
// replacing every default element with a bespoke look. Demonstrates the
// styling escape hatch that replaced the web version's Tailwind story.
// ---------------------------------------------------------------------------

const custom = StyleSheet.create({
  root: { gap: 14 },
  field: { gap: 6 },
  label: { fontSize: 12, fontWeight: "700", letterSpacing: 0.4, color: "#0f766e", textTransform: "uppercase" },
  input: {
    borderWidth: 2,
    borderColor: "#5eead4",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    backgroundColor: "#f0fdfa",
    color: "#134e4a",
  },
  inputInvalid: { borderColor: "#f43f5e", backgroundColor: "#fff1f2" },
  error: { fontSize: 12, color: "#e11d48", fontWeight: "600" },
});

function CustomStyledWrapper({ country }: { country: string }) {
  const [value, setValue] = useState<AddressValue>(EMPTY_ADDRESS(country));
  const lastCountry = useRef(country);
  if (lastCountry.current !== country) {
    lastCountry.current = country;
    setValue(EMPTY_ADDRESS(country));
  }

  return (
    <View style={s.card}>
      <AddressInput
        value={value}
        onChange={setValue}
        mode="fullRegion"
        defaultCountry={country || undefined}
        style={custom.root}
        renderContainer={({ id, label, required, error, children }) => (
          <View key={id} style={custom.field}>
            <Text nativeID={`${id}-label`} style={custom.label}>
              {label}
              {required ? " *" : ""}
            </Text>
            {children}
            {error ? (
              <Text testID={`${id}-error`} role="alert" style={custom.error}>
                {error}
              </Text>
            ) : null}
          </View>
        )}
        renderInput={({ id, value, onChangeText, onBlur, placeholder, invalid, accessibilityLabel }) => (
          <RNTextInput
            testID={id}
            aria-label={accessibilityLabel}
            style={[custom.input, invalid && custom.inputInvalid]}
            value={value}
            onChangeText={onChangeText}
            onBlur={onBlur}
            placeholder={placeholder}
            placeholderTextColor="#5eead4"
          />
        )}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// App shell — country picker + tab switcher.
// ---------------------------------------------------------------------------

type Tab = "address" | "b2b" | "b2c" | "either" | "custom";

const TABS: { key: Tab; label: string }[] = [
  { key: "address", label: "Address" },
  { key: "b2b", label: "B2B" },
  { key: "b2c", label: "B2C" },
  { key: "either", label: "Either" },
  { key: "custom", label: "Custom styled" },
];

const COUNTRY_OPTIONS = COUNTRY_LIST.map((c) => ({ value: c.code, label: c.name }));

export function App() {
  const [tab, setTab] = useState<Tab>("either");
  const [country, setCountry] = useState("US");

  return (
    <ScrollView style={s.page} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={s.container}>
        <Text style={s.h1}>react-native-address-tax</Text>
        <Text style={s.sub}>International address + consumption-tax input, running on react-native-web.</Text>

        <View style={s.controlGroup}>
          <Text style={s.legend}>country</Text>
          <Select
            id="demo-country"
            accessibilityLabel="Demo country"
            value={country}
            onValueChange={setCountry}
            options={COUNTRY_OPTIONS}
            placeholder="Select country"
          />
        </View>

        <View style={s.tabs}>
          {TABS.map((t) => {
            const active = t.key === tab;
            return (
              <Pressable key={t.key} style={[s.tab, active && s.tabActive]} onPress={() => setTab(t.key)}>
                <Text style={[s.tabText, active && s.tabTextActive]}>{t.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {tab === "address" ? <AddressWrapper country={country} /> : null}
        {tab === "b2b" ? <AddressTaxWrapper country={country} taxType="business" /> : null}
        {tab === "b2c" ? <AddressTaxWrapper country={country} taxType="individual" /> : null}
        {tab === "either" ? <AddressTaxWrapper country={country} taxType="either" /> : null}
        {tab === "custom" ? <CustomStyledWrapper country={country} /> : null}
      </View>
    </ScrollView>
  );
}

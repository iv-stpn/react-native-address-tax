// Web demo for react-native-address-tax, rendered via react-native-web.
// A country picker + tab switcher across AddressInput and the three
// AddressTaxInput tax-type variants, plus a "custom styled" showcase that
// drives the components entirely through their render props.
//
// The heavy lifting lives in sibling modules (styles, controls, TaxPanel,
// wrappers) so no single demo file exceeds the line budget.

import { COUNTRY_LIST } from 'country-data-ts/address';
import { useCallback, useId, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Select } from '../src/components/Select';
import { s } from './styles';
import { AddressTaxWrapper, AddressWrapper, CustomStyledWrapper } from './wrappers';

const TITLE = 'react-native-address-tax';
const SUBTITLE = 'International address + consumption-tax input, running on react-native-web.';
const COUNTRY_LEGEND = 'country';
const COUNTRY_PLACEHOLDER = 'Select country';

type Tab = 'address' | 'b2b' | 'b2c' | 'either' | 'custom';

const TABS: { key: Tab; label: string }[] = [
  { key: 'address', label: 'Address' },
  { key: 'b2b', label: 'B2B' },
  { key: 'b2c', label: 'B2C' },
  { key: 'either', label: 'Either' },
  { key: 'custom', label: 'Custom styled' },
];

const COUNTRY_OPTIONS = COUNTRY_LIST.map((c) => ({ value: c.code, label: c.name }));

type TabButtonProps = { tab: Tab; label: string; active: boolean; onSelect: (tab: Tab) => void };

// Extracted so the per-tab onPress is a stable reference, not an arrow in a `.map`.
function TabButton({ tab, label, active, onSelect }: TabButtonProps) {
  const handlePress = useCallback(() => onSelect(tab), [onSelect, tab]);
  return (
    <Pressable style={[s.tab, active && s.tabActive]} onPress={handlePress}>
      <Text style={[s.tabText, active && s.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

type ActivePanelProps = { tab: Tab; country: string };

// The active showcase. Keyed on country in App so a country change remounts it.
function ActivePanel({ tab, country }: ActivePanelProps) {
  switch (tab) {
    case 'address':
      return <AddressWrapper country={country} />;
    case 'b2b':
      return <AddressTaxWrapper country={country} taxType="business" />;
    case 'b2c':
      return <AddressTaxWrapper country={country} taxType="individual" />;
    case 'either':
      return <AddressTaxWrapper country={country} taxType="either" />;
    default:
      return <CustomStyledWrapper country={country} />;
  }
}

export function App() {
  const [tab, setTab] = useState<Tab>('either');
  const [country, setCountry] = useState('US');
  const countrySelectId = useId();

  return (
    <ScrollView style={s.page} contentContainerStyle={s.pageContent}>
      <View style={s.container}>
        <Text style={s.h1}>{TITLE}</Text>
        <Text style={s.sub}>{SUBTITLE}</Text>

        <View style={s.controlGroup}>
          <Text style={s.legend}>{COUNTRY_LEGEND}</Text>
          <Select
            id={countrySelectId}
            accessibilityLabel="Demo country"
            value={country}
            onValueChange={setCountry}
            options={COUNTRY_OPTIONS}
            placeholder={COUNTRY_PLACEHOLDER}
          />
        </View>

        <View style={s.tabs}>
          {TABS.map((t) => (
            <TabButton key={t.key} tab={t.key} label={t.label} active={t.key === tab} onSelect={setTab} />
          ))}
        </View>

        <ActivePanel key={country} tab={tab} country={country} />
      </View>
    </ScrollView>
  );
}

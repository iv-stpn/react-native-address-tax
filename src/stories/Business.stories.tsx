import type { Story } from "@ladle/react";
import { StoryWrapper } from "./_utils.js";

// Using ISO 2-letter codes as export names to keep stories flat (no per-country sub-folder).

export const AT: Story = () => (
	<StoryWrapper defaultCountry="AT" mode="business" />
);
AT.storyName = "Austria";

export const BE: Story = () => (
	<StoryWrapper defaultCountry="BE" mode="business" />
);
BE.storyName = "Belgium";

export const CH: Story = () => (
	<StoryWrapper defaultCountry="CH" mode="business" />
);
CH.storyName = "Switzerland";

export const DE: Story = () => (
	<StoryWrapper defaultCountry="DE" mode="business" />
);
DE.storyName = "Germany";

export const ES: Story = () => (
	<StoryWrapper defaultCountry="ES" mode="business" />
);
ES.storyName = "Spain";

export const FR: Story = () => (
	<StoryWrapper defaultCountry="FR" mode="business" />
);
FR.storyName = "France";

export const GB: Story = () => (
	<StoryWrapper defaultCountry="GB" mode="business" />
);
GB.storyName = "United Kingdom";

export const IT: Story = () => (
	<StoryWrapper defaultCountry="IT" mode="business" />
);
IT.storyName = "Italy";

export const NL: Story = () => (
	<StoryWrapper defaultCountry="NL" mode="business" />
);
NL.storyName = "Netherlands";

export const PL: Story = () => (
	<StoryWrapper defaultCountry="PL" mode="business" />
);
PL.storyName = "Poland";

export const US: Story = () => (
	<StoryWrapper defaultCountry="US" mode="business" />
);
US.storyName = "United States";

export const CA: Story = () => (
	<StoryWrapper defaultCountry="CA" mode="business" />
);
CA.storyName = "Canada";

export const AU: Story = () => (
	<StoryWrapper defaultCountry="AU" mode="business" />
);
AU.storyName = "Australia";

export const JP: Story = () => (
	<StoryWrapper defaultCountry="JP" mode="business" />
);
JP.storyName = "Japan";

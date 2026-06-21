import type { Story } from "@ladle/react";
import { StoryWrapper } from "./_utils.js";

export const Business: Story = () => <StoryWrapper mode="business" />;
Business.storyName = "Business";

export const Individual: Story = () => <StoryWrapper mode="individual" />;
Individual.storyName = "Individual";

export const IndividualOrBusiness: Story = () => <StoryWrapper mode="toggle" />;
IndividualOrBusiness.storyName = "Individual or Business";

// .storybook/main.ts
import type { StorybookConfig } from '@storybook/html-vite';

const config: StorybookConfig = {
  stories: ["../src/**/*.mdx", "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"],
  addons: [
    "@storybook/addon-essentials",
    "@chromatic-com/storybook",
    "@storybook/addon-interactions",
    "@storybook/addon-a11y",
  ],
  framework: {
    name: "@storybook/html-vite",
    options: {},
  },
  // Optional: Add TypeScript specific settings for Storybook if needed
  // typescript: {
  //   check: true,
  // }
};
export default config;

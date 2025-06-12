import type { Meta, StoryObj } from '@storybook/html';
import { expect, userEvent, within } from '@storybook/test';

import { createPage } from './Page'; // Ensure .ts is resolved

// Define Args type for Page stories - typically empty if no args are directly passed to createPage
type PageArgs = {}; // Or import a specific Props type if createPage accepted them

const meta: Meta<PageArgs> = {
  title: 'Example/Page',
  render: () => createPage(),
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  // No args/argTypes needed here as createPage() takes no arguments directly for its initial render
  // and manages its own state via interactions.
};

export default meta;

type Story = StoryObj<PageArgs>;

export const LoggedOut: Story = {
  // No args needed for this state, it's the default from createPage
};

// More on interaction testing: https://storybook.js.org/docs/writing-tests/interaction-testing
export const LoggedIn: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const loginButton = canvas.getByRole('button', { name: /Log in/i });
    await expect(loginButton).toBeInTheDocument();
    await userEvent.click(loginButton);
    // After click, Log in button should be gone, Log out button should be present
    await expect(loginButton).not.toBeInTheDocument();

    const logoutButton = canvas.getByRole('button', { name: /Log out/i });
    await expect(logoutButton).toBeInTheDocument();
  },
};

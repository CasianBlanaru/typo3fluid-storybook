import type { Meta, StoryObj } from '@storybook/html';
import { fn } from '@storybook/test';
import { createHeader, type HeaderProps } from './Header'; // Ensure .ts is resolved

const meta: Meta<HeaderProps> = {
  title: 'Example/Header',
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  render: (args) => createHeader(args),
  parameters: {
    // More on how to position stories at: https://storybook.js.org/docs/configure/story-layout
    layout: 'fullscreen',
  },
  // All stories inherit these args. They can be overridden per story.
  args: {
    onLogin: fn(),
    onLogout: fn(),
    onCreateAccount: fn(),
    user: undefined, // Explicitly set user to undefined for the default LoggedOut state
  },
  // argTypes can be defined here if more specific controls are needed
  // e.g., for the user object if we wanted to control its name directly.
  // argTypes: {
  //   user: { control: 'object' },
  // },
};

export default meta;

type Story = StoryObj<HeaderProps>;

export const LoggedIn: Story = {
  args: {
    user: {
      name: 'Jane Doe',
    },
  },
};

export const LoggedOut: Story = {
  args: {
    // user is already undefined from meta.args, so this story uses all defaults
  },
};

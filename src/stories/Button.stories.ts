import type { Meta, StoryObj } from '@storybook/html';
import { fn } from '@storybook/test';
import { createButton, type ButtonProps } from './Button'; // Ensure .ts is resolved if needed, or rely on TS resolution

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories
const meta: Meta<ButtonProps> = {
  title: 'Example/Button',
  tags: ['autodocs'],
  render: (args) => createButton(args), // Pass all args to createButton
  argTypes: {
    backgroundColor: { control: 'color' },
    label: { control: 'text' },
    onClick: { action: 'onClick' }, // For logging actions
    primary: { control: 'boolean' },
    size: {
      control: { type: 'select' },
      options: ['small', 'medium', 'large'],
    },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#action-args
  // All stories will inherit this arg if not overridden
  args: {
    onClick: fn(),
    label: 'Button Label', // Provide a default label for all button stories
  },
};

export default meta;

// Define individual stories using StoryObj type
type Story = StoryObj<ButtonProps>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    primary: true,
    // label: 'Button', // Inherited from meta.args, or can override
  },
};

export const Secondary: Story = {
  args: {
    primary: false, // Explicitly set primary to false for secondary
    // label: 'Button', // Inherited
  },
};

export const Large: Story = {
  args: {
    size: 'large',
    // label: 'Button', // Inherited
  },
};

export const Small: Story = {
  args: {
    size: 'small',
    // label: 'Button', // Inherited
  },
};

export const CustomBackground: Story = {
    args: {
        label: 'Custom BG',
        backgroundColor: '#ffcc00', // Example custom background
    }
};

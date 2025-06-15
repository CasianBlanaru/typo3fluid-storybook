import './button.css';

export interface ButtonProps {
  primary?: boolean;
  backgroundColor?: string;
  size?: 'small' | 'medium' | 'large';
  label: string;
  onClick?: () => void;
}

export const createButton = ({
  primary = false,
  size = 'medium',
  backgroundColor,
  label,
  onClick,
}: ButtonProps): HTMLButtonElement => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.innerText = label;
  if (onClick) { // Ensure onClick is only added if it exists
    btn.addEventListener('click', onClick);
  }

  const mode = primary ? 'storybook-button--primary' : 'storybook-button--secondary';
  btn.className = ['storybook-button', `storybook-button--${size}`, mode].join(' ');

  if (backgroundColor) { // Apply backgroundColor only if provided
    btn.style.backgroundColor = backgroundColor;
  }

  return btn;
};

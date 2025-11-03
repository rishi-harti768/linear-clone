'use client';

import { cn } from '@/lib/utils';

interface ToggleProps {
  value?: boolean;
  onChange?: (value: boolean) => void;
  className?: string;
  disabled?: boolean;
  activeClass?: string;
  activeLabelClass?: string;
}

export default function Toggle({
  value = false,
  onChange,
  className,
  disabled = false,
  activeClass = 'bg-primary hover:bg-primary/90',
  activeLabelClass = 'border-primary',
}: ToggleProps) {
  const labelClasses = cn(
    'absolute h-3.5 w-3.5 overflow-hidden border-2 transition duration-200 ease-linear rounded-full cursor-pointer bg-white shadow-sm',
    {
      'left-0 border-border': !value,
      'right-0': value,
      [activeLabelClass]: value,
      'cursor-not-allowed opacity-50': disabled,
    }
  );

  const classes = cn(
    'group relative rounded-full w-8 h-4 transition duration-200 ease-linear cursor-pointer',
    {
      [activeClass]: value && !disabled,
      'bg-muted': !value,
      'cursor-not-allowed opacity-50': disabled,
    },
    className
  );

  const handleClick = () => {
    if (!disabled && onChange) {
      onChange(!value);
    }
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      disabled={disabled}
      className={classes}
      onClick={handleClick}
    >
      <span className={labelClasses} />
    </button>
  );
}

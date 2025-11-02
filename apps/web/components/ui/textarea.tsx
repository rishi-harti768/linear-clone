'use client';

import * as React from 'react';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  errorMessage?: string;
  showCharacterCount?: boolean;
  maxCharacters?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      error,
      errorMessage,
      showCharacterCount,
      maxCharacters,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [charCount, setCharCount] = React.useState(0);

    React.useEffect(() => {
      if (value !== undefined) {
        setCharCount(String(value).length);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setCharCount(e.target.value.length);
      if (onChange) {
        onChange(e);
      }
    };

    return (
      <div className="relative w-full">
        <textarea
          className={cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm transition-colors duration-150',
            'placeholder:text-muted-foreground',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'resize-y',
            error && 'border-destructive focus-visible:ring-destructive',
            className
          )}
          ref={ref}
          value={value}
          onChange={handleChange}
          {...props}
        />
        {showCharacterCount && (
          <div className="mt-1 flex justify-end">
            <span
              className={cn(
                'text-xs text-muted-foreground',
                maxCharacters && charCount > maxCharacters && 'text-destructive'
              )}
            >
              {charCount}
              {maxCharacters && `/${maxCharacters}`}
            </span>
          </div>
        )}
        {error && errorMessage && <p className="mt-1 text-xs text-destructive">{errorMessage}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

export { Textarea };

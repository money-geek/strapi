import * as React from 'react';
import { forwardRef, memo, useEffect, useState } from 'react';

import { TextInput, useComposedRefs, Field } from '@strapi/design-system';

import { useFocusInputField } from '../../hooks/useFocusInputField';
import { type InputProps, useField } from '../Form';

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

interface UseDebouncedInputArgs {
  value: string | undefined;
  onChange: (eventOrPath: React.ChangeEvent<any> | string, value?: any) => void;
  name: string;
  delay?: number;
}

const useDebouncedInput = ({
  value,
  onChange,
  name,
  delay = parseInt(process.env.ADMIN_INPUT_DEBOUNCE_DELAY ?? '500'),
}: UseDebouncedInputArgs) => {
  const [inputValue, setInputValue] = useState<string>(value ?? '');
  const [lastExternalValue, setLastExternalValue] = useState<string>(value ?? '');
  const debouncedInputValue = useDebounce(inputValue, delay);

  useEffect(() => {
    if (debouncedInputValue !== value) {
      const syntheticEvent = {
        target: {
          name,
          value: debouncedInputValue,
        },
      } as React.ChangeEvent<HTMLInputElement>;
      onChange(syntheticEvent);
    }
  }, [debouncedInputValue, value, onChange, name]);

  useEffect(() => {
    const currentValue = value ?? '';
    if (currentValue !== lastExternalValue) {
      setInputValue(currentValue);
      setLastExternalValue(currentValue);
    }
  }, [value, lastExternalValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  return {
    inputValue,
    handleChange,
  };
};

const StringInput = forwardRef<HTMLInputElement, InputProps>(
  ({ name, required, label, hint, labelAction, ...props }, ref) => {
    const field = useField<string>(name);
    const fieldRef = useFocusInputField<HTMLInputElement>(name);

    const { inputValue, handleChange } = useDebouncedInput({
      value: field.value,
      onChange: field.onChange,
      name,
      delay: parseInt(process.env.ADMIN_INPUT_DEBOUNCE_DELAY ?? '500'),
    });

    const composedRefs = useComposedRefs(ref, fieldRef);

    return (
      <Field.Root error={field.error} name={name} hint={hint} required={required}>
        <Field.Label action={labelAction}>{label}</Field.Label>
        <TextInput
          ref={composedRefs}
          onChange={handleChange}
          value={inputValue}
          {...props}
          type="text"
        />
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

const MemoizedStringInput = memo(StringInput);

export { MemoizedStringInput as StringInput };

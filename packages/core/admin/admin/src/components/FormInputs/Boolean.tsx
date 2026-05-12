import { forwardRef, memo } from 'react';

import { Toggle, useComposedRefs, Field, Flex, TextButton } from '@strapi/design-system';
import { useIntl } from 'react-intl';
import { styled } from 'styled-components';

import { useFocusInputField } from '../../hooks/useFocusInputField';
import { useField } from '../Form';

import { InputProps } from './types';

const LabelWrapper = styled.div`
  flex: 1;
  min-width: 0;
  max-width: 100%;

  /* Field.Label internally renders a Flex (div) wrapping the <label>.
     Force it to shrink so the inner <label> can overflow. */
  > div {
    min-width: 0;
    max-width: 100%;
  }
`;

const CustomBooleanInputLabel = styled(Field.Label)`
  display: block;
  overflow-x: auto;
  overflow-y: hidden;
  text-overflow: clip;
  white-space: nowrap;
  min-width: 0;
  max-width: 100%;
`;

const BooleanInput = forwardRef<HTMLInputElement, InputProps>(
  ({ name, required, label, hint, labelAction, ...props }, ref) => {
    const { formatMessage } = useIntl();
    const field = useField<boolean | null>(name);
    const fieldRef = useFocusInputField<HTMLInputElement>(name);

    const composedRefs = useComposedRefs(ref, fieldRef);

    const handleClear = () => {
      field.onChange(name, null);
    };

    const showClearButton = !required && field.value !== null;

    return (
      <Field.Root error={field.error} name={name} hint={hint} required={required} maxWidth="320px">
        <Flex justifyContent="space-between" alignItems="flex-end" gap={2}>
          <LabelWrapper>
            <CustomBooleanInputLabel action={labelAction}>{label}</CustomBooleanInputLabel>
          </LabelWrapper>
          {showClearButton && (
            <TextButton onClick={handleClear}>
              {formatMessage({ id: 'clearLabel', defaultMessage: 'Clear' })}
            </TextButton>
          )}
        </Flex>
        <Toggle
          ref={composedRefs}
          checked={field.value === null ? null : field.value || false}
          offLabel={formatMessage({
            id: 'app.components.ToggleCheckbox.off-label',
            defaultMessage: 'False',
          })}
          onLabel={formatMessage({
            id: 'app.components.ToggleCheckbox.on-label',
            defaultMessage: 'True',
          })}
          onChange={field.onChange}
          name={name}
          {...props}
        />
        <Field.Hint />
        <Field.Error />
      </Field.Root>
    );
  }
);

const MemoizedBooleanInput = memo(BooleanInput);

export { MemoizedBooleanInput as BooleanInput };

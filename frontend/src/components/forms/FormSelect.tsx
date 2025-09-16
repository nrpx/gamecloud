'use client'

import React from 'react'
import { FieldValues } from 'react-hook-form'
import { FormFieldWrapper } from './FormFieldWrapper'
import { FormSelectProps } from './types'

export function FormSelect<T extends FieldValues>({
  name,
  label,
  helperText,
  isRequired,
  isDisabled,
  form,
  rules,
  placeholder,
  options,
  selectProps,
}: FormSelectProps<T>) {
  const {
    register,
    formState: { errors },
  } = form

  const fieldError = errors[name]?.message as string | undefined

  return (
    <FormFieldWrapper
      label={label}
      isRequired={isRequired}
      error={fieldError}
      helperText={helperText}
    >
      <select
        {...register(name, rules)}
        disabled={isDisabled}
        style={{
          backgroundColor: 'var(--chakra-colors-bg)',
          border: `1px solid var(--chakra-colors-${fieldError ? 'red-500' : 'border'})`,
          borderRadius: '6px',
          padding: '8px 12px',
          fontSize: '16px',
          width: '100%',
          outline: 'none',
        }}
        onFocus={(e) => {
          e.target.style.borderColor = fieldError 
            ? 'var(--chakra-colors-red-500)' 
            : 'var(--chakra-colors-gamecloud-primary)';
          e.target.style.boxShadow = `0 0 0 1px var(--chakra-colors-${fieldError ? 'red-500' : 'gamecloud-primary'})`;
        }}
        onBlur={(e) => {
          e.target.style.borderColor = fieldError 
            ? 'var(--chakra-colors-red-500)' 
            : 'var(--chakra-colors-border)';
          e.target.style.boxShadow = 'none';
        }}
        {...selectProps}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FormFieldWrapper>
  )
}
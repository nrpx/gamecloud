'use client'

import React from 'react'
import { Input } from '@chakra-ui/react'
import { FieldValues } from 'react-hook-form'
import { FormFieldWrapper } from './FormFieldWrapper'
import { FormInputProps } from './types'

export function FormInput<T extends FieldValues>({
  name,
  label,
  helperText,
  isRequired,
  isDisabled,
  form,
  rules,
  placeholder,
  type = 'text',
  inputProps,
}: FormInputProps<T>) {
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
      <Input
        {...register(name, rules)}
        placeholder={placeholder}
        type={type}
        disabled={isDisabled}
        bg="bg"
        border="1px solid"
        borderColor={fieldError ? "red.500" : "border"}
        _focus={{
          borderColor: fieldError ? "red.500" : "gamecloud.primary",
          boxShadow: `0 0 0 1px var(--chakra-colors-${fieldError ? "red-500" : "gamecloud-primary"})`,
        }}
        {...inputProps}
      />
    </FormFieldWrapper>
  )
}
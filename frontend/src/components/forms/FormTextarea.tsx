'use client'

import React from 'react'
import { Textarea } from '@chakra-ui/react'
import { FieldValues } from 'react-hook-form'
import { FormFieldWrapper } from './FormFieldWrapper'
import { FormTextareaProps } from './types'

export function FormTextarea<T extends FieldValues>({
  name,
  label,
  helperText,
  isRequired,
  isDisabled,
  form,
  rules,
  placeholder,
  rows = 4,
  textareaProps,
}: FormTextareaProps<T>) {
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
      <Textarea
        {...register(name, rules)}
        placeholder={placeholder}
        rows={rows}
        disabled={isDisabled}
        bg="bg"
        border="1px solid"
        borderColor={fieldError ? "red.500" : "border"}
        _focus={{
          borderColor: fieldError ? "red.500" : "gamecloud.primary",
          boxShadow: `0 0 0 1px var(--chakra-colors-${fieldError ? "red-500" : "gamecloud-primary"})`,
        }}
        resize="vertical"
        {...textareaProps}
      />
    </FormFieldWrapper>
  )
}
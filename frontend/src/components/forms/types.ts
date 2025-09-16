import { UseFormReturn, FieldValues, Path, RegisterOptions } from 'react-hook-form'
import { InputProps, TextareaProps } from '@chakra-ui/react'

export interface BaseFormFieldProps<T extends FieldValues> {
  name: Path<T>
  label?: string
  helperText?: string
  isRequired?: boolean
  isDisabled?: boolean
  form: UseFormReturn<T>
  rules?: RegisterOptions<T, Path<T>>
}

export interface FormInputProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  placeholder?: string
  type?: string
  inputProps?: Omit<InputProps, 'name' | 'value' | 'onChange' | 'onBlur'>
}

export interface FormTextareaProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  placeholder?: string
  rows?: number
  textareaProps?: Omit<TextareaProps, 'name' | 'value' | 'onChange' | 'onBlur'>
}

export interface FormSelectProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  placeholder?: string
  options: Array<{ value: string; label: string }>
  selectProps?: React.SelectHTMLAttributes<HTMLSelectElement>
}

export interface FormFieldWrapperProps {
  label?: string
  isRequired?: boolean
  error?: string
  helperText?: string
  children: React.ReactNode
}

export interface FormFileProps<T extends FieldValues> extends BaseFormFieldProps<T> {
  accept?: string
  multiple?: boolean
  fileProps?: Omit<React.InputHTMLAttributes<HTMLInputElement>, 'name' | 'onChange' | 'type'>
}
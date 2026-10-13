import React from 'react'
import { ChevronDown } from 'lucide-react'
import { SelectOption } from '../../types/master-data.types'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  options?: SelectOption<string | number>[]
  placeholder?: string
  wrapClassName?: string
}

export function Select({
  label,
  error,
  hint,
  options,
  placeholder,
  wrapClassName = '',
  className = '',
  id,
  children,
  ...props
}: SelectProps) {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col gap-1.5 ${wrapClassName}`}>
      {label && (
        <label htmlFor={selectId} className="text-xs font-semibold text-slate-700">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <select
          id={selectId}
          className={`w-full appearance-none rounded-lg border bg-white pl-3 pr-8 py-1.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400'
          } ${className}`}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options
            ? options.map((opt) => (
                <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
                  {opt.label}
                </option>
              ))
            : children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
      </div>

      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </div>
  )
}

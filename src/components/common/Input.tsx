import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  prefixText?: string
  suffixText?: string
  wrapClassName?: string
}

export function Input({
  label,
  error,
  hint,
  prefixText,
  suffixText,
  wrapClassName = '',
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <div className={`flex flex-col gap-1.5 ${wrapClassName}`}>
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-700">
          {label}
          {props.required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center rounded-lg shadow-sm">
        {prefixText && (
          <span className="inline-flex items-center px-3 border border-r-0 border-slate-300 bg-slate-50 text-slate-500 text-xs rounded-l-lg h-9">
            {prefixText}
          </span>
        )}

        <input
          id={inputId}
          className={`w-full rounded-lg border bg-white px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            error
              ? 'border-rose-300 focus:ring-rose-500 bg-rose-50/20'
              : 'border-slate-300 hover:border-slate-400'
          } ${prefixText ? 'rounded-l-none' : ''} ${suffixText ? 'rounded-r-none' : ''} ${className}`}
          {...props}
        />

        {suffixText && (
          <span className="inline-flex items-center px-3 border border-l-0 border-slate-300 bg-slate-50 text-slate-500 text-xs rounded-r-lg h-9">
            {suffixText}
          </span>
        )}
      </div>

      {error ? (
        <span className="text-xs font-medium text-rose-600 animate-in fade-in">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </div>
  )
}

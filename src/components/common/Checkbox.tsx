import React from 'react'

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: React.ReactNode
  description?: string
}

export function Checkbox({
  label,
  description,
  id,
  className = '',
  ...props
}: CheckboxProps) {
  const checkboxId = id || (typeof label === 'string' ? label.toLowerCase().replace(/\s+/g, '-') : undefined)

  return (
    <label htmlFor={checkboxId} className="flex items-start gap-2.5 cursor-pointer select-none text-slate-700">
      <input
        type="checkbox"
        id={checkboxId}
        className={`mt-0.5 size-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer ${className}`}
        {...props}
      />
      <div className="flex flex-col">
        <span className="text-xs sm:text-sm font-medium text-slate-800 leading-tight">{label}</span>
        {description && <span className="text-[11px] text-slate-500 mt-0.5">{description}</span>}
      </div>
    </label>
  )
}

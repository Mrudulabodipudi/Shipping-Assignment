import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface CollapsibleSectionProps {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
  badge,
  className = '',
}: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  return (
    <div className={`rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between text-left transition-colors hover:bg-slate-100/60"
      >
        <div className="flex items-center gap-2.5">
          <ChevronDown
            className={`size-4 text-slate-500 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-800">{title}</span>
              {badge}
            </div>
            {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>

        <span className="text-[11px] font-medium text-blue-600">
          {isOpen ? 'Hide' : 'Show details'}
        </span>
      </button>

      {isOpen && (
        <div className="p-4 border-t border-slate-200 bg-white animate-in fade-in duration-150">
          {children}
        </div>
      )}
    </div>
  )
}

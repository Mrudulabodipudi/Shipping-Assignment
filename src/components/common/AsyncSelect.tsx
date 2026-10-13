import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Search, Loader2, ChevronDown, X, Check } from 'lucide-react'
import { SelectOption } from '../../types/master-data.types'

export interface AsyncSelectProps {
  label?: string
  value?: string
  onChange: (value: string, option?: SelectOption) => void
  fetchOptions: (query: string) => Promise<SelectOption[]>
  getInitialLabel?: (value: string) => Promise<string>
  placeholder?: string
  error?: string
  hint?: string
  disabled?: boolean
  required?: boolean
  wrapClassName?: string
  actionButton?: React.ReactNode
}

export function AsyncSelect({
  label,
  value = '',
  onChange,
  fetchOptions,
  getInitialLabel,
  placeholder = 'Select an option...',
  error,
  hint,
  disabled = false,
  required = false,
  wrapClassName = '',
  actionButton,
}: AsyncSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [options, setOptions] = useState<SelectOption[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedLabel, setSelectedLabel] = useState<string>('')

  const containerRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Resolve initial label if value is present
  useEffect(() => {
    let active = true
    if (!value) {
      setSelectedLabel('')
      return
    }

    if (getInitialLabel) {
      getInitialLabel(value).then((resolved) => {
        if (active) setSelectedLabel(resolved)
      }).catch(() => {
        if (active) setSelectedLabel(value)
      })
    } else {
      // Look in existing options or fallback to value
      const match = options.find((o) => String(o.value) === String(value))
      if (match) setSelectedLabel(match.label)
      else setSelectedLabel(value)
    }

    return () => {
      active = false
    }
  }, [value, getInitialLabel, options])

  // Fetch options when dropdown opens or query changes
  const executeSearch = useCallback(
    async (q: string) => {
      setLoading(true)
      try {
        const results = await fetchOptions(q)
        setOptions(results)
      } catch (err) {
        console.error('AsyncSelect search error:', err)
        setOptions([])
      } finally {
        setLoading(false)
      }
    },
    [fetchOptions]
  )

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        void executeSearch(query)
      }, 150)
      return () => clearTimeout(timer)
    }
  }, [isOpen, query, executeSearch])

  // Focus search input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 50)
    }
  }, [isOpen])

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (opt: SelectOption) => {
    setSelectedLabel(opt.label)
    onChange(String(opt.value), opt)
    setIsOpen(false)
    setQuery('')
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedLabel('')
    onChange('', undefined)
  }

  return (
    <div className={`flex flex-col gap-1.5 relative ${wrapClassName}`} ref={containerRef}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-slate-700">
            {label}
            {required && <span className="text-rose-500 ml-0.5">*</span>}
          </label>
        )}
        {actionButton && <div className="text-xs">{actionButton}</div>}
      </div>

      <div
        onClick={() => !disabled && setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between rounded-lg border bg-white px-3 py-1.5 text-sm cursor-pointer transition-colors select-none ${
          disabled
            ? 'bg-slate-50 text-slate-400 cursor-not-allowed border-slate-200'
            : error
            ? 'border-rose-300 ring-1 ring-rose-300 bg-rose-50/20'
            : isOpen
            ? 'border-blue-600 ring-2 ring-blue-600/20'
            : 'border-slate-300 hover:border-slate-400'
        }`}
      >
        <span className={`truncate ${selectedLabel ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
          {selectedLabel || placeholder}
        </span>

        <div className="flex items-center gap-1 ml-2 shrink-0">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
            >
              <X className="size-3.5" />
            </button>
          )}
          <ChevronDown className={`size-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-full bg-white rounded-lg border border-slate-200 shadow-xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-100 max-h-72 flex flex-col">
          <div className="p-2 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2">
            <Search className="size-3.5 text-slate-400 shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter..."
              className="w-full text-xs bg-transparent border-none outline-none text-slate-800 placeholder:text-slate-400"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="size-3" />
              </button>
            )}
          </div>

          <div className="overflow-y-auto max-h-56 divide-y divide-slate-50">
            {loading ? (
              <div className="p-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <Loader2 className="size-4 animate-spin text-blue-600" />
                <span>Loading options...</span>
              </div>
            ) : options.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">
                No matching results found
              </div>
            ) : (
              options.map((opt) => {
                const isSelected = String(opt.value) === String(value)
                return (
                  <div
                    key={String(opt.value)}
                    onClick={() => handleSelect(opt)}
                    className={`px-3 py-2 text-xs cursor-pointer flex items-center justify-between transition-colors ${
                      isSelected
                        ? 'bg-blue-50 text-blue-900 font-semibold'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex flex-col truncate pr-2">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[10px] text-slate-400 font-normal">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && <Check className="size-3.5 text-blue-600 shrink-0" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {error ? (
        <span className="text-xs font-medium text-rose-600">{error}</span>
      ) : hint ? (
        <span className="text-xs text-slate-500">{hint}</span>
      ) : null}
    </div>
  )
}

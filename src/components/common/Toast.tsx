import React, { createContext, useContext, useState, useCallback } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

export interface ToastMessage {
  id: string
  type: 'success' | 'error' | 'info'
  text: string
}

interface ToastContextType {
  success: (msg: string) => void
  error: (msg: string) => void
  info: (msg: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const addToast = useCallback((type: 'success' | 'error' | 'info', text: string) => {
    const id = Math.random().toString(36).slice(2, 9)
    setToasts((prev) => [...prev, { id, type, text }])

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const success = useCallback((text: string) => addToast('success', text), [addToast])
  const error = useCallback((text: string) => addToast('error', text), [addToast])
  const info = useCallback((text: string) => addToast('info', text), [addToast])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ success, error, info }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center justify-between p-3.5 rounded-lg border shadow-lg text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${
              t.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : t.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-900'
                : 'bg-blue-50 border-blue-200 text-blue-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {t.type === 'success' && <CheckCircle2 className="size-4.5 text-emerald-600 shrink-0" />}
              {t.type === 'error' && <AlertCircle className="size-4.5 text-rose-600 shrink-0" />}
              {t.type === 'info' && <Info className="size-4.5 text-blue-600 shrink-0" />}
              <span className="font-medium text-xs sm:text-sm">{t.text}</span>
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="ml-2 text-slate-400 hover:text-slate-700 transition-colors p-0.5 rounded"
            >
              <X className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    return {
      success: (msg: string) => console.log('[Toast SUCCESS]', msg),
      error: (msg: string) => console.error('[Toast ERROR]', msg),
      info: (msg: string) => console.log('[Toast INFO]', msg),
    }
  }
  return ctx
}

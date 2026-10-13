import { Check, FileText, Package, Receipt, Send } from 'lucide-react'
import { TabKey } from '../../hooks/useShippingBill'

export interface WorkflowProgressProps {
  currentTab: TabKey
  onSelectTab: (tab: TabKey) => void
  isNew?: boolean
}

export function WorkflowProgress({
  currentTab,
  onSelectTab,
}: WorkflowProgressProps) {
  const steps: { id: TabKey; title: string; subtitle: string; icon: typeof FileText; index: number }[] = [
    {
      id: 'details',
      title: '1. Shipment Basics',
      subtitle: 'Parties, Ports & Weights',
      icon: Package,
      index: 1,
    },
    {
      id: 'invoices',
      title: '2. Invoices & Goods',
      subtitle: 'Line items, HS codes & Drawbacks',
      icon: Receipt,
      index: 2,
    },
    {
      id: 'documents',
      title: '3. Cargo & Documents',
      subtitle: 'Containers, e-Sanchit & Licences',
      icon: FileText,
      index: 3,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {steps.map((step) => {
        const isActive = currentTab === step.id
        const isCompleted =
          (step.id === 'details' && currentTab !== 'details') ||
          (step.id === 'invoices' && currentTab === 'documents')
        const Icon = step.icon

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => onSelectTab(step.id)}
            className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
              isActive
                ? 'bg-blue-50/80 border-blue-500 ring-1 ring-blue-500/20 shadow-xs'
                : isCompleted
                ? 'bg-white border-slate-200 hover:border-slate-300'
                : 'bg-white/60 border-slate-200 opacity-80 hover:opacity-100 hover:border-slate-300'
            }`}
          >
            <div
              className={`size-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : isCompleted
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {isCompleted ? <Check className="size-4 text-emerald-700" /> : <Icon className="size-4" />}
            </div>

            <div className="truncate">
              <span
                className={`text-xs sm:text-sm font-semibold block leading-tight truncate ${
                  isActive ? 'text-blue-950' : 'text-slate-800'
                }`}
              >
                {step.title}
              </span>
              <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                {step.subtitle}
              </span>
            </div>
          </button>
        )
      })}
    </div>
  )
}

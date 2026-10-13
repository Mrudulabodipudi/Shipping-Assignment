import { Plus, Receipt, AlertCircle } from 'lucide-react'
import { calculateShippingBillTotals } from '../../domain/calculations'
import { BillInvoiceForm, ShippingBillFormValues } from '../../types/shipping-bill.types'
import { Button } from '../common/Button'
import { InvoiceCard } from './InvoiceCard'

export interface InvoicesStepProps {
  values: ShippingBillFormValues
  errors: Record<string, string>
  onUpdateInvoice: (index: number, updater: (inv: BillInvoiceForm) => BillInvoiceForm) => void
  onAddInvoice: () => void
  onRemoveInvoice: (index: number) => void
}

export function InvoicesStep({
  values,
  errors,
  onUpdateInvoice,
  onAddInvoice,
  onRemoveInvoice,
}: InvoicesStepProps) {
  const totals = calculateShippingBillTotals(values)

  return (
    <div className="space-y-6">
      {/* Header & Aggregate Stats Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-blue-200 bg-blue-50/50 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <Receipt className="size-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              Commercial Invoices & Merchandise Declarations
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-0.5">
            Declare all export invoices, HS / RITC classifications, drawback schedules, and values.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="text-right px-3 py-1 bg-white rounded-lg border border-slate-200 shadow-2xs">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-medium">
              Total Declared Lines
            </span>
            <span className="text-sm font-bold text-slate-900">
              {totals.totalInvoices} {totals.totalInvoices === 1 ? 'Invoice' : 'Invoices'} · {totals.totalItems} Items
            </span>
          </div>

          <Button
            type="button"
            onClick={onAddInvoice}
            className="shadow-sm bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="size-4" />
            Add Invoice
          </Button>
        </div>
      </div>

      {errors.invoices && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-center gap-2 text-xs font-medium text-rose-800">
          <AlertCircle className="size-4 text-rose-600 shrink-0" />
          <span>{errors.invoices}</span>
        </div>
      )}

      {/* Invoices List */}
      <div className="space-y-6">
        {values.invoices.map((inv, index) => (
          <InvoiceCard
            key={index}
            invoice={inv}
            index={index}
            totalInvoices={values.invoices.length}
            consigneeId={values.consigneeId}
            consigneeBranchId={values.consigneeBranchId}
            errors={errors}
            onUpdate={(updater) => onUpdateInvoice(index, updater)}
            onRemove={() => onRemoveInvoice(index)}
          />
        ))}
      </div>

      {/* Bottom Add Invoice Button */}
      <div className="flex justify-center pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onAddInvoice}
          className="w-full sm:w-auto px-8 border-dashed border-slate-300 text-slate-700 hover:border-blue-400 hover:bg-blue-50/50"
        >
          <Plus className="size-4 text-blue-600" />
          Add Another Commercial Invoice
        </Button>
      </div>
    </div>
  )
}

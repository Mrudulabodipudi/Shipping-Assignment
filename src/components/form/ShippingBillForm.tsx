import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Download,
  FileCheck2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react'
import { useShippingBill } from '../../hooks/useShippingBill'
import { shippingBillService } from '../../services/api/shippingBillService'
import { SavedBill } from '../../types/shipping-bill.types'
import { calculateShippingBillTotals } from '../../domain/calculations'
import { downloadIcegateFile } from '../../domain/icegateFlatFile'
import { Button } from '../common/Button'
import { Modal } from '../common/Modal'
import { useToast } from '../common/Toast'
import { InvoicesStep } from './InvoicesStep'
import { OthersStep } from './OthersStep'
import { ShipmentBasicsStep } from './ShipmentBasicsStep'
import { WorkflowProgress } from './WorkflowProgress'

export interface ShippingBillFormProps {
  initialBill?: SavedBill
  onBack: () => void
  onSaved: (bill: SavedBill) => void
}

export function ShippingBillForm({
  initialBill,
  onBack,
  onSaved,
}: ShippingBillFormProps) {
  const toast = useToast()
  const form = useShippingBill(initialBill)
  const [isValidating, setIsValidating] = useState(false)
  const [validationModalOpen, setValidationModalOpen] = useState(false)
  const [validationReport, setValidationReport] = useState<{
    isValid: boolean
    errors: Record<string, string>
    warnings: Record<string, string>
  } | null>(null)

  const totals = calculateShippingBillTotals(form.values)

  // Handle manual draft save
  const handleSaveDraft = async () => {
    const saved = await form.saveDraft()
    if (saved) {
      toast.success(`Draft saved (Job #${saved.values.jobNumber || saved.id})`)
      onSaved(saved)
    } else {
      toast.error('Failed to save draft')
    }
  }

  // Handle EDI Flat File download
  const handleDownloadFlatFile = () => {
    try {
      downloadIcegateFile({
        id: form.billId || 3000,
        values: form.values,
      })
      toast.success(`ICEGATE Flat File (.sb) generated and downloaded`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate flat file')
    }
  }

  // Handle full async validation report
  const handleRunValidation = async () => {
    setIsValidating(true)
    try {
      const report = await shippingBillService.validate(form.values)
      setValidationReport(report)
      setValidationModalOpen(true)
      if (report.isValid) {
        toast.success('Customs validation passed with 0 blocking errors')
      } else {
        toast.error(`Found ${Object.keys(report.errors).length} validation errors`)
      }
    } catch (err) {
      console.error(err)
      toast.error('Validation service failed')
    } finally {
      setIsValidating(false)
    }
  }

  // Handle final submission / filing
  const handleFinalSubmit = async () => {
    const report = await shippingBillService.validate(form.values)
    if (!report.isValid) {
      setValidationReport(report)
      setValidationModalOpen(true)
      form.setErrors(report.errors)
      toast.error('Please resolve validation errors before filing')
      return
    }

    const saved = await form.saveDraft()
    if (saved) {
      // Mark as filed / ready
      toast.success(`Shipping Bill #${saved.values.jobNumber || saved.id} filed successfully!`)
      onSaved(saved)
      onBack()
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Bar with Navigation & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-1.5"
          >
            <ArrowLeft className="size-3.5" />
            Back to Shipping Bills
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {form.billId ? `Edit Shipping Bill #${form.values.jobNumber || form.billId}` : 'New Shipping Bill'}
            </h1>
            {form.lastSavedTime && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                <Clock className="size-3" />
                Saved at {form.lastSavedTime}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRunValidation}
            isLoading={isValidating}
            className="text-slate-700 bg-white"
          >
            <FileCheck2 className="size-3.5 text-emerald-600" />
            Validate Bill
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadFlatFile}
            className="text-slate-700 bg-white"
          >
            <Download className="size-3.5 text-blue-600" />
            ICEGATE Flat File (.sb)
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSaveDraft}
            isLoading={form.isSaving}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Save className="size-3.5" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Workflow Step Tracker */}
      <WorkflowProgress
        currentTab={form.activeTab}
        onSelectTab={(tab) => form.setActiveTab(tab)}
        isNew={!form.billId}
      />

      {/* Active Step Content */}
      <div className="transition-all duration-200">
        {form.activeTab === 'details' && (
          <ShipmentBasicsStep
            values={form.values}
            errors={form.errors}
            warnings={form.warnings}
            onFieldChange={form.setFieldValue}
          />
        )}

        {form.activeTab === 'invoices' && (
          <InvoicesStep
            values={form.values}
            errors={form.errors}
            onUpdateInvoice={form.updateInvoice}
            onAddInvoice={form.addInvoice}
            onRemoveInvoice={form.removeInvoice}
          />
        )}

        {form.activeTab === 'documents' && (
          <OthersStep
            values={form.values}
            errors={form.errors}
            onAddContainer={form.addContainer}
            onRemoveContainer={form.removeContainer}
            onUpdateContainer={form.updateContainer}
            onAddPackingRange={form.addPackingRange}
            onRemovePackingRange={form.removePackingRange}
            onUpdatePackingRange={form.updatePackingRange}
            onAddDocument={form.addDocument}
            onRemoveDocument={form.removeDocument}
            onUpdateDocument={form.updateDocument}
            onAddLicense={form.addLicense}
            onRemoveLicense={form.removeLicense}
            onUpdateLicense={form.updateLicense}
          />
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="sticky bottom-0 z-30 p-4 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-md shadow-lg flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" type="button" onClick={onBack}>
            Cancel
          </Button>

          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 border-l border-slate-200 pl-4">
            <span>
              Declared Value:{' '}
              <strong className="text-slate-800">
                {totals.currencies[0] || 'USD'} {totals.grandTotalAmount.toFixed(2)}
              </strong>
            </span>
            <span>·</span>
            <span>{totals.totalItems} line items</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {form.activeTab !== 'details' && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={form.goToPreviousStep}
            >
              <ArrowLeft className="size-3.5" />
              Previous Step
            </Button>
          )}

          {form.activeTab !== 'documents' ? (
            <Button
              type="button"
              size="sm"
              onClick={async () => {
                const ok = await form.goToNextStep()
                if (ok) {
                  toast.success('Step saved, advancing to next step')
                } else {
                  toast.error('Please correct the highlighted fields before proceeding')
                }
              }}
              isLoading={form.isSaving}
            >
              <span>Save & Next Step</span>
              <ArrowRight className="size-3.5" />
            </Button>
          ) : (
            <Button
              type="button"
              size="sm"
              onClick={handleFinalSubmit}
              isLoading={form.isSaving}
              className="bg-emerald-600 hover:bg-emerald-700 shadow-sm"
            >
              <Sparkles className="size-3.5" />
              <span>Complete & File Bill</span>
            </Button>
          )}
        </div>
      </div>

      {/* Validation Report Modal */}
      {validationModalOpen && validationReport && (
        <Modal
          isOpen={validationModalOpen}
          onClose={() => setValidationModalOpen(false)}
          title="ICEGATE Customs Validation Report"
          description="Automated pre-filing validation against Indian customs regulatory EDI specifications."
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div
              className={`p-3.5 rounded-lg border flex items-center gap-3 ${
                validationReport.isValid
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              {validationReport.isValid ? (
                <FileCheck2 className="size-5 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="size-5 text-rose-600 shrink-0" />
              )}
              <div className="text-xs">
                <span className="font-bold text-sm block">
                  {validationReport.isValid
                    ? 'All Customs Validation Rules Passed'
                    : `${Object.keys(validationReport.errors).length} Required Validation Issues Found`}
                </span>
                <span className="text-[11px] opacity-90">
                  {validationReport.isValid
                    ? 'This declaration is structurally compliant and ready for ICEGATE transmission.'
                    : 'The fields listed below must be completed or corrected before filing.'}
                </span>
              </div>
            </div>

            {Object.keys(validationReport.errors).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Errors ({Object.keys(validationReport.errors).length})
                </h4>
                <div className="max-h-48 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-slate-50/50">
                  {Object.entries(validationReport.errors).map(([field, msg]) => (
                    <div key={field} className="p-2.5 text-xs flex items-start gap-2">
                      <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded shrink-0">
                        {field}
                      </span>
                      <span className="text-slate-700">{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {Object.keys(validationReport.warnings).length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Warnings ({Object.keys(validationReport.warnings).length})
                </h4>
                <div className="max-h-36 overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-lg bg-slate-50/50">
                  {Object.entries(validationReport.warnings).map(([field, msg]) => (
                    <div key={field} className="p-2 text-xs flex items-start gap-2">
                      <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded shrink-0">
                        {field}
                      </span>
                      <span className="text-slate-600">{msg}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                size="sm"
                variant="primary"
                onClick={() => setValidationModalOpen(false)}
              >
                Close & Return to Form
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}

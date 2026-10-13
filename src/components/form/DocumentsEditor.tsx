import { Plus, Trash2, FileCheck } from 'lucide-react'
import { masterDataService } from '../../services/api/masterDataService'
import { SupportingDocForm } from '../../types/shipping-bill.types'
import { AsyncSelect } from '../common/AsyncSelect'
import { Button } from '../common/Button'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { Input } from '../common/Input'
import { Select } from '../common/Select'

export interface DocumentsEditorProps {
  documents: SupportingDocForm[]
  errors: Record<string, string>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, partial: Partial<SupportingDocForm>) => void
}

export function DocumentsEditor({
  documents,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: DocumentsEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <FileCheck className="size-4 text-blue-600" />
            e-SANCHIT Supporting Documents ({documents.length})
          </h4>
          <p className="text-xs text-slate-500">
            Upload document metadata & IRN (Image Reference Numbers) required for digital paperless clearance.
          </p>
        </div>

        <Button
          size="sm"
          variant="outline"
          type="button"
          onClick={onAdd}
          className="border-slate-300 text-slate-700 hover:bg-slate-50"
        >
          <Plus className="size-3.5" />
          Add Document
        </Button>
      </div>

      {documents.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
          <p className="text-xs text-slate-500 mb-2">
            No supporting documents added yet. (e.g. Commercial Invoice, Packing List, Certificate of Origin).
          </p>
          <Button size="sm" variant="outline" type="button" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add First Supporting Document
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {documents.map((doc, index) => {
            const typeErr = errors[`documents.${index}.documentTypeCode`]
            const refErr = errors[`documents.${index}.documentReferenceNumber`]

            return (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Supporting Document #{index + 1}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    type="button"
                    onClick={() => onRemove(index)}
                    className="text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="sm:col-span-2">
                    <AsyncSelect
                      label="Document Type Code (e-SANCHIT)"
                      required
                      value={doc.documentTypeCode}
                      error={typeErr}
                      placeholder="Search document type..."
                      fetchOptions={async (query) => {
                        const list = await masterDataService.getDocumentCodes(query)
                        return list.map((d) => ({
                          value: d.value,
                          label: d.label,
                        }))
                      }}
                      onChange={(code) => onUpdate(index, { documentTypeCode: code })}
                    />
                  </div>

                  <Input
                    label="Document Reference Number"
                    required
                    value={doc.documentReferenceNumber}
                    onChange={(e) =>
                      onUpdate(index, { documentReferenceNumber: e.target.value })
                    }
                    error={refErr}
                    placeholder="e.g. INV-2081-COMM"
                  />

                  <Input
                    label="ICEGATE IRN (Image Reference #)"
                    value={doc.imageReferenceNumber || ''}
                    onChange={(e) =>
                      onUpdate(index, { imageReferenceNumber: e.target.value })
                    }
                    placeholder="e.g. IRN993821039"
                    hint="IRN received from e-Sanchit upload"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Issue Date"
                    type="date"
                    value={doc.documentIssueDate || ''}
                    onChange={(e) => onUpdate(index, { documentIssueDate: e.target.value })}
                  />

                  <Input
                    label="Place of Issue"
                    value={doc.placeOfIssue || ''}
                    onChange={(e) => onUpdate(index, { placeOfIssue: e.target.value })}
                    placeholder="e.g. Mumbai, India"
                  />

                  <Select
                    label="Digital File Format"
                    value={doc.fileType || 'pdf'}
                    onChange={(e) => onUpdate(index, { fileType: e.target.value })}
                    options={[
                      { value: 'pdf', label: 'PDF Document (.pdf)' },
                      { value: 'jpg', label: 'JPEG Image (.jpg)' },
                    ]}
                  />
                </div>

                {/* Additional Issuing & Beneficiary Party info */}
                <CollapsibleSection title="Issuing & Beneficiary Party Details" subtitle="Name, address, PIN of issuing institution">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Input
                      label="Issuing Party Name"
                      value={doc.issuingPartyName || ''}
                      onChange={(e) => onUpdate(index, { issuingPartyName: e.target.value })}
                      placeholder="e.g. Apparel Export Promotion Council"
                    />
                    <Input
                      label="Issuing City & PIN"
                      value={doc.issuingPartyCity || ''}
                      onChange={(e) => onUpdate(index, { issuingPartyCity: e.target.value })}
                      placeholder="City"
                    />
                    <Input
                      label="Beneficiary Party Name"
                      value={doc.beneficiaryPartyName || ''}
                      onChange={(e) => onUpdate(index, { beneficiaryPartyName: e.target.value })}
                      placeholder="Beneficiary Entity Name"
                    />
                    <Input
                      label="Beneficiary City"
                      value={doc.beneficiaryPartyCity || ''}
                      onChange={(e) => onUpdate(index, { beneficiaryPartyCity: e.target.value })}
                      placeholder="Beneficiary City"
                    />
                  </div>
                </CollapsibleSection>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

import { Plus, Trash2, Award } from 'lucide-react'
import { LicenseForm } from '../../types/shipping-bill.types'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Select } from '../common/Select'

export interface LicensesEditorProps {
  licenses: LicenseForm[]
  errors: Record<string, string>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, partial: Partial<LicenseForm>) => void
}

export function LicensesEditor({
  licenses,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: LicensesEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Award className="size-4 text-blue-600" />
            DGFT Export Licences & Schemes ({licenses.length})
          </h4>
          <p className="text-xs text-slate-500">
            Enter licence numbers only when shipping under Advance Authorisation, EPCG, or DFIA.
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
          Add Licence
        </Button>
      </div>

      {licenses.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
          <p className="text-xs text-slate-500 mb-2">
            No export licences declared. (Leave empty if shipping under free shipping bill or non-licence scheme).
          </p>
          <Button size="sm" variant="outline" type="button" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add Licence Declaration
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {licenses.map((lic, index) => {
            const regErr = errors[`licenses.${index}.registrationNumber`]

            return (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Export Licence #{index + 1}
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
                  <Input
                    label="Licence Registration Number"
                    required
                    value={lic.registrationNumber}
                    onChange={(e) =>
                      onUpdate(index, { registrationNumber: e.target.value.toUpperCase() })
                    }
                    error={regErr}
                    placeholder="e.g. 0310982341"
                  />

                  <Input
                    label="Registration Date"
                    type="date"
                    value={lic.registrationDate || ''}
                    onChange={(e) => onUpdate(index, { registrationDate: e.target.value })}
                  />

                  <Select
                    label="Source of Goods"
                    value={lic.indigenousOrImported || 'D'}
                    onChange={(e) =>
                      onUpdate(index, { indigenousOrImported: e.target.value })
                    }
                    options={[
                      { value: 'D', label: 'D - Indigenous (Domestic Sourcing)' },
                      { value: 'I', label: 'I - Imported (Bonded / Advance Auth)' },
                    ]}
                  />

                  <Input
                    label="Licence Serial Number"
                    value={lic.licenseSerialNumber || ''}
                    onChange={(e) => onUpdate(index, { licenseSerialNumber: e.target.value })}
                    placeholder="e.g. 1"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <Input
                    label="Allocated Licence Quantity"
                    type="number"
                    value={lic.licenseQuantity || ''}
                    onChange={(e) => onUpdate(index, { licenseQuantity: e.target.value })}
                    placeholder="Qty permitted under licence"
                  />
                  <Input
                    label="Current Export Quantity"
                    type="number"
                    value={lic.licenseExportQuantity || ''}
                    onChange={(e) =>
                      onUpdate(index, { licenseExportQuantity: e.target.value })
                    }
                    placeholder="Qty exported in this bill"
                  />
                  <Input
                    label="Linked Item Serial Number"
                    type="number"
                    value={lic.itemSerialNumber || '1'}
                    onChange={(e) => onUpdate(index, { itemSerialNumber: e.target.value })}
                    placeholder="Item S.No"
                  />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

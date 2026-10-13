import { Plus, Trash2, Box } from 'lucide-react'
import { ContainerForm } from '../../types/shipping-bill.types'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Select } from '../common/Select'

export interface ContainersEditorProps {
  containers: ContainerForm[]
  errors: Record<string, string>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, partial: Partial<ContainerForm>) => void
}

export function ContainersEditor({
  containers,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: ContainersEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Box className="size-4 text-blue-600" />
            ISO Shipping Containers ({containers.length})
          </h4>
          <p className="text-xs text-slate-500">
            Enter container numbers and excise electronic/customs seals for containerized shipments.
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
          Add Container
        </Button>
      </div>

      {containers.length === 0 ? (
        <div className="p-6 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
          <p className="text-xs text-slate-500 mb-2">
            No containers declared yet. (Required for FCL/LCL containerized cargo).
          </p>
          <Button size="sm" variant="outline" type="button" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add First Container
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {containers.map((cont, index) => {
            const errorKey = `containers.${index}.containerNumber`
            return (
              <div
                key={index}
                className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className="text-xs font-bold text-slate-800">
                    Container #{index + 1}
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
                    label="Container Number"
                    required
                    value={cont.containerNumber}
                    onChange={(e) =>
                      onUpdate(index, { containerNumber: e.target.value.toUpperCase() })
                    }
                    error={errors[errorKey]}
                    placeholder="e.g. MSKU9023412"
                    hint="4 alpha prefix + 7 digits"
                  />

                  <Select
                    label="Container Size"
                    value={cont.containerSize || '20'}
                    onChange={(e) => onUpdate(index, { containerSize: e.target.value })}
                    options={[
                      { value: '20', label: '20 ft Standard Container' },
                      { value: '40', label: '40 ft High Cube / Standard' },
                      { value: '45', label: '45 ft High Cube' },
                    ]}
                  />

                  <Select
                    label="Seal Type"
                    value={cont.sealType || 'ESEAL'}
                    onChange={(e) => onUpdate(index, { sealType: e.target.value })}
                    options={[
                      { value: 'ESEAL', label: 'Electronic RFID Seal (e-Seal)' },
                      { value: 'BTSL', label: 'Bottle Seal' },
                      { value: 'CUST', label: 'Customs Officer Seal' },
                    ]}
                  />

                  <Input
                    label="Customs / Excise Seal Number"
                    value={cont.exciseSealNumber || ''}
                    onChange={(e) => onUpdate(index, { exciseSealNumber: e.target.value })}
                    placeholder="e.g. ES-883921"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <Input
                    label="Seal Date"
                    type="date"
                    value={cont.sealDate || ''}
                    onChange={(e) => onUpdate(index, { sealDate: e.target.value })}
                  />
                  <Input
                    label="Seal Device ID (RFID / IoT)"
                    value={cont.sealDeviceId || ''}
                    onChange={(e) => onUpdate(index, { sealDeviceId: e.target.value })}
                    placeholder="e.g. DEV-09281"
                  />
                  <Input
                    label="Movement Document Number"
                    value={cont.movementDocumentNumber || ''}
                    onChange={(e) => onUpdate(index, { movementDocumentNumber: e.target.value })}
                    placeholder="e.g. CT-88219"
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

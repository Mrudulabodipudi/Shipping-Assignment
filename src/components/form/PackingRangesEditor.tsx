import { Plus, Trash2, Layers } from 'lucide-react'
import { PackingRangeForm } from '../../types/shipping-bill.types'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Select } from '../common/Select'

export interface PackingRangesEditorProps {
  ranges: PackingRangeForm[]
  errors: Record<string, string>
  onAdd: () => void
  onRemove: (index: number) => void
  onUpdate: (index: number, partial: Partial<PackingRangeForm>) => void
}

export function PackingRangesEditor({
  ranges,
  errors,
  onAdd,
  onRemove,
  onUpdate,
}: PackingRangesEditorProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
            <Layers className="size-4 text-blue-600" />
            Packing List Sequences & Number Ranges ({ranges.length})
          </h4>
          <p className="text-xs text-slate-500">
            Define continuous serial number ranges of packages (e.g. Cartons 1 to 50).
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
          Add Package Range
        </Button>
      </div>

      {ranges.length === 0 ? (
        <div className="p-5 rounded-xl border border-dashed border-slate-300 bg-slate-50/60 text-center">
          <p className="text-xs text-slate-500 mb-2">
            No packaging ranges entered yet.
          </p>
          <Button size="sm" variant="outline" type="button" onClick={onAdd}>
            <Plus className="size-3.5" />
            Add First Packing Range
          </Button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {ranges.map((range, index) => {
            const fromErr = errors[`packingRanges.${index}.packingNumberFrom`]
            const toErr = errors[`packingRanges.${index}.packingNumberTo`]

            return (
              <div
                key={index}
                className="p-3.5 rounded-xl border border-slate-200 bg-white flex flex-wrap sm:flex-nowrap items-center gap-3 shadow-2xs"
              >
                <span className="text-xs font-bold text-slate-700 w-16 shrink-0">
                  Range #{index + 1}
                </span>

                <div className="flex-1 min-w-[120px]">
                  <Input
                    label="From Package #"
                    type="number"
                    min="1"
                    required
                    value={range.packingNumberFrom}
                    onChange={(e) => onUpdate(index, { packingNumberFrom: e.target.value })}
                    error={fromErr}
                    placeholder="1"
                  />
                </div>

                <div className="flex-1 min-w-[120px]">
                  <Input
                    label="To Package #"
                    type="number"
                    min="1"
                    required
                    value={range.packingNumberTo}
                    onChange={(e) => onUpdate(index, { packingNumberTo: e.target.value })}
                    error={toErr}
                    placeholder="10"
                  />
                </div>

                <div className="flex-1 min-w-[140px]">
                  <Select
                    label="Packing Type Code"
                    value={range.packingCode || 'CTN'}
                    onChange={(e) => onUpdate(index, { packingCode: e.target.value })}
                    options={[
                      { value: 'CTN', label: 'CTN - Cartons / Corrugated Boxes' },
                      { value: 'BOX', label: 'BOX - Wooden / Steel Boxes' },
                      { value: 'BAL', label: 'BAL - Bales (Fabric / Yarn)' },
                      { value: 'BAG', label: 'BAG - Bags / Gunny Bags' },
                      { value: 'DRM', label: 'DRM - Drums (Liquid)' },
                      { value: 'PLT', label: 'PLT - Pallets' },
                    ]}
                  />
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  type="button"
                  onClick={() => onRemove(index)}
                  className="text-rose-600 hover:bg-rose-50 mt-5 shrink-0"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

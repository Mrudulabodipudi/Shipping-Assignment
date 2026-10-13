import React, { useEffect, useState } from 'react'
import { Trash2, Sparkles, AlertCircle } from 'lucide-react'
import { masterDataService } from '../../services/api/masterDataService'
import { partyService } from '../../services/api/partyService'
import { SchemeCodeDefinition, SelectOption } from '../../types/master-data.types'
import { BillItemForm } from '../../types/shipping-bill.types'
import { lineTotal } from '../../domain/calculations'
import { AsyncSelect } from '../common/AsyncSelect'
import { Button } from '../common/Button'
import { Checkbox } from '../common/Checkbox'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { Input } from '../common/Input'
import { Select } from '../common/Select'

export interface GoodsItemEditorProps {
  item: BillItemForm
  itemIndex: number
  invoiceIndex: number
  currency: string
  errorPrefix: string
  errors: Record<string, string>
  onUpdate: (updater: (prev: BillItemForm) => BillItemForm) => void
  onRemove: () => void
  canRemove: boolean
}

export function GoodsItemEditor({
  item,
  itemIndex,
  invoiceIndex: _invoiceIndex,
  currency,
  errorPrefix,
  errors,
  onUpdate,
  onRemove,
  canRemove,
}: GoodsItemEditorProps) {
  const [quantityUnits, setQuantityUnits] = useState<SelectOption[]>([])
  const [schemeOptions, setSchemeOptions] = useState<SchemeCodeDefinition[]>([])
  const [tradeAgreements, setTradeAgreements] = useState<SelectOption[]>([])
  const [selectedSchemeDef, setSelectedSchemeDef] = useState<SchemeCodeDefinition | undefined>()

  useEffect(() => {
    let active = true
    Promise.all([
      masterDataService.getQuantityCodes(),
      masterDataService.getSchemeCodes(),
      masterDataService.getTradeAgreements(),
    ]).then(([units, schemes, trades]) => {
      if (active) {
        setQuantityUnits(units)
        setSchemeOptions(schemes)
        setTradeAgreements(trades)
        if (item.schemeCode) {
          const found = schemes.find((s) => s.value === item.schemeCode)
          setSelectedSchemeDef(found)
        }
      }
    })
    return () => {
      active = false
    }
  }, [item.schemeCode])

  const calculatedTotal = lineTotal(item)

  // Does the selected scheme code trigger drawback / incentive declarations?
  const showDrawbackFields = Boolean(
    selectedSchemeDef &&
      (selectedSchemeDef.drawback || selectedSchemeDef.RODTEP || selectedSchemeDef.ROSCTL)
  )

  const isIGSTPaymentRequired = item.igstPaymentStatus === 'P'

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-xs space-y-4">
      {/* Item Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="size-6 rounded-md bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center">
            {itemIndex + 1}
          </span>
          <span className="text-sm font-semibold text-slate-800">
            Line Item #{itemIndex + 1}
          </span>
          {item.rewardItem && (
            <span className="text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="size-3" />
              RoDTEP/RoSCTL
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block">Item Total</span>
            <span className="text-sm font-bold text-slate-900">
              {currency} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {canRemove && (
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={onRemove}
              className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              title="Remove item"
            >
              <Trash2 className="size-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Row 1: HS Code, Goods Description, Scheme Code */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
        <div className="lg:col-span-1">
          <Input
            label="RITC / HS Code"
            required
            value={item.ritcCode}
            onChange={(e) => onUpdate((prev) => ({ ...prev, ritcCode: e.target.value.trim() }))}
            error={errors[`${errorPrefix}.ritcCode`]}
            placeholder="e.g. 61091000"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-3">
          <Input
            label="Goods Description"
            required
            value={item.goodsDescription1}
            onChange={(e) => onUpdate((prev) => ({ ...prev, goodsDescription1: e.target.value }))}
            error={errors[`${errorPrefix}.goodsDescription1`]}
            placeholder="e.g. 100% Combed Cotton Knitted T-Shirts"
          />
        </div>

        <div className="sm:col-span-2 lg:col-span-2">
          <Select
            label="Export Scheme Code"
            value={item.schemeCode || ''}
            onChange={(e) => {
              const val = e.target.value
              const def = schemeOptions.find((s) => s.value === val)
              setSelectedSchemeDef(def)
              onUpdate((prev) => ({ ...prev, schemeCode: val }))
            }}
            placeholder="Select scheme..."
            options={schemeOptions.map((s) => ({
              value: s.value,
              label: `${s.value} - ${s.label}`,
            }))}
          />
        </div>
      </div>

      {/* Row 2: Quantity, UOM, Unit Price, Divisor (Per Unit) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Input
          label="Quantity"
          type="number"
          step="any"
          min="0.01"
          required
          value={item.quantity}
          onChange={(e) => onUpdate((prev) => ({ ...prev, quantity: e.target.value }))}
          error={errors[`${errorPrefix}.quantity`]}
        />

        <Select
          label="UOM (Unit of Measure)"
          required
          value={item.unitOfMeasurement}
          onChange={(e) => onUpdate((prev) => ({ ...prev, unitOfMeasurement: e.target.value }))}
          error={errors[`${errorPrefix}.unitOfMeasurement`]}
          options={quantityUnits}
        />

        <Input
          label={`Unit Price (${currency})`}
          type="number"
          step="any"
          min="0.001"
          required
          value={item.unitPrice}
          onChange={(e) => onUpdate((prev) => ({ ...prev, unitPrice: e.target.value }))}
          error={errors[`${errorPrefix}.unitPrice`]}
        />

        <Input
          label="Rate Divisor (Per)"
          type="number"
          min="1"
          value={item.numberOfUnits || '1'}
          onChange={(e) => onUpdate((prev) => ({ ...prev, numberOfUnits: e.target.value }))}
          hint="Divisor (default 1)"
        />

        <div className="col-span-2">
          <Select
            label="IGST Payment Status"
            value={item.igstPaymentStatus || 'LUT'}
            onChange={(e) => onUpdate((prev) => ({ ...prev, igstPaymentStatus: e.target.value }))}
            options={[
              { value: 'LUT', label: 'LUT / Bond (Without Payment of IGST)' },
              { value: 'P', label: 'Against Payment of IGST (Refund route)' },
              { value: 'NA', label: 'Not Applicable' },
            ]}
          />
        </div>
      </div>

      {/* Row 3: Conditional IGST fields if Payment route is selected */}
      {isIGSTPaymentRequired && (
        <div className="p-3 rounded-lg bg-blue-50/50 border border-blue-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Taxable Value (INR)"
            type="number"
            required
            value={item.taxableValue || ''}
            onChange={(e) => onUpdate((prev) => ({ ...prev, taxableValue: e.target.value }))}
            error={errors[`${errorPrefix}.taxableValue`]}
            placeholder="Assessable value for IGST"
          />
          <Input
            label="IGST Tax Amount Paid (INR)"
            type="number"
            required
            value={item.igstAmount || ''}
            onChange={(e) => onUpdate((prev) => ({ ...prev, igstAmount: e.target.value }))}
            error={errors[`${errorPrefix}.igstAmount`]}
            placeholder="IGST amount paid under GST"
          />
        </div>
      )}

      {/* Row 4: Conditional Drawback / Incentive Fields */}
      {showDrawbackFields && (
        <div className="p-3.5 rounded-lg bg-amber-50/50 border border-amber-200 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900">
            <AlertCircle className="size-3.5 text-amber-600" />
            Duty Drawback / RoDTEP / RoSCTL Incentive Schedule
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Drawback Schedule Serial No."
              value={item.drawbackSerialNumber || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, drawbackSerialNumber: e.target.value }))}
              placeholder="e.g. 6109A"
            />
            <Select
              label="Drawback Quantity UOM"
              value={item.drawbackUnit || item.unitOfMeasurement}
              onChange={(e) => onUpdate((prev) => ({ ...prev, drawbackUnit: e.target.value }))}
              options={quantityUnits}
            />
            <Input
              label="Drawback Quantity"
              type="number"
              value={item.drawbackQuantity || item.quantity}
              onChange={(e) => onUpdate((prev) => ({ ...prev, drawbackQuantity: e.target.value }))}
            />
          </div>
        </div>
      )}

      {/* Checkboxes: Reward Claim & Third-Party Item */}
      <div className="flex flex-wrap items-center gap-6 pt-2">
        <Checkbox
          label="Claim Export Reward (RoDTEP / RoSCTL)"
          checked={Boolean(item.rewardItem)}
          onChange={(e) => onUpdate((prev) => ({ ...prev, rewardItem: e.target.checked }))}
        />
        <Checkbox
          label="Manufactured / Sourced via Third Party"
          checked={Boolean(item.thirdPartyItem)}
          onChange={(e) => onUpdate((prev) => ({ ...prev, thirdPartyItem: e.target.checked }))}
        />
      </div>

      {/* Third Party Item Entity Selector */}
      {item.thirdPartyItem && (
        <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
          <span className="text-xs font-semibold text-slate-800">
            Third-Party Manufacturer Entity
          </span>
          <AsyncSelect
            placeholder="Search third-party supplier / job worker..."
            value={item.itemThirdPartyId || ''}
            fetchOptions={async (query) => {
              const list = await partyService.searchThirdParties(query)
              return list.map((b) => ({
                value: String(b.id),
                label: b.name,
                sublabel: b.branches[0]?.city,
              }))
            }}
            getInitialLabel={async (id) => {
              const biz = await partyService.getBusinessById(id)
              return biz ? biz.name : id
            }}
            onChange={(id) => onUpdate((prev) => ({ ...prev, itemThirdPartyId: id }))}
          />
        </div>
      )}

      {/* Advanced Customs, Taxes & End-Use Specifications */}
      <CollapsibleSection title="Advanced Customs Classifications & AR4" subtitle="Present Market Value (PMV), Trade Agreements, End Use, Accessories and AR4 Excise">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Input
              label="Present Market Value (PMV)"
              type="number"
              value={item.presentMarketValue || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, presentMarketValue: e.target.value }))}
              placeholder="Domestic market value"
            />
            <Select
              label="Preferential Trade Agreement"
              value={item.tradeAgreementsCode || 'NCPTI'}
              onChange={(e) => onUpdate((prev) => ({ ...prev, tradeAgreementsCode: e.target.value }))}
              options={tradeAgreements}
            />
            <Input
              label="Origin District Code (Customs)"
              value={item.originDistrictCode || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, originDistrictCode: e.target.value }))}
              placeholder="District code (e.g. 035)"
            />
            <Input
              label="End Use Code"
              value={item.endUseOfItem || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, endUseOfItem: e.target.value }))}
              placeholder="e.g. Commercial"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Accessories Description (if any)"
              value={item.accessoriesDescription || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, accessoriesDescription: e.target.value }))}
              placeholder="e.g. Spare buttons, tags, packaging"
            />
            <Select
              label="Accessory Duty Status"
              value={item.accessoryStatus || '0'}
              onChange={(e) => onUpdate((prev) => ({ ...prev, accessoryStatus: e.target.value }))}
              options={[
                { value: '0', label: '0 - No accessory' },
                { value: '1', label: '1 - Included free of cost' },
                { value: '2', label: '2 - Entered separately' },
              ]}
            />
          </div>

          {/* AR4 Excise Rebate Details */}
          <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/30">
            <h5 className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
              AR4 / Central Excise Certification
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Input
                label="AR4 Form Number"
                value={item.ar4Number || ''}
                onChange={(e) => onUpdate((prev) => ({ ...prev, ar4Number: e.target.value }))}
                placeholder="AR4 Number"
              />
              <Input
                label="AR4 Date"
                type="date"
                value={item.ar4Date || ''}
                onChange={(e) => onUpdate((prev) => ({ ...prev, ar4Date: e.target.value }))}
              />
              <Input
                label="Commissionerate"
                value={item.ar4Commissionerate || ''}
                onChange={(e) => onUpdate((prev) => ({ ...prev, ar4Commissionerate: e.target.value }))}
                placeholder="Commissionerate"
              />
              <Input
                label="Division & Range"
                value={item.ar4Division || ''}
                onChange={(e) => onUpdate((prev) => ({ ...prev, ar4Division: e.target.value }))}
                placeholder="Division / Range"
              />
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  )
}

import React, { useEffect, useState } from 'react'
import { ArrowRight, Building, Plus, AlertTriangle } from 'lucide-react'
import { marksAndNumbersService } from '../../services/api/marksAndNumbersService'
import { masterDataService } from '../../services/api/masterDataService'
import { partyService } from '../../services/api/partyService'
import { SelectOption } from '../../types/master-data.types'
import { Branch, Exporter, ShippingBillFormValues } from '../../types/shipping-bill.types'
import { portCountry } from '../../domain/calculations'
import { AsyncSelect } from '../common/AsyncSelect'
import { Button } from '../common/Button'
import { Card, CardContent, CardHeader } from '../common/Card'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { QuickAddBranchModal } from '../dialogs/QuickAddBranchModal'
import { QuickAddPartyModal } from '../dialogs/QuickAddPartyModal'

export interface ShipmentBasicsStepProps {
  values: ShippingBillFormValues
  errors: Record<string, string>
  warnings: Record<string, string>
  onFieldChange: (field: keyof ShippingBillFormValues, val: unknown) => void
}

export function ShipmentBasicsStep({
  values,
  errors,
  warnings,
  onFieldChange,
}: ShipmentBasicsStepProps) {
  // Party quick-add modal states
  const [quickPartyKind, setQuickPartyKind] = useState<'exporter' | 'consignee' | null>(null)
  const [quickBranchKind, setQuickBranchKind] = useState<{
    kind: 'exporter' | 'business'
    partyId: number
    partyName: string
  } | null>(null)

  // Master options
  const [cargoOptions, setCargoOptions] = useState<SelectOption[]>([])
  const [weightUnits, setWeightUnits] = useState<SelectOption[]>([])
  const [sealTypes, setSealTypes] = useState<SelectOption[]>([])
  const [states, setStates] = useState<SelectOption<number>[]>([])
  const [destinationPorts, setDestinationPorts] = useState<SelectOption[]>([])

  // Exporter branches
  const [exporterBranches, setExporterBranches] = useState<Branch[]>([])
  const [loadingExporterBranches, setLoadingExporterBranches] = useState(false)

  // Consignee branches
  const [consigneeBranches, setConsigneeBranches] = useState<Branch[]>([])
  const [loadingConsigneeBranches, setLoadingConsigneeBranches] = useState(false)

  // Exporter Marks and Numbers options
  const [marksOptions, setMarksOptions] = useState<SelectOption[]>([])
  const [loadingMarks, setLoadingMarks] = useState(false)

  // Selected party names for labels
  const [selectedExporterName, setSelectedExporterName] = useState(values.exporterName || '')
  const [selectedConsigneeName, setSelectedConsigneeName] = useState(values.consigneeName || '')

  // Load static master options on mount
  useEffect(() => {
    let active = true
    Promise.all([
      masterDataService.getCargoOptions(),
      masterDataService.getWeightUnits(),
      masterDataService.getSealTypes(),
      masterDataService.getStates(),
      masterDataService.searchDestinationPorts(),
    ]).then(([cargos, units, seals, stList, destPorts]) => {
      if (active) {
        setCargoOptions(cargos)
        setWeightUnits(units)
        setSealTypes(seals)
        setStates(stList)
        setDestinationPorts(destPorts.map((p) => ({ value: p.code, label: `${p.name} (${p.code})` })))
      }
    })
    return () => {
      active = false
    }
  }, [])

  // Load branches whenever exporterId changes
  useEffect(() => {
    let active = true
    if (!values.exporterId) {
      setExporterBranches([])
      return
    }

    setLoadingExporterBranches(true)
    partyService
      .searchExporterBranches(values.exporterId)
      .then((branches) => {
        if (active) {
          setExporterBranches(branches)
          setLoadingExporterBranches(false)
          // If current branch isn't in new list, pick first
          if (branches.length > 0 && !branches.some((b) => String(b.id) === values.exporterBranchId)) {
            onFieldChange('exporterBranchId', String(branches[0].id))
          }
        }
      })
      .catch(() => {
        if (active) setLoadingExporterBranches(false)
      })

    return () => {
      active = false
    }
  }, [values.exporterId, values.exporterBranchId, onFieldChange])

  // Load branches whenever consigneeId changes
  useEffect(() => {
    let active = true
    if (!values.consigneeId) {
      setConsigneeBranches([])
      return
    }

    setLoadingConsigneeBranches(true)
    partyService
      .searchBusinessBranches(values.consigneeId)
      .then((branches) => {
        if (active) {
          setConsigneeBranches(branches)
          setLoadingConsigneeBranches(false)
          if (branches.length > 0 && !branches.some((b) => String(b.id) === values.consigneeBranchId)) {
            onFieldChange('consigneeBranchId', String(branches[0].id))
          }
        }
      })
      .catch(() => {
        if (active) setLoadingConsigneeBranches(false)
      })

    return () => {
      active = false
    }
  }, [values.consigneeId, values.consigneeBranchId, onFieldChange])

  // Load marks & numbers whenever exporter changes
  useEffect(() => {
    let active = true
    if (!values.exporterId) {
      setMarksOptions([])
      return
    }

    setLoadingMarks(true)
    marksAndNumbersService
      .getMarksAndNumbersOptions(values.exporterId)
      .then((opts) => {
        if (active) {
          setMarksOptions(opts)
          setLoadingMarks(false)
        }
      })
      .catch(() => {
        if (active) setLoadingMarks(false)
      })

    return () => {
      active = false
    }
  }, [values.exporterId])

  const grossNum = Number(values.grossWeight)
  const netNum = Number(values.netWeight)
  const isWeightWarning = grossNum > 0 && netNum > 0 && netNum > grossNum

  return (
    <div className="space-y-5">
      {/* Shipment Basics Card */}
      <Card>
        <CardHeader
          title="Shipment Basics"
          description="Identify the exporting organization, overseas consignee, and export route."
        />
        <CardContent className="space-y-5">
          {/* Job Reference & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-2 border-b border-slate-100">
            <Input
              label="Job Reference Number"
              value={values.jobNumber || ''}
              onChange={(e) => onFieldChange('jobNumber', e.target.value)}
              placeholder="e.g. JOB-2026-001 (auto-generated if empty)"
              hint="Internal customs broker job reference"
            />
            <Input
              label="Job Date"
              type="date"
              required
              value={values.jobDate}
              onChange={(e) => onFieldChange('jobDate', e.target.value)}
              error={errors.jobDate}
            />
          </div>

          {/* Parties: Exporter & Consignee */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Exporter Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="size-3.5 text-blue-600" />
                  Exporter (Shipper)
                </span>
                <button
                  type="button"
                  onClick={() => setQuickPartyKind('exporter')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  New Exporter
                </button>
              </div>

              <AsyncSelect
                label="Select Exporter"
                required
                value={values.exporterId}
                error={errors.exporterId}
                placeholder="Search by Exporter name or IEC..."
                fetchOptions={async (query) => {
                  const list = await partyService.searchExporters(query)
                  return list.map((exp) => ({
                    value: String(exp.id),
                    label: `${exp.name} (IEC: ${exp.iec})`,
                    sublabel: `Class: ${exp.class} · PAN: ${exp.pan || 'N/A'}`,
                  }))
                }}
                getInitialLabel={async (id) => {
                  const exp = await partyService.getExporterById(id)
                  if (exp) {
                    setSelectedExporterName(exp.name)
                    return `${exp.name} (IEC: ${exp.iec})`
                  }
                  return id
                }}
                onChange={(id, opt) => {
                  onFieldChange('exporterId', id)
                  onFieldChange('exporterName', opt?.label ? opt.label.split(' (IEC:')[0] : '')
                  setSelectedExporterName(opt?.label ? opt.label.split(' (IEC:')[0] : '')
                }}
              />

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Exporter Branch / Registered Port Unit"
                    required
                    value={values.exporterBranchId}
                    onChange={(e) => onFieldChange('exporterBranchId', e.target.value)}
                    error={errors.exporterBranchId}
                    disabled={!values.exporterId || loadingExporterBranches}
                    placeholder={
                      !values.exporterId
                        ? 'Select exporter first'
                        : loadingExporterBranches
                        ? 'Loading branches...'
                        : 'Choose facility / branch...'
                    }
                    options={exporterBranches.map((b) => ({
                      value: String(b.id),
                      label: `${b.branchName} - ${b.city}${b.adCode ? ` (AD: ${b.adCode})` : ''}`,
                    }))}
                  />
                </div>
                {values.exporterId && (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() =>
                      setQuickBranchKind({
                        kind: 'exporter',
                        partyId: Number(values.exporterId),
                        partyName: selectedExporterName || 'Exporter',
                      })
                    }
                    className="shrink-0 mb-0.5"
                    title="Add branch"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>

            {/* Consignee Section */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="size-3.5 text-blue-600" />
                  Consignee (Foreign Buyer)
                </span>
                <button
                  type="button"
                  onClick={() => setQuickPartyKind('consignee')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Plus className="size-3" />
                  New Consignee
                </button>
              </div>

              <AsyncSelect
                label="Select Consignee"
                required
                value={values.consigneeId}
                error={errors.consigneeId}
                placeholder="Search overseas consignee..."
                fetchOptions={async (query) => {
                  const list = await partyService.searchConsignees(query)
                  return list.map((biz) => ({
                    value: String(biz.id),
                    label: biz.name,
                    sublabel: biz.branches[0]
                      ? `${biz.branches[0].city}, ${biz.branches[0].countryCode}`
                      : undefined,
                  }))
                }}
                getInitialLabel={async (id) => {
                  const biz = await partyService.getBusinessById(id)
                  if (biz) {
                    setSelectedConsigneeName(biz.name)
                    return biz.name
                  }
                  return id
                }}
                onChange={(id, opt) => {
                  onFieldChange('consigneeId', id)
                  onFieldChange('consigneeName', opt?.label || '')
                  setSelectedConsigneeName(opt?.label || '')
                }}
              />

              <div className="flex items-end gap-2">
                <div className="flex-1">
                  <Select
                    label="Consignee Destination Terminal / Branch"
                    required
                    value={values.consigneeBranchId}
                    onChange={(e) => onFieldChange('consigneeBranchId', e.target.value)}
                    error={errors.consigneeBranchId}
                    disabled={!values.consigneeId || loadingConsigneeBranches}
                    placeholder={
                      !values.consigneeId
                        ? 'Select consignee first'
                        : loadingConsigneeBranches
                        ? 'Loading destination branches...'
                        : 'Choose destination branch...'
                    }
                    options={consigneeBranches.map((b) => ({
                      value: String(b.id),
                      label: `${b.branchName} - ${b.city}, ${b.countryCode}`,
                    }))}
                  />
                </div>
                {values.consigneeId && (
                  <Button
                    size="sm"
                    variant="outline"
                    type="button"
                    onClick={() =>
                      setQuickBranchKind({
                        kind: 'business',
                        partyId: Number(values.consigneeId),
                        partyName: selectedConsigneeName || 'Consignee',
                      })
                    }
                    className="shrink-0 mb-0.5"
                    title="Add branch"
                  >
                    <Plus className="size-3.5" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Route Section */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Transit & Port Routing
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AsyncSelect
                label="Port of Loading (Indian Customs Location)"
                required
                value={values.loadingPort}
                error={errors.loadingPort}
                placeholder="Search Indian port (e.g. Mundra, Nhava Sheva)..."
                fetchOptions={async (query) => {
                  const list = await masterDataService.searchLoadingPorts(query)
                  return list.map((p) => ({
                    value: p.code,
                    label: `${p.name} · ${p.code}`,
                    sublabel: `Country: ${p.countryCode}`,
                  }))
                }}
                getInitialLabel={async (code) => {
                  const p = await masterDataService.getPortByCode(code)
                  return p ? `${p.name} · ${p.code}` : code
                }}
                onChange={(code) => onFieldChange('loadingPort', code)}
              />

              <AsyncSelect
                label="Final Destination Port (Overseas)"
                required
                value={values.finalDestinationPort}
                error={errors.finalDestinationPort}
                placeholder="Search foreign port (e.g. New Orleans, Jebel Ali)..."
                fetchOptions={async (query) => {
                  const list = await masterDataService.searchDestinationPorts(query)
                  return list.map((p) => ({
                    value: p.code,
                    label: `${p.name} · ${p.code}`,
                    sublabel: `Country: ${p.countryCode}`,
                  }))
                }}
                getInitialLabel={async (code) => {
                  const p = await masterDataService.getPortByCode(code)
                  return p ? `${p.name} · ${p.code}` : code
                }}
                onChange={(code) => {
                  onFieldChange('finalDestinationPort', code)
                  if (!values.dischargePort) {
                    onFieldChange('dischargePort', code)
                  }
                }}
              />
            </div>

            {/* Derived Route Badge */}
            {(values.loadingPort || values.finalDestinationPort) && (
              <div className="p-2.5 rounded-lg bg-blue-50/60 border border-blue-100 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2 font-medium">
                  <span className="text-blue-900">{portCountry(values.loadingPort) || 'Origin (IN)'}</span>
                  <ArrowRight className="size-3 text-blue-500" />
                  <span className="text-blue-900">
                    {portCountry(values.finalDestinationPort) || 'Destination'}
                  </span>
                </div>
                <span className="text-[11px] text-slate-500">
                  Auto-derived from UN/LOCODE master registry
                </span>
              </div>
            )}

            {/* Regulatory Collapsible */}
            <CollapsibleSection title="Regulatory & Route Exceptions" subtitle="Discharge port, origin state, NFEI and RBI exemptions">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Select
                  label="Port of Discharge"
                  value={values.dischargePort || ''}
                  onChange={(e) => onFieldChange('dischargePort', e.target.value)}
                  placeholder="Defaults to destination port"
                  options={destinationPorts}
                />
                <Select
                  label="Origin State (GST)"
                  value={values.originStateCode || ''}
                  onChange={(e) => onFieldChange('originStateCode', e.target.value)}
                  placeholder="Defaults to Branch State"
                  options={states}
                />
                <Select
                  label="NFEI Category"
                  value={values.nfeiCategory || ''}
                  onChange={(e) => onFieldChange('nfeiCategory', e.target.value)}
                  placeholder="Not applicable (Standard Commercial)"
                  options={[
                    { value: '01', label: '01 - Free trade sample' },
                    { value: '02', label: '02 - Diplomatic goods' },
                    { value: '03', label: '03 - Warranty replacement' },
                    { value: '07', label: '07 - Gift parcel' },
                    { value: '08', label: '08 - Other' },
                  ]}
                />
                <Input
                  label="RBI Waiver Number"
                  value={values.rbiWaiverNumber || ''}
                  onChange={(e) => onFieldChange('rbiWaiverNumber', e.target.value)}
                  placeholder="e.g. RBI-EXP-2026-9"
                />
              </div>
            </CollapsibleSection>
          </div>

          {/* Package & Weight Detail */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Cargo, Weight & Packaging Specifications
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Select
                label="Nature of Cargo"
                required
                value={values.natureOfCargo}
                onChange={(e) => onFieldChange('natureOfCargo', e.target.value)}
                options={cargoOptions}
              />
              <Input
                label="Gross Weight"
                type="number"
                step="any"
                min="0"
                value={values.grossWeight || ''}
                onChange={(e) => onFieldChange('grossWeight', e.target.value)}
                error={errors.grossWeight}
                placeholder="0.00"
              />
              <Input
                label="Net Weight"
                type="number"
                step="any"
                min="0"
                value={values.netWeight || ''}
                onChange={(e) => onFieldChange('netWeight', e.target.value)}
                error={errors.netWeight}
                placeholder="0.00"
              />
              <Select
                label="Weight Measurement Unit"
                value={values.measurementUnit}
                onChange={(e) => onFieldChange('measurementUnit', e.target.value)}
                options={weightUnits}
              />
            </div>

            {isWeightWarning && (
              <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 flex items-center gap-2 text-xs text-amber-800">
                <AlertTriangle className="size-4 text-amber-600 shrink-0" />
                <span>
                  <strong>Customs Warning:</strong> Net weight ({netNum} {values.measurementUnit}) exceeds Gross weight ({grossNum} {values.measurementUnit}). In customs declarations, gross weight must include packaging.
                </span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Input
                label="Total Packages"
                type="number"
                min="1"
                value={values.totalPackages || ''}
                onChange={(e) => onFieldChange('totalPackages', e.target.value)}
                error={errors.totalPackages}
                placeholder="Number of packages"
              />

              <div className="sm:col-span-3">
                <Select
                  label="Marks and Numbers (Shipping Marks)"
                  value={values.marksAndNumbers || ''}
                  onChange={(e) => onFieldChange('marksAndNumbers', e.target.value)}
                  disabled={!values.exporterId || loadingMarks}
                  placeholder={
                    !values.exporterId
                      ? 'Select exporter above first'
                      : loadingMarks
                      ? 'Loading exporter marks...'
                      : 'Select or configure marks and numbers template...'
                  }
                  options={marksOptions}
                />
              </div>
            </div>

            <CollapsibleSection title="Additional Shipment Identifiers" subtitle="Customs seal type, container counts, Airway bill numbers (MAWB / HAWB)">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  label="Customs Seal Type"
                  value={values.sealType || ''}
                  onChange={(e) => onFieldChange('sealType', e.target.value)}
                  options={sealTypes}
                />
                <Input
                  label="Master Airway Bill (MAWB)"
                  value={values.mawbNumber || ''}
                  onChange={(e) => onFieldChange('mawbNumber', e.target.value)}
                  placeholder="e.g. 098-12345675"
                />
                <Input
                  label="House Airway Bill (HAWB)"
                  value={values.hawbNumber || ''}
                  onChange={(e) => onFieldChange('hawbNumber', e.target.value)}
                  placeholder="e.g. HW-88129"
                />
              </div>
            </CollapsibleSection>
          </div>
        </CardContent>
      </Card>

      {/* Quick Add Party Modal */}
      {quickPartyKind && (
        <QuickAddPartyModal
          isOpen={Boolean(quickPartyKind)}
          kind={quickPartyKind}
          onClose={() => setQuickPartyKind(null)}
          onSuccess={(party) => {
            if (quickPartyKind === 'exporter') {
              onFieldChange('exporterId', String(party.id))
              onFieldChange('exporterName', party.name)
              setSelectedExporterName(party.name)
              if (party.branches[0]) {
                onFieldChange('exporterBranchId', String(party.branches[0].id))
              }
            } else {
              onFieldChange('consigneeId', String(party.id))
              onFieldChange('consigneeName', party.name)
              setSelectedConsigneeName(party.name)
              if (party.branches[0]) {
                onFieldChange('consigneeBranchId', String(party.branches[0].id))
              }
            }
          }}
        />
      )}

      {/* Quick Add Branch Modal */}
      {quickBranchKind && (
        <QuickAddBranchModal
          isOpen={Boolean(quickBranchKind)}
          kind={quickBranchKind.kind}
          partyId={quickBranchKind.partyId}
          partyName={quickBranchKind.partyName}
          onClose={() => setQuickBranchKind(null)}
          onSuccess={(branch) => {
            if (quickBranchKind.kind === 'exporter') {
              onFieldChange('exporterBranchId', String(branch.id))
            } else {
              onFieldChange('consigneeBranchId', String(branch.id))
            }
          }}
        />
      )}
    </div>
  )
}

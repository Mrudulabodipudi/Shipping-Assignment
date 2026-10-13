import { useState } from 'react'
import { Box, Layers, FileCheck, Award } from 'lucide-react'
import {
  ContainerForm,
  LicenseForm,
  PackingRangeForm,
  ShippingBillFormValues,
  SupportingDocForm,
} from '../../types/shipping-bill.types'
import { Card, CardContent } from '../common/Card'
import { ContainersEditor } from './ContainersEditor'
import { DocumentsEditor } from './DocumentsEditor'
import { LicensesEditor } from './LicensesEditor'
import { PackingRangesEditor } from './PackingRangesEditor'

export interface OthersStepProps {
  values: ShippingBillFormValues
  errors: Record<string, string>
  onAddContainer: () => void
  onRemoveContainer: (index: number) => void
  onUpdateContainer: (index: number, partial: Partial<ContainerForm>) => void
  onAddPackingRange: () => void
  onRemovePackingRange: (index: number) => void
  onUpdatePackingRange: (index: number, partial: Partial<PackingRangeForm>) => void
  onAddDocument: () => void
  onRemoveDocument: (index: number) => void
  onUpdateDocument: (index: number, partial: Partial<SupportingDocForm>) => void
  onAddLicense: () => void
  onRemoveLicense: (index: number) => void
  onUpdateLicense: (index: number, partial: Partial<LicenseForm>) => void
}

export function OthersStep({
  values,
  errors,
  onAddContainer,
  onRemoveContainer,
  onUpdateContainer,
  onAddPackingRange,
  onRemovePackingRange,
  onUpdatePackingRange,
  onAddDocument,
  onRemoveDocument,
  onUpdateDocument,
  onAddLicense,
  onRemoveLicense,
  onUpdateLicense,
}: OthersStepProps) {
  const [subTab, setSubTab] = useState<'containers' | 'packing' | 'documents' | 'licenses'>('containers')

  const subNavs = [
    {
      id: 'containers' as const,
      label: 'Containers',
      count: values.containers.length,
      icon: Box,
    },
    {
      id: 'packing' as const,
      label: 'Packing Ranges',
      count: values.packingRanges.length,
      icon: Layers,
    },
    {
      id: 'documents' as const,
      label: 'e-SANCHIT Docs',
      count: values.documents.length,
      icon: FileCheck,
    },
    {
      id: 'licenses' as const,
      label: 'DGFT Licences',
      count: values.licenses.length,
      icon: Award,
    },
  ]

  return (
    <div className="space-y-5">
      {/* Subnav Pills */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-xl bg-slate-200/70 border border-slate-200">
        {subNavs.map((nav) => {
          const isActive = subTab === nav.id
          const Icon = nav.icon

          return (
            <button
              key={nav.id}
              type="button"
              onClick={() => setSubTab(nav.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition-all select-none ${
                isActive
                  ? 'bg-white text-blue-900 shadow-xs ring-1 ring-slate-900/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <Icon className={`size-3.5 ${isActive ? 'text-blue-600' : 'text-slate-500'}`} />
              <span>{nav.label}</span>
              <span
                className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {nav.count}
              </span>
            </button>
          )
        })}
      </div>

      <Card>
        <CardContent className="p-5 sm:p-6">
          {subTab === 'containers' && (
            <ContainersEditor
              containers={values.containers}
              errors={errors}
              onAdd={onAddContainer}
              onRemove={onRemoveContainer}
              onUpdate={onUpdateContainer}
            />
          )}

          {subTab === 'packing' && (
            <PackingRangesEditor
              ranges={values.packingRanges}
              errors={errors}
              onAdd={onAddPackingRange}
              onRemove={onRemovePackingRange}
              onUpdate={onUpdatePackingRange}
            />
          )}

          {subTab === 'documents' && (
            <DocumentsEditor
              documents={values.documents}
              errors={errors}
              onAdd={onAddDocument}
              onRemove={onRemoveDocument}
              onUpdate={onUpdateDocument}
            />
          )}

          {subTab === 'licenses' && (
            <LicensesEditor
              licenses={values.licenses}
              errors={errors}
              onAdd={onAddLicense}
              onRemove={onRemoveLicense}
              onUpdate={onUpdateLicense}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

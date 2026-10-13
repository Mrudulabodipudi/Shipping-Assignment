import React, { useState } from 'react'
import { partyService } from '../../services/api/partyService'
import { Business, Exporter } from '../../types/shipping-bill.types'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Modal } from '../common/Modal'
import { Select } from '../common/Select'
import { useToast } from '../common/Toast'

export interface QuickAddPartyModalProps {
  isOpen: boolean
  kind: 'exporter' | 'consignee' | 'buyer' | 'thirdParty'
  onClose: () => void
  onSuccess: (party: Exporter | Business) => void
}

export function QuickAddPartyModal({
  isOpen,
  kind,
  onClose,
  onSuccess,
}: QuickAddPartyModalProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isExporter = kind === 'exporter'

  const [form, setForm] = useState({
    name: '',
    iec: '',
    pan: '',
    class: 'F',
    type: 'P',
    branchName: 'Main Operations / HQ',
    address1: '',
    city: '',
    state: '',
    pincode: '',
    countryCode: isExporter ? 'IN' : 'US',
    gstnId: '',
    adCode: '',
  })

  const title = isExporter
    ? 'Quick Add Exporter'
    : kind === 'consignee'
    ? 'Quick Add Consignee'
    : kind === 'buyer'
    ? 'Quick Add Buyer'
    : 'Quick Add Third-Party Supplier'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Entity name is required')
      return
    }

    setIsSubmitting(true)
    try {
      if (isExporter) {
        const created = await partyService.createExporter({
          name: form.name.trim(),
          iec: form.iec.trim(),
          pan: form.pan.trim(),
          class: form.class,
          type: form.type,
          firstBranch: {
            branchName: form.branchName.trim() || 'Head Office',
            address1: form.address1.trim() || 'Export Facility',
            city: form.city.trim() || 'New Delhi',
            state: form.state.trim() || 'Delhi',
            pincode: form.pincode.trim(),
            countryCode: form.countryCode,
            gstnId: form.gstnId.trim(),
            adCode: form.adCode.trim(),
          },
        })
        toast.success(`Exporter "${created.name}" created successfully`)
        onSuccess(created)
      } else {
        const created = await partyService.createBusiness({
          name: form.name.trim(),
          iec: form.iec.trim(),
          isConsignee: kind === 'consignee',
          isBuyer: kind === 'buyer',
          isNotify: false,
          isThirdParty: kind === 'thirdParty',
          firstBranch: {
            branchName: form.branchName.trim() || 'Primary Terminal',
            address1: form.address1.trim() || 'Distribution Center',
            city: form.city.trim() || 'Port City',
            countryCode: form.countryCode,
            pincode: form.pincode.trim(),
          },
        })
        toast.success(`Business entity "${created.name}" created successfully`)
        onSuccess(created)
      }
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create entity')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description="Quickly register a new party and its primary branch without leaving the form."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Legal Business Name"
          required
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Acme Global Exports Pvt Ltd"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label={isExporter ? 'IEC (Import Export Code)' : 'IEC / Tax ID'}
            value={form.iec}
            onChange={(e) => setForm({ ...form, iec: e.target.value.toUpperCase() })}
            placeholder="e.g. AABCA1234F"
          />
          {isExporter && (
            <Input
              label="PAN Number"
              value={form.pan}
              onChange={(e) => setForm({ ...form, pan: e.target.value.toUpperCase() })}
              placeholder="e.g. AABCA1234F"
            />
          )}
        </div>

        <div className="border-t border-slate-100 pt-3">
          <h4 className="text-xs font-semibold text-slate-800 uppercase tracking-wider mb-2">
            Primary Branch / Facility
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Branch Name"
              value={form.branchName}
              onChange={(e) => setForm({ ...form, branchName: e.target.value })}
              placeholder="e.g. Mumbai Port Unit"
            />
            <Input
              label="City"
              required
              value={form.city}
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              placeholder="e.g. Mumbai"
            />
            <Input
              label="Address Line"
              value={form.address1}
              onChange={(e) => setForm({ ...form, address1: e.target.value })}
              placeholder="e.g. 102 Dockyard Road"
            />
            <Input
              label="State / Province"
              value={form.state}
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              placeholder="e.g. Maharashtra"
            />
            {isExporter && (
              <>
                <Input
                  label="GSTIN"
                  value={form.gstnId}
                  onChange={(e) => setForm({ ...form, gstnId: e.target.value })}
                  placeholder="e.g. 27AABCA1234F1Z5"
                />
                <Input
                  label="Authorised Dealer (AD) Code"
                  value={form.adCode}
                  onChange={(e) => setForm({ ...form, adCode: e.target.value })}
                  placeholder="14-digit bank AD code"
                />
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save & Select
          </Button>
        </div>
      </form>
    </Modal>
  )
}

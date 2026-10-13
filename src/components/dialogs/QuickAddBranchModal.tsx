import React, { useState } from 'react'
import { partyService } from '../../services/api/partyService'
import { Branch } from '../../types/shipping-bill.types'
import { Button } from '../common/Button'
import { Input } from '../common/Input'
import { Modal } from '../common/Modal'
import { useToast } from '../common/Toast'

export interface QuickAddBranchModalProps {
  isOpen: boolean
  partyId: number
  partyName: string
  kind: 'exporter' | 'business'
  onClose: () => void
  onSuccess: (branch: Branch) => void
}

export function QuickAddBranchModal({
  isOpen,
  partyId,
  partyName,
  kind,
  onClose,
  onSuccess,
}: QuickAddBranchModalProps) {
  const toast = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [form, setForm] = useState({
    branchName: '',
    address1: '',
    city: '',
    state: '',
    pincode: '',
    countryCode: kind === 'exporter' ? 'IN' : 'US',
    gstnId: '',
    adCode: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.branchName.trim() || !form.city.trim()) {
      toast.error('Branch name and city are required')
      return
    }

    setIsSubmitting(true)
    try {
      const created = await partyService.createBranch(partyId, kind, {
        branchName: form.branchName.trim(),
        address1: form.address1.trim() || 'Customs Warehouse',
        city: form.city.trim(),
        state: form.state.trim(),
        pincode: form.pincode.trim(),
        countryCode: form.countryCode,
        gstnId: form.gstnId.trim(),
        adCode: form.adCode.trim(),
      })
      toast.success(`Branch "${created.branchName}" added`)
      onSuccess(created)
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('Failed to create branch')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Add Branch for ${partyName}`}
      description="Add an additional warehouse, branch office, or port terminal."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-3.5">
        <Input
          label="Branch / Unit Name"
          required
          value={form.branchName}
          onChange={(e) => setForm({ ...form, branchName: e.target.value })}
          placeholder="e.g. Kandla Port SEZ Unit"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="City"
            required
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            placeholder="e.g. Gandhidham"
          />
          <Input
            label="State / Province"
            value={form.state}
            onChange={(e) => setForm({ ...form, state: e.target.value })}
            placeholder="e.g. Gujarat"
          />
        </div>

        <Input
          label="Address Line"
          value={form.address1}
          onChange={(e) => setForm({ ...form, address1: e.target.value })}
          placeholder="e.g. Shed 14, Free Trade Zone"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Pincode / Postal Code"
            value={form.pincode}
            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          />
          {kind === 'exporter' && (
            <Input
              label="GSTIN (if state-specific)"
              value={form.gstnId}
              onChange={(e) => setForm({ ...form, gstnId: e.target.value })}
              placeholder="e.g. 24AABCA1234F1Z1"
            />
          )}
        </div>

        {kind === 'exporter' && (
          <Input
            label="Authorised Dealer (AD) Code"
            value={form.adCode}
            onChange={(e) => setForm({ ...form, adCode: e.target.value })}
            placeholder="14-digit bank AD code registered at this port"
          />
        )}

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSubmitting}>
            Save Branch
          </Button>
        </div>
      </form>
    </Modal>
  )
}

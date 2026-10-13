import { useCallback, useState } from 'react'
import {
  emptyBill,
  emptyDocument,
  emptyInvoice,
  emptyItem,
} from '../domain/calculations'
import {
  validateInvoices,
  validateOthers,
  validateShipmentBasics,
  ValidationResult,
} from '../domain/validations'
import { shippingBillService } from '../services/api/shippingBillService'
import {
  BillInvoiceForm,
  BillItemForm,
  ContainerForm,
  LicenseForm,
  PackingRangeForm,
  SavedBill,
  ShippingBillFormValues,
  SupportingDocForm,
} from '../types/shipping-bill.types'

export type TabKey = 'details' | 'invoices' | 'documents'

export function useShippingBill(initialBill?: SavedBill) {
  const [billId, setBillId] = useState<number | undefined>(initialBill?.id)
  const [values, setValues] = useState<ShippingBillFormValues>(() =>
    initialBill?.values ? JSON.parse(JSON.stringify(initialBill.values)) : emptyBill()
  )
  const [activeTab, setActiveTab] = useState<TabKey>('details')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [warnings, setWarnings] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<string | null>(
    initialBill?.updated ? new Date(initialBill.updated).toLocaleTimeString() : null
  )

  const setFieldValue = useCallback(
    (field: keyof ShippingBillFormValues, val: unknown) => {
      setValues((prev) => ({
        ...prev,
        [field]: val,
      }))
      setIsDirty(true)
      // Clear error for field if fixed
      setErrors((prev) => {
        if (!prev[field as string]) return prev
        const copy = { ...prev }
        delete copy[field as string]
        return copy
      })
    },
    []
  )

  const updateInvoice = useCallback(
    (index: number, updater: (inv: BillInvoiceForm) => BillInvoiceForm) => {
      setValues((prev) => {
        const list = [...prev.invoices]
        if (list[index]) {
          list[index] = updater({ ...list[index] })
        }
        return { ...prev, invoices: list }
      })
      setIsDirty(true)
    },
    []
  )

  const addInvoice = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      invoices: [...prev.invoices, emptyInvoice()],
    }))
    setIsDirty(true)
  }, [])

  const removeInvoice = useCallback((index: number) => {
    setValues((prev) => {
      if (prev.invoices.length <= 1) return prev
      const list = prev.invoices.filter((_, i) => i !== index)
      return { ...prev, invoices: list }
    })
    setIsDirty(true)
  }, [])

  const addItemToInvoice = useCallback((invoiceIndex: number) => {
    setValues((prev) => {
      const invs = [...prev.invoices]
      if (invs[invoiceIndex]) {
        invs[invoiceIndex] = {
          ...invs[invoiceIndex],
          items: [...invs[invoiceIndex].items, emptyItem()],
        }
      }
      return { ...prev, invoices: invs }
    })
    setIsDirty(true)
  }, [])

  const removeItemFromInvoice = useCallback(
    (invoiceIndex: number, itemIndex: number) => {
      setValues((prev) => {
        const invs = [...prev.invoices]
        if (invs[invoiceIndex]) {
          const items = invs[invoiceIndex].items.filter((_, i) => i !== itemIndex)
          invs[invoiceIndex] = {
            ...invs[invoiceIndex],
            items: items.length ? items : [emptyItem()],
          }
        }
        return { ...prev, invoices: invs }
      })
      setIsDirty(true)
    },
    []
  )

  const updateItemInInvoice = useCallback(
    (
      invoiceIndex: number,
      itemIndex: number,
      updater: (item: BillItemForm) => BillItemForm
    ) => {
      setValues((prev) => {
        const invs = [...prev.invoices]
        if (invs[invoiceIndex]?.items[itemIndex]) {
          const items = [...invs[invoiceIndex].items]
          items[itemIndex] = updater({ ...items[itemIndex] })
          invs[invoiceIndex] = { ...invs[invoiceIndex], items }
        }
        return { ...prev, invoices: invs }
      })
      setIsDirty(true)
    },
    []
  )

  const addContainer = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      containers: [
        ...(prev.containers || []),
        {
          containerNumber: '',
          containerSize: '40',
          sealType: 'ESEAL',
        },
      ],
    }))
    setIsDirty(true)
  }, [])

  const removeContainer = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      containers: prev.containers.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }, [])

  const updateContainer = useCallback(
    (index: number, partial: Partial<ContainerForm>) => {
      setValues((prev) => {
        const list = [...prev.containers]
        if (list[index]) {
          list[index] = { ...list[index], ...partial }
        }
        return { ...prev, containers: list }
      })
      setIsDirty(true)
    },
    []
  )

  const addPackingRange = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      packingRanges: [
        ...(prev.packingRanges || []),
        {
          packingNumberFrom: String((prev.packingRanges?.length || 0) + 1),
          packingNumberTo: String((prev.packingRanges?.length || 0) + 10),
          packingCode: 'CTN',
        },
      ],
    }))
    setIsDirty(true)
  }, [])

  const removePackingRange = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      packingRanges: prev.packingRanges.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }, [])

  const updatePackingRange = useCallback(
    (index: number, partial: Partial<PackingRangeForm>) => {
      setValues((prev) => {
        const list = [...prev.packingRanges]
        if (list[index]) {
          list[index] = { ...list[index], ...partial }
        }
        return { ...prev, packingRanges: list }
      })
      setIsDirty(true)
    },
    []
  )

  const addDocument = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      documents: [...(prev.documents || []), emptyDocument()],
    }))
    setIsDirty(true)
  }, [])

  const removeDocument = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }, [])

  const updateDocument = useCallback(
    (index: number, partial: Partial<SupportingDocForm>) => {
      setValues((prev) => {
        const list = [...prev.documents]
        if (list[index]) {
          list[index] = { ...list[index], ...partial }
        }
        return { ...prev, documents: list }
      })
      setIsDirty(true)
    },
    []
  )

  const addLicense = useCallback(() => {
    setValues((prev) => ({
      ...prev,
      licenses: [
        ...(prev.licenses || []),
        {
          registrationNumber: '',
          registrationDate: new Date().toISOString().split('T')[0],
          indigenousOrImported: 'D',
        },
      ],
    }))
    setIsDirty(true)
  }, [])

  const removeLicense = useCallback((index: number) => {
    setValues((prev) => ({
      ...prev,
      licenses: prev.licenses.filter((_, i) => i !== index),
    }))
    setIsDirty(true)
  }, [])

  const updateLicense = useCallback(
    (index: number, partial: Partial<LicenseForm>) => {
      setValues((prev) => {
        const list = [...prev.licenses]
        if (list[index]) {
          list[index] = { ...list[index], ...partial }
        }
        return { ...prev, licenses: list }
      })
      setIsDirty(true)
    },
    []
  )

  // Validate only the current step
  const validateStep = useCallback(
    (tab: TabKey): ValidationResult => {
      if (tab === 'details') return validateShipmentBasics(values)
      if (tab === 'invoices') return validateInvoices(values)
      return validateOthers(values)
    },
    [values]
  )

  // Save draft asynchronously
  const saveDraft = useCallback(async (): Promise<SavedBill | null> => {
    setIsSaving(true)
    try {
      const saved = await shippingBillService.save(values, billId)
      setBillId(saved.id)
      setIsDirty(false)
      setLastSavedTime(new Date().toLocaleTimeString())
      return saved
    } catch (err) {
      console.error('Failed to save draft:', err)
      return null
    } finally {
      setIsSaving(false)
    }
  }, [values, billId])

  // Move to next step with validation
  const goToNextStep = useCallback(async (): Promise<boolean> => {
    const result = validateStep(activeTab)
    setErrors(result.errors)
    setWarnings(result.warnings)

    if (!result.isValid) {
      return false
    }

    // Auto-save draft on step transition
    await saveDraft()

    if (activeTab === 'details') setActiveTab('invoices')
    else if (activeTab === 'invoices') setActiveTab('documents')

    return true
  }, [activeTab, validateStep, saveDraft])

  const goToPreviousStep = useCallback(() => {
    if (activeTab === 'documents') setActiveTab('invoices')
    else if (activeTab === 'invoices') setActiveTab('details')
  }, [activeTab])

  return {
    billId,
    values,
    activeTab,
    setActiveTab,
    errors,
    warnings,
    setErrors,
    isSaving,
    isDirty,
    lastSavedTime,
    setFieldValue,
    updateInvoice,
    addInvoice,
    removeInvoice,
    addItemToInvoice,
    removeItemFromInvoice,
    updateItemInInvoice,
    addContainer,
    removeContainer,
    updateContainer,
    addPackingRange,
    removePackingRange,
    updatePackingRange,
    addDocument,
    removeDocument,
    updateDocument,
    addLicense,
    removeLicense,
    updateLicense,
    validateStep,
    saveDraft,
    goToNextStep,
    goToPreviousStep,
  }
}

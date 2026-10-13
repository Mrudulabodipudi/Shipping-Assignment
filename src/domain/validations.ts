import { ShippingBillFormValues } from '../types/shipping-bill.types'

export interface ValidationError {
  path: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: Record<string, string>
  warnings: Record<string, string>
}

/**
 * Validates step 1: Shipment Basics
 */
export function validateShipmentBasics(values: ShippingBillFormValues): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  if (!values.jobDate) {
    errors.jobDate = 'Job date is required'
  }

  if (!values.exporterId) {
    errors.exporterId = 'Please select an exporter'
  }

  if (!values.exporterBranchId) {
    errors.exporterBranchId = 'Please select an exporter branch'
  }

  if (!values.consigneeId) {
    errors.consigneeId = 'Please select a consignee'
  }

  if (!values.consigneeBranchId) {
    errors.consigneeBranchId = 'Please select a consignee address/branch'
  }

  if (!values.loadingPort) {
    errors.loadingPort = 'Port of loading is required'
  } else if (!values.loadingPort.startsWith('IN')) {
    warnings.loadingPort = 'Port of loading is typically an Indian customs location (starts with IN)'
  }

  if (!values.finalDestinationPort) {
    errors.finalDestinationPort = 'Final destination port is required'
  } else if (values.loadingPort && values.loadingPort === values.finalDestinationPort) {
    errors.finalDestinationPort = 'Destination port cannot be identical to loading port for export'
  }

  const gross = Number(values.grossWeight)
  const net = Number(values.netWeight)

  if (values.grossWeight && (isNaN(gross) || gross <= 0)) {
    errors.grossWeight = 'Gross weight must be greater than zero'
  }

  if (values.netWeight && (isNaN(net) || net <= 0)) {
    errors.netWeight = 'Net weight must be greater than zero'
  }

  if (gross > 0 && net > 0 && net > gross) {
    errors.netWeight = 'Net weight cannot exceed gross weight'
  }

  if (values.totalPackages && (isNaN(Number(values.totalPackages)) || Number(values.totalPackages) <= 0)) {
    errors.totalPackages = 'Total packages must be a positive number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates step 2: Invoices and Goods
 */
export function validateInvoices(values: ShippingBillFormValues): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  if (!values.invoices || values.invoices.length === 0) {
    errors.invoices = 'At least one invoice is required'
    return { isValid: false, errors, warnings }
  }

  values.invoices.forEach((invoice, invIndex) => {
    const invPrefix = `invoices.${invIndex}`

    if (!invoice.invoiceNumber?.trim()) {
      errors[`${invPrefix}.invoiceNumber`] = 'Invoice number is required'
    }

    if (!invoice.invoiceDate) {
      errors[`${invPrefix}.invoiceDate`] = 'Invoice date is required'
    }

    if (!invoice.currency) {
      errors[`${invPrefix}.currency`] = 'Invoice currency is required'
    }

    if (!invoice.contractType) {
      errors[`${invPrefix}.contractType`] = 'Contract terms (Incoterm) are required'
    }

    if (!invoice.buyerSameAsConsignee) {
      if (!invoice.buyerId) {
        errors[`${invPrefix}.buyerId`] = 'Buyer must be selected when different from consignee'
      }
      if (!invoice.buyerBranchId) {
        errors[`${invPrefix}.buyerBranchId`] = 'Buyer branch/address is required'
      }
    }

    if (!invoice.items || invoice.items.length === 0) {
      errors[`${invPrefix}.items`] = 'Invoice must have at least one line item'
    } else {
      invoice.items.forEach((item, itemIndex) => {
        const itemPrefix = `${invPrefix}.items.${itemIndex}`

        if (!item.ritcCode?.trim()) {
          errors[`${itemPrefix}.ritcCode`] = 'RITC / HS Code is required'
        } else if (!/^\d{4,8}$/.test(item.ritcCode.trim())) {
          warnings[`${itemPrefix}.ritcCode`] = 'Customs RITC is typically 6 to 8 digits'
        }

        if (!item.goodsDescription1?.trim()) {
          errors[`${itemPrefix}.goodsDescription1`] = 'Goods description is required'
        }

        const qty = Number(item.quantity)
        if (isNaN(qty) || qty <= 0) {
          errors[`${itemPrefix}.quantity`] = 'Quantity must be greater than zero'
        }

        const price = Number(item.unitPrice)
        if (isNaN(price) || price <= 0) {
          errors[`${itemPrefix}.unitPrice`] = 'Unit price must be greater than zero'
        }

        if (!item.unitOfMeasurement) {
          errors[`${itemPrefix}.unitOfMeasurement`] = 'UOM is required'
        }

        if (item.igstPaymentStatus === 'P') {
          if (!item.taxableValue || Number(item.taxableValue) <= 0) {
            errors[`${itemPrefix}.taxableValue`] = 'Taxable value required when paying IGST'
          }
          if (!item.igstAmount || Number(item.igstAmount) <= 0) {
            errors[`${itemPrefix}.igstAmount`] = 'IGST amount required when paying IGST'
          }
        }

        if (item.thirdPartyItem && !item.itemThirdPartyId) {
          errors[`${itemPrefix}.itemThirdPartyId`] = 'Select third party business entity'
        }
      })
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Validates step 3: Others (Containers, Packing, Documents, Licenses)
 */
export function validateOthers(values: ShippingBillFormValues): ValidationResult {
  const errors: Record<string, string> = {}
  const warnings: Record<string, string> = {}

  values.containers?.forEach((container, index) => {
    if (!container.containerNumber?.trim()) {
      errors[`containers.${index}.containerNumber`] = 'Container number is required'
    } else if (!/^[A-Z]{3}[UJZ]\d{7}$/i.test(container.containerNumber.trim())) {
      warnings[`containers.${index}.containerNumber`] = 'Standard ISO container format is 4 letters + 7 digits'
    }
  })

  values.packingRanges?.forEach((range, index) => {
    const from = Number(range.packingNumberFrom)
    const to = Number(range.packingNumberTo)
    if (isNaN(from) || from <= 0) {
      errors[`packingRanges.${index}.packingNumberFrom`] = 'Valid starting number required'
    }
    if (isNaN(to) || to < from) {
      errors[`packingRanges.${index}.packingNumberTo`] = 'Ending number must be >= starting number'
    }
  })

  values.documents?.forEach((doc, index) => {
    if (!doc.documentTypeCode) {
      errors[`documents.${index}.documentTypeCode`] = 'Document type code required'
    }
    if (!doc.documentReferenceNumber?.trim()) {
      errors[`documents.${index}.documentReferenceNumber`] = 'Document reference number required'
    }
  })

  values.licenses?.forEach((lic, index) => {
    if (!lic.registrationNumber?.trim()) {
      errors[`licenses.${index}.registrationNumber`] = 'Licence registration number required'
    }
  })

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    warnings,
  }
}

/**
 * Performs full form validation across all tabs
 */
export function validateFullShippingBill(values: ShippingBillFormValues): ValidationResult {
  const basics = validateShipmentBasics(values)
  const invoices = validateInvoices(values)
  const others = validateOthers(values)

  const combinedErrors = {
    ...basics.errors,
    ...invoices.errors,
    ...others.errors,
  }

  const combinedWarnings = {
    ...basics.warnings,
    ...invoices.warnings,
    ...others.warnings,
  }

  return {
    isValid: Object.keys(combinedErrors).length === 0,
    errors: combinedErrors,
    warnings: combinedWarnings,
  }
}

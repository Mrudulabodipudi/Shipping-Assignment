import {
  BillInvoiceForm,
  BillItemForm,
  ShippingBillFormValues,
  SupportingDocForm,
} from '../types/shipping-bill.types'

/**
 * Calculates item line total based on quantity, unit price, and rate divisor.
 * Formula: (quantity * unitPrice) / numberOfUnits
 */
export function lineTotal(item: BillItemForm): number {
  const qty = Number(item.quantity)
  const price = Number(item.unitPrice)
  const divisor = Number(item.numberOfUnits)

  if (!Number.isFinite(qty) || !Number.isFinite(price) || qty <= 0 || price <= 0) {
    return 0
  }

  const effectiveDivisor = Number.isFinite(divisor) && divisor > 0 ? divisor : 1
  return (qty * price) / effectiveDivisor
}

/**
 * Calculates the total of an invoice based on its line items.
 */
export function invoiceTotal(invoice: BillInvoiceForm): number {
  if (invoice.invoiceTotal != null && String(invoice.invoiceTotal).trim() !== '') {
    const override = Number(invoice.invoiceTotal)
    if (Number.isFinite(override) && override > 0) return override
  }

  return (invoice.items || []).reduce((sum, item) => sum + lineTotal(item), 0)
}

/**
 * Calculates aggregate shipping bill statistics across all invoices.
 */
export function calculateShippingBillTotals(values: ShippingBillFormValues) {
  const totalInvoices = values.invoices?.length || 0
  let totalItems = 0
  let grandTotalAmount = 0
  const currencySet = new Set<string>()

  for (const inv of values.invoices || []) {
    if (inv.currency) currencySet.add(inv.currency)
    totalItems += inv.items?.length || 0
    grandTotalAmount += invoiceTotal(inv)
  }

  return {
    totalInvoices,
    totalItems,
    grandTotalAmount,
    currencies: Array.from(currencySet),
    containerCount: values.containers?.length || Number(values.numberOfContainers) || 0,
    packagesCount: Number(values.totalPackages) || 0,
    grossWeight: Number(values.grossWeight) || 0,
    netWeight: Number(values.netWeight) || 0,
  }
}

/**
 * Derives country name or code from port code.
 */
export function portCountry(portCode?: string): string {
  if (!portCode) return ''
  const prefix = portCode.slice(0, 2).toUpperCase()
  const map: Record<string, string> = {
    IN: 'India',
    US: 'United States',
    DE: 'Germany',
    AE: 'United Arab Emirates',
    SG: 'Singapore',
    GB: 'United Kingdom',
    KR: 'South Korea',
    CN: 'China',
    JP: 'Japan',
    AU: 'Australia',
  }
  return map[prefix] || prefix
}

export function emptyItem(): BillItemForm {
  return {
    ritcCode: '',
    goodsDescription1: '',
    quantity: '1',
    unitOfMeasurement: 'PCS',
    unitPrice: '0',
    unitOfRate: 'PCS',
    numberOfUnits: '1',
    igstPaymentStatus: 'LUT',
    rewardItem: true,
    thirdPartyItem: false,
  }
}

export function emptyInvoice(): BillInvoiceForm {
  return {
    invoiceNumber: '',
    invoiceDate: new Date().toISOString().split('T')[0],
    currency: 'USD',
    contractType: 'FOB',
    buyerSameAsConsignee: true,
    buyerId: '',
    buyerBranchId: '',
    items: [emptyItem()],
  }
}

export function emptyDocument(): SupportingDocForm {
  return {
    documentTypeCode: '380000', // Commercial Invoice
    documentReferenceNumber: '',
    invoiceSerialNumber: '1',
    itemSerialNumber: '1',
    fileType: 'pdf',
  }
}

export function emptyBill(): ShippingBillFormValues {
  return {
    jobNumber: '',
    jobDate: new Date().toISOString().split('T')[0],
    exporterId: '',
    exporterBranchId: '',
    consigneeId: '',
    consigneeBranchId: '',
    loadingPort: '',
    finalDestinationPort: '',
    natureOfCargo: 'P',
    measurementUnit: 'KG',
    sealType: 'S',
    invoices: [emptyInvoice()],
    containers: [],
    packingRanges: [],
    documents: [],
    licenses: [],
  }
}

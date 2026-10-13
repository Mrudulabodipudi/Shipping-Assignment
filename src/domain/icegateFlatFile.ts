import { SavedBill, ShippingBillFormValues } from '../types/shipping-bill.types'

/**
 * Generates official ICEGATE EDI Flat File (.sb) content from a SavedBill or form values.
 * Uses ICEGATE standard table delimiters: HREC, SHIPPING_BILL, INVOICE, ITEM, PACKING, TREC.
 */
export function generateIcegateFlatFile(bill: SavedBill | { id: number; values: ShippingBillFormValues }): string {
  const v = bill.values
  const lines: string[] = []

  const cleanText = (str?: string) => (str || '').replace(/[\^\r\n]+/g, ' ').trim()

  // Header Record
  lines.push(`HREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  // Shipping Bill Header Table
  lines.push(`<TABLE>SHIPPING_BILL`)
  lines.push(
    `<F>MESSAGE_TYPE^CHA_ID^JOB_NO^JOB_DATE^EXPORTER_ID^EXPORTER_BRANCH^CONSIGNEE_ID^LOADING_PORT^DEST_PORT^DISCHARGE_PORT^SEAL_TYPE^NATURE_OF_CARGO^GROSS_WEIGHT^NET_WEIGHT^UOM^PACKAGES^MARKS`
  )
  lines.push(
    `<R>F^1000^${v.jobNumber || bill.id}^${v.jobDate || ''}^${v.exporterId || ''}^${v.exporterBranchId || ''}^${v.consigneeId || ''}^${v.loadingPort || ''}^${v.finalDestinationPort || ''}^${v.dischargePort || v.finalDestinationPort || ''}^${v.sealType || ''}^${v.natureOfCargo || ''}^${v.grossWeight || ''}^${v.netWeight || ''}^${v.measurementUnit || 'KGS'}^${v.totalPackages || ''}^${cleanText(v.marksAndNumbers)}`
  )

  // Invoices Table
  if (v.invoices && v.invoices.length > 0) {
    lines.push(`<TABLE>INVOICE`)
    lines.push(
      `<F>INVOICE_SN^INVOICE_NO^INVOICE_DATE^CURRENCY^CONTRACT_TYPE^BUYER_ID^FREIGHT_AMOUNT^INSURANCE_AMOUNT`
    )
    v.invoices.forEach((inv, idx) => {
      lines.push(
        `<R>${idx + 1}^${inv.invoiceNumber}^${inv.invoiceDate || ''}^${inv.currency || 'USD'}^${inv.contractType || 'FOB'}^${inv.buyerId || v.consigneeId || ''}^${inv.freightAmount || 0}^${inv.insuranceAmount || 0}`
      )
    })

    // Goods Items Table
    lines.push(`<TABLE>ITEM`)
    lines.push(
      `<F>INVOICE_SN^ITEM_SN^RITC_CODE^DESCRIPTION^QUANTITY^UOM^UNIT_PRICE^LINE_TOTAL^SCHEME_CODE`
    )
    v.invoices.forEach((inv, invIdx) => {
      ;(inv.items || []).forEach((item, itemIdx) => {
        const qty = Number(item.quantity) || 0
        const price = Number(item.unitPrice) || 0
        const divisor = Number(item.numberOfUnits) || 1
        const lineTotal = ((qty * price) / divisor).toFixed(2)

        lines.push(
          `<R>${invIdx + 1}^${itemIdx + 1}^${item.ritcCode || ''}^${cleanText(item.goodsDescription1)}^${item.quantity || ''}^${item.unitOfMeasurement || 'PCS'}^${item.unitPrice || ''}^${lineTotal}^${item.schemeCode || ''}`
        )
      })
    })
  }

  // Packing List Table
  if (v.packingRanges && v.packingRanges.length > 0) {
    lines.push(`<TABLE>PACKING`)
    lines.push(`<F>FROM_PKG^TO_PKG^PKG_CODE`)
    v.packingRanges.forEach((pkg) => {
      lines.push(`<R>${pkg.packingNumberFrom}^${pkg.packingNumberTo}^${pkg.packingCode || 'CTN'}`)
    })
  }

  // Supporting Documents Table
  if (v.documents && v.documents.length > 0) {
    lines.push(`<TABLE>SUPPORTING_DOCS`)
    lines.push(`<F>DOC_SN^DOC_TYPE^DOC_REF^ISSUE_DATE^IMAGE_REF`)
    v.documents.forEach((doc, idx) => {
      lines.push(
        `<R>${idx + 1}^${doc.documentTypeCode}^${cleanText(doc.documentReferenceNumber)}^${doc.documentIssueDate || ''}^${doc.imageReferenceNumber || ''}`
      )
    })
  }

  // Licences Table
  if (v.licenses && v.licenses.length > 0) {
    lines.push(`<TABLE>LICENCE`)
    lines.push(`<F>LICENCE_SN^REG_NO^REG_DATE^QTY^EXP_QTY^ITEM_SN`)
    v.licenses.forEach((lic, idx) => {
      lines.push(
        `<R>${idx + 1}^${lic.registrationNumber}^${lic.registrationDate || ''}^${lic.licenseQuantity || ''}^${lic.licenseExportQuantity || ''}^${lic.itemSerialNumber || '1'}`
      )
    })
  }

  // Trailer Record
  lines.push(`TREC**ZZ*${v.loadingPort || 'INMUN1'}*ZZ*ICEGATE*01*SB*1.0*`)

  return lines.join('\r\n')
}

/**
 * Initiates browser file download for the ICEGATE flat file
 */
export function downloadIcegateFile(bill: SavedBill | { id: number; values: ShippingBillFormValues }): void {
  const content = generateIcegateFlatFile(bill)
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' })
  const filename = `shipping_bill_${bill.values.jobNumber || bill.id}.sb`

  const url = window.URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => window.URL.revokeObjectURL(url), 1000)
}

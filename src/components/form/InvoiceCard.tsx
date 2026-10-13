import { useEffect, useState } from 'react'
import { Plus, Trash2, Receipt, DollarSign, UserCheck } from 'lucide-react'
import { masterDataService } from '../../services/api/masterDataService'
import { partyService } from '../../services/api/partyService'
import { SelectOption } from '../../types/master-data.types'
import { BillInvoiceForm, BillItemForm } from '../../types/shipping-bill.types'
import { emptyItem, invoiceTotal } from '../../domain/calculations'
import { AsyncSelect } from '../common/AsyncSelect'
import { Button } from '../common/Button'
import { Card, CardContent, CardHeader } from '../common/Card'
import { Checkbox } from '../common/Checkbox'
import { CollapsibleSection } from '../common/CollapsibleSection'
import { Input } from '../common/Input'
import { Select } from '../common/Select'
import { GoodsItemEditor } from './GoodsItemEditor'

export interface InvoiceCardProps {
  invoice: BillInvoiceForm
  index: number
  totalInvoices: number
  consigneeId: string
  consigneeBranchId: string
  errors: Record<string, string>
  onUpdate: (updater: (prev: BillInvoiceForm) => BillInvoiceForm) => void
  onRemove: () => void
}

export function InvoiceCard({
  invoice,
  index,
  totalInvoices,
  consigneeId: _consigneeId,
  consigneeBranchId: _consigneeBranchId,
  errors,
  onUpdate,
  onRemove,
}: InvoiceCardProps) {
  const [currencies, setCurrencies] = useState<SelectOption[]>([])
  const [contractTypes, setContractTypes] = useState<SelectOption[]>([])
  const [paymentTypes, setPaymentTypes] = useState<SelectOption[]>([])
  const [priceInclusions, setPriceInclusions] = useState<SelectOption[]>([])

  useEffect(() => {
    let active = true
    Promise.all([
      masterDataService.getCurrencies(),
      masterDataService.getContractTypes(),
      masterDataService.getPaymentTypes(),
      masterDataService.getPriceInclusionTypes(),
    ]).then(([currs, contracts, payments, inclusions]) => {
      if (active) {
        setCurrencies(currs)
        setContractTypes(contracts)
        setPaymentTypes(payments)
        setPriceInclusions(inclusions)
      }
    })
    return () => {
      active = false
    }
  }, [])

  const errorPrefix = `invoices.${index}`
  const calculatedTotal = invoiceTotal(invoice)

  const handleAddItem = () => {
    onUpdate((prev) => ({
      ...prev,
      items: [...prev.items, emptyItem()],
    }))
  }

  const handleRemoveItem = (itemIndex: number) => {
    onUpdate((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== itemIndex),
    }))
  }

  const handleUpdateItem = (itemIndex: number, itemUpdater: (prev: BillItemForm) => BillItemForm) => {
    onUpdate((prev) => {
      const items = [...prev.items]
      if (items[itemIndex]) {
        items[itemIndex] = itemUpdater(items[itemIndex])
      }
      return { ...prev, items }
    })
  }

  return (
    <Card className="border-slate-300 shadow-sm">
      <CardHeader className="bg-slate-50/70">
        <div className="flex items-center gap-2">
          <Receipt className="size-4.5 text-blue-600" />
          <h3 className="text-sm sm:text-base font-bold text-slate-900">
            Invoice #{index + 1}
            {invoice.invoiceNumber && ` (${invoice.invoiceNumber})`}
          </h3>
          <span className="text-xs text-slate-500 font-normal">
            · {invoice.items.length} {invoice.items.length === 1 ? 'item' : 'items'}
          </span>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-[11px] text-slate-500 block leading-none">Invoice Total</span>
            <span className="text-base font-bold text-slate-950">
              {invoice.currency} {calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {totalInvoices > 1 && (
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={onRemove}
              className="text-rose-600 hover:bg-rose-50 hover:border-rose-200"
            >
              <Trash2 className="size-3.5" />
              Remove
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Invoice Metadata */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Input
            label="Commercial Invoice Number"
            required
            value={invoice.invoiceNumber}
            onChange={(e) => onUpdate((prev) => ({ ...prev, invoiceNumber: e.target.value }))}
            error={errors[`${errorPrefix}.invoiceNumber`]}
            placeholder="e.g. EXP/2026/081"
          />

          <Input
            label="Invoice Date"
            type="date"
            required
            value={invoice.invoiceDate}
            onChange={(e) => onUpdate((prev) => ({ ...prev, invoiceDate: e.target.value }))}
            error={errors[`${errorPrefix}.invoiceDate`]}
          />

          <Select
            label="Invoice Currency"
            required
            value={invoice.currency}
            onChange={(e) => onUpdate((prev) => ({ ...prev, currency: e.target.value }))}
            error={errors[`${errorPrefix}.currency`]}
            options={currencies}
          />

          <Select
            label="Contract Type (Incoterm)"
            required
            value={invoice.contractType}
            onChange={(e) => onUpdate((prev) => ({ ...prev, contractType: e.target.value }))}
            error={errors[`${errorPrefix}.contractType`]}
            options={contractTypes}
          />
        </div>

        {/* Buyer Section */}
        <div className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-3">
          <div className="flex items-center justify-between">
            <Checkbox
              label="Overseas Buyer is the same as Consignee"
              checked={invoice.buyerSameAsConsignee}
              onChange={(e) =>
                onUpdate((prev) => ({ ...prev, buyerSameAsConsignee: e.target.checked }))
              }
            />
            {invoice.buyerSameAsConsignee && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <UserCheck className="size-3.5 text-emerald-600" />
                Linked to consignee
              </span>
            )}
          </div>

          {!invoice.buyerSameAsConsignee && (
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AsyncSelect
                label="Select Overseas Buyer"
                required
                value={invoice.buyerId}
                error={errors[`${errorPrefix}.buyerId`]}
                placeholder="Search registered buyers..."
                fetchOptions={async (query) => {
                  const list = await partyService.searchBuyers(query)
                  return list.map((b) => ({
                    value: String(b.id),
                    label: b.name,
                    sublabel: b.branches[0]?.city,
                  }))
                }}
                getInitialLabel={async (id) => {
                  const b = await partyService.getBusinessById(id)
                  return b ? b.name : id
                }}
                onChange={(id) => onUpdate((prev) => ({ ...prev, buyerId: id }))}
              />

              <Input
                label="Buyer Address / Branch ID"
                value={invoice.buyerBranchId}
                onChange={(e) => onUpdate((prev) => ({ ...prev, buyerBranchId: e.target.value }))}
                error={errors[`${errorPrefix}.buyerBranchId`]}
                placeholder="Branch ID"
              />
            </div>
          )}
        </div>

        {/* Financial Adjustments: Freight, Insurance, Commission, Discounts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="size-3.5 text-blue-600" />
              Customs Financial Adjustments (Freight, Insurance & Deductions)
            </span>
            <span className="text-[11px] text-slate-500">
              Entering Rate locks Amount (mutually exclusive)
            </span>
          </div>

          <div className="rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden bg-white text-xs">
            {/* Freight Row */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <span className="sm:col-span-3 font-semibold text-slate-800">
                Ocean / Air Freight
              </span>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Freight Rate %"
                  suffixText="%"
                  disabled={Boolean(invoice.freightAmount && Number(invoice.freightAmount) > 0)}
                  value={invoice.freightRate || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, freightRate: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Freight Amount"
                  prefixText={invoice.freightCurrency || invoice.currency}
                  disabled={Boolean(invoice.freightRate && Number(invoice.freightRate) > 0)}
                  value={invoice.freightAmount || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, freightAmount: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  value={invoice.freightCurrency || invoice.currency}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, freightCurrency: e.target.value }))}
                  options={currencies}
                />
              </div>
            </div>

            {/* Insurance Row */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50/40">
              <span className="sm:col-span-3 font-semibold text-slate-800">
                Transit Insurance
              </span>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Insurance Rate %"
                  suffixText="%"
                  disabled={Boolean(invoice.insuranceAmount && Number(invoice.insuranceAmount) > 0)}
                  value={invoice.insuranceRate || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, insuranceRate: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Insurance Amount"
                  prefixText={invoice.insuranceCurrency || invoice.currency}
                  disabled={Boolean(invoice.insuranceRate && Number(invoice.insuranceRate) > 0)}
                  value={invoice.insuranceAmount || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, insuranceAmount: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  value={invoice.insuranceCurrency || invoice.currency}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, insuranceCurrency: e.target.value }))}
                  options={currencies}
                />
              </div>
            </div>

            {/* Commission Row */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              <span className="sm:col-span-3 font-semibold text-slate-800">
                Brokerage / Commission
              </span>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Commission %"
                  suffixText="%"
                  disabled={Boolean(invoice.commissionAmount && Number(invoice.commissionAmount) > 0)}
                  value={invoice.commissionRate || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, commissionRate: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Commission Amount"
                  prefixText={invoice.commissionCurrency || invoice.currency}
                  disabled={Boolean(invoice.commissionRate && Number(invoice.commissionRate) > 0)}
                  value={invoice.commissionAmount || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, commissionAmount: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  value={invoice.commissionCurrency || invoice.currency}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, commissionCurrency: e.target.value }))}
                  options={currencies}
                />
              </div>
            </div>

            {/* Discount Row */}
            <div className="p-3 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center bg-slate-50/40">
              <span className="sm:col-span-3 font-semibold text-slate-800">
                Trade Discount
              </span>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Discount Rate %"
                  suffixText="%"
                  disabled={Boolean(invoice.discountAmount && Number(invoice.discountAmount) > 0)}
                  value={invoice.discountRate || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, discountRate: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Discount Amount"
                  prefixText={invoice.discountCurrency || invoice.currency}
                  disabled={Boolean(invoice.discountRate && Number(invoice.discountRate) > 0)}
                  value={invoice.discountAmount || ''}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, discountAmount: e.target.value }))}
                />
              </div>
              <div className="sm:col-span-3">
                <Select
                  value={invoice.discountCurrency || invoice.currency}
                  onChange={(e) => onUpdate((prev) => ({ ...prev, discountCurrency: e.target.value }))}
                  options={currencies}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collapsible Additional Commercial Terms */}
        <CollapsibleSection title="Commercial Terms & Payment Details" subtitle="Packing charges, contract numbers, terms of payment">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Input
              label="Packing & Containerization Charges"
              type="number"
              step="any"
              min="0"
              placeholder="0.00"
              value={invoice.packingCharges || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, packingCharges: e.target.value }))}
            />
            <Select
              label="Price Includes (Incoterm Inclusion)"
              value={invoice.freightInsuranceIncluded || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, freightInsuranceIncluded: e.target.value }))}
              options={priceInclusions}
              placeholder="Select if included"
            />
            <Input
              label="Sales Contract / PO Number"
              value={invoice.contractNumber || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, contractNumber: e.target.value }))}
              placeholder="PO or Contract Number"
            />
            <Select
              label="Nature of Payment"
              value={invoice.natureOfPayment || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, natureOfPayment: e.target.value }))}
              options={paymentTypes}
              placeholder="Select payment type"
            />
            <Input
              label="Payment Credit Period (Days)"
              type="number"
              min="0"
              value={invoice.periodOfPayment || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, periodOfPayment: e.target.value }))}
              placeholder="e.g. 90"
            />
            <Input
              label="Manual Invoice Total Override"
              type="number"
              min="0"
              step="any"
              value={invoice.invoiceTotal || ''}
              onChange={(e) => onUpdate((prev) => ({ ...prev, invoiceTotal: e.target.value }))}
              placeholder={`Auto: ${calculatedTotal.toFixed(2)}`}
              hint="Leave blank for automatic calculation"
            />
          </div>
        </CollapsibleSection>

        {/* Line Items List */}
        <div className="pt-4 border-t border-slate-100 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">
                Goods Line Items ({invoice.items.length})
              </h4>
              <p className="text-xs text-slate-500">
                HS / RITC classification, descriptions, incentives and drawback quantities.
              </p>
            </div>

            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={handleAddItem}
              className="border-blue-300 text-blue-700 hover:bg-blue-50"
            >
              <Plus className="size-3.5" />
              Add Line Item
            </Button>
          </div>

          <div className="space-y-4">
            {invoice.items.map((item, itemIdx) => (
              <GoodsItemEditor
                key={itemIdx}
                item={item}
                itemIndex={itemIdx}
                invoiceIndex={index}
                currency={invoice.currency}
                errorPrefix={`${errorPrefix}.items.${itemIdx}`}
                errors={errors}
                onUpdate={(updater) => handleUpdateItem(itemIdx, updater)}
                onRemove={() => handleRemoveItem(itemIdx)}
                canRemove={invoice.items.length > 1}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { useEffect, useState, useCallback } from 'react'
import {
  Plus,
  Search,
  Download,
  Edit2,
  Trash2,
  FileText,
  Ship,
  TrendingUp,
  RefreshCw,
  Building2,
  ArrowRight,
  Loader2,
} from 'lucide-react'
import { calculateShippingBillTotals } from '../../domain/calculations'
import { shippingBillService } from '../../services/api/shippingBillService'
import { SavedBill } from '../../types/shipping-bill.types'
import { Badge } from '../common/Badge'
import { Button } from '../common/Button'
import { Card, CardContent } from '../common/Card'
import { Modal } from '../common/Modal'
import { useToast } from '../common/Toast'

export interface ShippingBillListProps {
  onCreateNew: () => void
  onEditBill: (bill: SavedBill) => void
}

export function ShippingBillList({
  onCreateNew,
  onEditBill,
}: ShippingBillListProps) {
  const toast = useToast()
  const [bills, setBills] = useState<SavedBill[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [downloadingId, setDownloadingId] = useState<number | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SavedBill | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchBills = useCallback(async () => {
    setIsLoading(true)
    try {
      const res = await shippingBillService.list({
        search,
        status: statusFilter,
        page: 1,
        pageSize: 50,
      })
      setBills(res.items)
    } catch (err) {
      console.error(err)
      toast.error('Failed to load shipping bills')
    } finally {
      setIsLoading(false)
    }
  }, [search, statusFilter, toast])

  useEffect(() => {
    fetchBills()
  }, [fetchBills])

  const handleDownload = async (bill: SavedBill) => {
    setDownloadingId(bill.id)
    try {
      await shippingBillService.downloadFlatFile(bill.id)
      toast.success(`Flat file (.sb) downloaded for Job #${bill.values.jobNumber || bill.id}`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to generate flat file')
    } finally {
      setDownloadingId(null)
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      await shippingBillService.delete(deleteTarget.id)
      toast.success(`Shipping bill #${deleteTarget.values.jobNumber || deleteTarget.id} deleted`)
      setDeleteTarget(null)
      fetchBills()
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete shipping bill')
    } finally {
      setIsDeleting(false)
    }
  }

  // Aggregate stats across all loaded bills
  const totalInvoicesCount = bills.reduce((sum, b) => sum + (b.values.invoices?.length || 0), 0)
  const totalGrossWeight = bills.reduce((sum, b) => sum + (Number(b.values.grossWeight) || 0), 0)

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Export Shipping Bills
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            ICEGATE Customs electronic declarations, invoice filings, and EDI flat-file generation.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchBills}
            isLoading={isLoading}
            className="text-slate-700 bg-white"
          >
            <RefreshCw className="size-3.5" />
            Refresh
          </Button>

          <Button
            size="sm"
            onClick={onCreateNew}
            className="bg-blue-600 hover:bg-blue-700 shadow-sm"
          >
            <Plus className="size-4" />
            New Shipping Bill
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Total Shipping Bills
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {bills.length}
              </span>
            </div>
            <div className="size-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileText className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Active Commercial Invoices
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {totalInvoicesCount}
              </span>
            </div>
            <div className="size-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Gross Export Weight
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                {totalGrossWeight.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg
              </span>
            </div>
            <div className="size-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Ship className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                Registered Exporters
              </span>
              <span className="text-2xl font-extrabold text-slate-900 mt-1 block">
                4 Entities
              </span>
            </div>
            <div className="size-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Building2 className="size-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <Card>
        <CardContent className="p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Job #, Exporter, Consignee, or Port..."
              className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-300 text-xs sm:text-sm bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'All Bills' },
              { id: 'filed', label: 'Filed' },
              { id: 'ready_for_filing', label: 'Ready for Filing' },
              { id: 'draft', label: 'Drafts' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === tab.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Bills Table */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="size-6 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Querying asynchronous shipping bill service...</span>
          </div>
        ) : bills.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="size-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="size-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800">No Shipping Bills Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? `No bills match "${search}". Try clearing your search filter.`
                : 'Get started by creating your first export shipping bill declaration.'}
            </p>
            <Button size="sm" onClick={onCreateNew}>
              <Plus className="size-3.5" />
              Create Shipping Bill
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Job # / Date</th>
                  <th className="py-3 px-4">Exporter</th>
                  <th className="py-3 px-4">Consignee</th>
                  <th className="py-3 px-4">Route</th>
                  <th className="py-3 px-4">Declared Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-800">
                {bills.map((bill) => {
                  const totals = calculateShippingBillTotals(bill.values)
                  const isCurrentDownloading = downloadingId === bill.id

                  return (
                    <tr
                      key={bill.id}
                      className="hover:bg-slate-50/60 transition-colors group cursor-pointer"
                      onClick={() => onEditBill(bill)}
                    >
                      <td className="py-3 px-4 font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            #{bill.values.jobNumber || bill.id}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {bill.values.jobDate || new Date(bill.created).toLocaleDateString()}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-900 block truncate max-w-[180px]">
                          {bill.values.exporterName || `Exporter #${bill.values.exporterId || '—'}`}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-medium text-slate-700 block truncate max-w-[180px]">
                          {bill.values.consigneeName || `Consignee #${bill.values.consigneeId || '—'}`}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5 font-medium text-slate-700">
                          <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">
                            {bill.values.loadingPort || 'INMUN1'}
                          </span>
                          <ArrowRight className="size-3 text-slate-400" />
                          <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-[10px]">
                            {bill.values.finalDestinationPort || 'USMSY'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">
                            {totals.currencies[0] || 'USD'}{' '}
                            {totals.grandTotalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {totals.totalInvoices} inv · {totals.totalItems} items
                          </span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            bill.status === 'filed'
                              ? 'success'
                              : bill.status === 'ready_for_filing'
                              ? 'info'
                              : 'neutral'
                          }
                          size="sm"
                        >
                          {bill.status === 'filed'
                            ? 'Filed'
                            : bill.status === 'ready_for_filing'
                            ? 'Ready'
                            : 'Draft'}
                        </Badge>
                      </td>

                      <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDownload(bill)}
                            isLoading={isCurrentDownloading}
                            title="Download ICEGATE Flat File (.sb)"
                            className="text-slate-600 hover:text-blue-600"
                          >
                            <Download className="size-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onEditBill(bill)}
                            title="Edit Shipping Bill"
                            className="text-slate-600 hover:text-blue-600"
                          >
                            <Edit2 className="size-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setDeleteTarget(bill)}
                            title="Delete Shipping Bill"
                            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={Boolean(deleteTarget)}
          onClose={() => setDeleteTarget(null)}
          title="Delete Shipping Bill"
          description={`Are you sure you want to delete Shipping Bill #${deleteTarget.values.jobNumber || deleteTarget.id}? This action cannot be undone.`}
          maxWidth="sm"
        >
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => setDeleteTarget(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              type="button"
              onClick={confirmDelete}
              isLoading={isDeleting}
            >
              Confirm Delete
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

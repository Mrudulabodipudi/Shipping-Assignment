import { downloadIcegateFile, generateIcegateFlatFile } from '../../domain/icegateFlatFile'
import { validateFullShippingBill, ValidationResult } from '../../domain/validations'
import { PaginatedResult } from '../../types/master-data.types'
import { SavedBill, ShippingBillFormValues } from '../../types/shipping-bill.types'
import { mockStorage } from '../mock/storage'
import { apiClient } from './client'

export interface BillListFilter {
  search?: string
  status?: string
  page?: number
  pageSize?: number
}

export const shippingBillService = {
  /**
   * Fetch paginated list of shipping bills with search and status filtering
   */
  async list(filter?: BillListFilter): Promise<PaginatedResult<SavedBill>> {
    return apiClient.execute(() => {
      const all = mockStorage.getBills()
      const search = (filter?.search || '').trim().toLowerCase()
      const status = filter?.status || 'all'
      const page = filter?.page || 1
      const pageSize = filter?.pageSize || 10

      let filtered = all.filter((bill) => {
        if (status !== 'all' && bill.status !== status) return false
        if (!search) return true

        const job = (bill.values.jobNumber || String(bill.id)).toLowerCase()
        const exp = (bill.values.exporterName || '').toLowerCase()
        const con = (bill.values.consigneeName || '').toLowerCase()
        const portL = (bill.values.loadingPort || '').toLowerCase()
        const portD = (bill.values.finalDestinationPort || '').toLowerCase()

        return (
          job.includes(search) ||
          exp.includes(search) ||
          con.includes(search) ||
          portL.includes(search) ||
          portD.includes(search)
        )
      })

      // Sort by newest updated
      filtered.sort((a, b) => new Date(b.updated).getTime() - new Date(a.updated).getTime())

      const total = filtered.length
      const start = (page - 1) * pageSize
      const items = filtered.slice(start, start + pageSize)

      return {
        items,
        total,
        page,
        pageSize,
        hasMore: start + pageSize < total,
      }
    })
  },

  /**
   * Get single shipping bill by ID
   */
  async getById(id: string | number): Promise<SavedBill | undefined> {
    return apiClient.execute(() => {
      return mockStorage.getBillById(Number(id))
    })
  },

  /**
   * Upsert shipping bill (creates or updates draft)
   */
  async save(values: ShippingBillFormValues, id?: number): Promise<SavedBill> {
    return apiClient.execute(() => {
      return mockStorage.saveBill(values, id)
    })
  },

  /**
   * Delete shipping bill by ID
   */
  async delete(id: number): Promise<boolean> {
    return apiClient.execute(() => {
      return mockStorage.deleteBill(id)
    })
  },

  /**
   * Validate shipping bill asynchronously
   */
  async validate(values: ShippingBillFormValues): Promise<ValidationResult> {
    return apiClient.execute(() => {
      return validateFullShippingBill(values)
    })
  },

  /**
   * Generate ICEGATE EDI flat file string
   */
  async generateFlatFile(id: number): Promise<{ filename: string; content: string }> {
    return apiClient.execute(() => {
      const bill = mockStorage.getBillById(id)
      if (!bill) throw new Error(`Shipping bill #${id} not found`)
      const content = generateIcegateFlatFile(bill)
      const filename = `shipping_bill_${bill.values.jobNumber || bill.id}.sb`
      return { filename, content }
    })
  },

  /**
   * Download ICEGATE EDI flat file directly
   */
  async downloadFlatFile(id: number): Promise<{ success: boolean; filename: string }> {
    return apiClient.execute(() => {
      const bill = mockStorage.getBillById(id)
      if (!bill) throw new Error(`Shipping bill #${id} not found`)
      downloadIcegateFile(bill)
      return {
        success: true,
        filename: `shipping_bill_${bill.values.jobNumber || bill.id}.sb`,
      }
    })
  },
}

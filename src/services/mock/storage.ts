import {
  Branch,
  Business,
  Exporter,
  SavedBill,
  ShippingBillFormValues,
} from '../../types/shipping-bill.types'
import {
  SEED_BUSINESSES,
  SEED_EXPORTERS,
  SEED_SHIPPING_BILLS,
} from './seed-data'

const STORAGE_KEY = 'shipping_bills_portal_v3'

interface PersistentStore {
  exporters: Exporter[]
  businesses: Business[]
  bills: SavedBill[]
}

class MockStorage {
  private data: PersistentStore

  constructor() {
    this.data = this.loadFromStorage()
  }

  private loadFromStorage(): PersistentStore {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<PersistentStore>
        if (Array.isArray(parsed.bills) && Array.isArray(parsed.exporters)) {
          // Merge any seed records not present in localStorage
          const existingExpIds = new Set(parsed.exporters.map((e) => e.id))
          const mergedExporters = [
            ...parsed.exporters,
            ...SEED_EXPORTERS.filter((e) => !existingExpIds.has(e.id)),
          ]

          const existingBizIds = new Set((parsed.businesses || []).map((b) => b.id))
          const mergedBusinesses = [
            ...(parsed.businesses || []),
            ...SEED_BUSINESSES.filter((b) => !existingBizIds.has(b.id)),
          ]

          const existingBillIds = new Set(parsed.bills.map((b) => b.id))
          const mergedBills = [
            ...parsed.bills,
            ...SEED_SHIPPING_BILLS.filter((b) => !existingBillIds.has(b.id)),
          ]

          return {
            exporters: mergedExporters,
            businesses: mergedBusinesses,
            bills: mergedBills,
          }
        }
      }
    } catch {
      // Ignore parse or storage errors in sandbox
    }

    return {
      exporters: [...SEED_EXPORTERS],
      businesses: [...SEED_BUSINESSES],
      bills: [...SEED_SHIPPING_BILLS],
    }
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data))
    } catch {
      // LocalStorage might be disabled in sandboxed iframes
    }
  }

  public getExporters(): Exporter[] {
    return [...this.data.exporters]
  }

  public getBusinesses(): Business[] {
    return [...this.data.businesses]
  }

  public getBills(): SavedBill[] {
    return [...this.data.bills]
  }

  public getBillById(id: number): SavedBill | undefined {
    return this.data.bills.find((b) => b.id === id)
  }

  public saveBill(values: ShippingBillFormValues, existingId?: number): SavedBill {
    const now = new Date().toISOString()
    const id = existingId ?? this.nextId()
    const existing = this.data.bills.find((b) => b.id === id)

    // Ensure job number is present
    const finalJobNumber = values.jobNumber?.trim() || `JOB-${id}`
    const enrichedValues: ShippingBillFormValues = {
      ...values,
      jobNumber: finalJobNumber,
    }

    const savedRecord: SavedBill = {
      id,
      created: existing?.created ?? now,
      updated: now,
      status: existing?.status ?? 'draft',
      values: enrichedValues,
    }

    const filtered = this.data.bills.filter((b) => b.id !== id)
    this.data.bills = [savedRecord, ...filtered]
    this.persist()
    return savedRecord
  }

  public deleteBill(id: number): boolean {
    const initialLen = this.data.bills.length
    this.data.bills = this.data.bills.filter((b) => b.id !== id)
    if (this.data.bills.length !== initialLen) {
      this.persist()
      return true
    }
    return false
  }

  public saveExporter(exporter: Omit<Exporter, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }): Exporter {
    const id = exporter.id ?? this.nextId()
    const existing = this.data.exporters.find((e) => e.id === id)
    const branches: Branch[] = existing?.branches ?? (
      exporter.firstBranch ? [{ ...exporter.firstBranch, id: id + 1 }] : []
    )

    const record: Exporter = {
      id,
      name: exporter.name,
      iec: exporter.iec,
      class: exporter.class || 'F',
      type: exporter.type || 'P',
      pan: exporter.pan,
      tan: exporter.tan,
      aeoNumber: exporter.aeoNumber,
      website: exporter.website,
      notes: exporter.notes,
      branches,
    }

    this.data.exporters = [record, ...this.data.exporters.filter((e) => e.id !== id)]
    this.persist()
    return record
  }

  public saveBusiness(business: Omit<Business, 'id' | 'branches'> & { id?: number; firstBranch?: Omit<Branch, 'id'> }): Business {
    const id = business.id ?? this.nextId()
    const existing = this.data.businesses.find((b) => b.id === id)
    const branches: Branch[] = existing?.branches ?? (
      business.firstBranch ? [{ ...business.firstBranch, id: id + 1 }] : []
    )

    const record: Business = {
      id,
      name: business.name,
      iec: business.iec,
      isConsignee: Boolean(business.isConsignee),
      isBuyer: Boolean(business.isBuyer),
      isNotify: Boolean(business.isNotify),
      isThirdParty: Boolean(business.isThirdParty),
      branches,
    }

    this.data.businesses = [record, ...this.data.businesses.filter((b) => b.id !== id)]
    this.persist()
    return record
  }

  public addBranchToParty(partyId: number, kind: 'exporter' | 'business', branch: Omit<Branch, 'id'>): Branch {
    const branchId = this.nextId()
    const newBranch: Branch = { ...branch, id: branchId }

    if (kind === 'exporter') {
      const exp = this.data.exporters.find((e) => e.id === partyId)
      if (exp) {
        exp.branches.push(newBranch)
        this.persist()
      }
    } else {
      const biz = this.data.businesses.find((b) => b.id === partyId)
      if (biz) {
        biz.branches.push(newBranch)
        this.persist()
      }
    }

    return newBranch
  }

  private nextId(): number {
    const ids: number[] = [
      3000,
      ...this.data.bills.map((b) => b.id),
      ...this.data.exporters.flatMap((e) => [e.id, ...e.branches.map((b) => b.id)]),
      ...this.data.businesses.flatMap((biz) => [biz.id, ...biz.branches.map((b) => b.id)]),
    ]
    return Math.max(...ids) + 1
  }
}

export const mockStorage = new MockStorage()

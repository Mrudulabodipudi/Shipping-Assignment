import {
  Branch,
  Business,
  Exporter,
} from '../../types/shipping-bill.types'
import { mockStorage } from '../mock/storage'
import { apiClient } from './client'

export const partyService = {
  /**
   * Search active exporters by name or IEC
   */
  async searchExporters(query = ''): Promise<Exporter[]> {
    return apiClient.execute(() => {
      const all = mockStorage.getExporters()
      const q = query.trim().toLowerCase()
      const available = all.filter((item) => !item.disabled)
      if (!q) return available
      return available.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.iec.toLowerCase().includes(q) ||
          (item.pan && item.pan.toLowerCase().includes(q))
      )
    })
  },

  /**
   * Fetch a single exporter by ID with branch list
   */
  async getExporterById(id: string | number): Promise<Exporter | undefined> {
    return apiClient.execute(() => {
      const all = mockStorage.getExporters()
      return all.find((item) => String(item.id) === String(id))
    })
  },

  /**
   * Search branches for a specific exporter
   */
  async searchExporterBranches(exporterId: string | number, query = ''): Promise<Branch[]> {
    return apiClient.execute(() => {
      if (!exporterId) return []
      const all = mockStorage.getExporters()
      const exporter = all.find((item) => String(item.id) === String(exporterId))
      if (!exporter) return []
      const q = query.trim().toLowerCase()
      if (!q) return exporter.branches
      return exporter.branches.filter(
        (b) =>
          b.branchName.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.state && b.state.toLowerCase().includes(q)) ||
          (b.gstnId && b.gstnId.toLowerCase().includes(q))
      )
    })
  },

  /**
   * Search consignees
   */
  async searchConsignees(query = ''): Promise<Business[]> {
    return apiClient.execute(() => {
      const all = mockStorage.getBusinesses()
      const consignees = all.filter((b) => b.isConsignee)
      const q = query.trim().toLowerCase()
      if (!q) return consignees
      return consignees.filter((b) => b.name.toLowerCase().includes(q))
    })
  },

  /**
   * Search foreign buyers
   */
  async searchBuyers(query = ''): Promise<Business[]> {
    return apiClient.execute(() => {
      const all = mockStorage.getBusinesses()
      const buyers = all.filter((b) => b.isBuyer)
      const q = query.trim().toLowerCase()
      if (!q) return buyers
      return buyers.filter((b) => b.name.toLowerCase().includes(q))
    })
  },

  /**
   * Search third party manufacturers / suppliers
   */
  async searchThirdParties(query = ''): Promise<Business[]> {
    return apiClient.execute(() => {
      const all = mockStorage.getBusinesses()
      const thirdParties = all.filter((b) => b.isThirdParty)
      const q = query.trim().toLowerCase()
      if (!q) return thirdParties
      return thirdParties.filter((b) => b.name.toLowerCase().includes(q))
    })
  },

  /**
   * Fetch business entity by ID
   */
  async getBusinessById(id: string | number): Promise<Business | undefined> {
    return apiClient.execute(() => {
      const all = mockStorage.getBusinesses()
      return all.find((item) => String(item.id) === String(id))
    })
  },

  /**
   * Search branches for a specific business entity
   */
  async searchBusinessBranches(businessId: string | number, query = ''): Promise<Branch[]> {
    return apiClient.execute(() => {
      if (!businessId) return []
      const all = mockStorage.getBusinesses()
      const biz = all.find((item) => String(item.id) === String(businessId))
      if (!biz) return []
      const q = query.trim().toLowerCase()
      if (!q) return biz.branches
      return biz.branches.filter(
        (b) =>
          b.branchName.toLowerCase().includes(q) ||
          b.city.toLowerCase().includes(q) ||
          (b.state && b.state.toLowerCase().includes(q))
      )
    })
  },

  /**
   * Quick-add a new exporter
   */
  async createExporter(
    exporter: Omit<Exporter, 'id' | 'branches'> & { firstBranch?: Omit<Branch, 'id'> }
  ): Promise<Exporter> {
    return apiClient.execute(() => {
      return mockStorage.saveExporter(exporter)
    })
  },

  /**
   * Quick-add a new business entity (Consignee, Buyer, Third-Party)
   */
  async createBusiness(
    business: Omit<Business, 'id' | 'branches'> & { firstBranch?: Omit<Branch, 'id'> }
  ): Promise<Business> {
    return apiClient.execute(() => {
      return mockStorage.saveBusiness(business)
    })
  },

  /**
   * Quick-add a branch to an existing party
   */
  async createBranch(
    partyId: number,
    kind: 'exporter' | 'business',
    branch: Omit<Branch, 'id'>
  ): Promise<Branch> {
    return apiClient.execute(() => {
      return mockStorage.addBranchToParty(partyId, kind, branch)
    })
  },
}

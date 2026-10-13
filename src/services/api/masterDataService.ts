import { documentCodes } from '../../data/e-sanchit-codes'
import { quantityCodes } from '../../data/quantity-code'
import rawSchemeCodes from '../../data/scheme-codes'
import { stateOptions } from '../../data/states'
import { Trades } from '../../data/trade-agrements'
import {
  cargoOptions,
  contractTypes,
  paymentTypes,
  priceInclusionTypes,
  sealTypes,
  weightUnits,
} from '../../data/types'
import {
  DocumentCodeOption,
  SchemeCodeDefinition,
  SelectOption,
} from '../../types/master-data.types'
import { PortOption } from '../../types/shipping-bill.types'
import { SEED_PORTS } from '../mock/seed-data'
import { apiClient } from './client'

const CURRENCIES: SelectOption[] = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'SGD', label: 'SGD - Singapore Dollar' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
]

export const masterDataService = {
  /**
   * Search Port of Loading (Indian ports)
   */
  async searchLoadingPorts(query = ''): Promise<PortOption[]> {
    return apiClient.execute(() => {
      const q = query.trim().toLowerCase()
      const indianPorts = SEED_PORTS.filter((p) => p.code.startsWith('IN'))
      if (!q) return indianPorts
      return indianPorts.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      )
    })
  },

  /**
   * Search Final Destination Ports
   */
  async searchDestinationPorts(query = ''): Promise<PortOption[]> {
    return apiClient.execute(() => {
      const q = query.trim().toLowerCase()
      if (!q) return SEED_PORTS
      return SEED_PORTS.filter(
        (p) => p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q)
      )
    })
  },

  /**
   * Resolve port by UN/LOCODE code
   */
  async getPortByCode(code: string): Promise<PortOption | undefined> {
    return apiClient.execute(() => {
      return SEED_PORTS.find((p) => p.code.toUpperCase() === code.toUpperCase())
    })
  },

  /**
   * Get Indian states for origin state field
   */
  async getStates(): Promise<SelectOption<number>[]> {
    return apiClient.execute(() => {
      return stateOptions.map((s) => ({
        value: s.value,
        label: s.label,
      }))
    })
  },

  /**
   * Get Unique Quantity Codes (UQC)
   */
  async getQuantityCodes(query = ''): Promise<SelectOption[]> {
    return apiClient.execute(() => {
      const q = query.trim().toLowerCase()
      const list = quantityCodes.map((item) => ({
        value: item.value,
        label: item.label,
      }))
      if (!q) return list.slice(0, 50)
      return list.filter(
        (item) => item.label.toLowerCase().includes(q) || item.value.toLowerCase().includes(q)
      )
    })
  },

  /**
   * Get export scheme codes (Drawback, RoDTEP, RoSCTL, EPCG, Advance Auth)
   */
  async getSchemeCodes(query = ''): Promise<SchemeCodeDefinition[]> {
    return apiClient.execute(() => {
      const q = query.trim().toLowerCase()
      const list = (rawSchemeCodes as SchemeCodeDefinition[])
      if (!q) return list
      return list.filter(
        (s) =>
          s.value.toLowerCase().includes(q) ||
          s.label.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q))
      )
    })
  },

  /**
   * Resolve specific scheme code definition
   */
  async getSchemeCodeByValue(value: string): Promise<SchemeCodeDefinition | undefined> {
    return apiClient.execute(() => {
      return (rawSchemeCodes as SchemeCodeDefinition[]).find((s) => s.value === value)
    })
  },

  /**
   * Get supported currencies
   */
  async getCurrencies(): Promise<SelectOption[]> {
    return apiClient.execute(() => CURRENCIES)
  },

  /**
   * Get contract / incoterm types (FOB, CIF, CF, CI)
   */
  async getContractTypes(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      contractTypes.map((c) => ({ value: c.value, label: c.label }))
    )
  },

  /**
   * Get cargo types
   */
  async getCargoOptions(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      cargoOptions.map((c) => ({ value: c.value, label: c.label }))
    )
  },

  /**
   * Get weight measurement units
   */
  async getWeightUnits(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      weightUnits.map((w) => ({ value: w.value, label: w.label }))
    )
  },

  /**
   * Get container seal types
   */
  async getSealTypes(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      sealTypes.map((s) => ({ value: s.value, label: s.label }))
    )
  },

  /**
   * Get payment nature types
   */
  async getPaymentTypes(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      paymentTypes.map((p) => ({ value: p.value, label: p.label }))
    )
  },

  /**
   * Get price inclusion options
   */
  async getPriceInclusionTypes(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      priceInclusionTypes.map((p) => ({ value: p.value, label: p.label }))
    )
  },

  /**
   * Search e-Sanchit customs supporting document codes
   */
  async getDocumentCodes(query = ''): Promise<DocumentCodeOption[]> {
    return apiClient.execute(() => {
      const q = query.trim().toLowerCase()
      if (!q) return documentCodes.slice(0, 50)
      return documentCodes.filter(
        (doc) => doc.label.toLowerCase().includes(q) || doc.value.toLowerCase().includes(q)
      )
    })
  },

  /**
   * Get preferential trade agreement options
   */
  async getTradeAgreements(): Promise<SelectOption[]> {
    return apiClient.execute(() =>
      Trades.map((t) => ({ value: t.value, label: t.label }))
    )
  },
}

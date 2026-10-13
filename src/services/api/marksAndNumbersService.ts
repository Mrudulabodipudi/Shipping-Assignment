import { MarksAndNumbersOption } from '../../types/shipping-bill.types'
import { apiClient } from './client'

const exporterMarksStore: Record<string, MarksAndNumbersOption[]> = {
  '1000': [
    {
      value: 'AARAV TEXTILES / MADE IN INDIA',
      label: 'AARAV TEXTILES / MADE IN INDIA',
    },
    {
      value: 'ATPL / LOT NO. ______ / CARTON __ OF __',
      label: 'ATPL / LOT NO. ______ / CARTON __ OF __',
    },
    {
      value: 'AARAV / 100% COTTON / PORT: USA',
      label: 'AARAV / 100% COTTON / PORT: USA',
    },
  ],
  '1002': [
    {
      value: 'BLUE HARBOR EXPORTS / INDIA',
      label: 'BLUE HARBOR EXPORTS / INDIA',
    },
    {
      value: 'BHE / SHIPPING MARKS AS PER INVOICE',
      label: 'BHE / SHIPPING MARKS AS PER INVOICE',
    },
  ],
  '1010': [
    {
      value: 'APEX GARMENTS / SURAT / EXPORT CARGO',
      label: 'APEX GARMENTS / SURAT / EXPORT CARGO',
    },
  ],
  '1020': [
    {
      value: 'HIMALAYAN ORGANIC / PRODUCT OF INDIA',
      label: 'HIMALAYAN ORGANIC / PRODUCT OF INDIA',
    },
  ],
}

export const marksAndNumbersService = {
  /**
   * Fetch marks and numbers templates for a selected exporter
   */
  async getMarksAndNumbersOptions(exporterId: string | number): Promise<MarksAndNumbersOption[]> {
    return apiClient.execute(() => {
      const idStr = String(exporterId)
      if (!idStr) return []
      return exporterMarksStore[idStr] || [
        {
          value: `EXPORT SHIPMENT / IEC: ${idStr}`,
          label: `EXPORT SHIPMENT / IEC: ${idStr}`,
        },
      ]
    })
  },

  /**
   * Add a new marks & numbers preset for an exporter
   */
  async addMarksAndNumbersOption(
    exporterId: string | number,
    option: MarksAndNumbersOption
  ): Promise<void> {
    return apiClient.execute(() => {
      const idStr = String(exporterId)
      if (!exporterMarksStore[idStr]) {
        exporterMarksStore[idStr] = []
      }
      exporterMarksStore[idStr].push(option)
    })
  },
}

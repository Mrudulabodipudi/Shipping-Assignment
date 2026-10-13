import { useEffect, useState } from 'react'
import { masterDataService } from '../services/api/masterDataService'
import { SelectOption } from '../types/master-data.types'

export interface MasterDataState {
  currencies: SelectOption[]
  contractTypes: SelectOption[]
  cargoOptions: SelectOption[]
  weightUnits: SelectOption[]
  sealTypes: SelectOption[]
  paymentTypes: SelectOption[]
  priceInclusionTypes: SelectOption[]
  states: SelectOption<number>[]
  tradeAgreements: SelectOption[]
  isLoading: boolean
  error: Error | null
}

export function useMasterData() {
  const [data, setData] = useState<MasterDataState>({
    currencies: [],
    contractTypes: [],
    cargoOptions: [],
    weightUnits: [],
    sealTypes: [],
    paymentTypes: [],
    priceInclusionTypes: [],
    states: [],
    tradeAgreements: [],
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isCancelled = false

    async function loadAll() {
      try {
        const [
          currencies,
          contractTypes,
          cargoOptions,
          weightUnits,
          sealTypes,
          paymentTypes,
          priceInclusionTypes,
          states,
          tradeAgreements,
        ] = await Promise.all([
          masterDataService.getCurrencies(),
          masterDataService.getContractTypes(),
          masterDataService.getCargoOptions(),
          masterDataService.getWeightUnits(),
          masterDataService.getSealTypes(),
          masterDataService.getPaymentTypes(),
          masterDataService.getPriceInclusionTypes(),
          masterDataService.getStates(),
          masterDataService.getTradeAgreements(),
        ])

        if (!isCancelled) {
          setData({
            currencies,
            contractTypes,
            cargoOptions,
            weightUnits,
            sealTypes,
            paymentTypes,
            priceInclusionTypes,
            states,
            tradeAgreements,
            isLoading: false,
            error: null,
          })
        }
      } catch (err) {
        if (!isCancelled) {
          setData((prev) => ({
            ...prev,
            isLoading: false,
            error: err instanceof Error ? err : new Error('Failed to load master data'),
          }))
        }
      }
    }

    void loadAll()

    return () => {
      isCancelled = true
    }
  }, [])

  return data
}

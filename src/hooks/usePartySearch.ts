import { useEffect, useState } from 'react'
import { partyService } from '../services/api/partyService'
import { Branch, Business, Exporter } from '../types/shipping-bill.types'
import { useDebounce } from './useDebounce'

export function usePartySearch() {
  const [exporterQuery, setExporterQuery] = useState('')
  const [consigneeQuery, setConsigneeQuery] = useState('')

  const debouncedExpQuery = useDebounce(exporterQuery, 200)
  const debouncedConQuery = useDebounce(consigneeQuery, 200)

  const [exporters, setExporters] = useState<Exporter[]>([])
  const [consignees, setConsignees] = useState<Business[]>([])
  const [loadingExporters, setLoadingExporters] = useState(false)
  const [loadingConsignees, setLoadingConsignees] = useState(false)

  useEffect(() => {
    let active = true
    setLoadingExporters(true)
    partyService
      .searchExporters(debouncedExpQuery)
      .then((res) => {
        if (active) {
          setExporters(res)
          setLoadingExporters(false)
        }
      })
      .catch(() => {
        if (active) setLoadingExporters(false)
      })

    return () => {
      active = false
    }
  }, [debouncedExpQuery])

  useEffect(() => {
    let active = true
    setLoadingConsignees(true)
    partyService
      .searchConsignees(debouncedConQuery)
      .then((res) => {
        if (active) {
          setConsignees(res)
          setLoadingConsignees(false)
        }
      })
      .catch(() => {
        if (active) setLoadingConsignees(false)
      })

    return () => {
      active = false
    }
  }, [debouncedConQuery])

  return {
    exporters,
    consignees,
    exporterQuery,
    setExporterQuery,
    consigneeQuery,
    setConsigneeQuery,
    loadingExporters,
    loadingConsignees,
  }
}

export function usePartyBranches(partyId: string | number | undefined, kind: 'exporter' | 'business') {
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let active = true
    if (!partyId) {
      setBranches([])
      return
    }

    setLoading(true)
    const fetcher =
      kind === 'exporter'
        ? partyService.searchExporterBranches(partyId)
        : partyService.searchBusinessBranches(partyId)

    fetcher
      .then((res) => {
        if (active) {
          setBranches(res)
          setLoading(false)
        }
      })
      .catch(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [partyId, kind])

  return { branches, loading }
}

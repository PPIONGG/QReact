import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '../stores'
import {
  getPaymentTermList,
  getCurrencyList,
  getWarehouseList,
  getCompanyInfo,
} from '../services'
import type { PaymentTerm, Currency, Warehouse, CompanyInfo } from '../types'

/**
 * Hook for fetching master data (payment terms, currencies, warehouses, company info)
 */
export function useMasterData() {
  const { accessToken, companyCode } = useAuthStore()

  const [paymentTerms, setPaymentTerms] = useState<PaymentTerm[]>([])
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const hasFetched = useRef(false)

  useEffect(() => {
    if (!accessToken || !companyCode) return
    if (hasFetched.current) return

    hasFetched.current = true

    const fetchAllMasterData = async () => {
      setIsLoading(true)

      try {
        const [paymentResponse, currencyResponse, warehouseResponse, companyResponse] =
          await Promise.all([
            getPaymentTermList(accessToken, companyCode),
            getCurrencyList(accessToken, companyCode),
            getWarehouseList(accessToken, companyCode),
            getCompanyInfo(accessToken, companyCode),
          ])

        if (paymentResponse.code === 0 && paymentResponse.result) {
          setPaymentTerms(paymentResponse.result)
        }

        if (currencyResponse.code === 0 && currencyResponse.result) {
          setCurrencies(currencyResponse.result)
        }

        if (warehouseResponse.code === 0 && warehouseResponse.result) {
          setWarehouses(warehouseResponse.result)
        }

        if (companyResponse.code === 0 && companyResponse.result) {
          setCompanyInfo(companyResponse.result)
        }
      } catch (error) {
        console.error('Failed to fetch master data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAllMasterData()
  }, [accessToken, companyCode])

  return {
    paymentTerms,
    currencies,
    warehouses,
    companyInfo,
    isLoading,
  }
}

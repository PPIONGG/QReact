import { useEffect, useState, useMemo } from 'react'
import { useAuthStore } from '../stores'
import { getApprovedConfigPO } from '../services'
import type { ApprovedConfigData, ApprovedAction, ApprovedLevel } from '../types'

export function useApprovedConfig() {
  const { accessToken, companyCode } = useAuthStore()
  const [approvedConfig, setApprovedConfig] = useState<ApprovedConfigData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Fetch approved config on mount
  useEffect(() => {
    if (!accessToken || !companyCode) return

    const fetchConfig = async () => {
      setIsLoading(true)
      try {
        const response = await getApprovedConfigPO(accessToken, companyCode)
        if (response.status && response.data) {
          setApprovedConfig(response.data)
        }
      } catch (error) {
        console.error('Failed to fetch approved config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchConfig()
  }, [accessToken, companyCode])

  // Get all configured levels (sorted by level number)
  const configuredLevels = useMemo((): ApprovedLevel[] => {
    if (!approvedConfig) return []
    return [...approvedConfig.levels].sort((a, b) => a.level - b.level)
  }, [approvedConfig])

  // Create a map of status value to label for each level
  const getStatusLabel = useMemo(() => {
    if (!approvedConfig) return () => ''

    const statusMaps: Record<number, Record<string, string>> = {}

    approvedConfig.levels.forEach((level) => {
      statusMaps[level.level] = {}
      level.actions.forEach((action) => {
        statusMaps[level.level][action.value] = action.labelTH
      })
    })

    return (level: number, statusValue: string): string => {
      return statusMaps[level]?.[statusValue] || statusValue
    }
  }, [approvedConfig])

  // Get actions for a specific level
  const getActionsForLevel = useMemo(() => {
    if (!approvedConfig) return () => []

    return (level: number): ApprovedAction[] => {
      const levelConfig = approvedConfig.levels.find((l) => l.level === level)
      return levelConfig?.actions || []
    }
  }, [approvedConfig])

  // Get all actions mapped by level
  const actionsByLevel = useMemo((): Record<number, ApprovedAction[]> => {
    if (!approvedConfig) return {}

    const result: Record<number, ApprovedAction[]> = {}
    approvedConfig.levels.forEach((level) => {
      result[level.level] = level.actions
    })
    return result
  }, [approvedConfig])

  return {
    approvedConfig,
    isLoading,
    configuredLevels,
    getStatusLabel,
    getActionsForLevel,
    actionsByLevel,
  }
}

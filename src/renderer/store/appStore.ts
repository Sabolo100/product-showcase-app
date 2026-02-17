import { create } from 'zustand'
import { Category, Product } from '../types'

interface AppState {
  categories: Category[]
  companyInfo: Product | null
  isInitialized: boolean
  error: string | null
  appPath: string

  // Actions
  initialize: () => Promise<void>
  setCategories: (categories: Category[]) => void
  setCompanyInfo: (info: Product | null) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  categories: [],
  companyInfo: null,
  isInitialized: false,
  error: null,
  appPath: '',

  initialize: async () => {
    try {
      // Get app path
      const pathResult = await window.electronAPI.getAppPath()
      if (!pathResult.success) {
        throw new Error(pathResult.error || 'Failed to get app path')
      }

      // Scan content folders
      const result = await window.electronAPI.scanContentFolders()
      if (!result.success) {
        throw new Error(result.error || 'Failed to scan content folders')
      }

      // Load company info
      const companyResult = await window.electronAPI.loadCompanyInfo()

      set({
        categories: result.data || [],
        companyInfo: companyResult.success ? companyResult.data : null,
        appPath: pathResult.data || '',
        isInitialized: true,
        error: null
      })
    } catch (error) {
      set({
        error: (error as Error).message,
        isInitialized: true
      })
    }
  },

  setCategories: (categories) => set({ categories }),

  setCompanyInfo: (info) => set({ companyInfo: info }),

  setError: (error) => set({ error })
}))

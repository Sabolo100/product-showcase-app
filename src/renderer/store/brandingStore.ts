import { create } from 'zustand'
import { BrandingConfig } from '../types'

interface BrandingState {
  config: BrandingConfig | null
  isLoaded: boolean

  // Actions
  loadBranding: () => Promise<void>
  applyBranding: () => void
}

export const useBrandingStore = create<BrandingState>((set, get) => ({
  config: null,
  isLoaded: false,

  loadBranding: async () => {
    try {
      const result = await window.electronAPI.loadBranding()

      if (result.success) {
        set({
          config: result.data,
          isLoaded: true
        })
      }
    } catch (error) {
      console.error('Failed to load branding:', error)
      // Use default config
      set({ isLoaded: true })
    }
  },

  applyBranding: () => {
    const { config } = get()

    if (!config) return

    const root = document.documentElement

    // Apply colors
    if (config.colors) {
      if (config.colors.primary) {
        root.style.setProperty('--primary-blue', config.colors.primary)
      }
      if (config.colors.primaryHover) {
        root.style.setProperty('--primary-blue-hover', config.colors.primaryHover)
      }
      if (config.colors.bgPrimary) {
        root.style.setProperty('--bg-primary', config.colors.bgPrimary)
      }
      if (config.colors.bgSecondary) {
        root.style.setProperty('--bg-secondary', config.colors.bgSecondary)
      }
      if (config.colors.textPrimary) {
        root.style.setProperty('--text-primary', config.colors.textPrimary)
      }
      if (config.colors.textSecondary) {
        root.style.setProperty('--text-secondary', config.colors.textSecondary)
      }
    }

    // Apply font
    if (config.font) {
      if (config.font.family) {
        root.style.setProperty('--font-family', config.font.family)
      }
      if (config.font.url) {
        // Load custom font
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = config.font.url
        document.head.appendChild(link)
      }
    }

    // Apply background
    if (config.background) {
      if (config.background.type === 'color') {
        document.body.style.backgroundColor = config.background.value
      } else if (config.background.type === 'image' && config.backgroundData) {
        document.body.style.backgroundImage = `url(${config.backgroundData})`
        document.body.style.backgroundSize = 'cover'
        document.body.style.backgroundPosition = 'center'
        document.body.style.backgroundRepeat = 'no-repeat'
      }
    }
  }
}))

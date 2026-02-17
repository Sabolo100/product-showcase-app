import { create } from 'zustand'
import { ChatMessage, ApiKeys, AIProvider } from '../types'
import { AIModel } from '../services/aiService'

interface AIState {
  isPanelOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  apiKeys: ApiKeys | null
  provider: AIProvider
  model: AIModel

  // Actions
  togglePanel: () => void
  openPanel: () => void
  closePanel: () => void
  addMessage: (message: ChatMessage) => void
  clearMessages: () => void
  setLoading: (isLoading: boolean) => void
  loadApiKeys: () => Promise<void>
  setProvider: (provider: AIProvider) => void
  setModel: (model: AIModel) => void
}

export const useAIStore = create<AIState>((set) => ({
  isPanelOpen: false,
  messages: [],
  isLoading: false,
  apiKeys: null,
  provider: 'gemini',
  model: 'gemini-2.5-pro',

  togglePanel: () => {
    set((state) => ({ isPanelOpen: !state.isPanelOpen }))
  },

  openPanel: () => {
    set({ isPanelOpen: true })
  },

  closePanel: () => {
    set({ isPanelOpen: false })
  },

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))

    // Save to database
    window.electronAPI.saveChatMessage({
      timestamp: message.timestamp,
      role: message.role,
      message: message.message,
      productId: message.productId,
      productName: message.productName,
      categoryPath: message.categoryPath
    })
  },

  clearMessages: () => {
    set({ messages: [] })
    window.electronAPI.clearChatHistory()
  },

  setLoading: (isLoading) => {
    set({ isLoading })
  },

  loadApiKeys: async () => {
    try {
      const result = await window.electronAPI.loadApiKeys()

      if (result.success && result.data) {
        const keys = result.data as ApiKeys

        console.log('API keys loaded:', { hasOpenAI: !!keys.openai, hasGemini: !!keys.gemini })

        // Just load the keys, default model is already set to gemini-2.5-pro
        set({
          apiKeys: keys
        })
      }
    } catch (error) {
      console.error('Failed to load API keys:', error)
    }
  },

  setProvider: (provider) => {
    set({ provider })
  },

  setModel: (model) => {
    set({ model })
  }
}))

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  message: string
  timestamp: string
  productId?: string
  productName?: string
  categoryPath?: string
}

export interface ApiKeys {
  openai?: string
  gemini?: string
}

export type AIProvider = 'openai' | 'gemini' | null

import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { ApiKeys, AIProvider, ChatMessage } from '../types'
import { Product } from '../types/content'

export type AIModel =
  | 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo'
  | 'gemini-2.5-pro' | 'gemini-2.5-flash' | 'gemini-2.0-flash'

export const AI_MODELS: { provider: AIProvider; model: AIModel; label: string }[] = [
  { provider: 'gemini', model: 'gemini-2.5-pro', label: 'Gemini 2.5 Pro' },
  { provider: 'gemini', model: 'gemini-2.5-flash', label: 'Gemini 2.5 Flash' },
  { provider: 'gemini', model: 'gemini-2.0-flash', label: 'Gemini 2.0 Flash' },
  { provider: 'openai', model: 'gpt-4o', label: 'GPT-4o' },
  { provider: 'openai', model: 'gpt-4o-mini', label: 'GPT-4o Mini' },
  { provider: 'openai', model: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
]

interface AIServiceConfig {
  apiKeys: ApiKeys
  provider: AIProvider
  model?: AIModel
}

class AIService {
  private openai: OpenAI | null = null
  private gemini: GoogleGenerativeAI | null = null
  private provider: AIProvider = null
  private model: AIModel = 'gemini-2.5-pro'

  initialize(config: AIServiceConfig) {
    this.provider = config.provider
    this.model = config.model || 'gemini-2.5-pro'

    console.log('AI Service initializing with provider:', config.provider, 'model:', this.model)

    if (config.apiKeys.openai) {
      console.log('OpenAI API key found, initializing...')
      this.openai = new OpenAI({
        apiKey: config.apiKeys.openai,
        dangerouslyAllowBrowser: true // Note: In production, API calls should go through backend
      })
    }

    if (config.apiKeys.gemini) {
      console.log('Gemini API key found, initializing...')
      this.gemini = new GoogleGenerativeAI(config.apiKeys.gemini)
    }
  }

  setModel(model: AIModel) {
    this.model = model
    const modelConfig = AI_MODELS.find(m => m.model === model)
    if (modelConfig) {
      this.provider = modelConfig.provider
    }
    console.log('AI model changed to:', model, 'provider:', this.provider)
  }

  getModel(): AIModel {
    return this.model
  }

  getAvailableModels(apiKeys: ApiKeys): typeof AI_MODELS {
    return AI_MODELS.filter(m => {
      if (m.provider === 'openai' && apiKeys.openai) return true
      if (m.provider === 'gemini' && apiKeys.gemini) return true
      return false
    })
  }

  async sendMessage(
    userMessage: string,
    currentProduct: Product | null,
    conversationHistory: ChatMessage[] = []
  ): Promise<string> {
    if (!this.provider) {
      throw new Error('AI service not initialized. Please check api-keys.txt file.')
    }

    const context = this.buildContext(currentProduct)
    const systemPrompt = this.buildSystemPrompt(context)

    console.log('Sending message to AI:', { provider: this.provider, userMessage })
    console.log('Product context:', currentProduct?.name, currentProduct?.aiContext ? '(has ai.txt)' : '(no ai.txt)')

    if (this.provider === 'openai' && this.openai) {
      return this.sendOpenAIMessage(systemPrompt, userMessage, conversationHistory)
    } else if (this.provider === 'gemini' && this.gemini) {
      return this.sendGeminiMessage(systemPrompt, userMessage, conversationHistory)
    }

    throw new Error('No AI provider available')
  }

  private buildContext(currentProduct: Product | null): string {
    if (!currentProduct) {
      return 'The user is on the home screen. No specific product is selected.'
    }

    let context = `Current Product: ${currentProduct.name}\n`

    // Use aiContext if available, otherwise fall back to description
    if (currentProduct.aiContext) {
      context += `\nProduct Information:\n${currentProduct.aiContext}\n`
    } else if (currentProduct.description) {
      context += `Description: ${currentProduct.description}\n`
    }

    context += `\nMedia files: ${currentProduct.media.length} items (${currentProduct.media.filter(m => m.type === 'image').length} images, ${currentProduct.media.filter(m => m.type === 'video').length} videos)`

    return context.trim()
  }

  private buildSystemPrompt(context: string): string {
    return `
You are an AI assistant for a product showcase touchscreen application. Your role is to help users learn about products and answer their questions.

Current Context:
${context}

Guidelines:
- Be helpful, friendly, and professional
- Provide accurate information about the products
- If you don't know something, admit it rather than guessing
- Keep responses concise but informative
- Use the current context to provide relevant answers
- If asked about a product that's not currently displayed, mention that and guide the user
    `.trim()
  }

  private async sendOpenAIMessage(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    if (!this.openai) {
      throw new Error('OpenAI not initialized')
    }

    try {
      const messages: any[] = [
        { role: 'system', content: systemPrompt }
      ]

      // Add conversation history (last 10 messages)
      const recentHistory = conversationHistory.slice(-10)
      for (const msg of recentHistory) {
        messages.push({
          role: msg.role,
          content: msg.message
        })
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage
      })

      const response = await this.openai.chat.completions.create({
        model: this.model,
        messages,
        temperature: 0.7,
        max_tokens: 1000
      })

      return response.choices[0]?.message?.content || 'No response from AI'
    } catch (error) {
      console.error('OpenAI error:', error)
      throw new Error('Failed to get response from OpenAI')
    }
  }

  private async sendGeminiMessage(
    systemPrompt: string,
    userMessage: string,
    conversationHistory: ChatMessage[]
  ): Promise<string> {
    if (!this.gemini) {
      throw new Error('Gemini not initialized')
    }

    try {
      const model = this.gemini.getGenerativeModel({ model: this.model })

      // Build conversation history
      let fullPrompt = systemPrompt + '\n\n'

      // Add recent history
      const recentHistory = conversationHistory.slice(-10)
      for (const msg of recentHistory) {
        fullPrompt += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.message}\n`
      }

      fullPrompt += `User: ${userMessage}\nAssistant:`

      const result = await model.generateContent(fullPrompt)
      const response = await result.response
      const text = response.text()

      return text || 'No response from AI'
    } catch (error) {
      console.error('Gemini error:', error)
      throw new Error('Failed to get response from Gemini')
    }
  }
}

export const aiService = new AIService()

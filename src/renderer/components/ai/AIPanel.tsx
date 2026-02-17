import { useEffect, useState } from 'react'
import { X, Send, Keyboard, ChevronDown, Mic, MicOff, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useAIStore } from '../../store/aiStore'
import { useNavigationStore } from '../../store/navigationStore'
import { aiService, AI_MODELS } from '../../services/aiService'
import { useVoiceRecorder } from '../../hooks/useVoiceRecorder'
import ChatFeed from './ChatFeed'
import VirtualKeyboard from './VirtualKeyboard'

export default function AIPanel() {
  const { t } = useTranslation()
  const {
    isPanelOpen,
    closePanel,
    messages,
    addMessage,
    isLoading,
    setLoading,
    apiKeys,
    provider,
    model,
    setModel
  } = useAIStore()
  const { selectedProduct } = useNavigationStore()

  const [inputText, setInputText] = useState('')
  const [showKeyboard, setShowKeyboard] = useState(false)
  const [showModelSelector, setShowModelSelector] = useState(false)

  // Send message function that takes text directly (for voice input auto-send)
  const sendMessageDirect = async (text: string) => {
    if (!text.trim() || isLoading || availableModels.length === 0) return

    const userMessage = text.trim()
    setShowKeyboard(false)

    // Add user message
    const userChatMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      message: userMessage,
      timestamp: new Date().toISOString(),
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      categoryPath: selectedProduct?.path
    }

    addMessage(userChatMessage)
    setLoading(true)

    try {
      const response = await aiService.sendMessage(userMessage, selectedProduct, messages)

      const aiChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        message: response,
        timestamp: new Date().toISOString(),
        productId: selectedProduct?.id,
        productName: selectedProduct?.name,
        categoryPath: selectedProduct?.path
      }

      addMessage(aiChatMessage)
    } catch (error) {
      console.error('Error sending message:', error)
      const errorText = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        message: `${t('ai.error')}\n\n(${errorText})`,
        timestamp: new Date().toISOString()
      }
      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // Voice recorder hook - auto-send after transcription
  const handleVoiceTranscription = (text: string) => {
    console.log('[AIPanel] Voice transcription received:', text)
    // Auto-send the transcribed text
    sendMessageDirect(text)
  }
  const { state: voiceState, isAvailable: isVoiceAvailable, toggleRecording, error: voiceError } = useVoiceRecorder(handleVoiceTranscription)

  // Get available models based on API keys
  const availableModels = apiKeys ? aiService.getAvailableModels(apiKeys) : []

  // Initialize AI service when API keys are available
  useEffect(() => {
    if (apiKeys) {
      // Determine provider from model
      const modelConfig = AI_MODELS.find(m => m.model === model)
      const currentProvider = modelConfig?.provider || 'gemini'
      aiService.initialize({ apiKeys, provider: currentProvider, model })
    }
  }, [apiKeys, model])

  // Close model selector when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setShowModelSelector(false)
    if (showModelSelector) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showModelSelector])

  const handleSendMessage = async () => {
    if (!inputText.trim() || isLoading || availableModels.length === 0) return

    const userMessage = inputText.trim()
    setInputText('')
    setShowKeyboard(false)

    // Add user message
    const userChatMessage = {
      id: Date.now().toString(),
      role: 'user' as const,
      message: userMessage,
      timestamp: new Date().toISOString(),
      productId: selectedProduct?.id,
      productName: selectedProduct?.name,
      categoryPath: selectedProduct?.path
    }

    addMessage(userChatMessage)
    setLoading(true)

    try {
      // Get AI response
      const response = await aiService.sendMessage(userMessage, selectedProduct, messages)

      // Add AI message
      const aiChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        message: response,
        timestamp: new Date().toISOString(),
        productId: selectedProduct?.id,
        productName: selectedProduct?.name,
        categoryPath: selectedProduct?.path
      }

      addMessage(aiChatMessage)
    } catch (error) {
      console.error('Error sending message:', error)

      // Add error message with details
      const errorText = error instanceof Error ? error.message : 'Unknown error'
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant' as const,
        message: `${t('ai.error')}\n\n(${errorText})`,
        timestamp: new Date().toISOString()
      }

      addMessage(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (!isPanelOpen) return null

  return (
    <div className="fixed right-0 top-[100px] bottom-[120px] w-[600px] bg-bg-secondary shadow-2xl flex flex-col z-30">
      {/* Header */}
      <div className="bg-bg-primary p-4 flex items-center justify-between border-b border-gray-700">
        <h2 className="text-xl font-bold">{t('ai.title')}</h2>

        {/* Model Selector */}
        {availableModels.length > 0 && (
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className="flex items-center gap-2 px-3 py-2 bg-bg-secondary rounded-lg hover:bg-primary/20 transition-colors text-sm"
            >
              <span className="text-text-secondary">
                {AI_MODELS.find(m => m.model === model)?.label || model}
              </span>
              <ChevronDown size={16} className={`transition-transform ${showModelSelector ? 'rotate-180' : ''}`} />
            </button>

            {showModelSelector && (
              <div className="absolute top-full right-0 mt-2 bg-bg-primary rounded-lg shadow-xl overflow-hidden z-50 min-w-[180px] border border-gray-700">
                {availableModels.map((m) => (
                  <button
                    key={m.model}
                    onClick={() => {
                      setModel(m.model)
                      aiService.setModel(m.model)
                      setShowModelSelector(false)
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-bg-secondary transition-colors text-sm ${
                      model === m.model ? 'bg-primary/20 text-primary' : ''
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={closePanel}
          className="p-2 hover:bg-bg-secondary rounded-lg transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* Check if AI is available */}
      {availableModels.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <p className="text-text-secondary text-lg">{t('ai.unavailable')}</p>
            <p className="text-text-secondary text-sm mt-2">
              Add API keys to app/api-keys.txt:
            </p>
            <pre className="mt-4 p-4 bg-bg-primary rounded-lg text-left text-xs text-text-secondary">
              GEMINI_API_KEY=your-key-here{'\n'}
              OPENAI_API_KEY=your-key-here
            </pre>
          </div>
        </div>
      ) : (
        <>
          {/* Chat Feed */}
          <div className="flex-1 overflow-hidden">
            <ChatFeed />
          </div>

          {/* Input Area */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setShowKeyboard(!showKeyboard)}
                className={`p-4 rounded-lg transition-colors touch-feedback touch-target ${
                  showKeyboard ? 'bg-primary' : 'bg-bg-primary hover:bg-primary'
                }`}
              >
                <Keyboard size={24} />
              </button>
              {isVoiceAvailable && (
                <button
                  onClick={toggleRecording}
                  disabled={isLoading || voiceState === 'processing'}
                  className={`p-4 rounded-lg transition-all touch-feedback touch-target ${
                    voiceState === 'recording'
                      ? 'bg-red-500 animate-pulse'
                      : voiceState === 'processing'
                      ? 'bg-yellow-500'
                      : 'bg-bg-primary hover:bg-primary'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                  title={voiceError || t('ai.voiceInput')}
                >
                  {voiceState === 'recording' ? (
                    <MicOff size={24} />
                  ) : voiceState === 'processing' ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Mic size={24} />
                  )}
                </button>
              )}
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={t('ai.placeholder')}
                disabled={isLoading || voiceState === 'recording'}
                className="flex-1 px-6 py-4 bg-bg-primary rounded-lg text-lg outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputText.trim() || isLoading}
                className="p-4 bg-primary rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-feedback touch-target"
              >
                <Send size={24} />
              </button>
            </div>

            {showKeyboard && (
              <VirtualKeyboard
                value={inputText}
                onChange={setInputText}
                onEnter={handleSendMessage}
              />
            )}
          </div>
        </>
      )}
    </div>
  )
}

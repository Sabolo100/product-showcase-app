import { useEffect, useRef } from 'react'
import { useAIStore } from '../../store/aiStore'
import { useTranslation } from 'react-i18next'
import ChatMessage from './ChatMessage'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function ChatFeed() {
  const { t } = useTranslation()
  const { messages, isLoading } = useAIStore()
  const scrollRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, isLoading])

  return (
    <div
      ref={scrollRef}
      className="h-full overflow-y-auto p-6 space-y-4 touch-scroll"
    >
      {messages.length === 0 ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-text-secondary text-lg">
              {t('ai.placeholder')}
            </p>
          </div>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-bg-primary rounded-2xl p-4">
                <LoadingSpinner size="sm" message={t('ai.thinking')} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

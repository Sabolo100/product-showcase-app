import { ChatMessage as ChatMessageType } from '../../types'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: ChatMessageType
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl p-4 ${
          isUser
            ? 'bg-primary text-white'
            : 'bg-bg-primary text-text-primary'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`p-2 rounded-full ${
              isUser ? 'bg-white/20' : 'bg-primary/20'
            }`}
          >
            {isUser ? <User size={20} /> : <Bot size={20} />}
          </div>
          <div className="flex-1">
            <p className="text-lg whitespace-pre-wrap">{message.message}</p>
            {message.productName && (
              <p className="text-sm opacity-70 mt-2">
                About: {message.productName}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

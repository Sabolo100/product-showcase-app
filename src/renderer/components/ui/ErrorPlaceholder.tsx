import { AlertCircle, RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'

interface ErrorPlaceholderProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorPlaceholder({ message, onRetry }: ErrorPlaceholderProps) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-8">
      <AlertCircle size={64} className="text-red-500" />
      <p className="text-text-secondary text-lg text-center">
        {message || t('error.loadFailed')}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-6 py-3 bg-primary rounded-lg hover:bg-primary-hover transition-colors touch-feedback"
        >
          <RotateCw size={20} />
          <span>{t('error.retry')}</span>
        </button>
      )}
    </div>
  )
}

import { useTranslation } from 'react-i18next'
import { Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface SessionTimeoutProps {
  show: boolean
  secondsRemaining: number
  onContinue: () => void
  onReset: () => void
}

export default function SessionTimeout({
  show,
  secondsRemaining,
  onContinue,
  onReset
}: SessionTimeoutProps) {
  const { t } = useTranslation()

  return (
    <AnimatePresence>
      {show && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
          >
            {/* Modal */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-bg-secondary rounded-2xl p-12 max-w-2xl mx-4 shadow-2xl"
            >
              <div className="text-center">
                <div className="flex justify-center mb-6">
                  <div className="p-6 bg-yellow-500/20 rounded-full">
                    <Clock size={64} className="text-yellow-500" />
                  </div>
                </div>

                <h2 className="text-4xl font-bold mb-4">
                  {t('session.timeout')}
                </h2>

                <p className="text-text-secondary text-2xl mb-8">
                  {t('session.timeoutMessage', { seconds: secondsRemaining })}
                </p>

                <div className="flex gap-4 justify-center">
                  <button
                    onClick={onContinue}
                    className="px-12 py-6 bg-primary rounded-xl hover:bg-primary-hover transition-colors text-2xl font-semibold touch-feedback touch-target-lg"
                  >
                    {t('session.continue')}
                  </button>

                  <button
                    onClick={onReset}
                    className="px-12 py-6 bg-bg-primary rounded-xl hover:bg-red-600 transition-colors text-2xl font-semibold touch-feedback touch-target-lg"
                  >
                    {t('session.reset')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

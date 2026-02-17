import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { TouchSquare } from 'lucide-react'

interface IdleModeProps {
  isIdle: boolean
}

export default function IdleMode({ isIdle }: IdleModeProps) {
  const { t } = useTranslation()

  if (!isIdle) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="flex justify-center mb-8"
        >
          <div className="p-8 bg-primary rounded-full">
            <TouchSquare size={80} />
          </div>
        </motion.div>

        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
          className="text-5xl font-bold mb-4"
        >
          Touch to Start
        </motion.h2>

        <p className="text-text-secondary text-2xl">
          Tap anywhere to explore products
        </p>
      </motion.div>
    </div>
  )
}

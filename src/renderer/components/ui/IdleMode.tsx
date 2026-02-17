import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface IdleModeProps {
  isIdle: boolean
  videoPath: string | null
  onDismiss: () => void
}

export default function IdleMode({ isIdle, videoPath, onDismiss }: IdleModeProps) {
  const videoRef = useRef<HTMLVideoElement>(null)

  // Handle video ready to play
  const handleCanPlay = useCallback(() => {
    if (videoRef.current) {
      console.log('[IdleMode] Video can play, starting playback')
      videoRef.current.play().catch(err => {
        console.error('[IdleMode] Error playing video:', err)
      })
    }
  }, [])

  // Handle click/touch to dismiss
  const handleDismiss = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    e.stopPropagation()
    console.log('[IdleMode] Dismissed by user interaction')
    onDismiss()
  }, [onDismiss])

  return (
    <AnimatePresence>
      {isIdle && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center cursor-pointer"
          onClick={handleDismiss}
          onTouchStart={handleDismiss}
        >
          {/* Video background */}
          {videoPath && (
            <video
              ref={videoRef}
              key={videoPath} // Force new element if path changes
              src={videoPath}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay
              loop
              muted
              playsInline
              onCanPlay={handleCanPlay}
              onError={(e) => console.error('[IdleMode] Video error:', e)}
            />
          )}

          {/* Fallback background if no video */}
          {!videoPath && (
            <div className="absolute inset-0 bg-gradient-to-b from-bg-primary to-bg-secondary" />
          )}

          {/* Overlay for text readability */}
          <div className="absolute inset-0 bg-black bg-opacity-40 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10 text-center px-8 pointer-events-none">
            <motion.h1
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-6xl md:text-7xl font-bold text-white mb-8 drop-shadow-lg"
            >
              Touch to see our products
            </motion.h1>

            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
              className="inline-block"
            >
              <div className="w-24 h-24 border-4 border-white rounded-full flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full opacity-50" />
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

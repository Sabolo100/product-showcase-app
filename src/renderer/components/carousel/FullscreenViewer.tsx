import { useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCarouselStore } from '../../store/carouselStore'
import VideoPlayer from './VideoPlayer'

export default function FullscreenViewer() {
  const { media, currentIndex, isFullscreen, setFullscreen, setCurrentIndex } = useCarouselStore()

  const currentMedia = media[currentIndex]

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setFullscreen(false)
      } else if (e.key === 'ArrowLeft') {
        goPrev()
      } else if (e.key === 'ArrowRight') {
        goNext()
      }
    }

    if (isFullscreen) {
      window.addEventListener('keydown', handleKeyDown)
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isFullscreen, currentIndex, media.length])

  const goPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goNext = () => {
    if (currentIndex < media.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
  }

  // Convert Windows path to proper file:// URL
  const getFileUrl = (filePath: string): string => {
    let url = filePath.replace(/\\/g, '/')
    if (url.match(/^[A-Za-z]:/)) {
      url = `file:///${url}`
    } else {
      url = `file://${url}`
    }
    return url
  }

  if (!currentMedia) return null

  const fileUrl = getFileUrl(currentMedia.path)

  return (
    <AnimatePresence>
      {isFullscreen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          onClick={() => setFullscreen(false)}
        >
          {/* Close Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              setFullscreen(false)
            }}
            className="absolute top-6 right-6 z-10 p-4 bg-bg-secondary/80 rounded-full hover:bg-primary transition-colors active:opacity-70"
          >
            <X size={32} />
          </button>

          {/* Media Counter */}
          <div className="absolute top-6 left-6 z-10 px-4 py-2 bg-bg-secondary/80 rounded-lg">
            <span className="text-lg font-medium">
              {currentIndex + 1} / {media.length}
            </span>
          </div>

          {/* Navigation Buttons */}
          {media.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goPrev()
                }}
                disabled={currentIndex === 0}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-bg-secondary/80 rounded-full hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:opacity-70"
              >
                <ChevronLeft size={40} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  goNext()
                }}
                disabled={currentIndex === media.length - 1}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-10 p-4 bg-bg-secondary/80 rounded-full hover:bg-primary disabled:opacity-30 disabled:cursor-not-allowed transition-colors active:opacity-70"
              >
                <ChevronRight size={40} />
              </button>
            </>
          )}

          {/* Media Content */}
          <motion.div
            key={currentMedia.id}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full max-w-[90vw] max-h-[90vh] flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {currentMedia.type === 'image' ? (
              <img
                src={fileUrl}
                alt={currentMedia.caption || currentMedia.filename}
                className="max-w-full max-h-full object-contain cursor-pointer"
                onClick={() => setFullscreen(false)}
              />
            ) : (
              <div
                className="w-full h-full max-w-[90vw] max-h-[85vh] cursor-pointer"
                onClick={() => setFullscreen(false)}
              >
                <VideoPlayer
                  src={fileUrl}
                  caption={currentMedia.caption}
                />
              </div>
            )}
          </motion.div>

          {/* Caption */}
          {currentMedia.caption && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 px-6 py-3 bg-bg-secondary/80 rounded-lg max-w-[80vw]">
              <p className="text-lg text-center">{currentMedia.caption}</p>
              {currentMedia.description && (
                <p className="text-sm text-text-secondary text-center mt-1">{currentMedia.description}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

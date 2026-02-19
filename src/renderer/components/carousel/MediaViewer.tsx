import { useState } from 'react'
import { MediaFile } from '../../types'
import VideoPlayer from './VideoPlayer'
import LoadingSpinner from '../ui/LoadingSpinner'
import ErrorPlaceholder from '../ui/ErrorPlaceholder'

interface MediaViewerProps {
  media: MediaFile
}

export default function MediaViewer({ media }: MediaViewerProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoading(false)
    setHasError(false)
  }

  const handleError = () => {
    setIsLoading(false)
    setHasError(true)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setHasError(false)
  }

  // Convert Windows path to proper file:// URL
  const getFileUrl = (filePath: string): string => {
    // Replace backslashes with forward slashes
    let url = filePath.replace(/\\/g, '/')

    // Ensure proper file:// protocol format for Windows
    // Windows paths like C:/... need file:///C:/...
    if (url.match(/^[A-Za-z]:/)) {
      url = `file:///${url}`
    } else {
      url = `file://${url}`
    }

    return url
  }

  const fileUrl = getFileUrl(media.path)

  return (
    <div
      className="bg-bg-primary rounded-2xl shadow-2xl flex items-center justify-center relative"
      style={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        overflow: 'hidden'
      }}
    >
      {isLoading && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {hasError ? (
        <ErrorPlaceholder onRetry={handleRetry} />
      ) : media.type === 'image' ? (
        <img
          src={fileUrl}
          alt={media.caption || media.filename}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain'
          }}
          className={`${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <VideoPlayer
          src={fileUrl}
          caption={media.caption}
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  )
}

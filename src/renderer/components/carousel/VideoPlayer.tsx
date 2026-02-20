import { useRef, useState, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX } from 'lucide-react'

interface VideoPlayerProps {
  src: string
  caption?: string
  onLoad?: () => void
  onError?: () => void
}

export default function VideoPlayer({ src, caption: _caption, onLoad, onError }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [buffered, setBuffered] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current && !isDragging) {
      const percent = (videoRef.current.currentTime / videoRef.current.duration) * 100
      setProgress(percent)
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleProgress = () => {
    if (videoRef.current && videoRef.current.buffered.length > 0) {
      const bufferedEnd = videoRef.current.buffered.end(videoRef.current.buffered.length - 1)
      const percent = (bufferedEnd / videoRef.current.duration) * 100
      setBuffered(percent)
    }
  }

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
      onLoad?.()
    }
  }

  const seekToPosition = (clientX: number) => {
    if (videoRef.current && progressRef.current) {
      const rect = progressRef.current.getBoundingClientRect()
      const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
      const newTime = percent * videoRef.current.duration
      videoRef.current.currentTime = newTime
      setProgress(percent * 100)
      setCurrentTime(newTime)
    }
  }

  const handleSeekStart = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.stopPropagation()
    setIsDragging(true)
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    seekToPosition(clientX)
  }

  const handleSeekMove = (e: MouseEvent | TouchEvent) => {
    if (isDragging) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
      seekToPosition(clientX)
    }
  }

  const handleSeekEnd = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleSeekMove)
      window.addEventListener('mouseup', handleSeekEnd)
      window.addEventListener('touchmove', handleSeekMove)
      window.addEventListener('touchend', handleSeekEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleSeekMove)
      window.removeEventListener('mouseup', handleSeekEnd)
      window.removeEventListener('touchmove', handleSeekMove)
      window.removeEventListener('touchend', handleSeekEnd)
    }
  }, [isDragging])

  const showControlsTemporarily = () => {
    setShowControls(true)

    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }

    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying && !isDragging) {
        setShowControls(false)
      }
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div
      className="relative w-full h-full"
      onClick={showControlsTemporarily}
      onMouseMove={showControlsTemporarily}
      onTouchStart={showControlsTemporarily}
    >
      <video
        ref={videoRef}
        src={src}
        className="w-full h-full object-contain bg-black"
        onTimeUpdate={handleTimeUpdate}
        onProgress={handleProgress}
        onLoadedMetadata={handleLoadedMetadata}
        onError={onError}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Control Bar - Bottom */}
      <div
        className={`absolute bottom-0 left-0 right-0 transition-all duration-300 ${
          showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

        {/* Controls Container */}
        <div className="relative px-4 pb-4 pt-8">
          {/* Progress Bar */}
          <div
            ref={progressRef}
            onMouseDown={handleSeekStart}
            onTouchStart={handleSeekStart}
            className="w-full h-6 flex items-center cursor-pointer group/progress mb-3"
          >
            <div className="w-full h-1 group-hover/progress:h-2 bg-white/30 rounded-full relative transition-all duration-150">
              {/* Buffered */}
              <div
                className="absolute top-0 left-0 h-full bg-white/40 rounded-full"
                style={{ width: `${buffered}%` }}
              />
              {/* Progress */}
              <div
                className="absolute top-0 left-0 h-full bg-primary rounded-full"
                style={{ width: `${progress}%` }}
              />
              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity duration-150"
                style={{ left: `calc(${progress}% - 8px)` }}
              />
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <button
              onClick={togglePlay}
              className="w-12 h-12 flex items-center justify-center text-white hover:text-primary transition-colors"
            >
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>

            {/* Volume */}
            <button
              onClick={toggleMute}
              className="w-10 h-10 flex items-center justify-center text-white/80 hover:text-white transition-colors"
            >
              {isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
            </button>

            {/* Time */}
            <div className="text-white/90 text-sm font-medium tabular-nums">
              {formatTime(currentTime)} <span className="text-white/50">/</span> {formatTime(duration)}
            </div>

            <div className="flex-1" />
          </div>
        </div>
      </div>

      {/* Center Play Button (when paused and controls visible) */}
      {!isPlaying && showControls && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <button
            onClick={(e) => {
              e.stopPropagation()
              togglePlay()
            }}
            className="w-20 h-20 flex items-center justify-center bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-all pointer-events-auto"
          >
            <Play size={40} className="text-white ml-1" />
          </button>
        </div>
      )}
    </div>
  )
}

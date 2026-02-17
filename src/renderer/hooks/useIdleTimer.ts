import { useEffect, useRef, useState } from 'react'

interface IdleTimerOptions {
  idleTime?: number // Time in ms before considered idle
  onIdle?: () => void
  onActive?: () => void
}

export function useIdleTimer(options: IdleTimerOptions) {
  const {
    idleTime = 30000, // 30 seconds default
    onIdle,
    onActive
  } = options

  const [isIdle, setIsIdle] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    if (isIdle) {
      setIsIdle(false)
      onActive?.()
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsIdle(true)
      onIdle?.()
    }, idleTime)
  }

  useEffect(() => {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    // Start timer on mount
    resetTimer()

    // Reset timer on any user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer)
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      events.forEach((event) => {
        document.removeEventListener(event, resetTimer)
      })
    }
  }, [idleTime, onIdle, onActive])

  return { isIdle, resetTimer }
}

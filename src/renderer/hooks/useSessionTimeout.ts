import { useEffect, useRef, useState } from 'react'

interface SessionTimeoutOptions {
  warningTime?: number // Time in ms before showing warning
  timeoutTime?: number // Time in ms before auto-reset
  onWarning?: () => void
  onTimeout?: () => void
}

export function useSessionTimeout(options: SessionTimeoutOptions) {
  const {
    warningTime = 45000, // 45 seconds
    timeoutTime = 60000, // 60 seconds
    onWarning,
    onTimeout
  } = options

  const [showWarning, setShowWarning] = useState(false)
  const [secondsRemaining, setSecondsRemaining] = useState(0)
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const countdownRef = useRef<NodeJS.Timeout | null>(null)

  const resetTimer = () => {
    setShowWarning(false)
    setSecondsRemaining(0)

    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current)
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    if (countdownRef.current) {
      clearInterval(countdownRef.current)
    }

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      setShowWarning(true)
      setSecondsRemaining(Math.floor((timeoutTime - warningTime) / 1000))
      onWarning?.()

      // Start countdown
      countdownRef.current = setInterval(() => {
        setSecondsRemaining((prev) => {
          if (prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current)
            }
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }, warningTime)

    // Set timeout timer
    timeoutRef.current = setTimeout(() => {
      onTimeout?.()
    }, timeoutTime)
  }

  const continueSession = () => {
    resetTimer()
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

    // Reset timer on any user activity (only if not showing warning)
    const handleActivity = () => {
      if (!showWarning) {
        resetTimer()
      }
    }

    events.forEach((event) => {
      document.addEventListener(event, handleActivity)
    })

    return () => {
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      if (countdownRef.current) {
        clearInterval(countdownRef.current)
      }

      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [warningTime, timeoutTime, showWarning])

  return { showWarning, secondsRemaining, continueSession, resetTimer }
}

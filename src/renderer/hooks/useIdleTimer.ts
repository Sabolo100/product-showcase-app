import { useEffect, useRef, useState, useCallback } from 'react'

interface IdleTimerOptions {
  idleTime: number // Time in ms before considered idle
  onIdle?: () => void
  onActive?: () => void
}

export function useIdleTimer(options: IdleTimerOptions) {
  const { idleTime, onIdle, onActive } = options

  const [isIdle, setIsIdle] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isIdleRef = useRef(false)

  // Store callbacks in refs to avoid dependency changes
  const onIdleRef = useRef(onIdle)
  const onActiveRef = useRef(onActive)

  // Update refs when callbacks change
  useEffect(() => {
    onIdleRef.current = onIdle
    onActiveRef.current = onActive
  }, [onIdle, onActive])

  // Keep isIdle ref in sync with state
  useEffect(() => {
    isIdleRef.current = isIdle
  }, [isIdle])

  const resetTimer = useCallback(() => {
    // If was idle, mark as active
    if (isIdleRef.current) {
      console.log('[IdleTimer] User became active')
      setIsIdle(false)
      isIdleRef.current = false
      onActiveRef.current?.()
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new timeout
    timeoutRef.current = setTimeout(() => {
      console.log('[IdleTimer] User is now idle')
      setIsIdle(true)
      isIdleRef.current = true
      onIdleRef.current?.()
    }, idleTime)
  }, [idleTime]) // Only depends on idleTime now

  useEffect(() => {
    console.log('[IdleTimer] Initializing with idleTime:', idleTime, 'ms')

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
    const handleActivity = () => resetTimer()

    events.forEach((event) => {
      document.addEventListener(event, handleActivity, { passive: true })
    })

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      events.forEach((event) => {
        document.removeEventListener(event, handleActivity)
      })
    }
  }, [idleTime, resetTimer])

  return { isIdle, resetTimer }
}

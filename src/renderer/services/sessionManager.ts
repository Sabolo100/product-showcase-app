class SessionManager {
  private idleTimeout: NodeJS.Timeout | null = null
  private warningTimeout: NodeJS.Timeout | null = null
  private resetTimeout: NodeJS.Timeout | null = null

  private readonly IDLE_TIME = 30000 // 30 seconds
  private readonly WARNING_TIME = 45000 // 45 seconds
  private readonly RESET_TIME = 60000 // 60 seconds

  private onIdleCallback: (() => void) | null = null
  private onWarningCallback: (() => void) | null = null
  private onResetCallback: (() => void) | null = null

  initialize(callbacks: {
    onIdle?: () => void
    onWarning?: () => void
    onReset?: () => void
  }) {
    this.onIdleCallback = callbacks.onIdle || null
    this.onWarningCallback = callbacks.onWarning || null
    this.onResetCallback = callbacks.onReset || null

    this.startTimers()
    this.setupEventListeners()
  }

  private startTimers() {
    this.clearTimers()

    // Idle timer
    this.idleTimeout = setTimeout(() => {
      this.onIdleCallback?.()
    }, this.IDLE_TIME)

    // Warning timer
    this.warningTimeout = setTimeout(() => {
      this.onWarningCallback?.()
    }, this.WARNING_TIME)

    // Reset timer
    this.resetTimeout = setTimeout(() => {
      this.onResetCallback?.()
      this.reset()
    }, this.RESET_TIME)
  }

  private clearTimers() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout)
      this.idleTimeout = null
    }
    if (this.warningTimeout) {
      clearTimeout(this.warningTimeout)
      this.warningTimeout = null
    }
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout)
      this.resetTimeout = null
    }
  }

  private setupEventListeners() {
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ]

    const resetHandler = () => this.startTimers()

    events.forEach((event) => {
      document.addEventListener(event, resetHandler)
    })
  }

  reset() {
    // Reset all timers and state
    this.startTimers()
  }

  destroy() {
    this.clearTimers()
  }
}

export const sessionManager = new SessionManager()

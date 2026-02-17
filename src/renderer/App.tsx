import { useEffect } from 'react'
import MainLayout from './components/layout/MainLayout'
import { useBrandingStore } from './store/brandingStore'
import { useAppStore } from './store/appStore'

function App() {
  const { loadBranding, applyBranding } = useBrandingStore()
  const { initialize, isInitialized, error } = useAppStore()

  useEffect(() => {
    const init = async () => {
      try {
        // Load branding first
        await loadBranding()
        applyBranding()

        // Initialize app
        await initialize()
      } catch (error) {
        console.error('Failed to initialize app:', error)
      }
    }

    init()
  }, [])

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-bg-primary">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-red-500 mb-4">Initialization Error</h1>
          <p className="text-text-secondary">{error}</p>
        </div>
      </div>
    )
  }

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center w-full h-full bg-bg-primary">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mb-4 mx-auto"></div>
          <p className="text-text-secondary text-xl">Loading...</p>
        </div>
      </div>
    )
  }

  return <MainLayout />
}

export default App

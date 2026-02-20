import { useEffect, useState } from 'react'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import PopupMenu from '../navigation/PopupMenu'
import MenuBreadcrumb from '../navigation/MenuBreadcrumb'
import Carousel from '../carousel/Carousel'
import AIPanel from '../ai/AIPanel'
import IdleMode from '../ui/IdleMode'
import { useAppStore } from '../../store/appStore'
import { useAIStore } from '../../store/aiStore'
import { useNavigationStore } from '../../store/navigationStore'
import { useIdleTimer } from '../../hooks/useIdleTimer'
import { useTranslation } from 'react-i18next'

export default function MainLayout() {
  const { t } = useTranslation()
  const { companyInfo } = useAppStore()
  const { isPanelOpen, loadApiKeys } = useAIStore()
  const { selectedProduct, navigateToProduct, goHome, isMenuOpen, currentCategory } = useNavigationStore()

  // Idle mode state
  const [idleVideoPath, setIdleVideoPath] = useState<string | null>(null)
  const [idleTimeout, setIdleTimeout] = useState<number>(60000) // Default 60 seconds

  // Load idle config
  useEffect(() => {
    const loadIdleConfig = async () => {
      try {
        const result = await window.electronAPI.loadIdleConfig()
        if (result.success && result.data) {
          console.log('[Idle] Config loaded:', result.data)
          setIdleVideoPath(result.data.videoPath)
          setIdleTimeout(result.data.timeout * 1000) // Convert to ms
        }
      } catch (err) {
        console.error('[Idle] Failed to load config:', err)
      }
    }
    loadIdleConfig()
  }, [])

  // Idle timer hook
  const { isIdle, resetTimer } = useIdleTimer({
    idleTime: idleTimeout,
    onIdle: () => console.log('[Idle] User is idle'),
    onActive: () => console.log('[Idle] User is active')
  })

  // Handle dismiss idle mode - navigate to company info carousel
  const handleDismissIdle = () => {
    console.log('[Idle] Dismissed by user')
    resetTimer()

    // Navigate to company info (VEX) carousel when user touches the screen
    if (companyInfo) {
      goHome() // Reset navigation first
      navigateToProduct(companyInfo) // Then show company info carousel
    }
  }

  useEffect(() => {
    // Load API keys on mount
    loadApiKeys()
  }, [])

  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {/* Top Bar */}
      <TopBar />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area - shifts left when AI panel is open */}
        <div
          className={`flex-1 transition-all duration-300 ${
            isPanelOpen ? 'mr-[600px]' : 'mr-0'
          }`}
        >
          <div className="w-full h-full flex flex-col">
            {/* Breadcrumb */}
            <div className="px-8 py-4">
              <MenuBreadcrumb />
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {selectedProduct ? (
                <Carousel />
              ) : (
                /* Only show placeholder when no menu is open and no category is selected */
                !isMenuOpen && !currentCategory && (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="text-4xl font-bold mb-4">{t('app.title')}</h1>
                      <p className="text-text-secondary text-xl">
                        Select a category from the menu below to get started
                      </p>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        {/* AI Panel */}
        <AIPanel />
      </div>

      {/* Bottom Bar */}
      <BottomBar />

      {/* Popup Menu */}
      <PopupMenu />

      {/* Idle Mode Overlay */}
      <IdleMode
        isIdle={isIdle}
        videoPath={idleVideoPath}
        onDismiss={handleDismissIdle}
      />
    </div>
  )
}

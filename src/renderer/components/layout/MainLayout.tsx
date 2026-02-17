import { useEffect } from 'react'
import TopBar from './TopBar'
import BottomBar from './BottomBar'
import PopupMenu from '../navigation/PopupMenu'
import MenuBreadcrumb from '../navigation/MenuBreadcrumb'
import Carousel from '../carousel/Carousel'
import AIPanel from '../ai/AIPanel'
import { useAIStore } from '../../store/aiStore'
import { useNavigationStore } from '../../store/navigationStore'
import { useTranslation } from 'react-i18next'

export default function MainLayout() {
  const { t } = useTranslation()
  const { isPanelOpen, loadApiKeys } = useAIStore()
  const { selectedProduct } = useNavigationStore()

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
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold mb-4">{t('app.title')}</h1>
                    <p className="text-text-secondary text-xl">
                      Select a category from the menu below to get started
                    </p>
                  </div>
                </div>
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
    </div>
  )
}

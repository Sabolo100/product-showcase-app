import { useTranslation } from 'react-i18next'
import { MessageSquare, Building2 } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAIStore } from '../../store/aiStore'
import { useNavigationStore } from '../../store/navigationStore'

export default function BottomBar() {
  const { t } = useTranslation()
  const { categories, companyInfo } = useAppStore()
  const { togglePanel } = useAIStore()
  const { navigateToCategory, toggleMenu, navigateToProduct } = useNavigationStore()

  const handleCompanyClick = () => {
    if (companyInfo) {
      navigateToProduct(companyInfo)
    }
  }

  return (
    <div className="h-[120px] bg-bg-secondary flex items-center justify-between px-8 shadow-lg">
      {/* Company Button (Left) - shows company name from name.txt */}
      <button
        onClick={handleCompanyClick}
        disabled={!companyInfo}
        className="flex items-center gap-3 px-6 py-3 bg-primary rounded-lg hover:bg-primary-hover transition-colors active:opacity-70 disabled:opacity-50 disabled:cursor-not-allowed min-w-[200px]"
      >
        <Building2 size={24} />
        <span className="text-lg font-semibold">
          {companyInfo?.name || t('nav.company')}
        </span>
      </button>

      {/* Category Menu (Center) */}
      <div className="flex-1 flex items-center justify-center gap-4 mx-8">
        {categories.length > 0 ? (
          categories.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                navigateToCategory(category)
                toggleMenu()
              }}
              className="px-6 py-3 bg-bg-primary rounded-lg hover:bg-primary transition-colors active:opacity-70"
            >
              <span className="text-lg font-semibold">{category.name}</span>
            </button>
          ))
        ) : (
          <p className="text-text-secondary text-lg">{t('error.noContent')}</p>
        )}
      </div>

      {/* AI Button (Right) */}
      <button
        onClick={togglePanel}
        className="flex items-center gap-3 px-6 py-3 bg-primary rounded-lg hover:bg-primary-hover transition-colors active:opacity-70"
      >
        <MessageSquare size={24} />
        <span className="text-lg font-semibold">{t('ai.title')}</span>
      </button>
    </div>
  )
}

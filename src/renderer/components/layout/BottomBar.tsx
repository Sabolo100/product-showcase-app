import { useTranslation } from 'react-i18next'
import { MessageSquare, Building2 } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import { useAIStore } from '../../store/aiStore'
import { useNavigationStore } from '../../store/navigationStore'

export default function BottomBar() {
  const { t } = useTranslation()
  const { categories, companyInfo } = useAppStore()
  const { togglePanel } = useAIStore()
  const { navigateToCategory, navigateToProduct } = useNavigationStore()

  const handleCompanyClick = () => {
    if (companyInfo) {
      navigateToProduct(companyInfo)
    }
  }

  // Uniform button style for all menu buttons
  const buttonClass = "h-[70px] min-w-[140px] px-5 flex items-center justify-center gap-2 rounded-lg transition-colors active:opacity-70"

  return (
    <div className="h-[120px] bg-bg-secondary flex items-center justify-evenly px-4 shadow-lg relative z-50">
      {/* Company Button - shows company name from name.txt */}
      <button
        onClick={handleCompanyClick}
        disabled={!companyInfo}
        className={`${buttonClass} bg-primary hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <Building2 size={20} />
        <span className="text-sm font-semibold">
          {companyInfo?.name || t('nav.company')}
        </span>
      </button>

      {/* Category Buttons */}
      {categories.length > 0 ? (
        categories.map((category) => (
          <button
            key={category.id}
            onClick={(e) => {
              e.stopPropagation()
              navigateToCategory(category)
            }}
            className={`${buttonClass} bg-bg-primary hover:bg-primary`}
          >
            <span className="text-sm font-semibold">{category.name}</span>
          </button>
        ))
      ) : (
        <p className="text-text-secondary text-sm">{t('error.noContent')}</p>
      )}

      {/* AI Button */}
      <button
        onClick={togglePanel}
        className={`${buttonClass} bg-primary hover:bg-primary-hover`}
      >
        <MessageSquare size={20} />
        <span className="text-sm font-semibold">Ask AI</span>
      </button>
    </div>
  )
}

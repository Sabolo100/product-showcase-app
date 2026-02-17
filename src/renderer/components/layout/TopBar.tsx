import { useTranslation } from 'react-i18next'
import { Globe } from 'lucide-react'
import { useBrandingStore } from '../../store/brandingStore'
import { useState, useEffect } from 'react'

export default function TopBar() {
  const { t, i18n } = useTranslation()
  const { config } = useBrandingStore()
  const [showLanguageMenu, setShowLanguageMenu] = useState(false)
  const [companyLogo, setCompanyLogo] = useState<string | null>(null)

  // Load company logo on mount
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const result = await window.electronAPI.loadCompanyLogo()
        if (result.success && result.data) {
          setCompanyLogo(result.data)
        }
      } catch (err) {
        console.error('Error loading company logo:', err)
      }
    }
    loadLogo()
  }, [])

  const languages = [
    { code: 'de', name: 'Deutsch' },
    { code: 'en', name: 'English' },
    { code: 'hu', name: 'Magyar' }
  ]

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang)
    setShowLanguageMenu(false)
  }

  return (
    <div className="h-[100px] bg-bg-secondary flex items-center justify-between px-8 shadow-lg">
      {/* App Logo / Title */}
      <div className="flex items-center h-full min-w-[200px]">
        {config?.logoData ? (
          <img
            src={config.logoData}
            alt="Logo"
            className="h-[60px] object-contain"
          />
        ) : (
          <div className="text-3xl font-bold">
            {t('app.title')}
          </div>
        )}
      </div>

      {/* Company Logo (center) */}
      <div className="flex items-center justify-center h-full">
        {companyLogo && (
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-[70px] max-w-[300px] object-contain"
          />
        )}
      </div>

      {/* Language Selector */}
      <div className="relative min-w-[200px] flex justify-end">
        <button
          onClick={() => setShowLanguageMenu(!showLanguageMenu)}
          className="flex items-center gap-2 px-5 py-2 bg-primary rounded-lg hover:bg-primary-hover transition-colors active:opacity-70"
        >
          <Globe size={20} />
          <span className="text-base font-medium uppercase">
            {i18n.language}
          </span>
        </button>

        {showLanguageMenu && (
          <div className="absolute top-full right-0 mt-2 bg-bg-secondary rounded-lg shadow-xl overflow-hidden z-50 animate-scale-in">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => changeLanguage(lang.code)}
                className={`w-full px-6 py-4 text-left hover:bg-bg-primary transition-colors touch-feedback ${
                  i18n.language === lang.code ? 'bg-primary text-white' : ''
                }`}
              >
                <span className="text-lg font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

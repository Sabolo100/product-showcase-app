import { ChevronRight, Home } from 'lucide-react'
import { useNavigationStore } from '../../store/navigationStore'

export default function MenuBreadcrumb() {
  const { breadcrumb, selectedProduct, goHome, navigateToBreadcrumbLevel } = useNavigationStore()

  if (breadcrumb.length === 0 && !selectedProduct) return null

  return (
    <div className="flex items-center gap-2 text-text-secondary">
      <button
        onClick={goHome}
        className="p-2 hover:bg-bg-secondary rounded-lg transition-colors touch-feedback"
      >
        <Home size={20} />
      </button>

      {breadcrumb.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={20} />
          <button
            onClick={() => navigateToBreadcrumbLevel(index)}
            className="text-lg hover:text-text-primary hover:underline transition-colors touch-feedback px-1 py-0.5 rounded"
          >
            {item}
          </button>
        </div>
      ))}

      {selectedProduct && (
        <div className="flex items-center gap-2">
          <ChevronRight size={20} />
          <span className="text-lg text-text-primary font-medium">{selectedProduct.name}</span>
        </div>
      )}
    </div>
  )
}

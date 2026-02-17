import { useTranslation } from 'react-i18next'
import { X, ChevronRight, ArrowLeft } from 'lucide-react'
import { useNavigationStore } from '../../store/navigationStore'
import { Category, Product } from '../../types'
import { motion, AnimatePresence } from 'framer-motion'

export default function PopupMenu() {
  const { t } = useTranslation()
  const {
    isMenuOpen,
    currentCategory,
    closeMenu,
    navigateToCategory,
    navigateToProduct,
    goBack,
    breadcrumb
  } = useNavigationStore()

  if (!isMenuOpen || !currentCategory) return null

  const hasSubcategories = currentCategory.subcategories.length > 0
  const hasProducts = currentCategory.products.length > 0

  return (
    <AnimatePresence>
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 flex justify-center pt-[180px] pb-[120px]">
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeMenu}
            className="absolute inset-0 bg-black bg-opacity-50"
          />

          {/* Menu Panel - fixed position below top bar */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-[80vw] h-full bg-bg-secondary rounded-2xl shadow-2xl z-50 overflow-hidden"
          >
            {/* Header - fixed height to prevent layout shift */}
            <div className="bg-bg-primary p-8 flex items-center justify-between border-b border-gray-700 h-[120px]">
              <div className="flex items-center gap-4">
                {/* Back button - always takes space, invisible when not needed */}
                <button
                  onClick={goBack}
                  className={`p-3 rounded-lg transition-colors touch-feedback ${
                    breadcrumb.length > 0
                      ? 'hover:bg-bg-secondary'
                      : 'invisible'
                  }`}
                >
                  <ArrowLeft size={32} />
                </button>
                <div>
                  <h2 className="text-3xl font-bold">{currentCategory.name}</h2>
                  {/* Breadcrumb - always takes space for consistent height */}
                  <p className={`text-text-secondary text-lg mt-1 h-7 ${
                    breadcrumb.length > 0 ? '' : 'invisible'
                  }`}>
                    {breadcrumb.length > 0 ? breadcrumb.join(' > ') : '\u00A0'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeMenu}
                className="p-3 hover:bg-bg-secondary rounded-lg transition-colors touch-feedback"
              >
                <X size={32} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto h-[calc(100%-120px)] touch-scroll">
              {/* Subcategories */}
              {hasSubcategories && (
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold mb-4 text-text-secondary">
                    Categories
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {currentCategory.subcategories.map((subcategory) => (
                      <CategoryCard
                        key={subcategory.id}
                        category={subcategory}
                        onClick={() => navigateToCategory(subcategory)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Products */}
              {hasProducts && (
                <div>
                  <h3 className="text-2xl font-semibold mb-4 text-text-secondary">
                    Products
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {currentCategory.products.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        onClick={() => navigateToProduct(product)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {!hasSubcategories && !hasProducts && (
                <div className="text-center py-12">
                  <p className="text-text-secondary text-xl">
                    {t('error.noContent')}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function CategoryCard({
  category,
  onClick
}: {
  category: Category
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="bg-bg-primary rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all group touch-feedback"
    >
      {/* Thumbnail */}
      <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden">
        {category.thumbnail ? (
          <img
            src={category.thumbnail}
            alt={category.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="text-6xl">📁</div>
        )}
      </div>
      {/* Info */}
      <div className="p-4 flex items-center justify-between">
        <div className="text-left">
          <h4 className="text-xl font-semibold">{category.name}</h4>
          <p className="text-text-secondary text-sm mt-1">
            {category.subcategories.length + category.products.length} items
          </p>
        </div>
        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
      </div>
    </button>
  )
}

function ProductCard({
  product,
  onClick
}: {
  product: Product
  onClick: () => void
}) {
  // Get thumbnail - prefer thumb.png, fallback to first image
  let thumbnailSrc: string | null = null

  if (product.thumbnail) {
    // Use the thumb.png from the product folder
    thumbnailSrc = product.thumbnail
  } else {
    // Fallback: use first image from media
    const images = product.media.filter(m => m.type === 'image')
    const firstImage = images[0]
    if (firstImage) {
      let url = firstImage.path.replace(/\\/g, '/')
      if (url.match(/^[A-Za-z]:/)) {
        url = `file:///${url}`
      } else {
        url = `file://${url}`
      }
      thumbnailSrc = url
    }
  }

  return (
    <button
      onClick={onClick}
      className="bg-bg-primary rounded-xl overflow-hidden hover:ring-2 hover:ring-primary transition-all group touch-feedback"
    >
      <div className="aspect-video bg-gray-800 flex items-center justify-center overflow-hidden">
        {thumbnailSrc ? (
          <img
            src={thumbnailSrc}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        ) : (
          <div className="text-6xl">🎬</div>
        )}
      </div>
      <div className="p-4">
        <h4 className="text-lg font-semibold">{product.name}</h4>
        <p className="text-text-secondary text-sm mt-1">
          {product.media.length} media files
        </p>
      </div>
    </button>
  )
}

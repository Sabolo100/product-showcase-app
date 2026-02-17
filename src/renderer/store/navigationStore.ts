import { create } from 'zustand'
import { Category, Product } from '../types'

interface NavigationState {
  currentPath: string[]
  breadcrumb: string[]
  currentCategory: Category | null
  selectedProduct: Product | null
  menuHistory: Category[][]
  isMenuOpen: boolean

  // Actions
  navigateToCategory: (category: Category) => void
  navigateToProduct: (product: Product) => void
  goBack: () => void
  goHome: () => void
  toggleMenu: () => void
  closeMenu: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentPath: [],
  breadcrumb: [],
  currentCategory: null,
  selectedProduct: null,
  menuHistory: [],
  isMenuOpen: false,

  navigateToCategory: (category) => {
    const { currentPath, breadcrumb, menuHistory, currentCategory } = get()

    // Check if we're already on this category (prevent duplicates)
    if (currentCategory && currentCategory.id === category.id) {
      return
    }

    // Check if this is a root level category navigation from bottom bar
    // If currentPath is empty OR this category is not a child of current category, reset navigation
    const isRootNavigation = currentPath.length === 0 ||
      (currentCategory && !currentCategory.subcategories.some(sub => sub.id === category.id))

    if (isRootNavigation) {
      // Reset navigation and start fresh
      set({
        currentPath: [category.id],
        breadcrumb: [category.name],
        currentCategory: category,
        selectedProduct: null,
        menuHistory: []
      })
    } else {
      // Normal drill-down navigation
      set({
        currentPath: [...currentPath, category.id],
        breadcrumb: [...breadcrumb, category.name],
        currentCategory: category,
        selectedProduct: null,
        menuHistory: currentCategory ? [...menuHistory, [currentCategory]] : menuHistory
      })
    }
  },

  navigateToProduct: (product) => {
    set({
      selectedProduct: product,
      isMenuOpen: false
    })
  },

  goBack: () => {
    const { currentPath, breadcrumb, menuHistory } = get()

    if (currentPath.length === 0) return

    const newPath = currentPath.slice(0, -1)
    const newBreadcrumb = breadcrumb.slice(0, -1)
    const newHistory = menuHistory.slice(0, -1)

    set({
      currentPath: newPath,
      breadcrumb: newBreadcrumb,
      currentCategory: newHistory.length > 0 ? newHistory[newHistory.length - 1][0] : null,
      selectedProduct: null,
      menuHistory: newHistory
    })
  },

  goHome: () => {
    set({
      currentPath: [],
      breadcrumb: [],
      currentCategory: null,
      selectedProduct: null,
      menuHistory: [],
      isMenuOpen: false
    })
  },

  toggleMenu: () => {
    set((state) => ({ isMenuOpen: !state.isMenuOpen }))
  },

  closeMenu: () => {
    set({ isMenuOpen: false })
  }
}))

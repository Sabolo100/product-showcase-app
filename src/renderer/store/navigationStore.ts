import { create } from 'zustand'
import { Category, Product } from '../types'

interface NavigationState {
  currentPath: string[]
  breadcrumb: string[]
  categoryPath: Category[] // Full path of category objects for breadcrumb navigation
  currentCategory: Category | null
  selectedProduct: Product | null
  menuHistory: Category[][]
  isMenuOpen: boolean

  // Actions
  navigateToCategory: (category: Category) => void
  navigateToProduct: (product: Product) => void
  navigateToBreadcrumbLevel: (index: number) => void
  goBack: () => void
  goHome: () => void
  toggleMenu: () => void
  closeMenu: () => void
}

export const useNavigationStore = create<NavigationState>((set, get) => ({
  currentPath: [],
  breadcrumb: [],
  categoryPath: [],
  currentCategory: null,
  selectedProduct: null,
  menuHistory: [],
  isMenuOpen: false,

  navigateToCategory: (category) => {
    const { currentPath, breadcrumb, categoryPath, menuHistory, currentCategory } = get()

    // Check if this is a root level category navigation from bottom bar
    // If currentPath is empty OR this category is not a child of current category, reset navigation
    const isChildOfCurrent = currentCategory?.subcategories?.some(sub => sub.id === category.id) ?? false
    const isRootNavigation = currentPath.length === 0 || !isChildOfCurrent

    if (isRootNavigation) {
      // Reset navigation and start fresh, always open menu for root navigation
      set({
        currentPath: [category.id],
        breadcrumb: [category.name],
        categoryPath: [category],
        currentCategory: category,
        selectedProduct: null,
        menuHistory: [],
        isMenuOpen: true
      })
    } else {
      // Normal drill-down navigation - keep menu open
      set({
        currentPath: [...currentPath, category.id],
        breadcrumb: [...breadcrumb, category.name],
        categoryPath: [...categoryPath, category],
        currentCategory: category,
        selectedProduct: null,
        menuHistory: currentCategory ? [...menuHistory, [currentCategory]] : menuHistory,
        isMenuOpen: true
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
    const { currentPath, breadcrumb, categoryPath, menuHistory } = get()

    if (currentPath.length === 0) return

    const newPath = currentPath.slice(0, -1)
    const newBreadcrumb = breadcrumb.slice(0, -1)
    const newCategoryPath = categoryPath.slice(0, -1)
    const newHistory = menuHistory.slice(0, -1)

    set({
      currentPath: newPath,
      breadcrumb: newBreadcrumb,
      categoryPath: newCategoryPath,
      currentCategory: newCategoryPath.length > 0 ? newCategoryPath[newCategoryPath.length - 1] : null,
      selectedProduct: null,
      menuHistory: newHistory
    })
  },

  goHome: () => {
    set({
      currentPath: [],
      breadcrumb: [],
      categoryPath: [],
      currentCategory: null,
      selectedProduct: null,
      menuHistory: [],
      isMenuOpen: false
    })
  },

  navigateToBreadcrumbLevel: (index) => {
    const { categoryPath } = get()

    // Index -1 means home
    if (index < 0 || categoryPath.length === 0) {
      set({
        currentPath: [],
        breadcrumb: [],
        categoryPath: [],
        currentCategory: null,
        selectedProduct: null,
        menuHistory: [],
        isMenuOpen: false
      })
      return
    }

    // Navigate to the category at the given index
    const newCategoryPath = categoryPath.slice(0, index + 1)
    const targetCategory = newCategoryPath[newCategoryPath.length - 1]

    set({
      currentPath: newCategoryPath.map(c => c.id),
      breadcrumb: newCategoryPath.map(c => c.name),
      categoryPath: newCategoryPath,
      currentCategory: targetCategory,
      selectedProduct: null,
      menuHistory: newCategoryPath.slice(0, -1).map(c => [c]),
      isMenuOpen: true
    })
  },

  toggleMenu: () => {
    set((state) => ({ isMenuOpen: !state.isMenuOpen }))
  },

  closeMenu: () => {
    set({ isMenuOpen: false })
  }
}))

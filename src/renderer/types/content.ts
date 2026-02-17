export interface MediaFile {
  id: string
  type: 'image' | 'video'
  filename: string
  path: string
  caption?: string
  description?: string
}

export interface Product {
  id: string
  name: string
  path: string
  media: MediaFile[]
  description: string
  aiContext?: string
}

export interface Category {
  id: string
  name: string
  path: string
  subcategories: Category[]
  products: Product[]
}

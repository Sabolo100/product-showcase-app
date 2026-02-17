export interface BrandingConfig {
  logo?: string
  logoData?: string
  background?: {
    type: 'color' | 'image'
    value: string
  }
  backgroundData?: string
  colors?: {
    primary?: string
    primaryHover?: string
    bgPrimary?: string
    bgSecondary?: string
    textPrimary?: string
    textSecondary?: string
  }
  font?: {
    family?: string
    url?: string
  }
}

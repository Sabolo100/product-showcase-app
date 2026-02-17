import fs from 'fs/promises'
import path from 'path'
import mammoth from 'mammoth'

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

export interface BrandingConfig {
  logo?: string
  background?: {
    type: 'color' | 'image'
    value: string
  }
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

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.mov', '.avi']

/**
 * Clean folder name for display
 * Removes numbered prefixes (001_, 02_, etc.) and suffixes (_done, _TODO, etc.)
 */
function cleanFolderName(folderName: string): string {
  let cleaned = folderName

  // Remove numbered prefix like "001_", "02_", "123_"
  cleaned = cleaned.replace(/^\d+_+/, '')

  // Remove common suffixes
  cleaned = cleaned.replace(/_?(done|todo|wip|draft|old|new|backup)$/i, '')

  // Replace underscores and hyphens with spaces
  cleaned = cleaned.replace(/[_-]/g, ' ')

  // Trim and normalize multiple spaces
  cleaned = cleaned.trim().replace(/\s+/g, ' ')

  return cleaned
}

/**
 * Check if a path is a directory
 */
async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath)
    return stat.isDirectory()
  } catch {
    return false
  }
}

/**
 * Check if a file is a media file (image or video)
 */
function isMediaFile(filename: string): boolean {
  const ext = path.extname(filename).toLowerCase()
  return IMAGE_EXTENSIONS.includes(ext) || VIDEO_EXTENSIONS.includes(ext)
}

/**
 * Get media type from filename
 */
function getMediaType(filename: string): 'image' | 'video' {
  const ext = path.extname(filename).toLowerCase()
  return VIDEO_EXTENSIONS.includes(ext) ? 'video' : 'image'
}

/**
 * Parse captions.txt file
 * Format: filename|caption|description
 */
async function parseCaptionsFile(captionsPath: string): Promise<Map<string, { caption?: string; description?: string }>> {
  const captions = new Map()

  try {
    const content = await fs.readFile(captionsPath, 'utf-8')
    const lines = content.split('\n').filter(line => line.trim())

    for (const line of lines) {
      const parts = line.split('|').map(p => p.trim())
      if (parts.length >= 2) {
        const [filename, caption, description] = parts
        captions.set(filename, {
          caption: caption || undefined,
          description: description || undefined
        })
      }
    }
  } catch (error) {
    // Captions file is optional
    console.log('No captions.txt found or error reading it:', error)
  }

  return captions
}

/**
 * Parse product.docx file
 */
async function parseProductDocx(docxPath: string): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ path: docxPath })
    return result.value.trim()
  } catch (error) {
    console.error('Error parsing docx:', error)
    return ''
  }
}

/**
 * Parse ai.txt file for AI context/description
 */
async function parseAiTxt(aiTxtPath: string): Promise<string> {
  try {
    const content = await fs.readFile(aiTxtPath, 'utf-8')
    return content.trim()
  } catch (error) {
    // ai.txt is optional
    return ''
  }
}

/**
 * Scan folder for media files (non-recursive, only direct children)
 */
async function collectMediaFiles(folderPath: string): Promise<string[]> {
  const mediaFiles: string[] = []

  try {
    const items = await fs.readdir(folderPath, { withFileTypes: true })

    for (const item of items) {
      if (item.isFile() && isMediaFile(item.name)) {
        const fullPath = path.join(folderPath, item.name)
        mediaFiles.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error collecting media files from ${folderPath}:`, error)
  }

  return mediaFiles
}

/**
 * Scan a product folder and collect media files
 */
async function scanProductFolder(folderPath: string, folderName: string): Promise<Product | null> {
  try {
    // Collect all media files from folder (only direct children)
    const allMediaPaths = await collectMediaFiles(folderPath)

    // If no media files found, not a product folder
    if (allMediaPaths.length === 0) {
      return null
    }

    // Parse captions if available
    const captionsPath = path.join(folderPath, 'captions.txt')
    const captions = await parseCaptionsFile(captionsPath)

    // Parse product description if available
    const docxPath = path.join(folderPath, 'product.docx')
    let description = ''
    try {
      await fs.access(docxPath)
      description = await parseProductDocx(docxPath)
    } catch {
      // product.docx is optional
    }

    // Parse AI context if available (ai.txt)
    const aiTxtPath = path.join(folderPath, 'ai.txt')
    const aiContext = await parseAiTxt(aiTxtPath)

    // Build media array
    const media: MediaFile[] = allMediaPaths.map((fullPath, index) => {
      const filename = path.basename(fullPath)
      const captionData = captions.get(filename) || {}

      return {
        id: `${folderName}-${index}`,
        type: getMediaType(filename),
        filename,
        path: fullPath,
        caption: captionData.caption,
        description: captionData.description
      }
    })

    return {
      id: folderName,
      name: cleanFolderName(folderName),
      path: folderPath,
      media,
      description,
      aiContext
    }
  } catch (error) {
    console.error(`Error scanning product folder ${folderPath}:`, error)
    return null
  }
}

/**
 * Recursively scan a category folder
 */
async function scanCategoryFolder(folderPath: string, folderName: string): Promise<Category | null> {
  try {
    const files = await fs.readdir(folderPath)

    const subcategories: Category[] = []
    const products: Product[] = []

    for (const file of files) {
      const fullPath = path.join(folderPath, file)

      if (await isDirectory(fullPath)) {
        // Try to scan as product first
        const product = await scanProductFolder(fullPath, file)

        if (product) {
          products.push(product)
        } else {
          // If not a product, try as category
          const category = await scanCategoryFolder(fullPath, file)
          if (category) {
            subcategories.push(category)
          }
        }
      }
    }

    // Only return category if it has content
    if (subcategories.length === 0 && products.length === 0) {
      return null
    }

    return {
      id: folderName,
      name: cleanFolderName(folderName),
      path: folderPath,
      subcategories,
      products
    }
  } catch (error) {
    console.error(`Error scanning category folder ${folderPath}:`, error)
    return null
  }
}

/**
 * Scan the Sources folder and return category hierarchy
 */
export async function scanSourcesFolder(sourcesPath: string): Promise<Category[]> {
  try {
    const files = await fs.readdir(sourcesPath)
    const categories: Category[] = []

    for (const file of files) {
      const fullPath = path.join(sourcesPath, file)

      if (await isDirectory(fullPath)) {
        const category = await scanCategoryFolder(fullPath, file)
        if (category) {
          categories.push(category)
        }
      }
    }

    return categories
  } catch (error) {
    console.error('Error scanning Sources folder:', error)
    return []
  }
}

/**
 * Load a media file and return as base64 data URL
 */
export async function loadMediaFile(appPath: string, relativePath: string): Promise<string> {
  try {
    const fullPath = path.join(appPath, relativePath)
    const buffer = await fs.readFile(fullPath)
    const ext = path.extname(fullPath).toLowerCase()

    // Determine MIME type
    let mimeType = 'application/octet-stream'
    if (IMAGE_EXTENSIONS.includes(ext)) {
      mimeType = `image/${ext.slice(1)}`
      if (ext === '.jpg') mimeType = 'image/jpeg'
    } else if (VIDEO_EXTENSIONS.includes(ext)) {
      mimeType = `video/${ext.slice(1)}`
    }

    // For videos, return file path instead of base64 (more efficient)
    if (VIDEO_EXTENSIONS.includes(ext)) {
      return `file://${fullPath}`
    }

    // For images, return base64
    return `data:${mimeType};base64,${buffer.toString('base64')}`
  } catch (error) {
    console.error('Error loading media file:', error)
    throw error
  }
}

/**
 * Load branding configuration
 */
export async function loadBrandingConfig(brandingPath: string): Promise<BrandingConfig> {
  try {
    const configPath = path.join(brandingPath, 'config.json')
    const content = await fs.readFile(configPath, 'utf-8')
    const config = JSON.parse(content)

    // Load logo if specified
    if (config.logo) {
      const logoPath = path.join(brandingPath, config.logo)
      try {
        const logoBuffer = await fs.readFile(logoPath)
        const ext = path.extname(config.logo).toLowerCase()
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
        config.logoData = `data:${mimeType};base64,${logoBuffer.toString('base64')}`
      } catch (error) {
        console.error('Error loading logo:', error)
      }
    }

    // Load background image if specified
    if (config.background?.type === 'image' && config.background.value) {
      const bgPath = path.join(brandingPath, config.background.value)
      try {
        const bgBuffer = await fs.readFile(bgPath)
        const ext = path.extname(config.background.value).toLowerCase()
        const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'
        config.backgroundData = `data:${mimeType};base64,${bgBuffer.toString('base64')}`
      } catch (error) {
        console.error('Error loading background image:', error)
      }
    }

    return config
  } catch (error) {
    console.error('Error loading branding config:', error)
    // Return default config
    return {
      background: {
        type: 'color',
        value: '#0A0E1A'
      },
      colors: {
        primary: '#0066FF',
        primaryHover: '#0052CC',
        bgPrimary: '#0A0E1A',
        bgSecondary: '#151B2D',
        textPrimary: '#FFFFFF',
        textSecondary: '#B0B8CC'
      },
      font: {
        family: 'Inter',
        url: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
      }
    }
  }
}

/**
 * Load company info (similar to product)
 */
export async function loadCompanyInfo(companyInfoPath: string): Promise<Product | null> {
  try {
    const introPath = path.join(companyInfoPath, 'intro')
    return await scanProductFolder(introPath, 'Company')
  } catch (error) {
    console.error('Error loading company info:', error)
    return null
  }
}

/**
 * Load company logo from CompanyInfo folder
 * Looks for company-logo.png or company-logo.jpg
 */
export async function loadCompanyLogo(companyInfoPath: string): Promise<string | null> {
  const possibleNames = ['company-logo.png', 'company-logo.jpg', 'company-logo.jpeg']

  for (const filename of possibleNames) {
    try {
      const logoPath = path.join(companyInfoPath, filename)
      await fs.access(logoPath)

      const buffer = await fs.readFile(logoPath)
      const ext = path.extname(filename).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'

      console.log('Company logo loaded:', logoPath)
      return `data:${mimeType};base64,${buffer.toString('base64')}`
    } catch {
      // Try next filename
    }
  }

  console.log('No company logo found in CompanyInfo folder')
  return null
}

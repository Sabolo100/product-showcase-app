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
  thumbnail?: string // Base64 data URL of thumb.png
}

export interface Category {
  id: string
  name: string
  path: string
  subcategories: Category[]
  products: Product[]
  thumbnail?: string // Base64 data URL of thumb.png
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
 * Clean folder name for display (fallback if no name.txt)
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
 * Read display name from name.txt file in folder
 * Falls back to cleaned folder name if name.txt doesn't exist
 */
async function readDisplayName(folderPath: string, folderName: string): Promise<string> {
  try {
    const nameFilePath = path.join(folderPath, 'name.txt')
    const content = await fs.readFile(nameFilePath, 'utf-8')
    const name = content.trim()
    if (name) {
      return name
    }
  } catch {
    // name.txt doesn't exist or is empty, use folder name
  }
  return cleanFolderName(folderName)
}

/**
 * Load thumbnail image from folder (thumb.png or thumb.jpg)
 * Returns base64 data URL or undefined if not found
 */
async function loadThumbnail(folderPath: string): Promise<string | undefined> {
  const possibleNames = ['thumb.png', 'thumb.jpg', 'thumb.jpeg']

  for (const filename of possibleNames) {
    try {
      const thumbPath = path.join(folderPath, filename)
      await fs.access(thumbPath)

      const buffer = await fs.readFile(thumbPath)
      const ext = path.extname(filename).toLowerCase()
      const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg'

      return `data:${mimeType};base64,${buffer.toString('base64')}`
    } catch {
      // Try next filename
    }
  }

  return undefined
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
 * A folder is a product ONLY if it contains a "Photos" subfolder with media files
 * Direct media files in the folder are ignored (they might be thumbnails)
 */
async function scanProductFolder(folderPath: string, folderName: string): Promise<Product | null> {
  try {
    // Check if Photos subfolder exists - this is the ONLY way to identify a product folder
    const photosPath = path.join(folderPath, 'Photos')

    try {
      const photosStat = await fs.stat(photosPath)
      if (!photosStat.isDirectory()) {
        return null // Photos exists but is not a directory
      }
    } catch {
      return null // No Photos folder = not a product
    }

    // Collect all media files from the Photos folder
    const allMediaPaths = await collectMediaFiles(photosPath)

    // If no media files found in Photos folder, not a valid product
    if (allMediaPaths.length === 0) {
      return null
    }

    // Parse captions if available (check both Photos folder and product folder)
    let captions = new Map<string, { caption?: string; description?: string }>()
    const captionsInPhotos = path.join(photosPath, 'captions.txt')
    const captionsInProduct = path.join(folderPath, 'captions.txt')

    try {
      await fs.access(captionsInPhotos)
      captions = await parseCaptionsFile(captionsInPhotos)
    } catch {
      try {
        await fs.access(captionsInProduct)
        captions = await parseCaptionsFile(captionsInProduct)
      } catch {
        // No captions file
      }
    }

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

    // Read display name from name.txt or use cleaned folder name
    const displayName = await readDisplayName(folderPath, folderName)

    // Load thumbnail if available
    const thumbnail = await loadThumbnail(folderPath)

    return {
      id: folderName,
      name: displayName,
      path: folderPath,
      media,
      description,
      aiContext,
      thumbnail
    }
  } catch (error) {
    console.error(`Error scanning product folder ${folderPath}:`, error)
    return null
  }
}

// Folders to skip when scanning (not categories or products)
const SKIP_FOLDERS = ['Photos', 'ASSETS', 'Idle', 'Videos', 'Images', 'CEGINFO']

/**
 * Recursively scan a category folder
 */
async function scanCategoryFolder(folderPath: string, folderName: string): Promise<Category | null> {
  try {
    const files = await fs.readdir(folderPath)

    const subcategories: Category[] = []
    const products: Product[] = []

    for (const file of files) {
      // Skip special folders
      if (SKIP_FOLDERS.includes(file)) {
        continue
      }

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

    // Read display name from name.txt or use cleaned folder name
    const displayName = await readDisplayName(folderPath, folderName)

    // Load thumbnail if available
    const thumbnail = await loadThumbnail(folderPath)

    return {
      id: folderName,
      name: displayName,
      path: folderPath,
      subcategories,
      products,
      thumbnail
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
      // Skip special folders at root level
      if (SKIP_FOLDERS.includes(file)) {
        continue
      }

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
 * Load company info from CEGINFO folder
 * Expects: name.txt (company name) and Photos/ folder with images
 */
export async function loadCompanyInfo(companyInfoPath: string): Promise<Product | null> {
  try {
    // Get folder name for fallback
    const folderName = path.basename(companyInfoPath)

    // Use scanProductFolder which handles Photos folder and name.txt
    const product = await scanProductFolder(companyInfoPath, folderName)

    if (product) {
      console.log('Company info loaded:', product.name, 'with', product.media.length, 'media files')
    } else {
      console.log('No company info found at:', companyInfoPath)
    }

    return product
  } catch (error) {
    console.error('Error loading company info:', error)
    return null
  }
}

/**
 * Load idle configuration from Sources/ASSETS/Idle folder
 * Returns video path and timeout in seconds
 */
export async function loadIdleConfig(sourcesPath: string): Promise<{ videoPath: string | null; timeout: number }> {
  const idleFolderPath = path.join(sourcesPath, 'ASSETS', 'Idle')
  const defaultTimeout = 60 // Default 60 seconds

  let videoPath: string | null = null
  let timeout = defaultTimeout

  // Check for idle.mp4
  try {
    const videoFile = path.join(idleFolderPath, 'idle.mp4')
    await fs.access(videoFile)
    videoPath = `file://${videoFile.replace(/\\/g, '/')}`
    console.log('Idle video found:', videoFile)
  } catch {
    console.log('No idle.mp4 found in ASSETS/Idle folder')
  }

  // Read timeout from idle_time.txt
  try {
    const timeoutFile = path.join(idleFolderPath, 'idle_time.txt')
    const content = await fs.readFile(timeoutFile, 'utf-8')
    const parsed = parseInt(content.trim(), 10)
    if (!isNaN(parsed) && parsed > 0) {
      timeout = parsed
      console.log('Idle timeout loaded:', timeout, 'seconds')
    }
  } catch {
    console.log('No idle_time.txt found, using default timeout:', defaultTimeout)
  }

  return { videoPath, timeout }
}

/**
 * Load company logo from Sources/ASSETS folder
 * Looks for logo.png or logo.jpg
 */
export async function loadCompanyLogo(assetsPath: string): Promise<string | null> {
  const possibleNames = ['logo.png', 'logo.jpg', 'logo.jpeg']

  for (const filename of possibleNames) {
    try {
      const logoPath = path.join(assetsPath, filename)
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

  console.log('No company logo found in Sources/ASSETS folder')
  return null
}

import { app, BrowserWindow, ipcMain, screen } from 'electron'
import path from 'path'
import { fileURLToPath } from 'url'
import { scanSourcesFolder, loadMediaFile, loadBrandingConfig, loadCompanyInfo, loadCompanyLogo } from './fileSystem'
import {
  initDatabase,
  saveChatMessage,
  getChatHistory,
  clearChatHistory
} from './database'
import { loadApiKeys } from './apiKeys'
import {
  isWhisperAvailable,
  initWhisper,
  transcribeAudio,
  closeWhisper
} from './whisperService'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Disable GPU acceleration for better compatibility
app.disableHardwareAcceleration()

let mainWindow: BrowserWindow | null = null

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  mainWindow = new BrowserWindow({
    width,
    height,
    fullscreen: true,
    frame: false,
    kiosk: !isDev, // Kiosk mode only in production
    webPreferences: {
      preload: path.join(__dirname, '../preload/preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false // Allow loading local files
    }
  })

  // Disable menu bar
  mainWindow.setMenu(null)

  // Disable keyboard shortcuts in production
  if (!isDev) {
    mainWindow.webContents.on('before-input-event', (event, input) => {
      // Block Alt+F4, F11, Ctrl+Q, etc.
      if (
        (input.alt && input.key === 'F4') ||
        input.key === 'F11' ||
        (input.control && input.key === 'q') ||
        (input.control && input.key === 'w')
      ) {
        event.preventDefault()
      }
    })
  }

  // Disable right-click context menu
  mainWindow.webContents.on('context-menu', (event) => {
    event.preventDefault()
  })

  // Load app
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

// App lifecycle
app.whenReady().then(async () => {
  // Initialize database
  await initDatabase()

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC Handlers

// Scan content folders
ipcMain.handle('scan-content-folders', async () => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    const categories = await scanSourcesFolder(path.join(appPath, 'Sources'))
    return { success: true, data: categories }
  } catch (error) {
    console.error('Error scanning content folders:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Load media file
ipcMain.handle('load-media', async (_, relativePath: string) => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    const data = await loadMediaFile(appPath, relativePath)
    return { success: true, data }
  } catch (error) {
    console.error('Error loading media:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Load branding config
ipcMain.handle('load-branding', async () => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    const config = await loadBrandingConfig(path.join(appPath, 'Branding'))
    return { success: true, data: config }
  } catch (error) {
    console.error('Error loading branding:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Load company info
ipcMain.handle('load-company-info', async () => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    const info = await loadCompanyInfo(path.join(appPath, 'CompanyInfo'))
    return { success: true, data: info }
  } catch (error) {
    console.error('Error loading company info:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Load company logo
ipcMain.handle('load-company-logo', async () => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    const logo = await loadCompanyLogo(path.join(appPath, 'CompanyInfo'))
    return { success: true, data: logo }
  } catch (error) {
    console.error('Error loading company logo:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Load API keys
ipcMain.handle('load-api-keys', async () => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    const keys = await loadApiKeys(appPath)
    return { success: true, data: keys }
  } catch (error) {
    console.error('Error loading API keys:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Chat history operations
ipcMain.handle('save-chat-message', async (_, message) => {
  try {
    await saveChatMessage(message)
    return { success: true }
  } catch (error) {
    console.error('Error saving chat message:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('get-chat-history', async (_, limit?: number) => {
  try {
    const history = await getChatHistory(limit)
    return { success: true, data: history }
  } catch (error) {
    console.error('Error getting chat history:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('clear-chat-history', async () => {
  try {
    await clearChatHistory()
    return { success: true }
  } catch (error) {
    console.error('Error clearing chat history:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Get app path
ipcMain.handle('get-app-path', async () => {
  try {
    const appPath = isDev
      ? path.join(process.cwd(), 'app')
      : path.join(process.resourcesPath, 'app')

    return { success: true, data: appPath }
  } catch (error) {
    console.error('Error getting app path:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Voice/Whisper operations
ipcMain.handle('voice-available', async () => {
  try {
    const available = await isWhisperAvailable()
    return { success: true, data: available }
  } catch (error) {
    console.error('Error checking voice availability:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('voice-init', async () => {
  try {
    const initialized = await initWhisper()
    return { success: true, data: initialized }
  } catch (error) {
    console.error('Error initializing voice:', error)
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('transcribe-audio', async (_, audioData: number[]) => {
  try {
    const result = await transcribeAudio(audioData)
    return result
  } catch (error) {
    console.error('Error transcribing audio:', error)
    return { success: false, error: (error as Error).message }
  }
})

// Cleanup on app quit
app.on('before-quit', () => {
  closeWhisper()
})

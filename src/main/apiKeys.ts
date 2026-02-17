import fs from 'fs/promises'
import path from 'path'

export interface ApiKeys {
  openai?: string
  gemini?: string
}

/**
 * Parse API keys from api-keys.txt file
 * Format:
 * OPENAI_API_KEY=sk-...
 * GEMINI_API_KEY=AIza...
 */
export async function loadApiKeys(appPath: string): Promise<ApiKeys> {
  try {
    const keysPath = path.join(appPath, 'api-keys.txt')
    const content = await fs.readFile(keysPath, 'utf-8')

    const keys: ApiKeys = {}

    const lines = content.split('\n').filter(line => line.trim())

    for (const line of lines) {
      const [key, value] = line.split('=').map(s => s.trim())

      if (key === 'OPENAI_API_KEY' && value) {
        keys.openai = value
      } else if (key === 'GEMINI_API_KEY' && value) {
        keys.gemini = value
      }
    }

    return keys
  } catch (error) {
    console.error('Error loading API keys:', error)
    return {}
  }
}

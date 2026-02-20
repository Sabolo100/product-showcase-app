import path from 'path'
import { app } from 'electron'

// Whisper is currently disabled - using Web Speech API in renderer instead
// To enable native Whisper, install: npm install @fugood/whisper.node

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function getModelPath(): string {
  const appPath = isDev
    ? path.join(process.cwd(), 'app')
    : path.join(process.resourcesPath, 'app')
  return path.join(appPath, 'models', 'ggml-base.bin')
}

/**
 * Check if Whisper model file exists
 * Currently always returns false to force Web Speech API usage
 */
export async function isWhisperAvailable(): Promise<boolean> {
  // Disabled - use Web Speech API instead
  return false
}

/**
 * Initialize Whisper - currently disabled
 */
export async function initWhisper(): Promise<boolean> {
  // Disabled - use Web Speech API instead
  console.log('Whisper disabled - using Web Speech API in browser')
  return false
}

/**
 * Transcribe audio - currently disabled
 */
export async function transcribeAudio(_audioData: number[]): Promise<{ success: boolean; text?: string; error?: string }> {
  return { success: false, error: 'Whisper disabled - use Web Speech API' }
}

/**
 * Close Whisper - no-op when disabled
 */
export function closeWhisper(): void {
  // No-op
}

/**
 * Get Whisper status
 */
export function getWhisperStatus(): { initialized: boolean; modelPath: string } {
  return {
    initialized: false,
    modelPath: getModelPath()
  }
}

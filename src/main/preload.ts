import { contextBridge, ipcRenderer } from 'electron'

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Content operations
  scanContentFolders: () => ipcRenderer.invoke('scan-content-folders'),
  loadMedia: (relativePath: string) => ipcRenderer.invoke('load-media', relativePath),
  loadBranding: () => ipcRenderer.invoke('load-branding'),
  loadCompanyInfo: () => ipcRenderer.invoke('load-company-info'),
  loadCompanyLogo: () => ipcRenderer.invoke('load-company-logo'),
  loadIdleConfig: () => ipcRenderer.invoke('load-idle-config'),
  loadApiKeys: () => ipcRenderer.invoke('load-api-keys'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),

  // Chat operations
  saveChatMessage: (message: any) => ipcRenderer.invoke('save-chat-message', message),
  getChatHistory: (limit?: number) => ipcRenderer.invoke('get-chat-history', limit),
  clearChatHistory: () => ipcRenderer.invoke('clear-chat-history'),

  // Voice/Whisper operations
  isVoiceAvailable: () => ipcRenderer.invoke('voice-available'),
  initVoice: () => ipcRenderer.invoke('voice-init'),
  transcribeAudio: (audioData: number[]) => ipcRenderer.invoke('transcribe-audio', audioData),
})

// Type definitions for TypeScript
export interface ElectronAPI {
  scanContentFolders: () => Promise<{ success: boolean; data?: any; error?: string }>
  loadMedia: (relativePath: string) => Promise<{ success: boolean; data?: any; error?: string }>
  loadBranding: () => Promise<{ success: boolean; data?: any; error?: string }>
  loadCompanyInfo: () => Promise<{ success: boolean; data?: any; error?: string }>
  loadCompanyLogo: () => Promise<{ success: boolean; data?: string | null; error?: string }>
  loadIdleConfig: () => Promise<{ success: boolean; data?: { videoPath: string | null; timeout: number }; error?: string }>
  loadApiKeys: () => Promise<{ success: boolean; data?: any; error?: string }>
  getAppPath: () => Promise<{ success: boolean; data?: string; error?: string }>
  saveChatMessage: (message: any) => Promise<{ success: boolean; error?: string }>
  getChatHistory: (limit?: number) => Promise<{ success: boolean; data?: any[]; error?: string }>
  clearChatHistory: () => Promise<{ success: boolean; error?: string }>
  // Voice/Whisper operations
  isVoiceAvailable: () => Promise<{ success: boolean; data?: boolean; error?: string }>
  initVoice: () => Promise<{ success: boolean; data?: boolean; error?: string }>
  transcribeAudio: (audioData: number[]) => Promise<{ success: boolean; text?: string; error?: string }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}

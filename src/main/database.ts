import path from 'path'
import { app } from 'electron'

// Try to import better-sqlite3, but gracefully handle if it's not available
let Database: any = null
try {
  Database = require('better-sqlite3')
} catch (error) {
  console.warn('better-sqlite3 not available - chat history will not persist')
}

let db: any = null
let isSQLiteAvailable = false

export interface ChatMessage {
  id?: number
  timestamp: string
  role: 'user' | 'assistant'
  message: string
  productId?: string
  productName?: string
  categoryPath?: string
}

// In-memory fallback storage when SQLite is not available
let inMemoryMessages: ChatMessage[] = []

/**
 * Initialize the SQLite database
 */
export async function initDatabase(): Promise<void> {
  if (!Database) {
    console.warn('SQLite not available - using in-memory storage')
    isSQLiteAvailable = false
    return
  }

  try {
    const userDataPath = app.getPath('userData')
    const dbPath = path.join(userDataPath, 'chat-history.db')

    db = new Database(dbPath)

    // Create chat_messages table if it doesn't exist
    db.exec(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT NOT NULL,
        role TEXT NOT NULL,
        message TEXT NOT NULL,
        product_id TEXT,
        product_name TEXT,
        category_path TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_timestamp ON chat_messages(timestamp);
    `)

    isSQLiteAvailable = true
    console.log('Database initialized successfully')
  } catch (error) {
    console.error('Error initializing database:', error)
    isSQLiteAvailable = false
    console.warn('Falling back to in-memory storage')
  }
}

/**
 * Save a chat message to the database or in-memory storage
 */
export async function saveChatMessage(message: ChatMessage): Promise<void> {
  if (!isSQLiteAvailable || !db) {
    // Use in-memory storage
    inMemoryMessages.push({
      ...message,
      id: inMemoryMessages.length + 1
    })
    return
  }

  try {
    const stmt = db.prepare(`
      INSERT INTO chat_messages (timestamp, role, message, product_id, product_name, category_path)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    stmt.run(
      message.timestamp,
      message.role,
      message.message,
      message.productId || null,
      message.productName || null,
      message.categoryPath || null
    )
  } catch (error) {
    console.error('Error saving chat message:', error)
    // Fallback to in-memory
    inMemoryMessages.push({
      ...message,
      id: inMemoryMessages.length + 1
    })
  }
}

/**
 * Get chat history from the database or in-memory storage
 */
export async function getChatHistory(limit: number = 100): Promise<ChatMessage[]> {
  if (!isSQLiteAvailable || !db) {
    // Return from in-memory storage
    return inMemoryMessages.slice(-limit)
  }

  try {
    const stmt = db.prepare(`
      SELECT * FROM chat_messages
      ORDER BY timestamp DESC
      LIMIT ?
    `)

    const rows = stmt.all(limit) as any[]

    return rows.map(row => ({
      id: row.id,
      timestamp: row.timestamp,
      role: row.role,
      message: row.message,
      productId: row.product_id,
      productName: row.product_name,
      categoryPath: row.category_path
    })).reverse() // Reverse to get chronological order
  } catch (error) {
    console.error('Error getting chat history:', error)
    return inMemoryMessages.slice(-limit)
  }
}

/**
 * Clear all chat history
 */
export async function clearChatHistory(): Promise<void> {
  // Clear in-memory storage
  inMemoryMessages = []

  if (!isSQLiteAvailable || !db) {
    return
  }

  try {
    db.exec('DELETE FROM chat_messages')
  } catch (error) {
    console.error('Error clearing chat history:', error)
  }
}

/**
 * Close the database connection
 */
export function closeDatabase(): void {
  if (db) {
    try {
      db.close()
    } catch (error) {
      console.error('Error closing database:', error)
    }
    db = null
  }
}

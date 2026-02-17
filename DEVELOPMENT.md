# Development Guide

## Architecture Overview

This application is built with:

- **Electron 28**: Desktop app container with Node.js backend
- **React 18 + TypeScript**: UI framework with type safety
- **Vite**: Fast build tool and dev server
- **Zustand**: Lightweight state management
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Swiper.js**: 3D carousel implementation
- **i18next**: Multi-language support
- **OpenAI SDK / Google Generative AI**: AI chat integration
- **better-sqlite3**: Local database for chat history

## Development Workflow

### Start Development Server

```bash
npm run dev
```

This runs:
1. Vite dev server on port 5173
2. Electron app with hot-reload
3. DevTools automatically opened

### Code Structure

#### Main Process (Node.js)

Location: `src/main/`

**Key Files:**
- `index.ts` - Electron app initialization, window management, IPC handlers
- `preload.ts` - Secure bridge between main and renderer processes
- `fileSystem.ts` - Folder scanning, content loading, file operations
- `database.ts` - SQLite chat history operations
- `apiKeys.ts` - API key parsing from text file

**IPC Handlers:**
- `scan-content-folders` - Recursively scan Sources folder
- `load-media` - Load individual media files
- `load-branding` - Load branding configuration
- `load-company-info` - Load company information
- `load-api-keys` - Parse API keys file
- `save-chat-message` - Store chat message in DB
- `get-chat-history` - Retrieve chat history
- `clear-chat-history` - Delete all chat messages

#### Renderer Process (React)

Location: `src/renderer/`

**Components Structure:**
```
components/
├── layout/         # App layout (TopBar, BottomBar, MainLayout)
├── carousel/       # 3D carousel and media viewer
├── navigation/     # Category menu, popup menu, breadcrumb
├── ai/             # AI chat panel, chat feed, virtual keyboard
├── buttons/        # Reusable touch-optimized buttons
└── ui/             # Common UI elements (loading, error, modals)
```

**State Management (Zustand):**
```
store/
├── appStore.ts         # Global app state, categories, initialization
├── navigationStore.ts  # Current path, breadcrumb, selected product
├── carouselStore.ts    # Carousel state, current slide, fullscreen
├── aiStore.ts          # Chat messages, AI provider, panel state
└── brandingStore.ts    # Branding config, theme application
```

**Services:**
```
services/
├── aiService.ts           # OpenAI/Gemini wrapper, context injection
└── sessionManager.ts      # Idle detection, session timeout
```

**Hooks:**
```
hooks/
├── useSwipeGesture.ts     # Touch swipe detection
├── useIdleTimer.ts        # Idle state management
└── useSessionTimeout.ts   # Session timeout with warning
```

### Key Features Implementation

#### 1. Content Loading

The app dynamically scans the `app/Sources/` folder structure:

```typescript
// File: src/main/fileSystem.ts
export async function scanSourcesFolder(sourcesPath: string): Promise<Category[]>
```

**Algorithm:**
1. Recursively traverse folders
2. If folder contains media files (.jpg, .png, .mp4) → Product
3. If folder contains only subfolders → Category
4. Parse `captions.txt` for media descriptions
5. Parse `product.docx` for product descriptions
6. Build hierarchical category tree

#### 2. Carousel with Touch Gestures

**Implementation:** `src/renderer/components/carousel/Carousel.tsx`

- Uses Swiper.js with 3D Coverflow effect
- Touch gestures with 200px minimum swipe distance
- Tap center item → Open fullscreen
- Tap side item → Navigate to that item
- Custom navigation buttons with 120×120px touch targets

**Configuration:**
```typescript
{
  effect: 'coverflow',
  coverflowEffect: {
    rotate: 15,
    stretch: 0,
    depth: 200,
    modifier: 1,
    slideShadows: true
  }
}
```

#### 3. AI Chat Integration

**Service:** `src/renderer/services/aiService.ts`

Supports two providers:
1. **OpenAI (GPT-3.5)** - Primary, if API key available
2. **Google Gemini** - Fallback, if OpenAI unavailable

**Context Injection:**
- Current product name and description
- Conversation history (last 10 messages)
- System prompt with assistant role

**Flow:**
```
User Input → AI Service → Provider API → Response → Save to DB → Display
```

#### 4. Multi-Language Support

**Implementation:** i18next with React hooks

```typescript
// Usage in components
const { t } = useTranslation()
<p>{t('nav.home')}</p>
```

**Supported Languages:**
- German (de) - Default
- English (en)
- Hungarian (hu)

**Files:** `src/renderer/locales/[lang].json`

#### 5. Session Management

**Idle Detection:**
- 30 seconds → Attract mode (pulse animation)
- 45 seconds → Warning modal
- 60 seconds → Auto reset to home

**Events tracked:**
```typescript
['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']
```

### Touch Optimization

All interactive elements follow these rules:

**Minimum Touch Target:** 100×100px
**Ideal Touch Target:** 120×120px

**CSS Classes:**
```css
.touch-target      → min 100×100px
.touch-target-lg   → min 120×120px
.touch-feedback    → Scale 0.95 + opacity 0.8 on active
```

**Disabled Features:**
- Double-tap zoom (`touch-action: manipulation`)
- Text selection (`user-select: none`)
- Context menu (on right-click)
- Browser keyboard shortcuts (Alt+F4, F11, Ctrl+Q)

### Build Process

```bash
npm run build
```

**Steps:**
1. TypeScript compilation (`tsc`)
2. Vite production build
3. Electron packaging
4. NSIS installer creation

**Output:** `release/Product Showcase Setup 1.0.0.exe`

### Testing

Manual testing checklist:

**Navigation:**
- [ ] Category selection opens popup menu
- [ ] Product selection loads carousel
- [ ] Back button returns to previous level
- [ ] Breadcrumb shows correct path

**Carousel:**
- [ ] Swipe left/right changes slides
- [ ] Arrow buttons work
- [ ] Center tap opens fullscreen
- [ ] Side tap navigates to that slide
- [ ] Video controls appear/hide correctly

**AI Chat:**
- [ ] Panel slides in from right
- [ ] Messages send and receive correctly
- [ ] Virtual keyboard works
- [ ] Chat history persists
- [ ] Context includes current product

**Session:**
- [ ] Idle mode activates after 30s
- [ ] Warning shows after 45s
- [ ] Auto-reset after 60s
- [ ] Any touch resets timers

**Branding:**
- [ ] Logo displays correctly
- [ ] Colors apply from config
- [ ] Custom font loads
- [ ] Background shows correctly

### Debugging

**Main Process:**
```javascript
console.log('Main process:', message)
```
Output visible in terminal running `npm run dev`

**Renderer Process:**
```javascript
console.log('Renderer:', message)
```
Output visible in DevTools (auto-opened in dev mode)

**Database Inspection:**
Chat history database location:
```
Windows: %APPDATA%\product-showcase-app\chat-history.db
```

Use SQLite browser: https://sqlitebrowser.org/

### Common Development Tasks

#### Add New Translation

1. Edit `src/renderer/locales/de.json`, `en.json`, `hu.json`
2. Add new key with translations
3. Use in component: `t('your.new.key')`

#### Add New Category/Product Property

1. Update type in `src/renderer/types/content.ts`
2. Update parser in `src/main/fileSystem.ts`
3. Update UI component to display property

#### Change Touch Target Size

Edit `tailwind.config.js`:
```javascript
spacing: {
  'touch': '100px',
  'touch-lg': '120px', // Change this
}
```

#### Add New AI Provider

1. Install SDK: `npm install provider-sdk`
2. Add to `src/renderer/services/aiService.ts`
3. Implement `sendProviderMessage` method
4. Update API keys parser

### Performance Optimization

**Image Loading:**
- Use lazy loading for carousel items
- Optimize images to 1920×1080 max
- Use WebP format for smaller file sizes

**Video Playback:**
- Use H.264 codec for best compatibility
- Compress videos to reduce file size
- Consider streaming for very large files

**State Management:**
- Avoid unnecessary re-renders
- Use Zustand selectors for specific state slices
- Memoize expensive computations

**Bundle Size:**
- Check with `npm run build` and inspect `dist/`
- Consider code splitting for large components
- Tree-shake unused dependencies

### Security Considerations

**API Keys:**
- Never commit API keys to version control
- Keys stored in plain text file (for easy user editing)
- In production, consider encrypting keys

**IPC Communication:**
- Context isolation enabled
- Node integration disabled
- Preload script with whitelisted APIs only

**File Access:**
- Limit file reads to `app/` folder only
- Validate file paths to prevent directory traversal
- Sanitize user input

### Future Enhancements

**Planned Features:**
1. **Admin Dashboard** - Web-based content management
2. **Analytics** - Heatmap, visitor statistics
3. **Remote Management** - Cloud-based content sync
4. **Multi-Display** - Controller tablet + display screen
5. **Offline AI** - Local LLM integration (Ollama)
6. **QR Codes** - Send content to user's phone
7. **Email Collection** - Newsletter signup
8. **Product Comparison** - Side-by-side view

## Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## Resources

- **Electron Docs:** https://www.electronjs.org/docs
- **React Docs:** https://react.dev/
- **Vite Docs:** https://vitejs.dev/
- **Swiper Docs:** https://swiperjs.com/
- **Tailwind CSS:** https://tailwindcss.com/
- **Framer Motion:** https://www.framer.com/motion/

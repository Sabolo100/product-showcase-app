# Product Showcase App - Setup Guide

## Prerequisites

Before starting, ensure you have:

1. **Node.js 18+** installed
   - Download from: https://nodejs.org/
   - Verify installation: `node --version` and `npm --version`

2. **Windows 10/11**
   - Required for Electron app development and deployment

## Installation Steps

### 1. Install Dependencies

Open PowerShell or Command Prompt in the project directory and run:

```bash
npm install
```

This will install all required packages listed in `package.json`.

### 2. Configure Content

#### A. Add Product Content

Navigate to `app/Sources/` and create your product hierarchy:

```
app/Sources/
├── Category-Name/
│   ├── Subcategory-Name/
│   │   ├── Product-Name/
│   │   │   ├── image1.jpg
│   │   │   ├── image2.png
│   │   │   ├── video1.mp4
│   │   │   ├── captions.txt
│   │   │   └── product.docx
```

**captions.txt format:**
```
image1.jpg|Image Title|Image description text
video1.mp4|Video Title|Video description text
```

**product.docx:**
- Create a Word document with product description
- This text will be used as context for the AI assistant

#### B. Configure Branding

Edit `app/Branding/config.json`:

```json
{
  "logo": "logo.png",
  "background": {
    "type": "color",
    "value": "#0A0E1A"
  },
  "colors": {
    "primary": "#0066FF",
    "primaryHover": "#0052CC",
    "bgPrimary": "#0A0E1A",
    "bgSecondary": "#151B2D",
    "textPrimary": "#FFFFFF",
    "textSecondary": "#B0B8CC"
  },
  "font": {
    "family": "Inter",
    "url": "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
  }
}
```

Add your logo file as `app/Branding/logo.png`.

#### C. Add Company Information

Create company intro content in `app/CompanyInfo/intro/`:

```
app/CompanyInfo/intro/
├── company-photo.jpg
├── company-video.mp4
├── captions.txt
└── company.docx
```

#### D. Configure API Keys

Edit `app/api-keys.txt`:

```
OPENAI_API_KEY=sk-your-openai-key-here
GEMINI_API_KEY=AIza-your-gemini-key-here
```

**Important:** You need at least one API key for the AI assistant to work.

- Get OpenAI key: https://platform.openai.com/api-keys
- Get Gemini key: https://makersuite.google.com/app/apikey

### 3. Development

Run the development server:

```bash
npm run dev
```

This will:
- Start Vite dev server
- Launch Electron in development mode
- Enable hot-reload for code changes
- Open DevTools for debugging

### 4. Build for Production

Create a distributable Windows installer:

```bash
npm run build
```

This will:
1. Compile TypeScript
2. Build React app with Vite
3. Package Electron app
4. Create installer in `release/` folder

The installer will be named something like:
```
Product Showcase Setup 1.0.0.exe
```

## Project Structure

```
product-showcase-app/
├── app/                    # User-configurable content (portable)
│   ├── Sources/            # Product hierarchy
│   ├── Branding/           # Logo, colors, fonts
│   ├── CompanyInfo/        # Company information
│   └── api-keys.txt        # API keys
│
├── src/                    # Source code
│   ├── main/               # Electron main process
│   │   ├── index.ts        # Main entry point
│   │   ├── preload.ts      # IPC bridge
│   │   ├── fileSystem.ts   # Content scanning
│   │   ├── database.ts     # SQLite chat history
│   │   └── apiKeys.ts      # API key parser
│   │
│   └── renderer/           # React UI
│       ├── main.tsx        # React entry point
│       ├── App.tsx         # Root component
│       ├── components/     # UI components
│       ├── services/       # Business logic
│       ├── store/          # Zustand state management
│       ├── hooks/          # Custom React hooks
│       ├── types/          # TypeScript types
│       ├── utils/          # Helper functions
│       ├── styles/         # Global CSS
│       └── locales/        # Translations (DE/EN/HU)
│
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
├── tailwind.config.js      # Tailwind CSS config
├── electron-builder.json   # Build config
└── README.md               # Project overview
```

## Troubleshooting

### Issue: "npm: command not found"

**Solution:** Node.js is not installed or not in PATH. Install from nodejs.org.

### Issue: "Cannot find module 'electron'"

**Solution:** Dependencies not installed. Run `npm install`.

### Issue: AI not responding

**Solution:** Check:
1. API keys are correctly set in `app/api-keys.txt`
2. API keys are valid (not expired)
3. Internet connection is active

### Issue: Content not loading

**Solution:** Check:
1. Folder structure matches the required format
2. Media files are in supported formats (jpg, png, mp4, webm)
3. File permissions allow reading

### Issue: Carousel not showing images

**Solution:**
1. Ensure images are in proper format
2. Check file paths don't contain special characters
3. Verify `captions.txt` format is correct

## Deployment

### Installing on Exhibition Computer

1. Copy the installer `.exe` file to the target computer
2. Run the installer
3. After installation, navigate to the app installation directory
4. Copy your configured `app/` folder to the installation directory
5. Launch the application

### Updating Content Without Reinstalling

You can update content without reinstalling the app:

1. Navigate to the installation directory (usually `C:\Program Files\Product Showcase\`)
2. Replace the `app/` folder with your updated content
3. Restart the application

## Performance Tips

1. **Image Optimization:** Resize images to max 1920×1080 before adding
2. **Video Compression:** Use H.264 codec for best compatibility
3. **Content Limit:** Keep total media files under 500 for best performance
4. **Network:** Ensure stable internet for AI features

## Support

For issues or questions, create an issue at:
https://github.com/arworks/product-showcase-app/issues

## License

MIT License - See LICENSE file for details

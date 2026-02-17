# Product Showcase Touchscreen Application

Interactive touchscreen application for product presentations with AI chat assistant.

## Features

- 3D Carousel product viewer
- Hierarchical category navigation
- AI chat assistant (OpenAI/Gemini)
- Multi-language support (German, English, Hungarian)
- Session management with idle detection
- Customizable branding
- Kiosk mode for exhibitions

## Requirements

- Windows 10/11
- Node.js 18+
- 42-55" touchscreen display (Full HD 1920×1080)

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create content structure in `app/` folder:
```
app/
├── Sources/          # Product content
├── Branding/         # Logo, colors, fonts
├── CompanyInfo/      # Company information
└── api-keys.txt      # API keys
```

3. Configure API keys in `app/api-keys.txt`:
```
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

This creates a Windows installer in the `release/` folder.

## Content Structure

### Products

Place products in hierarchical folders:

```
app/Sources/
├── Category-1/
│   ├── Subcategory-1/
│   │   ├── Product-1/
│   │   │   ├── img1.jpg
│   │   │   ├── video.mp4
│   │   │   ├── captions.txt
│   │   │   └── product.docx
```

### Captions Format

`captions.txt` format:
```
filename.jpg|Caption Title|Description text
video.mp4|Video Title|Video description
```

### Branding

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
    "primaryHover": "#0052CC"
  }
}
```

## Configuration

- Idle timeout: 30 seconds
- Session timeout: 60 seconds
- Touch target size: 100×100px minimum

## License

MIT

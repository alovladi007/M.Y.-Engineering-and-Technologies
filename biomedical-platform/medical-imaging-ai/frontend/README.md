# Medical Imaging AI - Frontend

Professional DICOM viewer with AI-powered analysis and Grad-CAM explainability. Built with Next.js 14, React, and CornerstoneJS.

## 🚀 Features

### Core Capabilities

1. **CornerstoneJS DICOM Viewer**
   - Full viewport manipulation (zoom, pan, rotate, flip)
   - Window/level adjustment for optimal contrast
   - Grayscale inversion
   - Image overlay information
   - Grad-CAM heatmap visualization
   - Multiple viewing tools

2. **AI Analysis Integration**
   - One-click ML inference trigger
   - Multiple model selection (ResNet50, EfficientNet, DenseNet)
   - Grad-CAM method selection (4 variants)
   - Real-time analysis progress
   - Comprehensive results display

3. **Radiology Worklist**
   - Study list with filtering and search
   - Priority-based organization (STAT, Urgent, Routine)
   - Status tracking (Pending, Processing, Completed)
   - Patient and study information
   - Quick access to viewer

4. **Study Management**
   - Study detail view
   - Image grid display
   - Series organization
   - Metadata display

5. **DICOM Upload**
   - Drag-and-drop interface
   - Multi-file upload support
   - Upload progress tracking
   - Automatic validation
   - Queue management

6. **Results Visualization**
   - Prediction display with confidence
   - Triage priority indication
   - Clinical findings summary
   - Treatment recommendations
   - Attention region mapping
   - Grad-CAM overlay toggle

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── layout.tsx              # Root layout
│   │   ├── page.tsx                # Homepage
│   │   ├── providers.tsx           # React Query provider
│   │   ├── upload/
│   │   │   └── page.tsx            # DICOM upload interface
│   │   ├── worklist/
│   │   │   └── page.tsx            # Radiology worklist
│   │   ├── viewer/
│   │   │   └── [id]/
│   │   │       └── page.tsx        # DICOM viewer with inference
│   │   └── study/
│   │       └── [uid]/
│   │           └── page.tsx        # Study detail view
│   ├── components/
│   │   └── DicomViewer.tsx         # Cornerstone DICOM viewer
│   └── lib/
│       ├── api.ts                  # API client (axios)
│       └── cornerstone.ts          # Cornerstone utilities
├── package.json
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

## 🛠 Technology Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **DICOM**: CornerstoneJS, cornerstone-wado-image-loader
- **Styling**: Tailwind CSS
- **Data Fetching**: React Query (@tanstack/react-query)
- **HTTP Client**: Axios
- **UI Components**: Lucide React (icons)
- **File Upload**: react-dropzone
- **Notifications**: react-hot-toast

## 📦 Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your API URL
```

## 🚀 Development

```bash
# Start development server
npm run dev

# Access at http://localhost:3002
```

## 🏗 Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

## 🔧 Configuration

### Environment Variables

See [.env.example](./.env.example) for all configuration options.

```bash
# API URL (backend)
NEXT_PUBLIC_API_URL=http://localhost:5002

# Feature flags
NEXT_PUBLIC_ENABLE_GRADCAM=true
NEXT_PUBLIC_ENABLE_ORTHANC=true
```

### Cornerstone Configuration

The CornerstoneJS viewer is automatically initialized with:
- Web Workers for parallel processing
- WADO image loader for DICOM files
- Configurable max workers (default: 4)

## 📖 Usage Guide

### Uploading DICOM Images

1. Navigate to Upload page
2. Drag and drop .dcm files or click to browse
3. Files are automatically validated and uploaded
4. Click "Analyze" on any uploaded image

### Viewing and Analyzing

1. Access Worklist to see all studies
2. Click "View" on any study to see images
3. Click on an image to open the viewer
4. Select AI model and Grad-CAM method
5. Click "Run Analysis" to trigger inference
6. View results in the right panel
7. Toggle Grad-CAM overlay to see heatmap

### Viewer Controls

**Toolbar:**
- Zoom In/Out
- Rotate (90° increments)
- Flip Horizontal/Vertical
- Invert Grayscale
- Reset Viewport

**Window/Level:**
- Use W+/W- buttons for window width
- Use L+/L- buttons for level adjustment
- Or left-click + drag on image

**Grad-CAM:**
- Toggle overlay on/off
- View attention regions
- See activation scores

## 🎨 Pages Overview

### Homepage (`/`)
- Feature showcase
- Platform statistics
- Supported models list
- Quick navigation

### Upload (`/upload`)
- Drag-and-drop zone
- Upload queue with progress
- Multi-file support
- Success/error handling

### Worklist (`/worklist`)
- Study list table
- Search and filters
- Status indicators
- Priority badges
- Quick statistics

### Study View (`/study/[uid]`)
- Study metadata
- Patient information
- Image grid
- Series organization

### Viewer (`/viewer/[id]`)
- Full DICOM viewer
- AI analysis controls
- Model selection
- Results display
- Grad-CAM visualization

## 🔌 API Integration

The frontend connects to the Medical Imaging AI backend via REST API:

```typescript
// Upload DICOM
await imagesApi.upload(file)

// Get image
await imagesApi.getById(imageId)

// Run inference
await inferenceApi.analyze(imageId, {
  model_name: 'resnet50_chest_xray',
  generate_gradcam: true,
  gradcam_method: 'gradcam'
})

// Get results
await inferenceApi.getByImage(imageId)

// List models
await inferenceApi.listModels()

// Studies
await studiesApi.list()
await studiesApi.getById(studyUid)
await studiesApi.getImages(studyUid)
```

## 🎯 Key Features Explained

### CornerstoneJS Integration

The DICOM viewer uses CornerstoneJS for medical image rendering:

- **Hardware Acceleration**: WebGL-enabled rendering
- **DICOM Support**: Full DICOM Part 10 support
- **Image Tools**: Pan, zoom, window/level, rotate, flip
- **Viewport Management**: Multi-viewport support ready
- **Measurements**: Ready for measurement tools integration

### Grad-CAM Visualization

Explainable AI visualization with:

- **Heatmap Overlay**: Color-mapped activation visualization
- **Attention Regions**: Bounding boxes on high-activation areas
- **Quality Metrics**: Heatmap quality scores
- **Multiple Methods**: 4 Grad-CAM variants supported
- **Toggle Control**: Easy on/off switching

### Real-time Analysis

- **Progress Tracking**: Loading states during inference
- **Error Handling**: User-friendly error messages
- **Result Updates**: Automatic result refresh
- **Toast Notifications**: Success/error notifications

## 🚢 Deployment

### Docker

```bash
# Build image
docker build -t medical-imaging-frontend:latest .

# Run container
docker run -d \
  -p 3002:3000 \
  -e NEXT_PUBLIC_API_URL=https://api.yourdomain.com \
  medical-imaging-frontend:latest
```

### Vercel

```bash
vercel deploy
```

### Static Export (Optional)

```bash
# Configure next.config.js for static export
npm run build

# Deploy the out/ directory
```

## 🔐 Security

- **Content Security Policy**: Configured headers
- **XSS Protection**: Enabled
- **Frame Options**: DENY
- **CORS**: Configured for API access
- **Input Validation**: Client-side validation

## 🐛 Troubleshooting

### DICOM Images Not Loading

- Check API_URL is correct
- Verify DICOM file is valid
- Check browser console for errors
- Ensure CORS is configured on backend

### Cornerstone Errors

- Clear browser cache
- Check WebGL support in browser
- Verify image format compatibility
- Check Web Worker initialization

### Analysis Not Running

- Verify API backend is running
- Check selected model is available
- Ensure image has been uploaded
- Check network tab for API errors

## 📈 Performance

- **Initial Load**: ~2-3s (cached: ~500ms)
- **Image Load**: ~1-2s depending on size
- **Inference**: ~2-5s (backend dependent)
- **Viewport Render**: 60fps with WebGL

## 🤝 Contributing

This is a proprietary project. For internal development guidelines, see the main platform documentation.

## 📝 License

Proprietary - M.Y. Engineering and Technologies

---

**Built with Next.js 14, CornerstoneJS, and React**

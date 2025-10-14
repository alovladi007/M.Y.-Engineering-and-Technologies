'use client'

import { useEffect, useRef, useState } from 'react'
import {
  initializeCornerstone,
  enableElement,
  disableElement,
  displayImage,
  loadImage,
  resize,
  zoomIn,
  zoomOut,
  reset,
  adjustWindowLevel,
  invert,
  rotate,
  flipHorizontal,
  flipVertical,
} from '@/lib/cornerstone'
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Contrast,
  RefreshCw,
  Download,
  Loader2,
} from 'lucide-react'
import toast from 'react-hot-toast'

interface DicomViewerProps {
  imageId?: string
  imageBlob?: Blob
  imageUrl?: string
  onImageLoad?: (image: any) => void
  showTools?: boolean
  enableGradCam?: boolean
  gradCamOverlay?: string
}

export default function DicomViewer({
  imageId,
  imageBlob,
  imageUrl,
  onImageLoad,
  showTools = true,
  enableGradCam = false,
  gradCamOverlay,
}: DicomViewerProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isInverted, setIsInverted] = useState(false)
  const [rotation, setRotation] = useState(0)
  const [showOverlay, setShowOverlay] = useState(true)
  const [imageMetadata, setImageMetadata] = useState<any>(null)

  useEffect(() => {
    // Initialize cornerstone once
    try {
      initializeCornerstone()
    } catch (err) {
      console.error('Failed to initialize Cornerstone:', err)
    }
  }, [])

  useEffect(() => {
    if (!viewportRef.current) return

    const element = viewportRef.current

    async function setupViewer() {
      try {
        setIsLoading(true)
        setError(null)

        // Enable the element
        enableElement(element)

        let imageToLoad: string | undefined

        // Determine image source
        if (imageId) {
          imageToLoad = imageId
        } else if (imageBlob) {
          // Convert blob to object URL
          const objectUrl = URL.createObjectURL(imageBlob)
          imageToLoad = `wadouri:${objectUrl}`
        } else if (imageUrl) {
          imageToLoad = `wadouri:${imageUrl}`
        }

        if (!imageToLoad) {
          throw new Error('No image source provided')
        }

        // Load and display image
        const image = await loadImage(imageToLoad)
        displayImage(element, image)

        // Extract metadata
        if (image.data) {
          setImageMetadata({
            width: image.width,
            height: image.height,
            rows: image.rows,
            columns: image.columns,
            modality: image.data?.string?.('x00080060'),
            patientName: image.data?.string?.('x00100010'),
            studyDescription: image.data?.string?.('x00081030'),
          })
        }

        if (onImageLoad) {
          onImageLoad(image)
        }

        setIsLoading(false)
      } catch (err: any) {
        console.error('Failed to load DICOM image:', err)
        setError(err.message || 'Failed to load DICOM image')
        setIsLoading(false)
        toast.error('Failed to load DICOM image')
      }
    }

    setupViewer()

    // Handle window resize
    const handleResize = () => {
      if (viewportRef.current) {
        resize(viewportRef.current)
      }
    }

    window.addEventListener('resize', handleResize)

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize)
      if (element) {
        try {
          disableElement(element)
        } catch (err) {
          console.error('Error disabling element:', err)
        }
      }
    }
  }, [imageId, imageBlob, imageUrl, onImageLoad])

  const handleZoomIn = () => {
    if (viewportRef.current) {
      zoomIn(viewportRef.current)
    }
  }

  const handleZoomOut = () => {
    if (viewportRef.current) {
      zoomOut(viewportRef.current)
    }
  }

  const handleReset = () => {
    if (viewportRef.current) {
      reset(viewportRef.current)
      setRotation(0)
      setIsInverted(false)
    }
  }

  const handleInvert = () => {
    if (viewportRef.current) {
      invert(viewportRef.current)
      setIsInverted(!isInverted)
    }
  }

  const handleRotate = () => {
    if (viewportRef.current) {
      rotate(viewportRef.current, 90)
      setRotation((rotation + 90) % 360)
    }
  }

  const handleFlipHorizontal = () => {
    if (viewportRef.current) {
      flipHorizontal(viewportRef.current)
    }
  }

  const handleFlipVertical = () => {
    if (viewportRef.current) {
      flipVertical(viewportRef.current)
    }
  }

  const handleWindowLevel = (deltaWindow: number, deltaLevel: number) => {
    if (viewportRef.current) {
      adjustWindowLevel(viewportRef.current, deltaWindow, deltaLevel)
    }
  }

  const handleDownload = () => {
    // TODO: Implement download functionality
    toast.success('Download functionality coming soon')
  }

  return (
    <div className="flex flex-col w-full h-full bg-black">
      {/* Toolbar */}
      {showTools && (
        <div className="flex items-center justify-between bg-gray-900 p-2 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={handleZoomIn}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleZoomOut}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleRotate}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Rotate"
            >
              <RotateCw className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleFlipHorizontal}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Flip Horizontal"
            >
              <FlipHorizontal className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleFlipVertical}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Flip Vertical"
            >
              <FlipVertical className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleInvert}
              className={`p-2 hover:bg-gray-700 rounded transition ${isInverted ? 'bg-blue-600' : ''}`}
              title="Invert"
            >
              <Contrast className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={handleReset}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Reset"
            >
              <RefreshCw className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            {enableGradCam && (
              <button
                onClick={() => setShowOverlay(!showOverlay)}
                className={`px-3 py-1 rounded text-sm ${
                  showOverlay ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                }`}
              >
                Grad-CAM {showOverlay ? 'ON' : 'OFF'}
              </button>
            )}
            <button
              onClick={handleDownload}
              className="p-2 hover:bg-gray-700 rounded transition"
              title="Download"
            >
              <Download className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* Viewport */}
      <div className="relative flex-1 bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
              <p className="text-white">Loading DICOM image...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 z-20">
            <div className="text-center text-red-500">
              <p className="text-xl mb-2">Error</p>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div ref={viewportRef} className="viewport-element w-full h-full" />

        {/* Overlay Information */}
        {showOverlay && imageMetadata && (
          <div className="viewport-overlay">
            <div className="text-xs space-y-1">
              <div>Modality: {imageMetadata.modality || 'N/A'}</div>
              <div>
                Size: {imageMetadata.width}x{imageMetadata.height}
              </div>
              <div>Rotation: {rotation}°</div>
              {imageMetadata.studyDescription && (
                <div>Study: {imageMetadata.studyDescription}</div>
              )}
            </div>
          </div>
        )}

        {/* Grad-CAM Overlay */}
        {enableGradCam && showOverlay && gradCamOverlay && (
          <div className="absolute inset-0 pointer-events-none">
            <img
              src={gradCamOverlay}
              alt="Grad-CAM Heatmap"
              className="w-full h-full object-contain opacity-60"
              style={{ mixBlendMode: 'screen' }}
            />
          </div>
        )}
      </div>

      {/* Window/Level Controls */}
      <div className="bg-gray-900 p-2 border-t border-gray-700">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <div>
            <span className="mr-2">Window/Level:</span>
            <button
              onClick={() => handleWindowLevel(100, 0)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded mr-1"
            >
              W+
            </button>
            <button
              onClick={() => handleWindowLevel(-100, 0)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded mr-2"
            >
              W-
            </button>
            <button
              onClick={() => handleWindowLevel(0, 10)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded mr-1"
            >
              L+
            </button>
            <button
              onClick={() => handleWindowLevel(0, -10)}
              className="px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded"
            >
              L-
            </button>
          </div>
          <div className="flex-1 text-right">
            <span>Left click + drag to adjust window/level</span>
          </div>
        </div>
      </div>
    </div>
  )
}

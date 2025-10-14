/**
 * Cornerstone DICOM Viewer Initialization and Utilities
 */

import * as cornerstone from 'cornerstone-core'
import * as cornerstoneWADOImageLoader from 'cornerstone-wado-image-loader'
import * as cornerstoneWebImageLoader from 'cornerstone-web-image-loader'
import * as dicomParser from 'dicomparser'

let isInitialized = false

export function initializeCornerstone() {
  if (isInitialized) return

  // Configure WADO Image Loader
  cornerstoneWADOImageLoader.external.cornerstone = cornerstone
  cornerstoneWADOImageLoader.external.dicomParser = dicomParser

  // Configure Web Image Loader
  cornerstoneWebImageLoader.external.cornerstone = cornerstone

  // Configure Web Worker for WADO loader
  const config = {
    maxWebWorkers: navigator.hardwareConcurrency || 4,
    startWebWorkersOnDemand: true,
    taskConfiguration: {
      decodeTask: {
        initializeCodecsOnStartup: false,
        usePDFJS: false,
        strict: false,
      },
    },
  }

  cornerstoneWADOImageLoader.webWorkerManager.initialize(config)

  isInitialized = true
}

export async function loadImage(imageId: string) {
  return cornerstone.loadImage(imageId)
}

export function displayImage(element: HTMLElement, image: any) {
  cornerstone.displayImage(element, image)
}

export function enableElement(element: HTMLElement) {
  cornerstone.enable(element)
}

export function disableElement(element: HTMLElement) {
  cornerstone.disable(element)
}

export function resize(element: HTMLElement) {
  cornerstone.resize(element)
}

export function reset(element: HTMLElement) {
  cornerstone.reset(element)
}

export function getViewport(element: HTMLElement) {
  return cornerstone.getViewport(element)
}

export function setViewport(element: HTMLElement, viewport: any) {
  cornerstone.setViewport(element, viewport)
}

export function getEnabledElement(element: HTMLElement) {
  return cornerstone.getEnabledElement(element)
}

// Viewport manipulation utilities
export function zoomIn(element: HTMLElement, factor: number = 0.15) {
  const viewport = getViewport(element)
  viewport.scale += factor
  setViewport(element, viewport)
}

export function zoomOut(element: HTMLElement, factor: number = 0.15) {
  const viewport = getViewport(element)
  viewport.scale -= factor
  setViewport(element, viewport)
}

export function pan(element: HTMLElement, deltaX: number, deltaY: number) {
  const viewport = getViewport(element)
  viewport.translation.x += deltaX
  viewport.translation.y += deltaY
  setViewport(element, viewport)
}

export function adjustWindowLevel(element: HTMLElement, deltaWindow: number, deltaLevel: number) {
  const viewport = getViewport(element)
  viewport.voi.windowWidth += deltaWindow
  viewport.voi.windowCenter += deltaLevel
  setViewport(element, viewport)
}

export function invert(element: HTMLElement) {
  const viewport = getViewport(element)
  viewport.invert = !viewport.invert
  setViewport(element, viewport)
}

export function rotate(element: HTMLElement, degrees: number) {
  const viewport = getViewport(element)
  viewport.rotation = (viewport.rotation + degrees) % 360
  setViewport(element, viewport)
}

export function flipHorizontal(element: HTMLElement) {
  const viewport = getViewport(element)
  viewport.hflip = !viewport.hflip
  setViewport(element, viewport)
}

export function flipVertical(element: HTMLElement) {
  const viewport = getViewport(element)
  viewport.vflip = !viewport.vflip
  setViewport(element, viewport)
}

// Measurement utilities
export function getPixelData(element: HTMLElement) {
  const enabledElement = getEnabledElement(element)
  return enabledElement.image.getPixelData()
}

export function getImageId(element: HTMLElement) {
  const enabledElement = getEnabledElement(element)
  return enabledElement.image.imageId
}

export function getImageMetadata(imageId: string) {
  return cornerstone.metaData.get('imagePlaneModule', imageId)
}

// Export cornerstone instance for advanced usage
export { cornerstone }

export default {
  initializeCornerstone,
  loadImage,
  displayImage,
  enableElement,
  disableElement,
  resize,
  reset,
  getViewport,
  setViewport,
  zoomIn,
  zoomOut,
  pan,
  adjustWindowLevel,
  invert,
  rotate,
  flipHorizontal,
  flipVertical,
}

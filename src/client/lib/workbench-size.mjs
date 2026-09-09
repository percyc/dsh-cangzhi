/**
 * Pure helpers for the Cangzhi knowledge workbench width/preset logic.
 * Kept dependency-free so the unit tests in tests/ can import this file
 * directly via Node without bundling the React component tree.
 */

export const WORKBENCH_SIZE_MIN = 360
export const WORKBENCH_SIZE_MAX = 760
export const WORKBENCH_FULLSCREEN_MAX = 1100

export const WORKBENCH_SIZE_TABLE = Object.freeze({
  narrow: 420,
  standard: 520,
  wide: 720,
})

export const WORKBENCH_SIZES = Object.freeze(['narrow', 'standard', 'wide'])

export const WORKBENCH_SIZE_LABELS_ZH = Object.freeze({
  narrow: '窄',
  standard: '标准',
  wide: '宽',
})

export const WORKBENCH_SIZE_GLYPHS = Object.freeze({
  narrow: '▮',
  standard: '▮▮',
  wide: '▮▮▮',
})

const SIZE_KEYS = new Set(WORKBENCH_SIZES)

export function isWorkbenchSize(value) {
  return typeof value === 'string' && SIZE_KEYS.has(value)
}

export function clampWorkbenchWidth(value) {
  if (!Number.isFinite(value)) return WORKBENCH_SIZE_TABLE.standard
  return Math.min(WORKBENCH_SIZE_MAX, Math.max(WORKBENCH_SIZE_MIN, Math.round(value)))
}

export function resizeWorkbenchWithKey(width, key) {
  if (key === 'Home') return WORKBENCH_SIZE_MIN
  if (key === 'End') return WORKBENCH_SIZE_MAX
  if (key === 'ArrowLeft') return clampWorkbenchWidth(width + 20)
  if (key === 'ArrowRight') return clampWorkbenchWidth(width - 20)
  return null
}

export function detectWorkbenchSize(width) {
  const clamped = clampWorkbenchWidth(width)
  if (clamped <= (WORKBENCH_SIZE_TABLE.narrow + WORKBENCH_SIZE_TABLE.standard) / 2) return 'narrow'
  if (clamped <= (WORKBENCH_SIZE_TABLE.standard + WORKBENCH_SIZE_TABLE.wide) / 2) return 'standard'
  return 'wide'
}

function makeStorageLike(getItem) {
  return {
    getItem: (key) => {
      try { return getItem(key) } catch { return null }
    },
  }
}

export function readWorkbenchWidthFromStorage(storage) {
  const reader = makeStorageLike(storage.getItem.bind(storage))
  const saved = Number(reader.getItem('cangzhi-workbench-width'))
  if (!Number.isFinite(saved) || saved < WORKBENCH_SIZE_MIN || saved > WORKBENCH_SIZE_MAX) {
    return WORKBENCH_SIZE_TABLE.standard
  }
  return clampWorkbenchWidth(saved)
}

export function readWorkbenchSizeFromStorage(storage) {
  const reader = makeStorageLike(storage.getItem.bind(storage))
  const saved = reader.getItem('cangzhi-workbench-size')
  return isWorkbenchSize(saved) ? saved : 'standard'
}

export function readWorkbenchFullscreenFromStorage(storage) {
  const reader = makeStorageLike(storage.getItem.bind(storage))
  return reader.getItem('cangzhi-workbench-fullscreen') === 'true'
}

function readRawWorkbenchSize(storage) {
  const reader = makeStorageLike(storage.getItem.bind(storage))
  const raw = reader.getItem('cangzhi-workbench-size')
  return typeof raw === 'string' ? raw : null
}

export function readWorkbenchInitialState(storage) {
  const rawSize = readRawWorkbenchSize(storage)
  if (isWorkbenchSize(rawSize)) {
    return {
      size: rawSize,
      width: WORKBENCH_SIZE_TABLE[rawSize],
      fullscreen: readWorkbenchFullscreenFromStorage(storage),
    }
  }
  const width = readWorkbenchWidthFromStorage(storage)
  return {
    size: detectWorkbenchSize(width),
    width,
    fullscreen: readWorkbenchFullscreenFromStorage(storage),
  }
}

export function sizeLabel(option) {
  return WORKBENCH_SIZE_LABELS_ZH[option] ?? ''
}

export function sizeGlyph(option) {
  return WORKBENCH_SIZE_GLYPHS[option] ?? ''
}

export class ImageInputError extends Error {
  code: 'type' | 'size' | 'decode'

  constructor(code: 'type' | 'size' | 'decode', message: string) {
    super(message)
    this.name = 'ImageInputError'
    this.code = code
  }
}

const ACCEPTED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new ImageInputError('decode', 'This image could not be opened.'))
    }
    image.src = url
  })
}

function approxDataUrlBytes(dataUrl: string): number {
  const payload = dataUrl.slice(dataUrl.indexOf(',') + 1)
  return Math.ceil((payload.length * 3) / 4)
}

export async function prepareImage(
  file: File,
  options: {
    maxDimension: number
    square: boolean
    maxBytes: number
    quality?: number
  },
): Promise<string> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new ImageInputError('type', 'Use a JPG, PNG or WebP photo.')
  }
  if (file.size > 20 * 1024 * 1024) {
    throw new ImageInputError('size', 'That photo is too large. Use one under 20 MB.')
  }

  const image = await loadImage(file)
  const side = options.square
    ? Math.min(image.naturalWidth, image.naturalHeight)
    : Math.max(image.naturalWidth, image.naturalHeight)
  const scale = Math.min(1, options.maxDimension / side)
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext('2d')
  if (!context) {
    throw new ImageInputError('decode', 'This browser cannot prepare the photo.')
  }

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, width, height)

  if (options.square) {
    const cropSize = Math.min(image.naturalWidth, image.naturalHeight)
    const sx = (image.naturalWidth - cropSize) / 2
    const sy = (image.naturalHeight - cropSize) / 2
    context.drawImage(image, sx, sy, cropSize, cropSize, 0, 0, width, height)
  } else {
    context.drawImage(image, 0, 0, width, height)
  }

  let quality = options.quality ?? 0.84
  let dataUrl = canvas.toDataURL('image/jpeg', quality)
  while (approxDataUrlBytes(dataUrl) > options.maxBytes && quality > 0.45) {
    quality -= 0.08
    dataUrl = canvas.toDataURL('image/jpeg', quality)
  }
  if (approxDataUrlBytes(dataUrl) > options.maxBytes) {
    throw new ImageInputError('size', 'The photo is still too large after compression.')
  }
  return dataUrl
}

export function prepareProfilePhoto(file: File): Promise<string> {
  return prepareImage(file, {
    maxDimension: 512,
    square: true,
    maxBytes: 1_800_000,
    quality: 0.86,
  })
}

export function prepareCropPhoto(file: File): Promise<string> {
  return prepareImage(file, {
    maxDimension: 1440,
    square: false,
    maxBytes: 3_800_000,
    quality: 0.84,
  })
}

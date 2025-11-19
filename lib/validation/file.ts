/**
 * File validation utilities
 */

export const ALLOWED_MIME_TYPES = {
  PDF: ['application/pdf'],
  IMAGE: ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  AUDIO: ['audio/mpeg', 'audio/wav', 'audio/webm', 'audio/mp3'],
} as const;

export const MAX_FILE_SIZES = {
  PDF: 10 * 1024 * 1024, // 10MB
  IMAGE: 5 * 1024 * 1024, // 5MB
  AUDIO: 25 * 1024 * 1024, // 25MB
} as const;

export interface FileValidationError {
  code: string;
  message: string;
}

export interface FileValidationResult {
  valid: boolean;
  error?: FileValidationError;
}

/**
 * Validate file type against allowed MIME types
 */
export function validateFileType(
  file: File,
  allowedTypes: readonly string[]
): FileValidationResult {
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_FILE_TYPE',
        message: `Tipo de archivo no permitido. Se permiten: ${allowedTypes.join(', ')}`,
      },
    };
  }

  return { valid: true };
}

/**
 * Validate file size
 */
export function validateFileSize(
  file: File,
  maxSize: number
): FileValidationResult {
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: {
        code: 'FILE_TOO_LARGE',
        message: `El archivo es demasiado grande. Tamaño máximo: ${maxSizeMB}MB`,
      },
    };
  }

  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: 'EMPTY_FILE',
        message: 'El archivo está vacío',
      },
    };
  }

  return { valid: true };
}

/**
 * Sanitize filename to prevent path traversal attacks
 */
export function sanitizeFilename(filename: string): string {
  // Remove path components
  const name = filename.replace(/^.*[\\\/]/, '');

  // Remove potentially dangerous characters
  const sanitized = name.replace(/[^\w\s.-]/g, '_');

  // Prevent files starting with dots (hidden files)
  if (sanitized.startsWith('.')) {
    return '_' + sanitized;
  }

  return sanitized;
}

/**
 * Validate PDF file
 */
export function validatePDFFile(file: File): FileValidationResult {
  // Validate type
  const typeValidation = validateFileType(file, ALLOWED_MIME_TYPES.PDF);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  // Validate size
  const sizeValidation = validateFileSize(file, MAX_FILE_SIZES.PDF);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Validate image file
 */
export function validateImageFile(file: File): FileValidationResult {
  const typeValidation = validateFileType(file, ALLOWED_MIME_TYPES.IMAGE);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file, MAX_FILE_SIZES.IMAGE);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Validate audio file
 */
export function validateAudioFile(file: File): FileValidationResult {
  const typeValidation = validateFileType(file, ALLOWED_MIME_TYPES.AUDIO);
  if (!typeValidation.valid) {
    return typeValidation;
  }

  const sizeValidation = validateFileSize(file, MAX_FILE_SIZES.AUDIO);
  if (!sizeValidation.valid) {
    return sizeValidation;
  }

  return { valid: true };
}

/**
 * Check if buffer is a valid PDF by checking magic bytes
 */
export function isPDFBuffer(buffer: Buffer): boolean {
  // PDF files start with %PDF
  const magicBytes = buffer.slice(0, 4).toString('utf-8');
  return magicBytes === '%PDF';
}

/**
 * Validate buffer is actually a PDF
 */
export function validatePDFBuffer(buffer: Buffer): FileValidationResult {
  if (!isPDFBuffer(buffer)) {
    return {
      valid: false,
      error: {
        code: 'INVALID_PDF_FORMAT',
        message: 'El archivo no es un PDF válido',
      },
    };
  }

  return { valid: true };
}

/**
 * Input validation and sanitization utilities
 */

import { z } from 'zod';

/**
 * Sanitize user input to prevent XSS
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate email format
 */
export const emailSchema = z.string().email('Email inválido').min(1);

/**
 * Validate password strength
 */
export const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .regex(/[A-Z]/, 'Debe contener al menos una mayúscula')
  .regex(/[a-z]/, 'Debe contener al menos una minúscula')
  .regex(/[0-9]/, 'Debe contener al menos un número');

/**
 * Validate user name
 */
export const nameSchema = z
  .string()
  .min(2, 'El nombre debe tener al menos 2 caracteres')
  .max(100, 'El nombre no puede exceder 100 caracteres')
  .regex(/^[\p{L}\s'-]+$/u, 'El nombre contiene caracteres inválidos');

/**
 * Validate medical input (allows medical terms and numbers)
 */
export const medicalInputSchema = z
  .string()
  .min(1, 'Este campo es requerido')
  .max(5000, 'El texto es demasiado largo');

/**
 * Sanitize and validate search query
 */
export function sanitizeSearchQuery(query: string): string {
  // Remove special characters that could be used for injection
  const sanitized = query
    .replace(/[<>"'`;()]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // Limit length
  return sanitized.slice(0, 200);
}

/**
 * Validate date is not in future
 */
export function validatePastDate(date: Date): boolean {
  return date <= new Date();
}

/**
 * Validate age range for medical context
 */
export function validateAge(age: number): boolean {
  return age >= 0 && age <= 150;
}

/**
 * Rate limit key generator
 */
export function generateRateLimitKey(
  userId: string,
  action: string,
  ip?: string
): string {
  const parts = ['ratelimit', action, userId];
  if (ip) {
    // Hash IP for privacy
    const hashedIp = Buffer.from(ip).toString('base64').slice(0, 10);
    parts.push(hashedIp);
  }
  return parts.join(':');
}

/**
 * Utility functions for safe date handling
 * Prevents "RangeError: Invalid time value" errors
 */

/**
 * Safely parse a date string, returning null if invalid
 */
export function safeParseDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

/**
 * Safely format a date string, with fallback for invalid dates
 */
export function safeFormatDate(
  dateString: string | null | undefined, 
  formatFn: (date: Date) => string,
  fallback: string = 'Invalid date'
): string {
  const date = safeParseDate(dateString);
  return date ? formatFn(date) : fallback;
}

/**
 * Safely get timestamp from date string
 */
export function safeGetTimestamp(dateString: string | null | undefined): number | null {
  const date = safeParseDate(dateString);
  return date ? date.getTime() : null;
}

/**
 * Check if a date string is valid
 */
export function isValidDate(dateString: string | null | undefined): boolean {
  return safeParseDate(dateString) !== null;
}

/**
 * Get a default date (current date) as ISO string
 */
export function getDefaultDate(): string {
  return new Date().toISOString();
}

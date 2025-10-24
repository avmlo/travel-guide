/**
 * Utility functions for string manipulation
 */

/**
 * Capitalizes city names by converting kebab-case to Title Case
 * @param city - The city name in kebab-case (e.g., "new-york")
 * @returns Capitalized city name (e.g., "New York")
 */
export function capitalizeCity(city: string): string {
  return city
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Capitalizes the first letter of each word in a string
 * @param str - The string to capitalize
 * @returns String with first letter of each word capitalized
 */
export function capitalizeWords(str: string): string {
  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Converts a string to kebab-case
 * @param str - The string to convert
 * @returns Kebab-case string
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
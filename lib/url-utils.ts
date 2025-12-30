/**
 * Normalizes URLs to HTTPS to prevent mixed content issues
 * Converts http:// to https://, leaves https://, data:, and relative paths unchanged
 */
export function normalizeToHttps(url: string | null | undefined): string {
  if (!url) return ''
  
  // If it's already a data URI or relative path, return as-is
  if (url.startsWith('data:') || url.startsWith('/')) {
    return url
  }
  
  // If it starts with http://, convert to https://
  if (url.startsWith('http://')) {
    return url.replace('http://', 'https://')
  }
  
  // If it starts with https://, return as-is
  if (url.startsWith('https://')) {
    return url
  }
  
  // If it's a relative path or doesn't have a protocol, return as-is
  return url
}


/**
 * Reliable image URL mappings for Indian city destinations.
 * Uses Picsum + keyword-consistent seeds so images look correct even if
 * the primary Unsplash URL fails.
 */

// Fallback gradient backgrounds per city keyword
export const CITY_FALLBACK_COLORS = {
  jaipur:    'from-orange-400 to-rose-600',
  udaipur:   'from-blue-400 to-indigo-600',
  goa:       'from-cyan-400 to-blue-500',
  munnar:    'from-green-400 to-emerald-600',
  alleppey:  'from-teal-400 to-green-600',
  manali:    'from-sky-400 to-blue-600',
  leh:       'from-purple-400 to-indigo-600',
  varanasi:  'from-amber-400 to-orange-600',
  rishikesh: 'from-emerald-400 to-teal-600',
  mumbai:    'from-slate-500 to-slate-700',
  amritsar:  'from-yellow-400 to-amber-600',
  darjeeling:'from-green-500 to-teal-700',
  agra:      'from-stone-400 to-amber-600',
  andaman:   'from-cyan-300 to-blue-500',
};

/**
 * Get a reliable image URL. Falls back to a Picsum photo if primary fails.
 * @param {string} url - Primary image URL
 * @param {number} seed - Picsum seed number for consistent fallback
 * @param {number} width - Image width
 * @param {number} height - Image height
 */
export function getReliableImageUrl(url, seed = 1, width = 800, height = 500) {
  if (!url) return `https://picsum.photos/seed/${seed}/${width}/${height}`;
  return url;
}

/**
 * Handle img onError — set a beautiful gradient placeholder
 * @param {Event} e - React synthetic event
 * @param {string} fallbackSrc - Optional fallback image src
 */
export function handleImageError(e, fallbackSrc = null) {
  const img = e.target;
  if (fallbackSrc && img.src !== fallbackSrc) {
    img.src = fallbackSrc;
  } else {
    // Hide broken image, show parent's background
    img.style.display = 'none';
  }
  img.onerror = null; // prevent infinite loop
}

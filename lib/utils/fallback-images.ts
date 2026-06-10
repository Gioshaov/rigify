/**
 * Get fallback Unsplash image URL based on business category
 */
export function getBusinessFallbackImage(
  imageUrl: string | null,
  categories?: Array<{ category_id: string }>
): string {
  // If image exists, return it
  if (imageUrl) return imageUrl;

  // Get primary category
  const primaryCategory = categories?.[0]?.category_id;

  // Category-based Picsum Photos fallbacks
  const fallbacks: Record<string, string> = {
    hair: 'https://picsum.photos/seed/hair/400/300',
    nails: 'https://picsum.photos/seed/nails/400/300',
    skin: 'https://picsum.photos/seed/skin/400/300',
    massage: 'https://picsum.photos/seed/massage/400/300',
    brows: 'https://picsum.photos/seed/brows/400/300',
    makeup: 'https://picsum.photos/seed/makeup/400/300',
    barber: 'https://picsum.photos/seed/barber/400/300',
  };

  // Return category-specific fallback or default
  return fallbacks[primaryCategory || ''] || 'https://picsum.photos/seed/beauty/400/300';
}

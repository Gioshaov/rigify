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

  // Category-based Unsplash fallbacks
  const fallbacks: Record<string, string> = {
    hair: 'https://source.unsplash.com/400x300/?hair,salon',
    nails: 'https://source.unsplash.com/400x300/?nails,manicure',
    skin: 'https://source.unsplash.com/400x300/?skincare,facial',
    massage: 'https://source.unsplash.com/400x300/?massage,spa',
    brows: 'https://source.unsplash.com/400x300/?eyebrows,beauty',
    makeup: 'https://source.unsplash.com/400x300/?makeup,cosmetics',
    barber: 'https://source.unsplash.com/400x300/?barbershop,barber',
  };

  // Return category-specific fallback or default
  return fallbacks[primaryCategory || ''] || 'https://source.unsplash.com/400x300/?beauty,wellness';
}

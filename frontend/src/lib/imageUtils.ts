/**
 * Get the full image URL, handling both old local paths and new Cloudinary URLs
 * @param imageUrl - The image URL from the database (could be relative path or full URL)
 * @returns Full image URL ready to use
 */
export function getFullImageUrl(
  imageUrl: string | undefined | null
): string | null {
  if (!imageUrl) {
    return null;
  }

  // If it's already a full URL (starts with http:// or https://), use it as-is
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }

  // Otherwise, it's a relative path - prepend the API URL
  return `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`;
}

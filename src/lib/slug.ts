import { prisma } from "./prisma";

/**
 * Generate unique slug from name
 * @param name - The name to generate slug from
 * @param type - The type of entity (product, store, category)
 * @param excludeId - Optional ID to exclude from uniqueness check (for updates)
 * @returns Unique slug string
 */
export async function generateUniqueSlug(
  name: string,
  type: 'product' | 'store' | 'category',
  excludeId?: string
): Promise<string> {
  // Generate base slug
  let baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim(); // Remove leading/trailing spaces/hyphens

  // Remove trailing hyphens
  baseSlug = baseSlug.replace(/-+$/, '');

  if (!baseSlug) {
    // Fallback if slug is empty after cleaning
    baseSlug = 'unnamed';
  }

  // Check if slug exists
  const existingEntity = await findEntityBySlug(baseSlug, type, excludeId);

  if (!existingEntity) {
    return baseSlug;
  }

  // If slug exists, append number until unique
  let counter = 1;
  let uniqueSlug = `${baseSlug}-${counter}`;

  while (await findEntityBySlug(uniqueSlug, type, excludeId)) {
    counter++;
    uniqueSlug = `${baseSlug}-${counter}`;
  }

  return uniqueSlug;
}

/**
 * Find entity by slug
 * @param slug - The slug to search for
 * @param type - The type of entity
 * @param excludeId - Optional ID to exclude from search (for updates)
 * @returns Entity if found, null otherwise
 */
async function findEntityBySlug(
  slug: string,
  type: 'product' | 'store' | 'category',
  excludeId?: string
): Promise<any> {
  switch (type) {
    case 'product':
      return await prisma.product.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
        select: { id: true, slug: true },
      });

    case 'store':
      return await prisma.store.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
        select: { id: true, slug: true },
      });

    case 'category':
      return await prisma.category.findFirst({
        where: {
          slug,
          ...(excludeId && { id: { not: excludeId } }),
        },
        select: { id: true, slug: true },
      });

    default:
      return null;
  }
}

/**
 * Generate slug synchronously (for UI updates, not for final save)
 * @param name - The name to generate slug from
 * @returns Basic slug string (not guaranteed to be unique)
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces/hyphens
    .replace(/-+$/, ''); // Remove trailing hyphens
}
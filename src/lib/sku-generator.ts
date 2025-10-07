export function generateSKU(productName: string, variantOptions: string[]): string {
  // Clean and normalize product name
  const productCode = productName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 6);

  // Clean and normalize variant options
  const optionCodes = variantOptions
    .map(option => option.toUpperCase().replace(/[^A-Z0-9]/g, ''))
    .filter(code => code.length > 0)
    .map(code => code.substring(0, 3));

  // Generate random 4 digit suffix
  const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

  // Combine all parts
  const skuParts = [productCode, ...optionCodes, randomSuffix];

  return skuParts.join('-');
}

export function generateVariantSKU(productName: string, options: Record<string, string>): string {
  // Extract option values and sort them consistently
  const optionValues = Object.values(options).filter(value => value && value.trim() !== '');

  return generateSKU(productName, optionValues);
}

// Example usage:
// generateVariantSKU("Classic T-Shirt", { color: "Blue", size: "XL" })
// Returns: "CLASSIBLU-XL-1234"

// generateVariantSKU("Denim Jeans", { size: "32" })
// Returns: "DENIM3-1234"
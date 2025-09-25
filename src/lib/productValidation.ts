import { Product } from '@/types';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateProductForAPI(product: Product): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Required fields validation
  if (!product.name || product.name.trim().length === 0) {
    errors.push('Product name is required');
  }

  if (!product.description || product.description.trim().length === 0) {
    errors.push('Product description is required');
  }

  if (!product.category || product.category.trim().length === 0) {
    errors.push('Product category is required');
  }

  // Price validation
  const price = Number(product.price);
  if (isNaN(price) || price < 0) {
    errors.push('Price must be a positive number');
  }

  // Stock validation
  const stock = Number(product.stockCount);
  if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
    errors.push('Stock must be a non-negative integer');
  }

  // Original price validation (if provided)
  if (product.originalPrice !== undefined && product.originalPrice !== null) {
    const originalPrice = Number(product.originalPrice);
    if (isNaN(originalPrice) || originalPrice < 0) {
      warnings.push('Original price should be a positive number or left empty');
    }
  }

  // Rating validation (if provided)
  if (product.rating !== undefined && product.rating !== null) {
    const rating = Number(product.rating);
    if (isNaN(rating) || rating < 0 || rating > 5) {
      warnings.push('Rating should be between 0 and 5');
    }
  }

  // Review count validation (if provided)
  if (product.reviewCount !== undefined && product.reviewCount !== null) {
    const reviewCount = Number(product.reviewCount);
    if (isNaN(reviewCount) || reviewCount < 0 || !Number.isInteger(reviewCount)) {
      warnings.push('Review count should be a non-negative integer');
    }
  }

  // Brand validation
  if (!product.brand || product.brand.trim().length === 0) {
    warnings.push('Brand is recommended for better SKU generation');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function logValidationResults(product: Product, result: ValidationResult): void {
  if (!result.isValid) {
    console.error('❌ Product validation failed:', {
      productName: product.name,
      errors: result.errors,
      warnings: result.warnings
    });
  } else if (result.warnings.length > 0) {
    console.warn('⚠️ Product validation passed with warnings:', {
      productName: product.name,
      warnings: result.warnings
    });
  } else {
    console.log('✅ Product validation passed:', product.name);
  }
}

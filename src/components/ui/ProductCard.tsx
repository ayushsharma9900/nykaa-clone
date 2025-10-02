'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useWishlist } from '@/contexts/WishlistContext';
import { useToast } from '@/contexts/ToastContext';
import { useImageManager } from '@/hooks/useImageManager';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart, isInCart, getItemQuantity } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { showToast } = useToast();
  const { generateResponsiveUrls } = useImageManager();
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  // Generate category-based fallback image using dynamic system
  const getFallbackImage = (category: string): string => {
    const fallbackMap: Record<string, string> = {
      'Makeup': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348',
      'Skincare': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b',
      'Hair Care': 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da',
      'Fragrance': 'https://images.unsplash.com/photo-1541643600914-78b084683601',
      'Personal Care': 'https://images.unsplash.com/photo-1556228720-195a672e8a03',
      "Men's Grooming": 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f',
      'Wellness': 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528'
    };
    const baseUrl = fallbackMap[category] || 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136';
    return `${baseUrl}?w=500&h=500&fit=crop&auto=format&t=${Date.now()}`;
  };
  
  // Get optimized image URLs using dynamic image manager
  const imageUrls = useMemo(() => {
    const primaryImage = product.image;
    if (!primaryImage) {
      return {
        main: getFallbackImage(product.category),
        responsive: {}
      };
    }
    
    return {
      main: primaryImage,
      responsive: generateResponsiveUrls(primaryImage)
    };
  }, [product.image, product.category, generateResponsiveUrls]);
  
  // Get the best available image source
  const getImageSource = (): string => {
    if (!imageError && imageUrls.main) {
      return imageUrls.main;
    }
    // If primary image failed, try the first alternative image
    if (!imageError && product.images && product.images.length > 1) {
      return product.images[1];
    }
    // Fall back to category-specific image
    return getFallbackImage(product.category);
  };
  
  const isWishlisted = isInWishlist(product.id);
  
  const discountedPrice = product.originalPrice 
    ? product.originalPrice - product.price 
    : 0;
  
  const discountPercentage = product.originalPrice 
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
    
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ProductCard - handleWishlistClick called for product:', product.name);
    
    // Validate product object
    if (!product.id) {
      console.error('Product missing ID:', product);
      showToast('Invalid product data', 'error');
      return;
    }
    
    try {
      console.log('Calling toggleWishlist with product:', {
        id: product.id,
        name: product.name
      });
      
      const wasAdded = toggleWishlist(product);
      const action = wasAdded ? 'Added to' : 'Removed from';
      showToast(`${action} wishlist: ${product.name}`);
      console.log('Successfully toggled wishlist via ProductCard:', { wasAdded });
    } catch (error) {
      console.error('Failed to toggle wishlist:', error);
      showToast('Failed to update wishlist. Please try again.', 'error');
    }
  };
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('ProductCard - handleAddToCart called for product:', product.name);
    
    if (!product.inStock) {
      console.log('Product not in stock, aborting add to cart');
      return;
    }
    
    // Validate product object
    if (!product.id) {
      console.error('Product missing ID:', product);
      showToast('Invalid product data', 'error');
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      console.log('Calling addToCart with product:', {
        id: product.id,
        name: product.name,
        price: product.price,
        inStock: product.inStock
      });
      
      // Add to cart using context
      addToCart(product, 1);
      showToast(`Added ${product.name} to cart!`);
      console.log('Successfully added to cart via ProductCard');
    } catch (error) {
      console.error('Failed to add product to cart:', error);
      showToast('Failed to add product to cart. Please try again.', 'error');
    } finally {
      setTimeout(() => {
        setIsAddingToCart(false);
      }, 500);
    }
  };
  
  const itemQuantity = getItemQuantity(product.id);
  const productIsInCart = isInCart(product.id);
  
  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <StarSolidIcon key={i} className="h-4 w-4 text-yellow-400" />
      );
    }
    
    if (hasHalfStar) {
      stars.push(
        <StarIcon key="half" className="h-4 w-4 text-yellow-400" />
      );
    }
    
    const remainingStars = 5 - stars.length;
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <StarIcon key={`empty-${i}`} className="h-4 w-4 text-gray-300" />
      );
    }
    
    return stars;
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Wishlist button */}
      <button 
        onClick={handleWishlistClick}
        className={`absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors ${
          isWishlisted ? 'text-pink-600' : 'text-gray-600'
        }`}
        aria-label={isWishlisted ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
        title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      >
        {isWishlisted ? (
          <HeartSolidIcon className="h-4 w-4" />
        ) : (
          <HeartIcon className="h-4 w-4" />
        )}
      </button>

      {/* Discount badge */}
      {(product.discount || discountPercentage > 0) && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
          {product.discount || discountPercentage}% OFF
        </div>
      )}

      <Link href={`/product/${product.id}`}>
        {/* Product image */}
        <div className="aspect-square relative overflow-hidden rounded-t-lg bg-gray-100">
          <Image
            src={getImageSource()}
            alt={product.name || 'Product image'}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
            onError={(e) => {
              console.log('Image failed to load:', getImageSource(), 'for product:', product.name);
              if (!imageError) {
                setImageError(true);
                // Force re-render with fallback image
                const img = e.target as HTMLImageElement;
                img.src = getFallbackImage(product.category);
              }
            }}
            priority={false}
            placeholder="blur"
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx4f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLidUUKAl0t0lBU1K5YdvTz"
          />
        </div>

        {/* Product info */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Product name */}
          <h3 className="font-medium text-gray-900 text-sm leading-5 mb-2 overflow-hidden" 
              style={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical' as const
              }}>
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1 mb-2">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-xs text-gray-500">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center space-x-2">
            <span className="text-lg font-semibold text-gray-900">
              ₹{product.price}
            </span>
            {product.originalPrice && (
              <>
                <span className="text-sm text-gray-500 line-through">
                  ₹{product.originalPrice}
                </span>
                <span className="text-xs text-green-600 font-medium">
                  Save ₹{discountedPrice}
                </span>
              </>
            )}
          </div>

          {/* Stock status */}
          {!product.inStock && (
            <p className="text-xs text-red-500 mt-1">Out of Stock</p>
          )}
        </div>
      </Link>

      {/* Add to cart button */}
      <div className="p-4 pt-0">
        <button 
          onClick={handleAddToCart}
          className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!product.inStock || isAddingToCart}
          aria-label={`Add ${product.name} to cart`}
        >
          {isAddingToCart 
            ? 'Adding...' 
            : productIsInCart 
              ? `In Cart (${itemQuantity})` 
              : product.inStock 
                ? 'Add to Cart' 
                : 'Out of Stock'
          }
        </button>
      </div>
    </div>
  );
}

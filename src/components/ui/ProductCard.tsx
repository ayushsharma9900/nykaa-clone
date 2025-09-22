import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { HeartIcon, StarIcon } from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const discountedPrice = product.originalPrice 
    ? product.originalPrice - product.price 
    : 0;
  
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
      <button className="absolute top-2 right-2 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-colors">
        <HeartIcon className="h-4 w-4 text-gray-600" />
      </button>

      {/* Discount badge */}
      {product.discount && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded text-xs font-medium">
          {product.discount}% OFF
        </div>
      )}

      <Link href={`/product/${product.id}`}>
        {/* Product image */}
        <div className="aspect-square relative overflow-hidden rounded-t-lg">
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        </div>

        {/* Product info */}
        <div className="p-4">
          {/* Brand */}
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
            {product.brand}
          </p>

          {/* Product name */}
          <h3 className="font-medium text-gray-900 text-sm leading-5 mb-2 line-clamp-2">
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
          className="w-full py-2 px-4 bg-pink-600 text-white rounded-md hover:bg-pink-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
          disabled={!product.inStock}
        >
          {product.inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

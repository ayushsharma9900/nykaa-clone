import { NextRequest, NextResponse } from 'next/server';
import { ensureDatabaseInitialized, runQuery, getAllQuery, generateId, generateSKU } from '@/lib/database';

// Conditionally import scraping dependencies
let axios: unknown;
let cheerio: unknown;

try {
  const axiosModule = await import('axios');
  axios = axiosModule.default;
  const cheerioModule = await import('cheerio');
  cheerio = cheerioModule;
} catch (error) {
  console.warn('Web scraping dependencies not available:', (error as Error).message);
}

interface ImportedProduct {
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  images: string[];
  category: string;
  brand?: string;
  specifications?: { [key: string]: string };
  rating?: number;
  reviewCount?: number;
  availability?: boolean;
  source: 'amazon' | 'flipkart' | 'nykaa';
  sourceUrl: string;
}

// Product scrapers for different platforms
class ProductScraper {
  private static async fetchPage(url: string): Promise<string> {
    if (!axios) {
      throw new Error('Web scraping dependencies not available on this platform');
    }
    
    try {
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Accept-Encoding': 'gzip, deflate',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
        timeout: 15000
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch page: ${error.message}`);
    }
  }

  static async scrapeAmazon(url: string): Promise<ImportedProduct> {
    if (!cheerio) {
      throw new Error('Web scraping dependencies not available on this platform');
    }
    
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);

      const name = $('#productTitle').text().trim() || 
                   $('.product-title').text().trim() ||
                   $('h1').first().text().trim();

      const priceText = $('.a-price-whole').first().text().trim() ||
                       $('.a-offscreen').first().text().trim() ||
                       $('.a-price').first().text().trim();
      
      const price = parseFloat(priceText.replace(/[^\d.]/g, '')) || 0;

      const originalPriceText = $('.a-text-price .a-offscreen').text().trim() ||
                               $('.a-price.a-text-price .a-offscreen').text().trim();
      const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^\d.]/g, '')) : undefined;

      const description = $('#feature-bullets ul').text().trim() ||
                         $('.a-unordered-list.a-vertical.a-spacing-mini').text().trim() ||
                         $('#productDescription').text().trim();

      const images: string[] = [];
      $('#altImages img, .a-dynamic-image, #landingImage').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src && !src.includes('placeholder')) {
          images.push(src.replace(/\._.*\./, '.'));
        }
      });

      const brand = $('.a-row .a-text-bold:contains("Brand")').next().text().trim() ||
                   $('#bylineInfo').text().replace(/^by\s+/, '').trim() ||
                   $('.author').text().trim();

      const ratingText = $('.a-icon-alt').first().text();
      const rating = ratingText ? parseFloat(ratingText.match(/[\d.]+/)?.[0] || '0') : undefined;

      const reviewCountText = $('#acrCustomerReviewText').text() ||
                             $('.a-link-normal .a-size-small').text();
      const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/[^\d]/g, '')) : undefined;

      return {
        name: name || 'Unknown Product',
        price,
        originalPrice,
        description: description || 'No description available',
        images: images.slice(0, 5), // Limit to 5 images
        category: 'Imported',
        brand,
        rating,
        reviewCount,
        availability: $('.a-size-medium.a-color-success').length > 0,
        source: 'amazon',
        sourceUrl: url
      };
    } catch (error) {
      throw new Error(`Failed to scrape Amazon product: ${error.message}`);
    }
  }

  static async scrapeFlipkart(url: string): Promise<ImportedProduct> {
    if (!cheerio) {
      throw new Error('Web scraping dependencies not available on this platform');
    }
    
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);

      const name = $('.B_NuCI').text().trim() ||
                   $('._35KyD6').text().trim() ||
                   $('h1').first().text().trim();

      const priceText = $('._30jeq3._16Jk6d').text().trim() ||
                       $('._3I9_wc._27UcVY').text().trim() ||
                       $('._1_WHN1').text().trim();
      const price = parseFloat(priceText.replace(/[^\d]/g, '')) || 0;

      const originalPriceText = $('._3I9_wc._2p6lqe').text().trim() ||
                               $('._14Ck6e').text().trim();
      const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^\d]/g, '')) : undefined;

      const description = $('._1mXcCf').text().trim() ||
                         $('.A9wKJe').text().trim() ||
                         $('._13dGcG').text().trim();

      const images: string[] = [];
      $('._2r_T1I img, ._3kidJX img, .q6DClP img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src) {
          images.push(src.replace(/\?.*$/, '').replace(/\/128\/128\//, '/832/832/'));
        }
      });

      const brand = $('.G6XhBx').text().trim() ||
                   $('._2Ix9wL').text().trim();

      const ratingText = $('._3LWZlK').text().trim();
      const rating = ratingText ? parseFloat(ratingText) : undefined;

      const reviewCountText = $('._2_R_DZ').text().trim();
      const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/[^\d]/g, '')) : undefined;

      return {
        name: name || 'Unknown Product',
        price,
        originalPrice,
        description: description || 'No description available',
        images: images.slice(0, 5),
        category: 'Imported',
        brand,
        rating,
        reviewCount,
        availability: $('._16FRp0').text().includes('In Stock') || $('._16FRp0').text().includes('Available'),
        source: 'flipkart',
        sourceUrl: url
      };
    } catch (error) {
      throw new Error(`Failed to scrape Flipkart product: ${error.message}`);
    }
  }

  static async scrapeNykaa(url: string): Promise<ImportedProduct> {
    if (!cheerio) {
      throw new Error('Web scraping dependencies not available on this platform');
    }
    
    try {
      const html = await this.fetchPage(url);
      const $ = cheerio.load(html);

      const name = $('.css-1gc4x7i').text().trim() ||
                   $('.product-title').text().trim() ||
                   $('h1').first().text().trim();

      const priceText = $('.css-1jczs19').text().trim() ||
                       $('.css-f4jvey').text().trim() ||
                       $('.price').text().trim();
      const price = parseFloat(priceText.replace(/[^\d]/g, '')) || 0;

      const originalPriceText = $('.css-1a8ccv').text().trim() ||
                               $('.original-price').text().trim();
      const originalPrice = originalPriceText ? parseFloat(originalPriceText.replace(/[^\d]/g, '')) : undefined;

      const description = $('.css-1qg9c20').text().trim() ||
                         $('.product-description').text().trim() ||
                         $('.description').text().trim();

      const images: string[] = [];
      $('.css-1k9q6lz img, .product-images img, .css-1qg9csd img').each((i, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src) {
          images.push(src.replace(/\?.*$/, ''));
        }
      });

      const brand = $('.css-1gc4x7i').text().trim() ||
                   $('.brand-name').text().trim();

      const ratingText = $('.css-1eb83h9').text().trim() ||
                        $('.rating').text().trim();
      const rating = ratingText ? parseFloat(ratingText) : undefined;

      const reviewCountText = $('.css-qtzd94').text().trim() ||
                             $('.review-count').text().trim();
      const reviewCount = reviewCountText ? parseInt(reviewCountText.replace(/[^\d]/g, '')) : undefined;

      return {
        name: name || 'Unknown Product',
        price,
        originalPrice,
        description: description || 'No description available',
        images: images.slice(0, 5),
        category: 'Beauty', // Nykaa is primarily beauty products
        brand,
        rating,
        reviewCount,
        availability: $('.css-xjhrni').text().includes('In Stock') || !$('.out-of-stock').length,
        source: 'nykaa',
        sourceUrl: url
      };
    } catch (error) {
      throw new Error(`Failed to scrape Nykaa product: ${error.message}`);
    }
  }
}

function detectPlatform(url: string): 'amazon' | 'flipkart' | 'nykaa' | null {
  const domain = url.toLowerCase();
  if (domain.includes('amazon.')) return 'amazon';
  if (domain.includes('flipkart.')) return 'flipkart';
  if (domain.includes('nykaa.')) return 'nykaa';
  return null;
}

export async function POST(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    const body = await request.json();
    const { url, category, customPrice, manualEntry } = body;
    
    // If dependencies are not available, require manual entry
    if (!axios || !cheerio) {
      if (!manualEntry) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'Web scraping is not available on this platform. Please use manual entry mode.',
            requiresManualEntry: true
          },
          { status: 400 }
        );
      }
      
      // Handle manual product entry
      const { name, description, price, images } = manualEntry;
      if (!name || !description || !price) {
        return NextResponse.json(
          { success: false, message: 'Manual entry requires name, description, and price' },
          { status: 400 }
        );
      }
      
      // Create product from manual entry
      const productId = generateId('prod');
      const productSKU = generateSKU(name, category || 'Manual');
      
      await runQuery(`
        INSERT INTO products (
          id, name, description, category, price, costPrice, stock, sku, 
          isActive, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        productId, name, description, category || 'Manual', price, price * 0.8, 
        10, productSKU, 1, new Date().toISOString(), new Date().toISOString()
      ]);
      
      // Add images if provided
      if (images && Array.isArray(images)) {
        for (let i = 0; i < images.length; i++) {
          await runQuery(`
            INSERT INTO product_images (productId, url, alt, sortOrder)
            VALUES (?, ?, ?, ?)
          `, [productId, images[i], name, i]);
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Product created manually',
        data: { id: productId, name, price, category: category || 'Manual', source: 'manual', images: images?.length || 0 }
      });
    }

    if (!url) {
      return NextResponse.json(
        { success: false, message: 'URL is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Starting product import from:', url);

    // Detect platform
    const platform = detectPlatform(url);
    if (!platform) {
      return NextResponse.json(
        { success: false, message: 'Unsupported platform. Only Amazon, Flipkart, and Nykaa are supported.' },
        { status: 400 }
      );
    }

    console.log('🏷️ Detected platform:', platform);

    // Scrape product data
    let productData: ImportedProduct;
    switch (platform) {
      case 'amazon':
        productData = await ProductScraper.scrapeAmazon(url);
        break;
      case 'flipkart':
        productData = await ProductScraper.scrapeFlipkart(url);
        break;
      case 'nykaa':
        productData = await ProductScraper.scrapeNykaa(url);
        break;
      default:
        throw new Error('Unsupported platform');
    }

    console.log('📦 Scraped product:', productData.name);

    // Override category if provided
    if (category) {
      productData.category = category;
    }

    // Override price if provided
    if (customPrice && !isNaN(parseFloat(customPrice))) {
      productData.price = parseFloat(customPrice);
    }

    // Generate product ID and SKU
    const productId = generateId('prod');
    const productSKU = generateSKU(productData.name, productData.category);

    // Check if product already exists (by source URL)
    const existingProduct = await getAllQuery(
      'SELECT id FROM products WHERE sourceUrl = ?',
      [url]
    );

    if (existingProduct.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Product already imported from this URL',
          productId: existingProduct[0].id
        },
        { status: 409 }
      );
    }

    // Insert product into database
    await runQuery(`
      INSERT INTO products (
        id, name, description, category, price, costPrice, stock, sku, 
        isActive, brand, rating, reviewCount, sourceUrl, source,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      productId,
      productData.name,
      productData.description,
      productData.category,
      productData.price,
      productData.originalPrice || productData.price * 0.8, // Assume 20% markup if no original price
      10, // Default stock
      productSKU,
      1, // Active
      productData.brand || 'Imported Brand',
      productData.rating || 0,
      productData.reviewCount || 0,
      url,
      platform,
      new Date().toISOString(),
      new Date().toISOString()
    ]);

    // Insert product images
    for (let i = 0; i < productData.images.length; i++) {
      await runQuery(`
        INSERT INTO product_images (productId, url, alt, sortOrder)
        VALUES (?, ?, ?, ?)
      `, [productId, productData.images[i], productData.name, i]);
    }

    console.log('✅ Product imported successfully:', productId);

    return NextResponse.json({
      success: true,
      message: 'Product imported successfully',
      data: {
        id: productId,
        name: productData.name,
        price: productData.price,
        category: productData.category,
        source: platform,
        images: productData.images.length
      }
    });

  } catch (error) {
    console.error('❌ Import error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to import product',
        error: error.message
      },
      { status: 500 }
    );
  }
}

// Import multiple products from a list of URLs
export async function PUT(request: NextRequest) {
  try {
    await ensureDatabaseInitialized();
    
    const body = await request.json();
    const { urls, category, defaultPrice } = body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json(
        { success: false, message: 'URLs array is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Starting bulk import for', urls.length, 'products');

    const results = [];
    for (const url of urls) {
      try {
        // Import each product individually
        const importResult = await POST(new NextRequest('POST', {
          body: JSON.stringify({ url, category, customPrice: defaultPrice })
        }));
        
        const result = await importResult.json();
        results.push({
          url,
          success: result.success,
          data: result.data || null,
          error: result.message || null
        });
      } catch (error) {
        results.push({
          url,
          success: false,
          data: null,
          error: error.message
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;

    console.log(`✅ Bulk import completed: ${successful} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: `Bulk import completed: ${successful} successful, ${failed} failed`,
      results,
      summary: { successful, failed, total: results.length }
    });

  } catch (error) {
    console.error('❌ Bulk import error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to perform bulk import',
        error: error.message
      },
      { status: 500 }
    );
  }
}

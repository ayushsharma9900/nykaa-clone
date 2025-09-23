import Link from 'next/link';
import { 
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center">
              <h3 className="text-2xl font-bold text-pink-400">kaayalife</h3>
            </div>
            <p className="text-gray-300 text-sm">
              Your ultimate destination for beauty and skincare. Discover the latest trends and products from top brands.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <MapPinIcon className="h-4 w-4" />
                <span>Mumbai, Maharashtra, India</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <PhoneIcon className="h-4 w-4" />
                <span>+91 1234567890</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-300">
                <EnvelopeIcon className="h-4 w-4" />
                <span>support@kaayalife.in</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link href="/skincare" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Skincare
                </Link>
              </li>
              <li>
                <Link href="/makeup" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Makeup
                </Link>
              </li>
              <li>
                <Link href="/hair-care" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Hair Care
                </Link>
              </li>
              <li>
                <Link href="/fragrance" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Fragrance
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Customer Care</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/account" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  My Account
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/wishlist" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Wishlist
                </Link>
              </li>
              <li>
                <Link href="/track-order" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Help & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Company</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Terms & Conditions
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-gray-300 hover:text-pink-400 text-sm transition-colors">
                  Return Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Social Media & Newsletter */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between space-y-4 lg:space-y-0">
            {/* Social Media */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Follow Us:</span>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M20 10C20 4.477 15.523 0 10 0S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z" clipRule="evenodd" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M6.29 18.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0020 3.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.073 4.073 0 01.8 7.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 010 16.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-pink-400 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm4.472 14.28c.348-.348.472-.847.472-1.36v-5.84c0-.513-.124-1.012-.472-1.36-.348-.348-.847-.472-1.36-.472H6.888c-.513 0-1.012.124-1.36.472-.348.348-.472.847-.472 1.36v5.84c0 .513.124 1.012.472 1.36.348.348.847.472 1.36.472h6.224c.513 0 1.012-.124 1.36-.472zM10 13c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm4-7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* App Store Badges */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">Download App:</span>
              <div className="flex space-x-2">
                <a href="#" className="block">
                  <img src="/app-store.svg" alt="Download on App Store" className="h-10" />
                </a>
                <a href="#" className="block">
                  <img src="/google-play.svg" alt="Get it on Google Play" className="h-10" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <p className="text-sm text-gray-400">
              © {currentYear} kaayalife.in. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
              <Link href="#" className="text-sm text-gray-400 hover:text-pink-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-pink-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="#" className="text-sm text-gray-400 hover:text-pink-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
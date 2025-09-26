'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface MenuItem {
  _id: string;
  name: string;
  slug: string;
  description: string;
  children?: MenuItem[];
  productCount?: number;
}

interface MegaDropdownProps {
  category: MenuItem;
  isLoading?: boolean;
}

export default function MegaDropdown({ category, isLoading }: MegaDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setIsOpen(false), 150);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const hasChildren = category.children && category.children.length > 0;

  if (isLoading) {
    return (
      <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
    );
  }

  return (
    <div 
      className="relative group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Top-level menu item */}
      <Link 
        href={`/${category.slug}`} 
        className="inline-flex items-center text-gray-700 hover:text-pink-600 font-medium transition-colors duration-200 py-2 px-1"
        title={category.description}
      >
        <span>{category.name}</span>
        {hasChildren && (
          <ChevronDownIcon 
            className={`h-4 w-4 ml-1 text-gray-400 transition-all duration-200 ${
              isOpen ? 'rotate-180 text-pink-600' : 'group-hover:text-pink-600'
            }`} 
          />
        )}
      </Link>

      {/* Mega dropdown panel */}
      {hasChildren && (
        <div 
          className={`absolute left-0 top-full z-50 mt-1 transition-all duration-200 ${
            isOpen ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible -translate-y-2'
          }`}
        >
          <div className="min-w-[320px] max-w-[800px] rounded-lg border border-gray-200 bg-white shadow-xl overflow-hidden">
            {/* Category header */}
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
            </div>

            {/* Submenu grid */}
            <div className="p-6">
              <div className={`grid ${
                category.children.length > 4 ? 'grid-cols-2' : 'grid-cols-1'
              } gap-6`}>
                {category.children.map((child) => (
                  <div key={child._id} className="space-y-2">
                    <Link 
                      href={`/${child.slug}`} 
                      className="block group/child"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-gray-900 group-hover/child:text-pink-600 transition-colors">
                          {child.name}
                        </h4>
                        {child.productCount && child.productCount > 0 && (
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {child.productCount}
                          </span>
                        )}
                      </div>
                      {child.description && (
                        <p className="text-sm text-gray-600 mt-1 group-hover/child:text-gray-700">
                          {child.description}
                        </p>
                      )}
                    </Link>

                    {/* Level 3 children */}
                    {child.children && child.children.length > 0 && (
                      <ul className="space-y-1 pl-4 border-l-2 border-gray-100">
                        {child.children.map((subchild) => (
                          <li key={subchild._id}>
                            <Link 
                              href={`/${subchild.slug}`} 
                              className="block text-sm text-gray-600 hover:text-pink-600 transition-colors py-1"
                            >
                              {subchild.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>

              {/* View All link */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link 
                  href={`/${category.slug}`} 
                  className="inline-flex items-center text-pink-600 hover:text-pink-700 font-medium text-sm transition-colors"
                >
                  <span>View All {category.name}</span>
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

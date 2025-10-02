'use client';

import React from 'react';

interface CategoryErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

interface CategoryErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  categoryName?: string;
}

class CategoryErrorBoundary extends React.Component<
  CategoryErrorBoundaryProps,
  CategoryErrorBoundaryState
> {
  constructor(props: CategoryErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): CategoryErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Category Error Boundary caught an error:', {
      categoryName: this.props.categoryName,
      error: error.message,
      errorInfo: errorInfo.componentStack
    });
    
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Return fallback or default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="group text-center transform transition-all duration-300">
          <div className="relative">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-full w-20 h-20 mx-auto mb-3 flex items-center justify-center shadow-sm">
              <span className="text-3xl text-gray-400">⚠️</span>
            </div>
            
            <h3 className="font-medium text-gray-500 text-sm leading-tight">
              {this.props.categoryName || 'Error Loading Category'}
            </h3>
            
            <p className="text-xs text-gray-400 mt-1">
              Unable to load
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CategoryErrorBoundary;

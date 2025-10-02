'use client';

import { useState, useRef } from 'react';
import { useCategories } from '@/hooks/useCategories';
import { apiService } from '@/lib/api';

interface ImportResult {
  url: string;
  success: boolean;
  data?: {
    id: string;
    name: string;
    price: number;
    category: string;
    source: string;
    images: number;
  };
  error?: string;
}

export default function ImportProductsPage() {
  const [activeTab, setActiveTab] = useState('single');
  const [singleUrl, setSingleUrl] = useState('');
  const [bulkUrls, setBulkUrls] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importResults, setImportResults] = useState<ImportResult[]>([]);
  const [lastImportSummary, setLastImportSummary] = useState<{successful: number, failed: number, total: number} | null>(null);
  
  const { categories } = useCategories();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const detectPlatform = (url: string): string => {
    const domain = url.toLowerCase();
    if (domain.includes('amazon.')) return 'Amazon';
    if (domain.includes('flipkart.')) return 'Flipkart';
    if (domain.includes('nykaa.')) return 'Nykaa';
    return 'Unknown';
  };

  const validateUrl = (url: string): boolean => {
    try {
      new URL(url);
      const platform = detectPlatform(url);
      return platform !== 'Unknown';
    } catch {
      return false;
    }
  };

  const handleSingleImport = async () => {
    if (!singleUrl.trim()) {
      alert('Please enter a product URL');
      return;
    }

    if (!validateUrl(singleUrl)) {
      alert('Please enter a valid Amazon, Flipkart, or Nykaa product URL');
      return;
    }

    setIsImporting(true);
    try {
      const response = await fetch('/api/import/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: singleUrl,
          category: selectedCategory,
          customPrice: customPrice
        }),
      });

      const result = await response.json();
      
      setImportResults([{
        url: singleUrl,
        success: result.success,
        data: result.data,
        error: result.message
      }]);

      if (result.success) {
        setSingleUrl('');
        setCustomPrice('');
        alert(`Product imported successfully: ${result.data?.name}`);
      } else {
        alert(`Import failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Import failed: ${error.message}`);
      setImportResults([{
        url: singleUrl,
        success: false,
        error: error.message
      }]);
    } finally {
      setIsImporting(false);
    }
  };

  const handleBulkImport = async () => {
    const urls = bulkUrls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);

    if (urls.length === 0) {
      alert('Please enter at least one product URL');
      return;
    }

    const invalidUrls = urls.filter(url => !validateUrl(url));
    if (invalidUrls.length > 0) {
      alert(`Invalid URLs found: ${invalidUrls.join(', ')}`);
      return;
    }

    setIsImporting(true);
    setImportResults([]);
    setLastImportSummary(null);

    try {
      const response = await fetch('/api/import/product', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          urls,
          category: selectedCategory,
          defaultPrice: customPrice
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setImportResults(result.results || []);
        setLastImportSummary(result.summary);
        setBulkUrls('');
        setCustomPrice('');
        alert(`Bulk import completed: ${result.summary?.successful} successful, ${result.summary?.failed} failed`);
      } else {
        alert(`Bulk import failed: ${result.message}`);
      }
    } catch (error) {
      alert(`Bulk import failed: ${error.message}`);
    } finally {
      setIsImporting(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setBulkUrls(content);
      };
      reader.readAsText(file);
    } else {
      alert('Please select a valid text file (.txt)');
    }
  };

  const exportResults = () => {
    if (importResults.length === 0) return;

    const csvContent = [
      'URL,Success,Product Name,Price,Category,Source,Error',
      ...importResults.map(result => 
        `"${result.url}","${result.success}","${result.data?.name || ''}","${result.data?.price || ''}","${result.data?.category || ''}","${result.data?.source || ''}","${result.error || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-results-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>
          <p className="text-gray-600">Import products from Amazon, Flipkart, and Nykaa</p>
        </div>
      </div>

      {/* Platform Support Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-medium text-blue-900 mb-2">Supported Platforms</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Amazon (.in, .com)
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Flipkart (.com)
          </div>
          <div className="flex items-center">
            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
            Nykaa (.com)
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('single')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'single'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Single Import
          </button>
          <button
            onClick={() => setActiveTab('bulk')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'bulk'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Bulk Import
          </button>
        </nav>
      </div>

      {/* Common Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-4 rounded-lg">
        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
            Category (Optional)
          </label>
          <select
            id="category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          >
            <option value="">Auto-detect category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
            Custom Price (Optional)
          </label>
          <input
            type="number"
            id="price"
            value={customPrice}
            onChange={(e) => setCustomPrice(e.target.value)}
            placeholder="Override scraped price"
            step="0.01"
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
          />
        </div>
      </div>

      {/* Single Import Tab */}
      {activeTab === 'single' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Single Product Import</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="singleUrl" className="block text-sm font-medium text-gray-700 mb-2">
                Product URL
              </label>
              <input
                type="url"
                id="singleUrl"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="https://www.amazon.in/product-name/dp/XXXXX or similar"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
              {singleUrl && (
                <p className="mt-1 text-sm text-gray-600">
                  Platform: <span className="font-medium">{detectPlatform(singleUrl)}</span>
                </p>
              )}
            </div>
            <button
              onClick={handleSingleImport}
              disabled={isImporting || !singleUrl.trim()}
              className="w-full bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isImporting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Importing...
                </>
              ) : (
                'Import Product'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Bulk Import Tab */}
      {activeTab === 'bulk' && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Bulk Product Import</h3>
          <div className="space-y-4">
            <div>
              <label htmlFor="bulkUrls" className="block text-sm font-medium text-gray-700 mb-2">
                Product URLs (one per line)
              </label>
              <textarea
                id="bulkUrls"
                value={bulkUrls}
                onChange={(e) => setBulkUrls(e.target.value)}
                placeholder="https://www.amazon.in/product1
https://www.flipkart.com/product2
https://www.nykaa.com/product3"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 border border-gray-300"
              >
                Upload URL List (.txt)
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={handleBulkImport}
                disabled={isImporting || !bulkUrls.trim()}
                className="flex-1 bg-pink-600 text-white py-2 px-4 rounded-md hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isImporting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Importing...
                  </>
                ) : (
                  'Import All Products'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Results */}
      {importResults.length > 0 && (
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Import Results</h3>
            <button
              onClick={exportResults}
              className="text-sm bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>

          {lastImportSummary && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{lastImportSummary.successful}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <div className="text-center p-3 bg-red-50 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{lastImportSummary.failed}</div>
                <div className="text-sm text-red-600">Failed</div>
              </div>
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{lastImportSummary.total}</div>
                <div className="text-sm text-blue-600">Total</div>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {importResults.map((result, index) => (
                  <tr key={index} className={result.success ? 'bg-green-50' : 'bg-red-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {result.success ? 'Success' : 'Failed'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="truncate max-w-xs" title={result.url}>
                        {result.url}
                      </div>
                      <div className="text-xs text-gray-400">
                        {detectPlatform(result.url)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {result.success && result.data ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{result.data.name}</div>
                          <div className="text-sm text-gray-500">₹{result.data.price}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {result.success && result.data ? (
                        <div className="text-xs text-gray-500">
                          <div>Category: {result.data.category}</div>
                          <div>Images: {result.data.images}</div>
                          <div>Source: {result.data.source}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-red-600">{result.error}</div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

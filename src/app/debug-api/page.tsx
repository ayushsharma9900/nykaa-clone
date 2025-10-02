'use client';

import { useState } from 'react';

export default function DebugApiPage() {
  const [results, setResults] = useState<any>({});
  const [loading, setLoading] = useState<string>('');

  const testEndpoint = async (name: string, url: string, method = 'GET') => {
    setLoading(name);
    try {
      const response = await fetch(url, { method });
      const data = await response.json();
      setResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [name]: {
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      }));
    } finally {
      setLoading('');
    }
  };

  const tests = [
    { name: 'Database Status', url: '/api/admin/init-db', method: 'GET' },
    { name: 'Initialize Database', url: '/api/admin/init-db', method: 'POST' },
    { name: 'Get Categories', url: '/api/categories', method: 'GET' },
    { name: 'Get Menu Items', url: '/api/menu-management/menu-items', method: 'GET' },
    { name: 'Get Products', url: '/api/products', method: 'GET' },
    { name: 'Get Admin Products', url: '/api/products/admin/all', method: 'GET' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">API Debug Dashboard</h1>
        
        <div className="grid gap-4 mb-8">
          {tests.map((test) => (
            <div key={test.name} className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-medium text-gray-900">{test.name}</h3>
                <button
                  onClick={() => testEndpoint(test.name, test.url, test.method)}
                  disabled={loading === test.name}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading === test.name ? 'Testing...' : `${test.method} Test`}
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-2">{test.method} {test.url}</p>
              
              {results[test.name] && (
                <div className="mt-4">
                  <div className={`inline-block px-2 py-1 rounded text-sm font-medium ${
                    results[test.name].success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    Status: {results[test.name].status}
                  </div>
                  <pre className="mt-2 p-3 bg-gray-100 rounded text-xs overflow-auto max-h-48">
                    {JSON.stringify(results[test.name], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <h4 className="text-yellow-800 font-medium mb-2">Instructions for Vercel:</h4>
          <ol className="text-yellow-700 text-sm space-y-1">
            <li>1. First, test "Database Status" to see if the database is initialized</li>
            <li>2. If no tables found, run "Initialize Database" to set up the database</li>
            <li>3. Test "Get Categories" and "Get Menu Items" to verify menu data is available</li>
            <li>4. Test "Get Products" to verify products are loading</li>
            <li>5. Check your main website to see if menu, categories and products now appear</li>
          </ol>
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-md p-4">
          <h4 className="text-blue-800 font-medium mb-2">About In-Memory Database:</h4>
          <p className="text-blue-700 text-sm">
            On Vercel, we use an in-memory SQLite database that gets recreated on each serverless function call.
            The database will be initialized automatically when you first call the API endpoints.
            This is a temporary solution - for production, consider using Vercel KV, PlanetScale, or another persistent database.
          </p>
        </div>
      </div>
    </div>
  );
}

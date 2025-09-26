'use client';

import { useState } from 'react';
import { apiRequest } from '../../utils/api';

export default function SyncTest() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testSync = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('Testing sync API call...');
      const response = await apiRequest('/menu-management/sync-categories', {
        method: 'POST'
      });

      console.log('Response received:', response);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);

      setResult(`✅ SUCCESS: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Sync test error:', error);
      setResult(`❌ ERROR: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testDirectFetch = async () => {
    setLoading(true);
    setResult('');

    try {
      console.log('Testing direct fetch...');
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const url = `${API_BASE_URL}/menu-management/sync-categories`;
      
      console.log('Calling URL:', url);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('Direct response:', response);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Direct response data:', data);

      setResult(`✅ DIRECT SUCCESS: ${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      console.error('Direct test error:', error);
      setResult(`❌ DIRECT ERROR: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white border rounded-lg shadow">
      <h2 className="text-lg font-bold mb-4">Sync Categories Debug</h2>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={testSync}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test API Utility'}
        </button>
        
        <button
          onClick={testDirectFetch}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? 'Testing...' : 'Test Direct Fetch'}
        </button>
      </div>

      {result && (
        <div className="mt-4">
          <h3 className="font-semibold mb-2">Result:</h3>
          <pre className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap overflow-auto max-h-64">
            {result}
          </pre>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-600">
        <p><strong>API_BASE_URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}</p>
        <p><strong>Current URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'N/A'}</p>
      </div>
    </div>
  );
}

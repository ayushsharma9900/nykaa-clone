'use client';

import { useState } from 'react';

export default function TestJavaScript() {
  const [count, setCount] = useState(0);
  
  console.log('🧪 TEST COMPONENT RENDERING, count:', count);
  
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">JavaScript Test Page</h1>
      
      <div className="space-y-4">
        <div>
          <p>Count: {count}</p>
          <button 
            onClick={() => {
              console.log('🚀 React onClick working!');
              setCount(count + 1);
              alert('React button works!');
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Click Me (React)
          </button>
        </div>
        
        <div>
          <button 
            onClick={() => alert('Simple alert works!')}
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            Simple Alert
          </button>
        </div>
        
        <div>
          <button 
            onClick={(e) => {
              console.log('🎯 Event object:', e);
              console.log('🎯 Event type:', e.type);
              console.log('🎯 Target:', e.target);
              alert('Event details logged to console');
            }}
            className="px-4 py-2 bg-purple-500 text-white rounded"
          >
            Debug Event
          </button>
        </div>
      </div>
      
      <div className="mt-8 p-4 bg-gray-100 rounded">
        <h2 className="font-bold mb-2">Debug Info:</h2>
        <p>React State Count: {count}</p>
        <p>Window object exists: {typeof window !== 'undefined' ? 'Yes' : 'No'}</p>
        <p>Console log works: Check browser console</p>
      </div>
    </div>
  );
}

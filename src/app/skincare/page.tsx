'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function SkincarePage() {
  useEffect(() => {
    // Redirect to dynamic category page
    window.location.href = '/skincare';
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Loading Skincare products...</p>
    </div>
  );
}

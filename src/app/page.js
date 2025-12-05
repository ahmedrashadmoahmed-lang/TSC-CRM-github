'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to new dashboard
    router.push('/dashboard-new');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">جاري التحميل...</p>
      </div>
    </div>
  );
}

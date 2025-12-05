// Error Boundary Component
'use client';

import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">حدث خطأ غير متوقع</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">نعتذر عن الإزعاج</p>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-4">
          <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
            {error.message}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={resetErrorBoundary}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            إعادة المحاولة
          </button>
          <button
            onClick={() => (window.location.href = '/')}
            className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            الصفحة الرئيسية
          </button>
        </div>

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4">
            <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
              Stack Trace (Development Only)
            </summary>
            <pre className="mt-2 text-xs bg-gray-900 text-gray-100 p-4 rounded overflow-auto max-h-64">
              {error.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={(error, errorInfo) => {
        // Log to error reporting service (e.g., Sentry)
        console.error('Error Boundary caught:', error, errorInfo);
      }}
      onReset={() => {
        // Reset app state if needed
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}

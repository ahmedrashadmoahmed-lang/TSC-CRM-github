// Virtual List Component for Large Tables
'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';

export function VirtualTable({ data, columns, rowHeight = 50 }) {
  const parentRef = useRef(null);

  const rowVirtualizer = useVirtualizer({
    count: data.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto border border-gray-200 dark:border-gray-700 rounded-lg"
    >
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = data[virtualRow.index];
          return (
            <div
              key={virtualRow.index}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
              className="flex items-center border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              {columns.map((column, colIndex) => (
                <div
                  key={colIndex}
                  className="flex-1 px-4 py-2 text-sm text-gray-900 dark:text-gray-100"
                >
                  {column.render ? column.render(row) : row[column.key]}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Example usage:
// <VirtualTable
//   data={largeDataArray}
//   columns={[
//     { key: 'id', label: 'ID' },
//     { key: 'name', label: 'Name' },
//     { key: 'amount', label: 'Amount', render: (row) => formatCurrency(row.amount) },
//   ]}
//   rowHeight={50}
// />

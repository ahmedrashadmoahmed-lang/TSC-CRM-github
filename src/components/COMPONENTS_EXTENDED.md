# UI Components Documentation - Part 2

## Additional Components

### 1. Alert

Modal alert component with actions and auto-close.

**Props:**
- `type` - Alert type: 'success', 'error', 'warning', 'info'
- `title` - Alert title
- `message` - Alert message
- `onClose` - Close callback
- `autoClose` - Auto-close after duration (default: false)
- `duration` - Auto-close duration in ms (default: 5000)
- `actions` - Array of action buttons

**Usage:**
```jsx
<Alert
  type="success"
  title="نجح!"
  message="تم حفظ البيانات بنجاح"
  onClose={() => setShowAlert(false)}
  autoClose
  actions={[
    { label: 'تراجع', onClick: handleUndo },
    { label: 'موافق', onClick: handleOk, primary: true },
  ]}
/>
```

---

### 2. NotificationCenter

Real-time notification center with read/unread states.

**Props:**
- `notifications` - Array of notification objects
- `onMarkAsRead` - Mark as read callback
- `onClear` - Clear all callback

**Notification Object:**
```javascript
{
  id: 'unique-id',
  type: 'success', // success, error, warning, info, system
  title: 'عنوان الإشعار',
  message: 'نص الإشعار',
  read: false,
  createdAt: new Date(),
}
```

**Usage:**
```jsx
<NotificationCenter
  notifications={notifications}
  onMarkAsRead={(id) => markAsRead(id)}
  onClear={() => clearAll()}
/>
```

---

### 3. FileUpload

File upload with drag-and-drop and progress tracking.

**Props:**
- `accept` - Accepted file types (default: '*')
- `multiple` - Allow multiple files (default: false)
- `maxSize` - Max file size in bytes (default: 5MB)
- `onUpload` - Upload callback
- `onError` - Error callback
- `disabled` - Disabled state

**Usage:**
```jsx
<FileUpload
  accept="image/*,.pdf"
  multiple
  maxSize={10 * 1024 * 1024} // 10MB
  onUpload={async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });
  }}
  onError={(error) => toast.error(error)}
/>
```

---

### 4. SearchBar

Advanced search with filters and debounce.

**Props:**
- `placeholder` - Search placeholder
- `onSearch` - Search callback
- `debounceMs` - Debounce delay (default: 300)
- `showFilters` - Show filters panel
- `filters` - Array of filter objects
- `onFilterChange` - Filter change callback

**Filter Object:**
```javascript
{
  key: 'status',
  label: 'الحالة',
  type: 'select', // select, date, text
  options: [
    { value: 'active', label: 'نشط' },
    { value: 'inactive', label: 'معطل' },
  ],
}
```

**Usage:**
```jsx
<SearchBar
  placeholder="ابحث عن المنتجات..."
  onSearch={(term, filters) => handleSearch(term, filters)}
  showFilters
  filters={[
    {
      key: 'category',
      label: 'الفئة',
      type: 'select',
      options: categories,
    },
    {
      key: 'date',
      label: 'التاريخ',
      type: 'date',
    },
  ]}
  onFilterChange={(filters) => console.log(filters)}
/>
```

---

### 5. Timeline

Timeline component for activity history.

**Props:**
- `items` - Array of timeline items
- `variant` - Variant: 'default', 'compact'

**Timeline Item:**
```javascript
{
  id: 'unique-id',
  title: 'عنوان الحدث',
  description: 'وصف الحدث',
  date: '2024-01-15',
  status: 'completed', // completed, pending, cancelled, active
  icon: '✓',
  details: 'تفاصيل إضافية',
  user: {
    name: 'أحمد محمد',
    avatar: '👤',
  },
}
```

**Usage:**
```jsx
<Timeline
  items={[
    {
      id: '1',
      title: 'تم إنشاء الفاتورة',
      description: 'فاتورة رقم INV-001',
      date: '2024-01-15 10:30',
      status: 'completed',
      user: { name: 'أحمد محمد' },
    },
    {
      id: '2',
      title: 'في انتظار الموافقة',
      date: '2024-01-15 11:00',
      status: 'pending',
    },
  ]}
  variant="default"
/>
```

---

## Complete Component List

### Basic Components (8)
1. SkeletonLoader
2. DataTable
3. FormBuilder
4. Modal
5. Badge
6. ConfirmDialog
7. Dropdown
8. Tabs

### Advanced Components (5)
9. Accordion
10. Pagination
11. Alert
12. NotificationCenter
13. FileUpload

### Utility Components (2)
14. SearchBar
15. Timeline

### Dashboard Components (3)
16. StatCard
17. ChartCard
18. SimpleBarChart

**Total: 18 Components** ✅

---

## Best Practices

1. **Always handle loading states**
2. **Validate user input**
3. **Show meaningful error messages**
4. **Use appropriate component variants**
5. **Keep components accessible**
6. **Test on mobile devices**
7. **Follow RTL/LTR guidelines**

---

**All components are production-ready! 🚀**

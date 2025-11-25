# UI Components Library

## Overview

This directory contains a comprehensive collection of reusable UI components for the Enterprise ERP system. All components are built with React, styled with CSS-in-JS, and follow consistent design patterns.

## Components

### Layout Components

#### 1. Modal
**File:** `Modal.js`

**Props:**
- `isOpen` - Boolean to control visibility
- `onClose` - Close handler
- `title` - Modal title
- `size` - 'small', 'medium', 'large', 'full'
- `showCloseButton` - Show/hide close button
- `closeOnOverlayClick` - Close when clicking overlay
- `footer` - Footer content

**Usage:**
```jsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="إضافة عميل جديد"
  size="medium"
  footer={
    <>
      <button onClick={handleSave}>حفظ</button>
      <button onClick={() => setIsOpen(false)}>إلغاء</button>
    </>
  }
>
  <FormBuilder fields={fields} />
</Modal>
```

---

#### 2. ConfirmDialog
**File:** `ConfirmDialog.js`

**Props:**
- `isOpen` - Boolean
- `onClose` - Close handler
- `onConfirm` - Confirm handler
- `title` - Dialog title
- `message` - Confirmation message
- `variant` - 'danger', 'warning', 'info'
- `loading` - Loading state

**Usage:**
```jsx
<ConfirmDialog
  isOpen={showConfirm}
  onClose={() => setShowConfirm(false)}
  onConfirm={handleDelete}
  title="حذف العميل"
  message="هل أنت متأكد من حذف هذا العميل؟"
  variant="danger"
  confirmLabel="حذف"
/>
```

---

#### 3. Dropdown
**File:** `Dropdown.js`

**Props:**
- `trigger` - Trigger element
- `items` - Array of menu items
- `align` - 'left', 'right', 'center'
- `width` - Dropdown width

**Item Structure:**
```javascript
{
  text: 'تعديل',
  icon: '✏️',
  onClick: () => {},
  badge: '3',
  danger: false,
  disabled: false,
  divider: false, // For dividers
  label: 'Actions', // For labels
}
```

**Usage:**
```jsx
<Dropdown
  trigger={<button>القائمة</button>}
  items={[
    { text: 'تعديل', icon: '✏️', onClick: handleEdit },
    { divider: true },
    { text: 'حذف', icon: '🗑️', onClick: handleDelete, danger: true },
  ]}
  align="right"
/>
```

---

#### 4. Tabs
**File:** `Tabs.js`

**Props:**
- `tabs` - Array of tab objects
- `defaultTab` - Default active tab index
- `onChange` - Tab change handler
- `variant` - 'default', 'pills', 'underline'

**Tab Structure:**
```javascript
{
  label: 'معلومات عامة',
  icon: '📋',
  badge: '5',
  disabled: false,
  content: <div>Tab content</div>,
}
```

**Usage:**
```jsx
<Tabs
  tabs={[
    { label: 'معلومات', content: <GeneralInfo /> },
    { label: 'الفواتير', content: <Invoices />, badge: '12' },
  ]}
  variant="pills"
  onChange={(index) => console.log('Tab changed:', index)}
/>
```

---

### Data Display Components

#### 5. DataTable
**File:** `DataTable.js`

**Props:**
- `columns` - Array of column definitions
- `data` - Array of data rows
- `loading` - Loading state
- `pagination` - Enable pagination
- `pageSize` - Items per page
- `sortable` - Enable sorting
- `searchable` - Enable search
- `onRowClick` - Row click handler
- `actions` - Row actions renderer

**Column Structure:**
```javascript
{
  key: 'name',
  label: 'الاسم',
  width: '200px',
  render: (value, row) => <strong>{value}</strong>,
}
```

**Usage:**
```jsx
<DataTable
  columns={[
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد' },
    { key: 'phone', label: 'الهاتف' },
  ]}
  data={customers}
  loading={loading}
  pagination
  pageSize={10}
  searchable
  onRowClick={(row) => navigate(`/customers/${row.id}`)}
  actions={(row) => (
    <>
      <button onClick={() => handleEdit(row)}>تعديل</button>
      <button onClick={() => handleDelete(row)}>حذف</button>
    </>
  )}
/>
```

---

#### 6. Badge
**File:** `Badge.js`

**Props:**
- `variant` - 'default', 'primary', 'success', 'warning', 'error', 'info'
- `size` - 'small', 'medium', 'large'
- `rounded` - Boolean for pill shape

**Usage:**
```jsx
<Badge variant="success" size="small">نشط</Badge>
<Badge variant="error" rounded>معلق</Badge>
```

---

#### 7. SkeletonLoader
**File:** `SkeletonLoader.js`

**Props:**
- `type` - 'card', 'table', 'list', 'stat', 'chart', 'form'
- `count` - Number of skeletons
- `className` - Additional CSS class

**Usage:**
```jsx
{loading ? (
  <SkeletonLoader type="table" count={1} />
) : (
  <DataTable data={data} />
)}
```

---

### Form Components

#### 8. FormBuilder
**File:** `FormBuilder.js`

**Props:**
- `fields` - Array of field definitions
- `schema` - Zod validation schema
- `initialValues` - Initial form values
- `onSubmit` - Submit handler
- `onCancel` - Cancel handler
- `loading` - Loading state

**Field Structure:**
```javascript
{
  name: 'email',
  type: 'email', // text, email, password, number, tel, textarea, select, checkbox, date
  label: 'البريد الإلكتروني',
  placeholder: 'أدخل البريد',
  required: true,
  disabled: false,
  hint: 'سيتم استخدامه لتسجيل الدخول',
  options: [{ value: '1', label: 'خيار 1' }], // For select
  checkboxLabel: 'أوافق على الشروط', // For checkbox
  rows: 4, // For textarea
}
```

**Usage:**
```jsx
<FormBuilder
  fields={[
    { name: 'name', type: 'text', label: 'الاسم', required: true },
    { name: 'email', type: 'email', label: 'البريد' },
    { name: 'type', type: 'select', label: 'النوع', options: [...] },
  ]}
  schema={customerSchema}
  initialValues={{ name: '', email: '' }}
  onSubmit={handleSubmit}
  onCancel={() => setShowForm(false)}
  loading={saving}
/>
```

---

## Design Tokens

All components use CSS variables for theming:

```css
--primary-color
--primary-hover
--primary-light
--bg-primary
--bg-secondary
--bg-tertiary
--card-bg
--text-primary
--text-secondary
--border-color
--error-color
--success-color
--warning-color
--shadow-sm
--shadow-md
--shadow-lg
--shadow-xl
```

## Best Practices

1. **Always use components** instead of building custom UI
2. **Pass validation schemas** to FormBuilder
3. **Use SkeletonLoader** for loading states
4. **Wrap pages** with ErrorBoundary
5. **Use Modal** for forms and dialogs
6. **Use ConfirmDialog** for destructive actions
7. **Use DataTable** for all data lists
8. **Use Badge** for status indicators

## Examples

### Complete CRUD Example

```jsx
import { useState } from 'react';
import DataTable from '@/components/DataTable';
import Modal from '@/components/Modal';
import FormBuilder from '@/components/FormBuilder';
import ConfirmDialog from '@/components/ConfirmDialog';
import SkeletonLoader from '@/components/SkeletonLoader';
import { customerSchema } from '@/lib/validation';

export default function CustomersPage() {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const columns = [
    { key: 'name', label: 'الاسم' },
    { key: 'email', label: 'البريد' },
    { key: 'phone', label: 'الهاتف' },
  ];

  const fields = [
    { name: 'name', type: 'text', label: 'الاسم', required: true },
    { name: 'email', type: 'email', label: 'البريد' },
    { name: 'phone', type: 'tel', label: 'الهاتف' },
  ];

  if (loading) {
    return <SkeletonLoader type="table" />;
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={customers}
        searchable
        pagination
        actions={(row) => (
          <>
            <button onClick={() => handleEdit(row)}>تعديل</button>
            <button onClick={() => handleDelete(row)}>حذف</button>
          </>
        )}
      />

      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="إضافة عميل"
      >
        <FormBuilder
          fields={fields}
          schema={customerSchema}
          onSubmit={handleSubmit}
          onCancel={() => setShowForm(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmDelete}
        title="حذف العميل"
        message="هل أنت متأكد؟"
        variant="danger"
      />
    </>
  );
}
```

---

**Total Components: 8**
**Production-Ready: ✅**

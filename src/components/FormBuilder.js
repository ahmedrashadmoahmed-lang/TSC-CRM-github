'use client';

import { useState } from 'react';
import { validate } from '@/lib/validation';

export default function FormBuilder({
  fields = [],
  schema = null,
  initialValues = {},
  onSubmit,
  submitLabel = 'حفظ',
  cancelLabel = 'إلغاء',
  onCancel = null,
  loading = false,
}) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleChange = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleBlur = (name) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = fields.reduce((acc, field) => {
      acc[field.name] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Client-side validation for required fields
    const clientErrors = {};
    fields.forEach((field) => {
      if (field.required) {
        const value = values[field.name];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          clientErrors[field.name] = `${field.label} مطلوب`;
        }
      }
    });

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors);
      return;
    }

    // Validate if schema provided
    if (schema) {
      const { success, errors: validationErrors } = validate(schema, values);

      if (!success) {
        setErrors(validationErrors);
        return;
      }
    }

    // Submit
    await onSubmit(values);
  };

  const renderField = (field) => {
    const value = values[field.name] !== undefined && values[field.name] !== null
      ? values[field.name]
      : (field.type === 'checkbox' ? false : '');
    const error = touched[field.name] && errors[field.name];

    switch (field.type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
        return (
          <input
            type={field.type}
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );

      case 'textarea':
        return (
          <textarea
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            placeholder={field.placeholder}
            disabled={field.disabled || loading}
            rows={field.rows || 4}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );

      case 'select':
        return (
          <select
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            disabled={field.disabled || loading}
            className={`form-input ${error ? 'error' : ''}`}
          >
            <option value="">{field.placeholder || 'اختر...'}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <label className="checkbox-label">
            <input
              type="checkbox"
              name={field.name}
              checked={!!value}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled || loading}
              className="checkbox-input"
            />
            <span>{field.checkboxLabel}</span>
          </label>
        );

      case 'date':
        return (
          <input
            type="date"
            name={field.name}
            value={value}
            onChange={(e) => handleChange(field.name, e.target.value)}
            onBlur={() => handleBlur(field.name)}
            disabled={field.disabled || loading}
            className={`form-input ${error ? 'error' : ''}`}
          />
        );

      default:
        return null;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-builder">
      {fields.map((field) => (
        <div key={field.name} className="form-field">
          {field.type !== 'checkbox' && (
            <label htmlFor={field.name} className="form-label">
              {field.label}
              {field.required && <span className="required">*</span>}
            </label>
          )}

          {renderField(field)}

          {touched[field.name] && errors[field.name] && (
            <div className="error-message">{errors[field.name]}</div>
          )}

          {field.hint && <div className="hint-message">{field.hint}</div>}
        </div>
      ))}

      <div className="form-actions">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="btn btn-secondary"
          >
            {cancelLabel}
          </button>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'جاري الحفظ...' : submitLabel}
        </button>
      </div>

      <style jsx>{`
        .form-builder {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-field {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 600;
          color: var(--text-primary);
          font-size: 0.875rem;
        }

        .required {
          color: #ef4444;
          margin-right: 0.25rem;
        }

        .form-input {
          padding: 0.75rem 1rem;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--bg-secondary);
          color: var(--text-primary);
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary-color);
          background: var(--bg-primary);
        }

        .form-input.error {
          border-color: #ef4444;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        textarea.form-input {
          resize: vertical;
          min-height: 100px;
        }

        select.form-input {
          cursor: pointer;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
          color: var(--text-primary);
        }

        .checkbox-input {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }

        .error-message {
          color: #ef4444;
          font-size: 0.75rem;
          margin-top: -0.25rem;
        }

        .hint-message {
          color: var(--text-secondary);
          font-size: 0.75rem;
          margin-top: -0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          margin-top: 1rem;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
          font-size: 0.875rem;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: var(--primary-color);
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: var(--primary-hover);
          transform: translateY(-2px);
        }

        .btn-secondary {
          background: var(--bg-secondary);
          color: var(--text-primary);
          border: 1px solid var(--border-color);
        }

        .btn-secondary:hover:not(:disabled) {
          background: var(--bg-tertiary);
          transform: translateY(-2px);
        }

        @media (max-width: 768px) {
          .form-actions {
            flex-direction: column-reverse;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </form>
  );
}

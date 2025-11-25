'use client';

import { useState, useRef } from 'react';

export default function FileUpload({
    accept = '*',
    multiple = false,
    maxSize = 5 * 1024 * 1024, // 5MB
    onUpload,
    onError,
    disabled = false,
}) {
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const inputRef = useRef(null);

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const validateFile = (file) => {
        if (file.size > maxSize) {
            return `حجم الملف ${file.name} أكبر من الحد المسموح (${formatFileSize(maxSize)})`;
        }
        return null;
    };

    const handleFiles = (fileList) => {
        const newFiles = Array.from(fileList);
        const validFiles = [];
        const errors = [];

        newFiles.forEach((file) => {
            const error = validateFile(file);
            if (error) {
                errors.push(error);
            } else {
                validFiles.push({
                    file,
                    id: Math.random().toString(36).substr(2, 9),
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    progress: 0,
                });
            }
        });

        if (errors.length > 0) {
            onError?.(errors.join('\n'));
            return;
        }

        if (multiple) {
            setFiles((prev) => [...prev, ...validFiles]);
        } else {
            setFiles(validFiles);
        }

        // Simulate upload
        uploadFiles(validFiles);
    };

    const uploadFiles = async (filesToUpload) => {
        setUploading(true);

        for (const fileObj of filesToUpload) {
            try {
                // Simulate progress
                for (let progress = 0; progress <= 100; progress += 10) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    setFiles((prev) =>
                        prev.map((f) =>
                            f.id === fileObj.id ? { ...f, progress } : f
                        )
                    );
                }

                // Call upload callback
                await onUpload?.(fileObj.file);
            } catch (error) {
                onError?.(error.message);
            }
        }

        setUploading(false);
    };

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(e.dataTransfer.files);
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(e.target.files);
        }
    };

    const removeFile = (id) => {
        setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    return (
        <div className="file-upload">
            <div
                className={`upload-area ${dragActive ? 'drag-active' : ''} ${disabled ? 'disabled' : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !disabled && inputRef.current?.click()}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    disabled={disabled}
                    style={{ display: 'none' }}
                />

                <div className="upload-icon">📁</div>
                <div className="upload-text">
                    <strong>اضغط لاختيار الملفات</strong> أو اسحب وأفلت هنا
                </div>
                <div className="upload-hint">
                    الحد الأقصى: {formatFileSize(maxSize)}
                </div>
            </div>

            {files.length > 0 && (
                <div className="files-list">
                    {files.map((fileObj) => (
                        <div key={fileObj.id} className="file-item">
                            <div className="file-icon">📄</div>
                            <div className="file-info">
                                <div className="file-name">{fileObj.name}</div>
                                <div className="file-size">{formatFileSize(fileObj.size)}</div>
                                {fileObj.progress > 0 && fileObj.progress < 100 && (
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{ width: `${fileObj.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                            {!uploading && (
                                <button
                                    onClick={() => removeFile(fileObj.id)}
                                    className="remove-btn"
                                    aria-label="حذف"
                                >
                                    ✕
                                </button>
                            )}
                            {fileObj.progress === 100 && (
                                <div className="success-icon">✓</div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <style jsx>{`
        .file-upload {
          width: 100%;
        }

        .upload-area {
          border: 2px dashed var(--border-color);
          border-radius: 12px;
          padding: 3rem 2rem;
          text-align: center;
          cursor: pointer;
          transition: all 0.3s;
          background: var(--bg-secondary);
        }

        .upload-area:hover:not(.disabled) {
          border-color: var(--primary-color);
          background: var(--primary-light);
        }

        .upload-area.drag-active {
          border-color: var(--primary-color);
          background: var(--primary-light);
          transform: scale(1.02);
        }

        .upload-area.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .upload-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .upload-text {
          color: var(--text-primary);
          margin-bottom: 0.5rem;
        }

        .upload-text strong {
          color: var(--primary-color);
        }

        .upload-hint {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .files-list {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .file-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          transition: all 0.2s;
        }

        .file-item:hover {
          background: var(--bg-secondary);
        }

        .file-icon {
          font-size: 2rem;
        }

        .file-info {
          flex: 1;
        }

        .file-name {
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 0.25rem;
        }

        .file-size {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }

        .progress-bar {
          margin-top: 0.5rem;
          height: 4px;
          background: var(--bg-tertiary);
          border-radius: 2px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary-color);
          transition: width 0.3s;
        }

        .remove-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          border: none;
          background: var(--bg-secondary);
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: #ef4444;
          color: white;
        }

        .success-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #22c55e;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        @media (max-width: 768px) {
          .upload-area {
            padding: 2rem 1rem;
          }

          .upload-icon {
            font-size: 2rem;
          }
        }
      `}</style>
        </div>
    );
}

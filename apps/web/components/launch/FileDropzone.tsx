'use client';

import {
  useCallback,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import {
  MAX_FILE_BYTES,
  fileMatches,
  isImageDataUrl,
  readFileAsDataUrl,
} from './types';

interface FileDropzoneProps {
  inputId: string;
  labelledBy: string;
  emptyTitle: string;
  hint: string;
  accept: string;
  exts: string[];
  mimes: Set<string>;
  compact?: boolean;
  value: string;
  fileName: string;
  onFile: (dataUrl: string, fileName: string) => void;
  onClear: () => void;
}

export function FileDropzone({
  inputId,
  labelledBy,
  emptyTitle,
  hint,
  accept,
  exts,
  mimes,
  compact = false,
  value,
  fileName,
  onFile,
  onClear,
}: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCount = useRef(0);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasFile = Boolean(value);

  const applyFile = useCallback(
    async (file: File | undefined) => {
      if (!file) return;
      setError(null);
      if (!fileMatches(file, exts, mimes)) {
        setError('That file type is not supported');
        return;
      }
      if (file.size > MAX_FILE_BYTES) {
        setError('File is too large. Use a file under 4 MB.');
        return;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        onFile(dataUrl, file.name);
      } catch {
        setError('Could not read that file');
      }
    },
    [exts, mimes, onFile],
  );

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    void applyFile(file);
  };

  const onDragEnter = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCount.current += 1;
    setDragging(true);
  };

  const onDragLeave = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCount.current = Math.max(0, dragCount.current - 1);
    if (dragCount.current === 0) setDragging(false);
  };

  const onDragOver = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const onDrop = (event: DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
    dragCount.current = 0;
    setDragging(false);
    void applyFile(event.dataTransfer.files?.[0]);
  };

  const openPicker = () => inputRef.current?.click();

  const dropzoneClass = [
    'launch-dropzone',
    compact ? 'is-compact' : '',
    hasFile ? 'is-filled' : '',
    dragging ? 'is-dragging' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="launch-dropzone-wrap">
      <input
        ref={inputRef}
        id={inputId}
        className="launch-file-input"
        type="file"
        accept={accept}
        aria-labelledby={labelledBy}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        tabIndex={hasFile ? -1 : undefined}
        onChange={onInputChange}
      />

      {hasFile ? (
        <div
          className={dropzoneClass}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <div className="launch-dropzone-filled">
            {isImageDataUrl(value) ? (
              <div
                className={`launch-dropzone-preview${compact ? ' is-compact' : ''}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="" />
              </div>
            ) : null}
            <div className="launch-dropzone-meta">
              <p className="launch-dropzone-name">{fileName || 'Selected file'}</p>
              <div className="launch-dropzone-actions">
                <button
                  type="button"
                  className="launch-text-btn"
                  onClick={openPicker}
                >
                  Replace
                </button>
                <button
                  type="button"
                  className="launch-text-btn"
                  onClick={() => {
                    setError(null);
                    onClear();
                  }}
                >
                  Remove
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <label
          htmlFor={inputId}
          className={dropzoneClass}
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
        >
          <span className="launch-dropzone-copy">
            <span className="launch-dropzone-title">{emptyTitle}</span>
            <span className="launch-dropzone-hint">{hint}</span>
          </span>
        </label>
      )}

      {error ? (
        <p id={`${inputId}-error`} className="launch-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

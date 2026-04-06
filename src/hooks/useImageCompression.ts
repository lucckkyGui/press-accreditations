import { useCallback } from 'react';

interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.8,
  maxSizeMB: 2,
};

export function useImageCompression() {
  const compressImage = useCallback(
    async (file: File, options?: CompressionOptions): Promise<File> => {
      const opts = { ...DEFAULT_OPTIONS, ...options };

      // Skip non-image files
      if (!file.type.startsWith('image/')) return file;
      // Skip small files
      if (opts.maxSizeMB && file.size <= opts.maxSizeMB * 1024 * 1024) return file;
      // Skip SVGs/GIFs
      if (file.type === 'image/svg+xml' || file.type === 'image/gif') return file;

      return new Promise((resolve) => {
        const img = new Image();
        const url = URL.createObjectURL(file);
        
        img.onload = () => {
          URL.revokeObjectURL(url);
          
          let { width, height } = img;
          const maxW = opts.maxWidth || 1920;
          const maxH = opts.maxHeight || 1920;
          
          if (width > maxW || height > maxH) {
            const ratio = Math.min(maxW / width, maxH / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) { resolve(file); return; }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob(
            (blob) => {
              if (!blob || blob.size >= file.size) {
                resolve(file); // Keep original if compression didn't help
                return;
              }
              resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
            },
            'image/jpeg',
            opts.quality
          );
        };
        
        img.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(file);
        };
        
        img.src = url;
      });
    },
    []
  );

  const compressImages = useCallback(
    async (files: File[], options?: CompressionOptions): Promise<File[]> => {
      return Promise.all(files.map((f) => compressImage(f, options)));
    },
    [compressImage]
  );

  return { compressImage, compressImages };
}

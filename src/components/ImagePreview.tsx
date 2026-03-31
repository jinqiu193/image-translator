'use client';

import { useEffect, useState } from 'react';
import { X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ImageFile {
  id: string;
  file: File;
  preview: string;
}

interface ImagePreviewProps {
  images: ImageFile[];
  onRemove: (id: string) => void;
  disabled?: boolean;
  maxImages?: number;
}

export default function ImagePreview({
  images,
  onRemove,
  disabled = false,
  maxImages = 20,
}: ImagePreviewProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  useEffect(() => {
    setImageErrors(new Set());
  }, [images]);

  const handleImageError = (id: string) => {
    setImageErrors((prev) => new Set(prev).add(id));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-4 sm:mt-6">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <h3 className="text-sm sm:text-lg font-semibold text-gray-900">
          已选择 {images.length} {maxImages ? `/ ${maxImages}` : ''} 张图片
        </h3>
        {images.length >= maxImages && (
          <div className="flex items-center space-x-1 sm:space-x-2 text-amber-600 text-xs sm:text-sm">
            <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">已达到最大数量限制</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
          >
            {/* 图片预览 */}
            <div className="aspect-square bg-gray-100 relative">
              {imageErrors.has(image.id) ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100">
                  <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">预览失败</span>
                </div>
              ) : (
                <img
                  src={image.preview}
                  alt={image.file.name}
                  className="w-full h-full object-cover"
                  onError={() => handleImageError(image.id)}
                />
              )}

              {/* 序号标记 */}
              <div className="absolute top-2 left-2 bg-[#0EA5E9] text-white text-xs font-semibold px-2 py-1 rounded-full">
                {index + 1}
              </div>

              {/* 删除按钮 */}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => onRemove(image.id)}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  aria-label="删除图片"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* 文件信息 */}
            <div className="p-2 sm:p-3">
              <p
                className="text-xs sm:text-sm font-medium text-gray-900 truncate"
                title={image.file.name}
              >
                {image.file.name}
              </p>
              <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                {formatFileSize(image.file.size)}
              </p>
            </div>
          </div>
        ))}
      </div>

      {images.length >= maxImages && (
        <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs sm:text-sm text-amber-700">
            已达到最大上传数量限制（{maxImages} 张）。如需处理更多图片，请先删除部分图片或分批处理。
          </p>
        </div>
      )}
    </div>
  );
}

// 创建图片对象的辅助函数
export function createImageFile(file: File): ImageFile {
  const id = `${file.name}-${file.size}-${Date.now()}`;
  const preview = URL.createObjectURL(file);
  return { id, file, preview };
}

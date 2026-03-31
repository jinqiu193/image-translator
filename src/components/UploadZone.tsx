'use client';

import { useCallback, useState } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export default function UploadZone({ onFilesSelected, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/bmp', 'image/webp'];

  const validateFiles = (files: File[]): File[] => {
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      // 检查文件类型
      if (!ALLOWED_TYPES.includes(file.type)) {
        errors.push(`"${file.name}" 不是支持的图片格式`);
        return;
      }

      // 检查文件大小
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`"${file.name}" 超过 10MB 限制`);
        return;
      }

      validFiles.push(file);
    });

    if (errors.length > 0) {
      setError(errors.join('; '));
      setTimeout(() => setError(null), 5000);
    } else {
      setError(null);
    }

    return validFiles;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [disabled, onFilesSelected]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !e.target.files) return;

    const files = Array.from(e.target.files);
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }

    // 重置 input 以便可以选择同一文件
    e.target.value = '';
  }, [disabled, onFilesSelected]);

  return (
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-6 sm:p-12 transition-all duration-200
          ${isDragging
            ? 'border-[#0EA5E9] bg-[#E0F2FE] scale-[1.02]'
            : 'border-gray-300 hover:border-[#0EA5E9] hover:bg-gray-50'
          }
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          id="file-upload"
          multiple
          accept=".png,.jpg,.jpeg,.gif,.bmp,.webp"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={disabled}
        />

        <div className="flex flex-col items-center justify-center space-y-4">
          <div className={`
            p-3 sm:p-4 rounded-full transition-all duration-200
            ${isDragging ? 'bg-[#0EA5E9]' : 'bg-[#E0F2FE]'}
          `}>
            <Upload className={`w-8 h-8 sm:w-12 sm:h-12 ${isDragging ? 'text-white' : 'text-[#0EA5E9]'}`} />
          </div>

          <div className="text-center space-y-1 sm:space-y-2">
            <p className="text-base sm:text-lg font-semibold text-gray-900">
              {isDragging ? '释放以上传图片' : '拖拽图片到这里'}
            </p>
            <p className="text-xs sm:text-sm text-gray-500">
              或者点击选择文件
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400">
              支持 PNG、JPG、JPEG、GIF、BMP、WebP • 单张最大 10MB
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            className="mt-2 border-[#0EA5E9] text-[#0EA5E9] hover:bg-[#0EA5E9] hover:text-white"
            disabled={disabled}
          >
            <FileImage className="w-4 h-4 mr-2" />
            选择图片
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-[#F8FAFC] border border-gray-200 rounded-lg">
        <h4 className="text-xs sm:text-sm font-semibold text-gray-900 mb-1 sm:mb-2">使用说明</h4>
        <ul className="text-[10px] sm:text-xs text-gray-600 space-y-0.5 sm:space-y-1">
          <li>• 支持批量上传，最多可处理 20 张图片</li>
          <li>• 请确保图片中的文字清晰可辨</li>
          <li>• 建议分辨率：1000x800px 或更高</li>
          <li>• 文字与背景应有足够对比度</li>
          <li>• 图片数据仅在本地处理，不会上传到服务器</li>
        </ul>
        <div className="mt-2 sm:mt-3 pt-2 sm:pt-3 border-t border-gray-200">
          <p className="text-[10px] sm:text-xs text-gray-500">
            💡 <span className="font-semibold">提示：</span>
            如果识别失败，请尝试使用更高清、对比度更高的图片
          </p>
        </div>
      </div>
    </div>
  );
}

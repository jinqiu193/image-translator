'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Settings } from 'lucide-react';

export type TargetLanguage = 'en' | 'th';

interface TranslationOptions {
  autoDetectRegion: boolean;
  useTerminology: boolean;
  checkConsistency: boolean;
  targetLang?: TargetLanguage;
}

interface QuickOptionsProps {
  options: TranslationOptions;
  onOptionsChange: (options: TranslationOptions) => void;
  disabled?: boolean;
}

export default function QuickOptions({
  options,
  onOptionsChange,
  disabled = false,
}: QuickOptionsProps) {
  const handleOptionChange = (key: keyof TranslationOptions) => (
    checked: boolean
  ) => {
    onOptionsChange({ ...options, [key]: checked });
  };

  const enabledCount =
    (options.autoDetectRegion ? 1 : 0) +
    (options.useTerminology ? 1 : 0) +
    (options.checkConsistency ? 1 : 0);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" disabled={disabled}>
          <Settings className="w-4 h-4 mr-2" />
          选项
          {enabledCount > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-[#0EA5E9] text-white rounded-full text-[10px]">
              {enabledCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="end">
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900 text-sm">翻译选项</h3>

          {/* 使用术语库 */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Label className="text-sm font-medium text-gray-900 cursor-pointer">
                医疗术语库
              </Label>
              <p className="text-xs text-gray-500">
                使用内置术语翻译
              </p>
            </div>
            <Switch
              checked={options.useTerminology}
              onCheckedChange={handleOptionChange('useTerminology')}
              disabled={disabled}
            />
          </div>

          {/* 一致性检查 */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Label className="text-sm font-medium text-gray-900 cursor-pointer">
                术语一致性
              </Label>
              <p className="text-xs text-gray-500">
                检查翻译一致性
              </p>
            </div>
            <Switch
              checked={options.checkConsistency}
              onCheckedChange={handleOptionChange('checkConsistency')}
              disabled={disabled}
            />
          </div>

          {/* 自动识别区域 */}
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <Label className="text-sm font-medium text-gray-900 cursor-pointer">
                自动识别区域
              </Label>
              <p className="text-xs text-gray-500">
                分类文本位置
              </p>
            </div>
            <Switch
              checked={options.autoDetectRegion}
              onCheckedChange={handleOptionChange('autoDetectRegion')}
              disabled={disabled}
            />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export type { TranslationOptions };

'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface TranslationOptions {
  autoDetectRegion: boolean;
  useTerminology: boolean;
  checkConsistency: boolean;
}

interface OptionsPanelProps {
  options: TranslationOptions;
  onOptionsChange: (options: TranslationOptions) => void;
  disabled?: boolean;
}

export default function OptionsPanel({
  options,
  onOptionsChange,
  disabled = false,
}: OptionsPanelProps) {
  const handleOptionChange = (key: keyof TranslationOptions) => (
    checked: boolean
  ) => {
    onOptionsChange({ ...options, [key]: checked });
  };

  return (
    <div className="w-full mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">翻译选项</h3>

      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
        {/* 自动识别区域 */}
        <div className="flex items-start space-x-4">
          <Checkbox
            id="autoDetectRegion"
            checked={options.autoDetectRegion}
            onCheckedChange={handleOptionChange('autoDetectRegion')}
            disabled={disabled}
            className="mt-1"
          />
          <div className="flex-1">
            <Label
              htmlFor="autoDetectRegion"
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              自动识别区域
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              根据文本在图片中的位置自动分类为导航栏、内容区、按钮等区域
            </p>
          </div>
        </div>

        {/* 使用术语库 */}
        <div className="flex items-start space-x-4">
          <Checkbox
            id="useTerminology"
            checked={options.useTerminology}
            onCheckedChange={handleOptionChange('useTerminology')}
            disabled={disabled}
            className="mt-1"
          />
          <div className="flex-1">
            <Label
              htmlFor="useTerminology"
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              使用医疗术语库
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              使用内置的医疗行业专用术语库进行翻译，确保专业术语翻译准确
            </p>
            <p className="text-xs text-[#0EA5E9] mt-1">
              术语库包含约 200+ 医疗、输液监控系统专业词汇
            </p>
          </div>
        </div>

        {/* 一致性检查 */}
        <div className="flex items-start space-x-4">
          <Checkbox
            id="checkConsistency"
            checked={options.checkConsistency}
            onCheckedChange={handleOptionChange('checkConsistency')}
            disabled={disabled}
            className="mt-1"
          />
          <div className="flex-1">
            <Label
              htmlFor="checkConsistency"
              className="text-sm font-semibold text-gray-900 cursor-pointer"
            >
              术语一致性检查
            </Label>
            <p className="text-xs text-gray-500 mt-1">
              检查同一中文术语在不同图片中的英文翻译是否一致，不一致的项会标记
            </p>
            <p className="text-xs text-amber-600 mt-1">
              不一致的术语将在结果表中用橙色背景标记
            </p>
          </div>
        </div>
      </div>

      {/* 选项说明卡片 */}
      <div className="mt-4 p-4 bg-[#F8FAFC] border border-gray-200 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">选项说明</h4>
        <div className="grid gap-3 text-xs text-gray-600">
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#0EA5E9] mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">自动识别区域：</span>
              <span>
                启用后，系统会根据文本坐标自动分类（顶部→导航栏、中部→内容区、底部→底部栏），提高表格可读性
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#10B981] mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">使用医疗术语库：</span>
              <span>
                启用后，优先使用内置医疗术语库翻译（如"输液"→"Infusion"，"滴速"→"Drop Rate"），避免通用翻译错误
              </span>
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-1.5 flex-shrink-0" />
            <div>
              <span className="font-semibold">术语一致性检查：</span>
              <span>
                启用后，批量翻译时会检查同一中文术语的英文翻译是否一致，确保文档的专业性和统一性
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { TranslationOptions };

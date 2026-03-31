'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface PromptEditorProps {
  onPromptChange?: (prompt: string) => void;
  onLangChange?: (lang: 'en' | 'th') => void;
}

const DEFAULT_PROMPT = `识别图片中的文字并翻译为英文。返回JSON数组格式：
[{"chinese":"中文原文","english":"英文翻译","region":"位置区域"}]
图片无文字则返回空数组。请准确翻译，保持简洁。`;

const PRESET_PROMPTS = [
  {
    name: '简洁模式（英）',
    lang: 'en',
    prompt: `识别图片中的文字并翻译为英文。返回JSON数组格式：
[{"chinese":"中文原文","english":"英文翻译","region":"位置区域"}]
图片无文字则返回空数组。请准确翻译，保持简洁。`,
  },
  {
    name: '详细模式（英）',
    lang: 'en',
    prompt: `你是一个OCR识别和翻译助手。请仔细识别图片中的所有文字，并将中文翻译为英文。

要求：
1. 识别图片中的所有文本（包括中文和英文）
2. 将中文翻译为英文
3. 返回JSON数组格式：
[{"chinese":"中文原文","english":"英文翻译","region":"文本位置区域"}]
4. 如果图片中没有文字，返回空数组 []

请准确识别并翻译，保持简洁。`,
  },
  {
    name: '医疗术语模式（英）',
    lang: 'en',
    prompt: `你是一个医疗领域的OCR识别和翻译助手。请仔细识别图片中的所有文字，并将中文翻译为英文。

重要术语参考：
- 输液 → Infusion
- 滴速 → Drop Rate
- 余液 → Remaining Fluid
- 输液监控 → Infusion Monitoring
- 空瓶 → Empty Bottle
- 气泡 → Air Bubble
- 堵塞 → Blockage
- 报警 → Alarm

返回格式：
[{"chinese":"中文原文","english":"英文翻译","region":"位置区域"}]

图片无文字则返回空数组。`,
  },
  {
    name: '简洁模式（泰）',
    lang: 'th',
    prompt: `识别图片中的文字并翻译为泰文。返回JSON数组格式：
[{"chinese":"中文原文","thai":"泰文翻译","region":"位置区域"}]
图片无文字则返回空数组。请准确翻译，保持简洁。`,
  },
  {
    name: '详细模式（泰）',
    lang: 'th',
    prompt: `你是一个OCR识别和翻译助手。请仔细识别图片中的所有文字，并将中文翻译为泰文。

要求：
1. 识别图片中的所有文本（包括中文和泰文）
2. 将中文翻译为泰文
3. 返回JSON数组格式：
[{"chinese":"中文原文","thai":"泰文翻译","region":"文本位置区域"}]
4. 如果图片中没有文字，返回空数组 []

请准确识别并翻译，保持简洁。`,
  },
  {
    name: '医疗术语模式（泰）',
    lang: 'th',
    prompt: `你是一个医疗领域的OCR识别和翻译助手。请仔细识别图片中的所有文字，并将中文翻译为泰文。

重要术语参考：
- 输液 → การฉีดยา (Infusion)
- 滴速 → อัตราหยด (Drop Rate)
- 余液 → ยาที่เหลือ (Remaining Fluid)
- 输液监控 → การตรวจสอบการฉีดยา (Infusion Monitoring)
- 空瓶 → ขวดเปล่า (Empty Bottle)
- 气泡 → ฟองอากาศ (Air Bubble)
- 堵塞 → อุดตัน (Blockage)
- 报警 → การแจ้งเตือน (Alarm)

返回格式：
[{"chinese":"中文原文","thai":"泰文翻译","region":"位置区域"}]

图片无文字则返回空数组。`,
  },
];

export function PromptEditor({ onPromptChange }: PromptEditorProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState(DEFAULT_PROMPT);
  const [saved, setSaved] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // 从 localStorage 加载 Prompt（仅在组件挂载时执行一次）
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const savedPrompt = localStorage.getItem('custom-prompt');
    const savedLang = localStorage.getItem('selected-target-lang') as 'en' | 'th' | null;

    if (savedPrompt) {
      setPrompt(savedPrompt);
      setSelectedPreset('custom');
    } else if (savedLang) {
      // 没有自定义 prompt 时，自动选择当前语言对应的第一个预设
      const firstPresetOfLang = PRESET_PROMPTS.find(p => p.lang === savedLang);
      if (firstPresetOfLang) {
        setPrompt(firstPresetOfLang.prompt);
        setSelectedPreset(firstPresetOfLang.name);
      }
    }
  }, []); // 空依赖数组，仅执行一次

  // 检查当前 prompt 是否匹配某个预设
  const checkPresetMatch = (presetPrompt: string): boolean => {
    return prompt.trim() === presetPrompt.trim();
  };

  // 选择预设模板
  const handleSelectPreset = (preset: typeof PRESET_PROMPTS[0]) => {
    setPrompt(preset.prompt);
    setSelectedPreset(preset.name);
    // 自动保存目标语言并通知父组件
    if (preset.lang && typeof window !== 'undefined') {
      localStorage.setItem('selected-target-lang', preset.lang);
      onLangChange?.(preset.lang);
    }
  };

  // 保存 Prompt
  const handleSave = () => {
    localStorage.setItem('custom-prompt', prompt);
    setSaved(true);
    onPromptChange?.(prompt);

    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  // 重置为默认
  const handleReset = () => {
    setPrompt(DEFAULT_PROMPT);
    setSelectedPreset(null);
    localStorage.removeItem('custom-prompt');
    onPromptChange?.(DEFAULT_PROMPT);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <MessageSquare className="w-4 h-4 mr-2" />
          提示词
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>提示词设置</DialogTitle>
          <DialogDescription>
            自定义发送给视觉模型的提示词。提示词会直接影响OCR识别和翻译的效果。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 预设模板 */}
          <div className="space-y-2">
            <Label>预设模板</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_PROMPTS.map((preset) => {
                const isSelected = selectedPreset === preset.name || checkPresetMatch(preset.prompt);
                return (
                  <Button
                    key={preset.name}
                    variant={isSelected ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-xs ${isSelected ? 'bg-[#0EA5E9] hover:bg-[#0284C7]' : ''}`}
                  >
                    {preset.name}
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Prompt 编辑器 */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="prompt-input">自定义提示词</Label>
              <span className="text-xs text-gray-400">
                {prompt.length} 字符
              </span>
            </div>
            <Textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="输入你的自定义提示词..."
              className="min-h-[200px] font-mono text-sm"
            />
          </div>

          {/* 提示 */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs text-amber-800">
              <span className="font-semibold">💡 提示：</span>
              提示词中请包含返回格式的说明，例如：
              <code className="bg-amber-100 px-1 rounded">
                [&#123;"chinese":"中文","english":"English","region":"位置"&#125;]
              </code>
            </p>
          </div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center space-x-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重置默认</span>
          </Button>
          <Button onClick={handleSave} className="flex items-center space-x-2">
            {saved ? (
              <>
                <span>已保存 ✓</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>保存</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function getCustomPrompt(): string {
  if (typeof window === 'undefined') return DEFAULT_PROMPT;
  return localStorage.getItem('custom-prompt') || DEFAULT_PROMPT;
}

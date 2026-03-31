'use client';

import { useState, useEffect } from 'react';
import { Settings, Eye, EyeOff, Save, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ModelConfig {
  modelName: string;
  apiKey: string;
  apiBaseUrl: string;
}

interface ConfigPanelProps {
  onConfigChange?: (config: ModelConfig) => void;
}

const DEFAULT_CONFIG: ModelConfig = {
  modelName: 'GLM-4.6V-Flash',
  apiKey: '',
  apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
};

const PRESET_MODELS = [
  {
    name: 'GLM-4.6V-Flash',
    baseUrl: 'https://open.bigmodel.cn/api/paas/v4',
    label: 'GLM-4.6V-Flash (智谱 AI)',
  },
  {
    name: 'gpt-4o',
    baseUrl: 'https://api.openai.com/v1',
    label: 'GPT-4o (OpenAI)',
  },
  {
    name: 'gpt-4o-mini',
    baseUrl: 'https://api.openai.com/v1',
    label: 'GPT-4o-mini (OpenAI)',
  },
  {
    name: 'claude-3-5-sonnet-20241022',
    baseUrl: 'https://api.anthropic.com/v1',
    label: 'Claude 3.5 Sonnet (Anthropic)',
  },
  {
    name: 'qwen-vl-max',
    baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    label: 'Qwen-VL-Max (通义千问)',
  },
];

export function ConfigPanel({ onConfigChange }: ConfigPanelProps) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ModelConfig>(DEFAULT_CONFIG);
  const [showApiKey, setShowApiKey] = useState(false);
  const [customModel, setCustomModel] = useState(false);
  const [saved, setSaved] = useState(false);

  // 从 localStorage 加载配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('model-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        setCustomModel(!PRESET_MODELS.find(m => m.name === parsed.modelName));
      } catch (e) {
        console.error('Failed to load config:', e);
      }
    }
  }, []);

  // 保存配置到 localStorage
  const handleSave = () => {
    if (!config.apiKey.trim()) {
      alert('请输入 API Key');
      return;
    }

    localStorage.setItem('model-config', JSON.stringify(config));
    setSaved(true);
    onConfigChange?.(config);

    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 1000);
  };

  // 重置为默认配置
  const handleReset = () => {
    setConfig(DEFAULT_CONFIG);
    setCustomModel(false);
    localStorage.removeItem('model-config');
    onConfigChange?.(DEFAULT_CONFIG);
  };

  // 选择预设模型
  const handleSelectModel = (modelName: string) => {
    const model = PRESET_MODELS.find(m => m.name === modelName);
    if (model) {
      setConfig({
        modelName: model.name,
        apiKey: config.apiKey,
        apiBaseUrl: model.baseUrl,
      });
      setCustomModel(false);
    } else {
      setCustomModel(true);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Settings className="w-4 h-4 mr-2" />
          模型配置
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>模型配置</DialogTitle>
          <DialogDescription>
            配置你自己的视觉模型和 API Key。支持 OpenAI、Anthropic、智谱 AI 等多种模型。
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 模型选择 */}
          <div className="space-y-2">
            <Label htmlFor="model-select">模型</Label>
            <Select
              value={customModel ? 'custom' : config.modelName}
              onValueChange={handleSelectModel}
            >
              <SelectTrigger id="model-select">
                <SelectValue placeholder="选择模型" />
              </SelectTrigger>
              <SelectContent>
                {PRESET_MODELS.map((model) => (
                  <SelectItem key={model.name} value={model.name}>
                    {model.label}
                  </SelectItem>
                ))}
                <SelectItem value="custom">自定义模型</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* 自定义模型名称 */}
          {customModel && (
            <div className="space-y-2">
              <Label htmlFor="custom-model">自定义模型名称</Label>
              <Input
                id="custom-model"
                value={config.modelName}
                onChange={(e) =>
                  setConfig({ ...config, modelName: e.target.value })
                }
                placeholder="例如: my-custom-vision-model"
              />
            </div>
          )}

          {/* API Base URL */}
          {!customModel && (
            <div className="space-y-2">
              <Label htmlFor="api-url">API Base URL</Label>
              <Input
                id="api-url"
                value={config.apiBaseUrl}
                onChange={(e) =>
                  setConfig({ ...config, apiBaseUrl: e.target.value })
                }
                placeholder="例如: https://api.openai.com/v1"
              />
            </div>
          )}

          {/* API Key */}
          <div className="space-y-2">
            <Label htmlFor="api-key">API Key</Label>
            <div className="flex space-x-2">
              <Input
                id="api-key"
                type={showApiKey ? 'text' : 'password'}
                value={config.apiKey}
                onChange={(e) =>
                  setConfig({ ...config, apiKey: e.target.value })
                }
                placeholder="输入你的 API Key"
                className="flex-1"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setShowApiKey(!showApiKey)}
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              你的 API Key 只会保存在本地浏览器中，不会上传到服务器。
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
                <span>保存配置</span>
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { ModelConfig };

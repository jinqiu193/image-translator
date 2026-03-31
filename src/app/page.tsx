'use client';

import { useState, useEffect } from 'react';
import { Bot, Sparkles, ArrowRight, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import UploadZone from '@/components/UploadZone';
import ImagePreview, { createImageFile } from '@/components/ImagePreview';
import QuickOptions, { TranslationOptions } from '@/components/QuickOptions';
import ProgressBar from '@/components/ProgressBar';
import ResultTable from '@/components/ResultTable';
import { ConfigPanel, type ModelConfig } from '@/components/ConfigPanel';
import { TerminologyManagement } from '@/components/TerminologyManagement';
import { PromptEditor } from '@/components/PromptEditor';
import { useExcel } from '@/hooks/useExcel';
import { translateAllImages, type TranslationProgress, type TranslationResult } from '@/lib/translator';
import type { ImageFile } from '@/components/ImagePreview';

const DEFAULT_MODEL_CONFIG: ModelConfig = {
  modelName: 'GLM-4.6V-Flash',
  apiKey: '',
  apiBaseUrl: 'https://open.bigmodel.cn/api/paas/v4',
};

export default function Home() {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [options, setOptions] = useState<TranslationOptions>({
    autoDetectRegion: true,
    useTerminology: true,
    checkConsistency: true,
  });
  const [modelConfig, setModelConfig] = useState<ModelConfig>(DEFAULT_MODEL_CONFIG);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<TranslationProgress>({
    stage: 'complete',
    currentImage: 0,
    totalImages: 0,
    progress: 0,
    message: '',
  });
  const [results, setResults] = useState<TranslationResult[]>([]);
  const { downloadExcel } = useExcel();

  // 从 localStorage 加载模型配置
  useEffect(() => {
    const savedConfig = localStorage.getItem('model-config');
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setModelConfig(parsed);
      } catch (e) {
        console.error('Failed to load model config:', e);
      }
    }

    // 加载自定义 Prompt
    const savedPrompt = localStorage.getItem('custom-prompt');
    if (savedPrompt) {
      setOptions(prev => ({ ...prev, customPrompt: savedPrompt }));
    }

    // 加载目标语言
    const savedLang = localStorage.getItem('selected-target-lang') as 'en' | 'th' | null;
    if (savedLang) {
      setOptions(prev => ({ ...prev, targetLang: savedLang }));
    }
  }, []);

  const handleFilesSelected = (files: File[]) => {
    const newImages = files.map(createImageFile);
    setImages((prev) => {
      const combined = [...prev, ...newImages];
      // 限制最多 20 张
      return combined.slice(0, 20);
    });
  };

  const handleRemoveImage = (id: string) => {
    setImages((prev) => {
      const image = prev.find((img) => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter((img) => img.id !== id);
    });
  };

  const handleStartTranslation = async () => {
    if (images.length === 0) return;

    // 检查是否配置了 API Key
    if (!modelConfig.apiKey) {
      alert('请先配置 API Key。点击右上角的"模型配置"按钮进行设置。');
      return;
    }

    setIsProcessing(true);
    setResults([]);

    try {
      const translationResults = await translateAllImages(
        images.map((img) => img.file),
        options,
        modelConfig,
        (p) => setProgress(p)
      );
      setResults(translationResults);
    } catch (error) {
      console.error('Translation error:', error);

      // 提供更详细的错误信息
      let errorMessage = '翻译过程中出现错误，请重试';

      if (error instanceof Error) {
        if (error.message.includes('size')) {
          errorMessage = error.message;
        } else if (error.message.includes('format')) {
          errorMessage = error.message;
        } else if (error.message.includes('访问量较大') || error.message.includes('稍后再试')) {
          errorMessage = '当前服务访问量较大，系统已自动重试。如仍失败，建议等待 30 秒后重试。';
        } else if (error.message.includes('API')) {
          errorMessage = '视觉模型 API 调用失败，请检查网络连接或稍后重试';
        } else {
          errorMessage = error.message;
        }
      }

      alert(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownloadExcel = () => {
    downloadExcel(results);
  };

  const handleNewTask = () => {
    // 清理预览 URL
    images.forEach((img) => URL.revokeObjectURL(img.preview));
    setImages([]);
    setResults([]);
    setProgress({
      stage: 'complete',
      currentImage: 0,
      totalImages: 0,
      progress: 0,
      message: '',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F8FAFC] via-white to-[#F0F9FF]">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-gradient-to-br from-[#0EA5E9] to-[#10B981] rounded-lg sm:rounded-xl">
                <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-base sm:text-xl font-bold text-gray-900 leading-tight">图片翻译表格</h1>
                <p className="text-xs text-gray-500 hidden sm:block">Medical Image Translation</p>
              </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
              <QuickOptions options={options} onOptionsChange={setOptions} disabled={isProcessing} />
              <PromptEditor onPromptChange={(prompt) => setOptions(prev => ({ ...prev, customPrompt: prompt }))} onLangChange={(lang) => setOptions(prev => ({ ...prev, targetLang: lang }))} />
              <TerminologyManagement />
              <ConfigPanel onConfigChange={setModelConfig} />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {!results.length && !isProcessing && (
        <section className="container mx-auto px-3 sm:px-4 py-6 sm:py-12 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-[#0EA5E9]/10 px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-[#0EA5E9]" />
              <span className="text-sm font-medium text-[#0EA5E9]">
                视觉模型 OCR • GLM-4.6V-Flash
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              将中文界面截图翻译为
              <span className="bg-gradient-to-r from-[#0EA5E9] to-[#10B981] bg-clip-text text-transparent">
                {' '}中英对照表格
              </span>
            </h2>

            <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
              使用先进的视觉模型进行 OCR 识别，准确率大幅提升。
              <br className="hidden sm:inline" />
              支持医疗术语翻译、一致性检查，一键导出 Excel。
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto mb-8 sm:mb-12">
              <FeatureCard
                icon={Shield}
                title="视觉模型"
                description="使用 GLM-4.6V-Flash，识别准确率更高"
              />
              <FeatureCard
                icon={Sparkles}
                title="医疗术语库"
                description="内置 200+ 医疗行业专业词汇"
              />
              <FeatureCard
                icon={ArrowRight}
                title="批量处理"
                description="最多支持 20 张图片同时处理"
              />
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 pb-24">
        {/* 上传区域 */}
        {!results.length && !isProcessing && (
          <div className="max-w-4xl mx-auto space-y-6">
            {images.length > 0 && (
              <Button
                onClick={handleStartTranslation}
                disabled={isProcessing}
                className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#10B981] hover:from-[#0284C7] hover:to-[#059669] text-white font-semibold py-6 text-lg"
                size="lg"
              >
                {isProcessing ? (
                  <>
                    <Sparkles className="w-5 h-5 mr-2 animate-spin" />
                    处理中...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    开始翻译 ({images.length} 张图片)
                  </>
                )}
              </Button>
            )}
            <UploadZone
              onFilesSelected={handleFilesSelected}
              disabled={isProcessing}
            />
            <ImagePreview
              images={images}
              onRemove={handleRemoveImage}
              disabled={isProcessing}
              maxImages={20}
            />
          </div>
        )}

        {/* 进度显示 */}
        {isProcessing && (
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>正在处理</CardTitle>
              </CardHeader>
              <CardContent>
                <ProgressBar progress={progress} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* 结果显示 */}
        {results.length > 0 && !isProcessing && (
          <div className="max-w-6xl mx-auto">
            <ResultTable
              results={results}
              options={options}
              onDownloadExcel={handleDownloadExcel}
              onNewTask={handleNewTask}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white/95 backdrop-blur-sm z-50">
        <div className="container mx-auto px-4 py-2 sm:py-3">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-3 text-[10px] sm:text-xs text-gray-400">
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <span>© 2024 LobsterAI</span>
              <span className="hidden sm:inline">|</span>
              <span>图片翻译表格</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">术语库来源：医疗行业、输液监控系统专业词汇</span>
            </div>
            <div>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <Card className="border-gray-200 hover:border-[#0EA5E9] transition-colors">
      <CardContent className="pt-4 sm:pt-6">
        <div className="flex items-start space-x-2 sm:space-x-3">
          <div className="p-1.5 sm:p-2 bg-[#E0F2FE] rounded-lg">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#0EA5E9]" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-0.5 sm:mb-1 text-sm sm:text-base">{title}</h3>
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

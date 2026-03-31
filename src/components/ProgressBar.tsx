'use client';

import { Clock, FileText, CheckCircle2, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import type { TranslationProgress } from '@/lib/translator';

interface ProgressBarProps {
  progress: TranslationProgress;
}

export default function ProgressBar({ progress }: ProgressBarProps) {
  const getStageInfo = (stage: TranslationProgress['stage']) => {
    switch (stage) {
      case 'loading':
        return {
          icon: Loader2,
          color: 'text-[#0EA5E9]',
          bgColor: 'bg-[#E0F2FE]',
          label: '加载中',
        };
      case 'recognizing':
        return {
          icon: FileText,
          color: 'text-[#10B981]',
          bgColor: 'bg-[#D1FAE5]',
          label: 'OCR 识别',
        };
      case 'translating':
        return {
          icon: Clock,
          color: 'text-[#0EA5E9]',
          bgColor: 'bg-[#E0F2FE]',
          label: '翻译中',
        };
      case 'checking':
        return {
          icon: CheckCircle2,
          color: 'text-[#F59E0B]',
          bgColor: 'bg-[#FEF3C7]',
          label: '一致性检查',
        };
      case 'complete':
        return {
          icon: CheckCircle2,
          color: 'text-[#10B981]',
          bgColor: 'bg-[#D1FAE5]',
          label: '完成',
        };
      default:
        return {
          icon: Loader2,
          color: 'text-gray-400',
          bgColor: 'bg-gray-100',
          label: '处理中',
        };
    }
  };

  const stageInfo = getStageInfo(progress.stage);
  const Icon = stageInfo.icon;

  return (
    <div className="w-full">
      {/* 进度条 */}
      <div className="mb-4">
        <Progress value={progress.progress} className="h-2" />
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span>{Math.round(progress.progress)}%</span>
          <span>
            {progress.currentImage} / {progress.totalImages} 张图片
          </span>
        </div>
      </div>

      {/* 状态卡片 */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center space-x-3">
          <div className={`p-3 rounded-full ${stageInfo.bgColor}`}>
            <Icon
              className={`w-6 h-6 ${stageInfo.color} ${
                progress.stage !== 'complete' && progress.stage !== 'loading'
                  ? 'animate-pulse'
                  : ''
              }`}
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-semibold text-gray-900">
                {stageInfo.label}
              </span>
              {progress.stage === 'recognizing' && (
                <span className="text-xs text-[#0EA5E9]">
                  ({progress.currentImage}/{progress.totalImages})
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">{progress.message}</p>
          </div>
        </div>

        {/* 分阶段进度指示 */}
        <div className="mt-4 grid grid-cols-4 gap-2">
          <StageIndicator
            label="OCR 识别"
            active={progress.stage === 'recognizing'}
            completed={progress.stage !== 'loading'}
          />
          <StageIndicator
            label="翻译"
            active={progress.stage === 'translating'}
            completed={
              progress.stage === 'checking' || progress.stage === 'complete'
            }
          />
          <StageIndicator
            label="检查"
            active={progress.stage === 'checking'}
            completed={progress.stage === 'complete'}
          />
          <StageIndicator
            label="完成"
            active={progress.stage === 'complete'}
            completed={progress.stage === 'complete'}
          />
        </div>
      </div>
    </div>
  );
}

interface StageIndicatorProps {
  label: string;
  active: boolean;
  completed: boolean;
}

function StageIndicator({ label, active, completed }: StageIndicatorProps) {
  return (
    <div
      className={`
        flex items-center justify-center px-3 py-2 rounded-lg text-xs font-medium transition-all
        ${completed
          ? 'bg-[#10B981] text-white'
          : active
          ? 'bg-[#0EA5E9] text-white'
          : 'bg-gray-100 text-gray-400'
        }
      `}
    >
      {completed ? '✓' : ''} {label}
    </div>
  );
}

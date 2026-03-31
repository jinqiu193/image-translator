/**
 * OCR 识别与翻译引擎
 * 使用视觉模型 GLM-4.6V-Flash 进行 OCR 识别和翻译
 */

import { findTermsInText, findTranslation, findTranslationByLang, type TermMapping } from './terminology';

// ==================== 翻译结果缓存 ====================

interface CacheEntry {
  results: any[];
  timestamp: number;
}

// 翻译结果缓存（基于文件内容的 hash + 目标语言）
const translationCache = new Map<string, CacheEntry>();

// 缓存有效期：5 分钟
const CACHE_TTL = 5 * 60 * 1000;

/**
 * 生成缓存 key：文件 hash + 目标语言
 */
async function generateCacheKey(file: File, targetLang: string): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const fileHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  return `${fileHash}_${targetLang}`;
}

/**
 * 获取缓存的翻译结果
 */
async function getCachedResults(file: File, targetLang: string): Promise<any[] | null> {
  const key = await generateCacheKey(file, targetLang);
  const entry = translationCache.get(key);

  if (!entry) return null;

  // 检查是否过期
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    translationCache.delete(key);
    return null;
  }

  return entry.results;
}

/**
 * 设置翻译结果缓存
 */
async function setCachedResults(file: File, results: any[], targetLang: string): Promise<void> {
  const key = await generateCacheKey(file, targetLang);
  translationCache.set(key, {
    results,
    timestamp: Date.now(),
  });

  // 防止缓存无限增长，限制最大缓存数量
  if (translationCache.size > 50) {
    // 删除最老的条目
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    for (const [key, entry] of translationCache) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }
    if (oldestKey) {
      translationCache.delete(oldestKey);
    }
  }
}

/**
 * 清除所有缓存
 */
export function clearTranslationCache(): void {
  translationCache.clear();
}

/**
 * 使用术语库对翻译结果进行替换修正
 * @param chinese 中文原文
 * @param translation 模型的翻译结果
 * @param targetLang 目标语言 'en' | 'th'
 * @returns 修正后的翻译和是否进行了术语替换
 */
function applyTerminologyReplacement(
  chinese: string,
  translation: string,
  targetLang: 'en' | 'th' = 'en'
): { translation: string; isTerminologyMatched: boolean } {
  // 精确匹配：检查整个中文文本是否在术语库中
  const exactMatch = findTranslationByLang(chinese, targetLang);
  if (exactMatch) {
    return {
      translation: exactMatch,
      isTerminologyMatched: true,
    };
  }

  // 部分匹配：检查中文文本中是否包含术语库中的词汇
  const termsInText = findTermsInText(chinese);
  if (termsInText.length > 0) {
    // 按长度降序排序，优先处理长词条
    termsInText.sort((a, b) => b.cn.length - a.cn.length);

    let result = translation;
    let replaced = false;

    for (const term of termsInText) {
      // 检查术语是否在中文文本中
      if (chinese.includes(term.cn)) {
        const targetTranslation = targetLang === 'th' ? term.th : term.en;
        if (!targetTranslation) continue;

        // 构建可能的同义词模式（处理模型翻译不准确的情况）
        // 例如：术语是 "输液监控" → "Infusion Monitoring"
        // 模型可能翻译为：Infusion Monitor, Infusion monitoring, Monitor 等

        // 检查模型翻译中是否包含相关但不完全匹配的术语
        const lowerTranslation = result.toLowerCase();

        // 如果模型翻译中已经包含正确的术语，不需要替换
        if (lowerTranslation.includes(targetTranslation.toLowerCase())) {
          continue;
        }

        // 尝试找到并替换可能的错误翻译
        // 这里使用简单的启发式方法：检测可能的同义词模式
        const possiblePatterns = generatePossiblePatterns(targetTranslation);

        for (const pattern of possiblePatterns) {
          if (lowerTranslation.includes(pattern.toLowerCase())) {
            result = result.replace(new RegExp(pattern, 'gi'), targetTranslation);
            replaced = true;
            break;
          }
        }

        // 如果没有找到任何模式匹配，尝试直接追加正确术语（针对短文本）
        if (!replaced && result.length < 50) {
          // 检查是否已经包含这个词的某种形式
          const baseWord = targetTranslation.split(' ')[0].toLowerCase();
          if (!lowerTranslation.includes(baseWord)) {
            // 简单追加或前缀
            result = targetTranslation + (result ? ' ' + result : '');
            replaced = true;
          }
        }
      }
    }

    if (replaced) {
      return {
        translation: result,
        isTerminologyMatched: true,
      };
    }
  }

  return {
    translation,
    isTerminologyMatched: false,
  };
}

/**
 * 生成可能的同义词模式
 */
function generatePossiblePatterns(correctTerm: string): string[] {
  const patterns: string[] = [correctTerm];

  // 单复数
  if (correctTerm.endsWith('s')) {
    patterns.push(correctTerm.slice(0, -1));
  } else {
    patterns.push(correctTerm + 's');
  }

  // ing 形式
  if (correctTerm.endsWith('ing')) {
    patterns.push(correctTerm.slice(0, -3));
    patterns.push(correctTerm.slice(0, -3) + 'ed');
  } else if (!correctTerm.includes(' ')) {
    patterns.push(correctTerm + 'ing');
    patterns.push(correctTerm + 'ed');
  }

  // 常见变体
  const commonVariants: Record<string, string[]> = {
    'Infusion Monitoring': ['Infusion Monitor', 'Infusion monitor', 'Monitor Infusion'],
    'Remaining Fluid': ['Remain Fluid', 'Remaining fluids', 'Fluid Remain'],
    'Drop Rate': ['Drops Rate', 'Drop rate', 'Rate Drop', 'Drip Rate'],
  };

  if (commonVariants[correctTerm]) {
    patterns.push(...commonVariants[correctTerm]);
  }

  return patterns;
}

export interface TranslationProgress {
  stage: 'loading' | 'recognizing' | 'translating' | 'checking' | 'complete';
  currentImage: number;
  totalImages: number;
  progress: number; // 0-100
  message: string;
}

export interface TranslatedItem {
  id: string;
  order: number;
  chinese: string;
  english: string;
  region: string;
  confidence: number;
  isInconsistent: boolean;
  isTerminologyMatched: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export interface TranslationResult {
  imageName: string;
  items: TranslatedItem[];
  stats: {
    total: number;
    terminologyMatched: number;
    inconsistent: number;
    hasError?: boolean;
  };
  errorMessage?: string;
}

export type TargetLanguage = 'en' | 'th';

export interface TranslationOptions {
  autoDetectRegion: boolean;
  useTerminology: boolean;
  checkConsistency: boolean;
  customPrompt?: string;
  targetLang?: TargetLanguage;
}

export interface ModelConfig {
  modelName: string;
  apiKey: string;
  apiBaseUrl: string;
}

/**
 * 使用视觉模型 API 进行 OCR 识别（带缓存和重试机制）
 */
export async function performVisionOCR(
  file: File,
  modelConfig: ModelConfig,
  onProgress?: (progress: number) => void,
  useTerminology: boolean = true,
  retryCount: number = 0,
  customPrompt?: string,
  targetLang: TargetLanguage = 'en'
): Promise<{ text: string; english: string; region: string }[]> {
  console.log('Starting Vision OCR for file:', file.name, 'Model:', modelConfig.modelName, 'Retry:', retryCount, 'TargetLang:', targetLang);

  onProgress?.(10);

  // 检查缓存（基于文件 hash + 目标语言）
  const cachedResults = await getCachedResults(file, targetLang);
  if (cachedResults) {
    console.log('Using cached results for:', file.name, 'lang:', targetLang);
    onProgress?.(100);
    return cachedResults;
  }

  try {
    // 创建 FormData
    const formData = new FormData();
    formData.append('file', file);
    formData.append('useTerminology', useTerminology.toString());
    formData.append('modelName', modelConfig.modelName);
    formData.append('apiKey', modelConfig.apiKey);
    formData.append('apiBaseUrl', modelConfig.apiBaseUrl);
    if (customPrompt) {
      formData.append('prompt', customPrompt);
    }
    formData.append('targetLang', targetLang);

    onProgress?.(30);

    // 调用 API
    const response = await fetch('/api/vision-ocr', {
      method: 'POST',
      body: formData,
    });

    onProgress?.(70);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Vision OCR API Error:', errorData);

      // 检查是否是限流错误，如果是则重试
      const isRateLimitError =
        errorData.error?.includes('访问量较大') ||
        errorData.error?.includes('稍后再试') ||
        errorData.error?.includes('1305');

      if (isRateLimitError && retryCount < 3) {
        console.log(`Rate limited, retrying... (${retryCount + 1}/3)`);
        // 等待 2 秒后重试
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return performVisionOCR(file, modelConfig, onProgress, useTerminology, retryCount + 1);
      }

      throw new Error(errorData.error || 'OCR 服务调用失败');
    }

    const data = await response.json();

    onProgress?.(90);

    if (!data.success || !data.results || !Array.isArray(data.results)) {
      console.error('Invalid API response:', data);
      throw new Error('OCR 服务返回无效数据');
    }

    console.log('Vision OCR results:', data.results);

    onProgress?.(100);

    // 映射结果
    const results = data.results.map((item: any) => ({
      text: item.text || item.chinese || item.english || '',
      english: item.english || item.text || '',
      region: item.region || '未分类',
    }));

    // 缓存结果
    await setCachedResults(file, results, targetLang);

    return results;
  } catch (error) {
    console.error('Vision OCR Error:', error);
    throw error;
  }
}

/**
 * 使用术语库翻译文本
 * @deprecated 视觉模型已内置翻译能力，此函数仅作备用
 */
export function translateWithTerminology(chinese: string): string | null {
  // 首先尝试完全匹配
  const exactMatch = findTranslation(chinese);
  if (exactMatch) {
    return exactMatch;
  }

  // 检查文本中是否包含术语库词汇
  const terms = findTermsInText(chinese);
  if (terms.length > 0) {
    let translated = chinese;
    // 按长度降序排序，优先匹配长文本
    terms.sort((a, b) => b.cn.length - a.cn.length);

    terms.forEach((term) => {
      translated = translated.replace(new RegExp(term.cn, 'g'), term.en);
    });

    return translated;
  }

  return null;
}

/**
 * 翻译单个图片
 */
export async function translateImage(
  file: File,
  options: TranslationOptions,
  imageHeight: number,
  modelConfig: ModelConfig,
  onProgress?: (progress: number) => void
): Promise<TranslatedItem[]> {
  console.log('Translating image:', file.name);

  try {
    // 使用视觉模型进行 OCR 和翻译
    const visionResults = await performVisionOCR(
      file,
      modelConfig,
      onProgress,
      options.useTerminology,
      0,
      options.customPrompt,
      options.targetLang || 'en'
    );

    console.log('Vision OCR results count:', visionResults.length);

    if (visionResults.length === 0) {
      console.warn('No text detected in image:', file.name);
      return [{
        id: `${file.name}-no-text`,
        order: 1,
        chinese: '未识别到文本',
        english: 'No text detected',
        region: '未分类',
        confidence: 0,
        isInconsistent: false,
        isTerminologyMatched: false,
      }];
    }

    // 格式化结果并应用术语库替换
    const targetLang = options.targetLang || 'en';
    const items: TranslatedItem[] = visionResults.map((result, index) => {
      // 使用术语库对翻译结果进行智能替换
      const { translation: finalTranslation, isTerminologyMatched } = applyTerminologyReplacement(
        result.text,
        result.english,
        targetLang
      );

      return {
        id: `${file.name}-${index}`,
        order: index + 1,
        chinese: result.text,
        english: finalTranslation,
        region: result.region,
        confidence: 100, // 视觉模型不提供置信度，设为 100
        isInconsistent: false,
        isTerminologyMatched,
      };
    });

    console.log(`Translated ${items.length} items`);

    return items;
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
}

/**
 * 检查术语一致性
 */
export function checkConsistency(
  results: TranslationResult[]
): TranslationResult[] {
  // 构建中文到英文的映射（记录每种中文术语的所有英文翻译）
  const termMap = new Map<string, Set<string>>();

  results.forEach((result) => {
    result.items.forEach((item) => {
      if (!termMap.has(item.chinese)) {
        termMap.set(item.chinese, new Set());
      }
      termMap.get(item.chinese)!.add(item.english);
    });
  });

  // 标记不一致的术语
  const inconsistentTerms = new Set<string>();
  termMap.forEach((englishSet, chinese) => {
    if (englishSet.size > 1) {
      inconsistentTerms.add(chinese);
    }
  });

  // 更新结果中的不一致标记
  return results.map((result) => ({
    ...result,
    items: result.items.map((item) => ({
      ...item,
      isInconsistent: inconsistentTerms.has(item.chinese),
    })),
    stats: {
      ...result.stats,
      inconsistent: result.items.filter((item) =>
        inconsistentTerms.has(item.chinese)
      ).length,
    },
  }));
}

/**
 * 统计术语匹配数
 */
function countTerminologyMatches(
  items: TranslatedItem[],
  useTerminology: boolean
): number {
  if (!useTerminology) return 0;

  return items.filter((item) => {
    const terminologyTranslation = translateWithTerminology(item.chinese);
    return terminologyTranslation !== null && item.english === terminologyTranslation;
  }).length;
}

/**
 * 并行处理图片翻译（带并发限制）
 */
async function processImagesWithConcurrency(
  files: File[],
  options: TranslationOptions,
  modelConfig: ModelConfig,
  concurrency: number,
  onProgress?: (progress: TranslationProgress) => void
): Promise<TranslationResult[]> {
  const results: TranslationResult[] = new Array(files.length);
  let completed = 0;
  let processedItems = 0;
  const totalItems = files.length;

  // 通知开始
  onProgress?.({
    stage: 'recognizing',
    currentImage: 0,
    totalImages: files.length,
    progress: 0,
    message: `开始并行处理 ${files.length} 张图片（同时处理 ${concurrency} 张）...`,
  });

  // 处理单个图片的函数
  const processOne = async (index: number, file: File): Promise<void> => {
    try {
      // 获取图片尺寸
      const imageHeight = await new Promise<number>((resolve) => {
        const img = new Image();
        img.onload = () => resolve(img.height);
        img.src = URL.createObjectURL(file);
      });

      // 翻译图片
      const items = await translateImage(file, options, imageHeight, modelConfig, (p) => {
        const currentProgress = ((completed * 100) + p) / totalItems;
        onProgress?.({
          stage: 'recognizing',
          currentImage: completed + 1,
          totalImages: files.length,
          progress: currentProgress,
          message: `正在翻译（${completed + 1}/${files.length}）`,
        });
      });

      results[index] = {
        imageName: file.name,
        items,
        stats: {
          total: items.length,
          terminologyMatched: items.filter((item) => item.isTerminologyMatched).length,
          inconsistent: 0,
          hasError: false,
        },
      };
    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      // 获取错误信息
      const errorMessage = error instanceof Error ? error.message : '未知错误';

      // 创建错误结果项
      const errorItem = {
        id: `${file.name}-error`,
        order: 1,
        chinese: `处理失败: ${errorMessage}`,
        english: `Failed: ${errorMessage.substring(0, 50)}`,
        region: '错误',
        confidence: 0,
        isInconsistent: false,
        isTerminologyMatched: false,
        isError: true,
        errorMessage: errorMessage,
      };

      results[index] = {
        imageName: file.name,
        items: [errorItem],
        stats: { total: 1, terminologyMatched: 0, inconsistent: 0, hasError: true },
        errorMessage: errorMessage,
      };

      // 在进度中显示失败
      onProgress?.({
        stage: 'recognizing',
        currentImage: completed + 1,
        totalImages: files.length,
        progress: ((completed + 1) / files.length) * 100,
        message: `⚠️ ${file.name} 处理失败: ${errorMessage.substring(0, 30)}`,
      });
    }

    completed++;
    onProgress?.({
      stage: 'recognizing',
      currentImage: completed,
      totalImages: files.length,
      progress: (completed / files.length) * 100,
      message: `已完成 ${completed}/${files.length} 张图片`,
    });
  };

  // 分批并行处理
  for (let i = 0; i < files.length; i += concurrency) {
    const batch = files.slice(i, i + concurrency);
    const batchPromises = batch.map((file, batchIndex) =>
      processOne(i + batchIndex, file)
    );
    await Promise.all(batchPromises);
  }

  return results;
}

/**
 * 翻译所有图片（并行优化版）
 */
export async function translateAllImages(
  files: File[],
  options: TranslationOptions,
  modelConfig: ModelConfig,
  onProgress?: (progress: TranslationProgress) => void
): Promise<TranslationResult[]> {
  // 并发数量：同时处理 3 张图片（避免 API 限流）
  const concurrency = 3;

  // 并行处理所有图片
  const results = await processImagesWithConcurrency(
    files,
    options,
    modelConfig,
    concurrency,
    onProgress
  );

  // 一致性检查
  if (options.checkConsistency) {
    onProgress?.({
      stage: 'checking',
      currentImage: files.length,
      totalImages: files.length,
      progress: 95,
      message: '正在检查术语一致性...',
    });

    const checkedResults = checkConsistency(results);

    onProgress?.({
      stage: 'complete',
      currentImage: files.length,
      totalImages: files.length,
      progress: 100,
      message: `翻译完成！共 ${results.length} 张图片`,
    });

    return checkedResults;
  }

  onProgress?.({
    stage: 'complete',
    currentImage: files.length,
    totalImages: files.length,
    progress: 100,
    message: `翻译完成！共 ${results.length} 张图片`,
  });

  return results;
}

/**
 * 获取总体统计信息
 */
export function getTotalStats(results: TranslationResult[]): {
  totalImages: number;
  totalItems: number;
  totalTerminologyMatched: number;
  totalInconsistent: number;
} {
  return {
    totalImages: results.length,
    totalItems: results.reduce((sum, r) => sum + r.stats.total, 0),
    totalTerminologyMatched: results.reduce(
      (sum, r) => sum + r.stats.terminologyMatched,
      0
    ),
    totalInconsistent: results.reduce(
      (sum, r) => sum + r.stats.inconsistent,
      0
    ),
  };
}

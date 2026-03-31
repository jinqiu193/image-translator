import { NextRequest, NextResponse } from 'next/server';

interface OCRResult {
  chinese: string;
  english: string;
  thai?: string;
  region: string;
}

interface MappedOCRResult {
  text: string;
  english: string;
  region: string;
  confidence: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const useTerminology = formData.get('useTerminology') === 'true';
    const modelName = formData.get('modelName') as string;
    const apiKey = formData.get('apiKey') as string;
    const apiBaseUrl = formData.get('apiBaseUrl') as string;
    const customPrompt = formData.get('prompt') as string;
    const targetLang = (formData.get('targetLang') as string) || 'en';

    if (!file) {
      return NextResponse.json({ error: '未找到文件' }, { status: 400 });
    }

    // 验证 API Key
    if (!apiKey) {
      return NextResponse.json(
        { error: '未配置 API Key，请在模型配置中设置' },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!file.type.match(/image\/(png|jpeg|jpg|gif|bmp|webp)/i)) {
      return NextResponse.json({ error: '不支持的图片格式' }, { status: 400 });
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: '图片大小超过 10MB 限制' }, { status: 400 });
    }

    // 将文件转换为 base64
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // 根据目标语言选择默认 Prompt
    const DEFAULT_PROMPT_EN = `识别图片中的文字并翻译为英文。返回JSON数组格式：
[{"chinese":"中文原文","english":"英文翻译","region":"位置区域"}]
图片无文字则返回空数组。请准确翻译，保持简洁。`;

    const DEFAULT_PROMPT_TH = `识别图片中的文字并翻译为泰文。返回JSON数组格式：
[{"chinese":"中文原文","thai":"泰文翻译","region":"位置区域"}]
图片无文字则返回空数组。请准确翻译，保持简洁。`;

    const prompt = customPrompt || (targetLang === 'th' ? DEFAULT_PROMPT_TH : DEFAULT_PROMPT_EN);

    // 构建完整的 API URL
    const apiUrl = apiBaseUrl.endsWith('/chat/completions')
      ? apiBaseUrl
      : `${apiBaseUrl}/chat/completions`;

    console.log(`Using model: ${modelName}, API: ${apiUrl}`);

    // 构建请求体
    const requestBody: any = {
      model: modelName,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`,
              },
            },
            {
              type: 'text',
              text: prompt,
            },
          ],
        },
      ],
      temperature: 0.3,
      max_tokens: 4096,  // 限制输出 token 数量，加快响应
    };

    // 禁用 thinking（仅 GLM 模型支持）- 关闭以加快响应速度
    if (modelName.startsWith('GLM')) {
      requestBody.thinking = {
        type: 'disabled',
      };
    }

    // 根据不同的 API 提供商调整 Authorization 格式
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (modelName.startsWith('claude')) {
      // Anthropic Claude 使用 x-api-key
      headers['x-api-key'] = apiKey;
      headers['anthropic-version'] = '2023-06-01';
      // Claude 需要特殊的请求格式
      requestBody.max_tokens = 4096;
    } else if (modelName.startsWith('qwen')) {
      // 阿里云通义千问使用 Bearer Token
      headers['Authorization'] = `Bearer ${apiKey}`;
    } else {
      // OpenAI 格式（包括 GLM）
      headers['Authorization'] = `Bearer ${apiKey}`;
    }

    // 调用视觉模型 API（60秒超时）
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(60000),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GLM API Error:', errorText);

      // 解析错误信息
      let userMessage = 'OCR 服务调用失败，请重试';
      try {
        const errorData = JSON.parse(errorText);
        if (errorData.error?.code === '1305') {
          userMessage = '当前服务访问量较大，请稍后再试（建议等待 30 秒后重试）';
        } else if (errorData.error?.message) {
          userMessage = `API 错误：${errorData.error.message}`;
        }
      } catch (e) {
        // JSON 解析失败，使用默认消息
      }

      return NextResponse.json(
        { error: userMessage, details: errorText },
        { status: 500 }
      );
    }

    const data = await response.json();

    // 提取响应内容
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return NextResponse.json({ error: '未返回识别结果' }, { status: 500 });
    }

    // 解析 JSON 响应
    let results: OCRResult[];
    try {
      // 尝试从内容中提取 JSON 数组
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        results = JSON.parse(jsonMatch[0]);
      } else {
        // 如果没有匹配到数组，尝试解析整个内容
        results = JSON.parse(content);
      }

      // 验证结果格式
      if (!Array.isArray(results)) {
        throw new Error('返回结果不是数组');
      }

      // 验证每个元素的结构
      const mappedResults: MappedOCRResult[] = results.map((item, index) => {
        // 根据目标语言取翻译字段：英文用 english，泰文用 thai
        const translation = targetLang === 'th'
          ? (item.thai || item.english || item.chinese || '')
          : (item.english || item.chinese || '');
        return {
          text: item.chinese || translation || '',
          english: translation,
          region: item.region || '未分类',
          confidence: 100, // 视觉模型不提供置信度，设为 100
        };
      });

      if (mappedResults.length === 0) {
        return NextResponse.json(
          { error: '未识别到文本' },
          { status: 400 }
        );
      }

      return NextResponse.json({ success: true, results: mappedResults });
    } catch (parseError) {
      console.error('JSON Parse Error:', parseError);
      console.error('Raw content:', content);
      return NextResponse.json(
        { error: '解析识别结果失败', rawContent: content },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: '服务器错误', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

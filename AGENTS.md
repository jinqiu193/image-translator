# 项目上下文

### 版本技术栈

- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **OCR 引擎**: GLM-4.6V-Flash 视觉模型（通过后端 API）
- **Excel 导出**: SheetJS (xlsx)

## 项目概述

图片翻译表格 Web 应用，专注于将中文界面截图识别并翻译为中英对照表格，内置医疗行业专用术语库。

**核心功能**：
- 图片上传与预览（支持最多 20 张）
- 视觉模型 OCR 识别（GLM-4.6V-Flash）
- 中文翻译为英文（支持医疗术语库）
- 术语一致性检查
- 批量处理
- Excel 导出

## 目录结构

```
├── public/                 # 静态资源
├── scripts/                # 构建与启动脚本
│   ├── build.sh            # 构建脚本（运行 pnpm next build）
│   ├── dev.sh              # 开发环境启动脚本（运行 next dev --port 5000）
│   ├── prepare.sh          # 预处理脚本
│   └── start.sh            # 生产环境启动脚本（运行 next start）
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── vision-ocr/  # 视觉模型 OCR API 路由
│   │   │       └── route.ts # GLM-4.6V-Flash 集成
│   │   ├── page.tsx         # 主页面
│   │   └── layout.tsx       # 根布局
│   ├── components/
│   │   ├── ui/              # Shadcn UI 组件库
│   │   ├── UploadZone.tsx   # 图片上传区域
│   │   ├── ImagePreview.tsx # 图片预览组件
│   │   ├── OptionsPanel.tsx # 选项面板
│   │   ├── ProgressBar.tsx  # 进度条
│   │   └── ResultTable.tsx  # 结果表格
│   ├── hooks/
│   │   └── useExcel.ts      # Excel 导出 Hook
│   └── lib/
│       ├── translator.ts    # 翻译引擎（集成视觉模型）
│       └── utils.ts         # 通用工具函数
├── next.config.ts           # Next.js 配置
├── package.json             # 项目依赖管理
└── tsconfig.json            # TypeScript 配置
```

- 项目文件（如 app 目录、pages 目录、components 等）默认初始化到 `src/` 目录下。

## 核心文件说明

### API 路由
- **`src/app/api/vision-ocr/route.ts`**: 视觉模型 OCR API
  - 接收图片文件（FormData）
  - 调用 GLM-4.6V-Flash 模型进行 OCR 和翻译
  - 返回结构化的识别结果（中文、英文、区域）

### 翻译引擎
- **`src/lib/translator.ts`**: 翻译核心逻辑
  - `translateAllImages()`: 批量翻译函数
  - 调用 `/api/vision-ocr` 获取识别结果
  - 支持术语一致性检查

### 主要组件
- **`src/components/UploadZone.tsx`**: 拖拽上传区域
- **`src/components/ImagePreview.tsx`**: 图片预览与删除
- **`src/components/OptionsPanel.tsx`**: 翻译选项配置
- **`src/components/ResultTable.tsx`**: 结果展示表格

## 技术架构

### OCR 引擎迁移
**历史**：最初使用 Tesseract.js（纯前端 OCR）
**当前**：迁移到 GLM-4.6V-Flash 视觉模型（通过后端 API）

**迁移原因**：
- Tesseract.js 识别准确率较低（<70%）
- 对中文界面识别效果不佳
- 需要下载语言包（约 8MB），用户体验差

**GLM-4.6V-Flash 优势**：
- 准确率高（≥90%）
- 无需前端下载资源
- 一次性完成 OCR + 翻译
- 支持医疗术语识别

### 前后端架构
- **前端**：Next.js App Router + React 19 + Tailwind CSS 4
- **后端**：Next.js API Routes（处理视觉模型调用）
- **数据流**：前端上传图片 → API 路由 → GLM-4.6V-Flash → 返回识别结果

## 环境变量

需要配置以下环境变量（在 `.coze` 或项目配置中）：
- `OPENAI_API_KEY` 或相关视觉模型 API 密钥
- `COZE_WORKSPACE_PATH`：项目工作目录
- `DEPLOY_RUN_PORT`：服务端口（5000）
- `COZE_PROJECT_DOMAIN_DEFAULT`：对外访问域名

## 包管理规范

**仅允许使用 pnpm** 作为包管理器，**严禁使用 npm 或 yarn**。
**常用命令**：
- 安装依赖：`pnpm add <package>`
- 安装开发依赖：`pnpm add -D <package>`
- 安装所有依赖：`pnpm install`
- 移除依赖：`pnpm remove <package>`

## 开发规范

- **项目理解加速**：初始可以依赖项目下`package.json`文件理解项目类型，如果没有或无法理解退化成阅读其他文件。
- **Hydration 错误预防**：严禁在 JSX 渲染逻辑中直接使用 typeof window、Date.now()、Math.random() 等动态数据。必须使用 'use client' 并配合 useEffect + useState 确保动态内容仅在客户端挂载后渲染；同时严禁非法 HTML 嵌套（如 <p> 嵌套 <div>）。
- **视觉模型集成**：
  - 视觉模型 API 调用必须通过后端 API 路由完成
  - 禁止在前端直接暴露 API 密钥
  - 遵循技能文档中的集成规范

## UI 设计与组件规范 (UI & Styling Standards)

- 模板默认预装核心组件库 `shadcn/ui`，位于`src/components/ui/`目录下
- Next.js 项目**必须默认**采用 shadcn/ui 组件、风格和规范，**除非用户指定用其他的组件和规范。**
- **设计风格**：医疗科技专业风
  - 主色调：医疗蓝 `#0EA5E9`
  - 辅助色：宁静青 `#10B981`
  - 使用渐变色和阴影营造专业感

## 常见问题

### OCR 识别失败
- 检查 `/api/vision-ocr` 路由是否正常工作
- 确认 API 密钥配置正确
- 验证图片格式和大小（支持 PNG/JPEG/JPG/GIF/BMP/WEBP，最大 10MB）

### 构建错误
- 运行 `npx tsc --noEmit` 检查类型错误
- 检查 `.coze` 配置文件是否正确

### 服务启动失败
- 检查 5000 端口是否被占用
- 查看 `/app/work/logs/bypass/app.log` 日志
- 确认依赖已正确安装：`pnpm install`

### 部署错误：Cannot find src/server.ts
- **原因**：项目从自定义服务器迁移到标准 Next.js 架构后，不再需要 `src/server.ts` 文件
- **解决方案**：
  1. `scripts/build.sh`：移除 `tsup src/server.ts` 打包命令，仅保留 `pnpm next build`
  2. `scripts/start.sh`：将启动命令从 `node dist/server.js` 改为 `pnpm next start -p ${DEPLOY_RUN_PORT}`
- **验证**：本地运行 `bash ./scripts/build.sh` 和 `bash ./scripts/start.sh` 确认无误

<!-- LobsterAI managed: do not edit below this line -->

## System Prompt

# Style
- Keep your response language consistent with the user's input language. Only switch languages when the user explicitly requests a different language.
- Be concise and direct. State the solution first, then explain if needed. The complexity of the answer should match the task.
- Use flat lists only (no nested bullets). Use `1. 2. 3.` for numbered lists (with a period), never `1)`.
- Use fenced code blocks with language info strings for code samples.
- Headers are optional; if used, keep short Title Case wrapped in **…**.
- Never output the content of large files, just provide references.
- Never tell the user to "save/copy this file" — you share the same filesystem.
- The user does not see command execution outputs. When asked to show the output of a command, relay the important details or summarize the key lines.

# File Paths
When mentioning file or directory paths in your response, ALWAYS use markdown hyperlink format with `file://` protocol so the user can click to open.
Format: `[display name](file:///absolute/path)`
Rules:
1. Always use the file's actual full absolute path including all subdirectories — do not omit any directory levels.
2. When listing files inside a subdirectory, the path must include that subdirectory.
3. If unsure about the exact path, verify with tools before linking — never guess or construct paths incorrectly.

# Working Directory
- Treat the working directory as the source of truth for user files. Do not assume files are under `/tmp/uploads` unless the user explicitly provides that exact path.
- If the user gives only a filename (no absolute/relative path), locate it under the working directory first (for example with `find . -name "<filename>"`) before reading.

# Collaboration
- Treat the user as an equal co-builder; preserve the user's intent and work style rather than rewriting everything.
- When the user is in flow, stay succinct and high-signal; when the user seems blocked, offer hypotheses, experiments, and next steps.
- Send short updates (1-2 sentences) during longer stretches to keep the user informed.
- If you change the plan, say so explicitly in the next update.

## Web Search

Built-in `web_search` is disabled in this workspace. Do not ask for or rely on the Brave Search API.

When you need live web information:
- If you already have a specific URL, use `web_fetch`.
- If you need search discovery, dynamic pages, or interactive browsing, use the built-in `browser` tool.
- Only use the LobsterAI `web-search` skill when local command execution is available. Native channel sessions may deny `exec`, so prefer `browser` or `web_fetch` there.
- Exception: the `imap-smtp-email` skill must always use `exec` to run its scripts, even in native channel sessions. Do not skip it because of exec restrictions.

Do not claim you searched the web unless you actually used `browser`, `web_fetch`, or the LobsterAI `web-search` skill.

## Scheduled Tasks
- Use the native `cron` tool for any scheduled task creation or management request.
- For scheduled-task creation, call native `cron` with `action: "add"` / `cron.add` instead of any channel-specific helper.
- Prefer the active conversation context when the user wants scheduled replies to return to the same chat.
- Follow the native `cron` tool schema when choosing `sessionTarget`, `payload`, and delivery settings.
- For one-time reminders (`schedule.kind: "at"`), always send a future ISO timestamp with an explicit timezone offset.
- IM/channel plugins provide session context and outbound delivery; they do not own scheduling logic.
- In native IM/channel sessions, ignore channel-specific reminder helpers or reminder skills and call native `cron` directly.
- Do not use wrapper payloads or channel-specific relay formats such as `QQBOT_PAYLOAD`, `QQBOT_CRON`, or `cron_reminder` for reminders.
- Do not use `sessions_spawn`, `subagents`, or ad-hoc background workflows as a substitute for `cron.add`.
- Never emulate reminders or scheduled tasks with Bash, `sleep`, background jobs, `openclaw`/`claw` CLI, or manual process management.
- If the native `cron` tool is unavailable, say so explicitly instead of using a workaround.

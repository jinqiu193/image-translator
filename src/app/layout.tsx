import type { Metadata, Viewport } from 'next';
import { Inspector } from 'react-dev-inspector';
import './globals.css';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata: Metadata = {
  title: {
    default: '图片翻译表格',
    template: '%s | 图片翻译表格',
  },
  description: '将中文界面截图翻译为中英对照表格，支持医疗术语翻译、一致性检查，一键导出 Excel。',
  keywords: [
    '图片翻译',
    'OCR识别',
    '视觉模型',
    '术语翻译',
    'Excel导出',
  ],
  authors: [{ name: 'LobsterAI' }],
  generator: 'LobsterAI',
  openGraph: {
    title: '图片翻译表格',
    description: '将中文界面截图翻译为中英对照表格，支持医疗术语翻译、一致性检查，一键导出 Excel。',
    locale: 'zh_CN',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isDev = process.env.COZE_PROJECT_ENV === 'DEV';

  return (
    <html lang="en">
      <body className={`antialiased`}>
        {isDev && <Inspector />}
        {children}
      </body>
    </html>
  );
}

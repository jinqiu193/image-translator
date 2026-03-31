/**
 * Excel 导出 Hook
 * 使用 SheetJS 生成中英对照 Excel 表格
 */

import * as XLSX from 'xlsx';
import type { TranslationResult } from '@/lib/translator';

export function useExcel() {
  const downloadExcel = (results: TranslationResult[]) => {
    // 创建工作簿
    const workbook = XLSX.utils.book_new();

    // 生成文件名
    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[-T:]/g, '');
    const filename = `图片翻译对照表_${timestamp}.xlsx`;

    // 创建说明 Sheet
    const createSummarySheet = () => {
      const summaryData = [
        ['图片翻译对照表'],
        ['', ''],
        ['生成时间', now.toLocaleString('zh-CN')],
        ['图片数量', results.length],
        ['', ''],
        ['统计信息'],
        ['总翻译项数', results.reduce((sum, r) => sum + r.stats.total, 0)],
        ['术语库匹配数', results.reduce((sum, r) => sum + r.stats.terminologyMatched, 0)],
        ['不一致项数', results.reduce((sum, r) => sum + r.stats.inconsistent, 0)],
        ['', ''],
        ['说明'],
        ['本文件包含以下 Sheet：'],
        ...results.map((r, i) => [`${i + 1}. ${r.imageName}`]),
        ['', ''],
        ['使用说明：'],
        ['1. 每个 Sheet 对应一张图片的翻译结果'],
        ['2. 表格包含：序号、位置/区域、中文、English、置信度、术语匹配'],
        ['3. 标记为橙色的单元格表示术语翻译不一致'],
        ['4. 术语匹配列显示"是"表示该翻译来自术语库'],
        ['5. 术语库基于医疗行业、输液监控系统专业词汇'],
      ];

      const summaryWs = XLSX.utils.aoa_to_sheet(summaryData);

      // 设置列宽
      summaryWs['!cols'] = [
        { wch: 25 }, // 第一列
        { wch: 40 }, // 第二列
      ];

      // 添加工作表
      XLSX.utils.book_append_sheet(workbook, summaryWs, '说明');
    };

    // 创建单个图片的 Sheet
    const createImageSheet = (result: TranslationResult, sheetName: string) => {
      // 表头
      const header = ['序号', '位置/区域', '中文', 'English', '置信度', '术语匹配'];

      // 数据行
      const data = result.items.map((item) => [
        item.order,
        item.region,
        item.chinese,
        item.english,
        `${Math.round(item.confidence)}%`,
        item.isTerminologyMatched ? '是' : '否',
      ]);

      // 合并表头和数据
      const allData = [header, ...data];

      // 创建工作表
      const ws = XLSX.utils.aoa_to_sheet(allData);

      // 设置列宽
      ws['!cols'] = [
        { wch: 8 },   // 序号
        { wch: 15 },  // 位置/区域
        { wch: 30 },  // 中文
        { wch: 30 },  // English
        { wch: 10 },  // 置信度
        { wch: 12 },  // 术语匹配
      ];

      // 标记表头（黄色背景）
      const headerRange = XLSX.utils.decode_range(ws['!ref'] || 'A1');
      for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
        if (ws[cellAddress]) {
          ws[cellAddress].s = {
            fill: {
              patternType: 'solid',
              fgColor: { rgb: 'FFFF00' },
            },
            font: {
              bold: true,
            },
          };
        }
      }

      // 标记不一致项（橙色背景）
      result.items.forEach((item, index) => {
        if (item.isInconsistent) {
          const row = index + 2; // +2 因为有表头行（从 0 开始）+ 1
          const englishCol = 3; // English 列索引（从 0 开始）
          const cellAddress = XLSX.utils.encode_cell({ r: row - 1, c: englishCol });
          if (ws[cellAddress]) {
            ws[cellAddress].s = {
              fill: {
                patternType: 'solid',
                fgColor: { rgb: 'FFCC99' },
              },
              font: {
                bold: true,
                color: { rgb: 'FF6600' },
              },
            };
          }
        }
      });

      // 标记术语匹配项（浅绿色背景）
      result.items.forEach((item, index) => {
        if (item.isTerminologyMatched) {
          const row = index + 1; // +1 因为有表头行
          const matchedCol = 5; // 术语匹配列索引（从 0 开始）
          const cellAddress = XLSX.utils.encode_cell({ r: row, c: matchedCol });
          if (ws[cellAddress]) {
            ws[cellAddress].s = {
              fill: {
                patternType: 'solid',
                fgColor: { rgb: '90EE90' },
              },
              font: {
                bold: true,
                color: { rgb: '006400' },
              },
            };
          }
        }
      });

      // 添加工作表
      XLSX.utils.book_append_sheet(workbook, ws, sheetName);
    };

    // 生成所有工作表
    createSummarySheet();
    results.forEach((result, index) => {
      // 生成简短的 Sheet 名称（Excel 限制 31 个字符）
      const sheetName = `图片${index + 1}`;
      createImageSheet(result, sheetName);
    });

    // 导出文件
    XLSX.writeFile(workbook, filename);

    return filename;
  };

  return { downloadExcel };
}

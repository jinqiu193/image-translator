'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, FileText, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { TranslationResult } from '@/lib/translator';
import type { TranslationOptions } from '@/components/QuickOptions';

interface ResultTableProps {
  results: TranslationResult[];
  options: TranslationOptions;
  onDownloadExcel: () => void;
  onNewTask: () => void;
}

const ITEMS_PER_PAGE = 10;

export default function ResultTable({
  results,
  options,
  onDownloadExcel,
  onNewTask,
}: ResultTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  // 计算总体统计
  const totalStats = {
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

  // 计算所有项目的不一致数
  const allInconsistentItems = results.flatMap((result) =>
    result.items.filter((item) => item.isInconsistent)
  );

  // 渲染统计卡片
  const renderStatsCard = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <StatCard
        icon={FileText}
        label="图片数"
        value={totalStats.totalImages}
        color="text-[#0EA5E9]"
        bgColor="bg-[#E0F2FE]"
      />
      <StatCard
        icon={FileText}
        label="翻译项"
        value={totalStats.totalItems}
        color="text-[#10B981]"
        bgColor="bg-[#D1FAE5]"
      />
      <StatCard
        icon={CheckCircle2}
        label="术语匹配"
        value={totalStats.totalTerminologyMatched}
        color="text-[#0EA5E9]"
        bgColor="bg-[#E0F2FE]"
      />
      <StatCard
        icon={AlertTriangle}
        label="不一致"
        value={totalStats.totalInconsistent}
        color="text-[#F59E0B]"
        bgColor="bg-[#FEF3C7]"
      />
    </div>
  );

  // 渲染单张图片的表格
  const renderSingleTable = (result: TranslationResult) => {
    const totalPages = Math.ceil(result.items.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentItems = result.items.slice(startIndex, endIndex);

    return (
      <div key={result.imageName}>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{result.imageName}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto -mx-4 sm:mx-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">序号</TableHead>
                  <TableHead className="w-32">位置/区域</TableHead>
                  <TableHead>中文</TableHead>
                  <TableHead>{options.targetLang === 'th' ? 'ภาษาไทย' : 'English'}</TableHead>
                  <TableHead className="w-20">置信度</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentItems.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="text-center py-8"
                    >
                      <div className="flex flex-col items-center justify-center space-y-3">
                        <div className="p-3 bg-[#F59E0B]/10 rounded-full">
                          <AlertTriangle className="w-6 h-6 text-[#F59E0B]" />
                        </div>
                        <div>
                          <p className="text-lg font-semibold text-gray-900 mb-1">未识别到文本</p>
                          <p className="text-sm text-gray-500">
                            可能的原因：图片模糊、文字过小、或格式不支持
                          </p>
                        </div>
                        <div className="text-xs text-gray-400 max-w-md text-center">
                          建议使用高分辨率、文字清晰的图片（推荐 1000x800px 以上）
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  currentItems.map((item) => (
                    <TableRow
                      key={item.id}
                      className={
                        item.isInconsistent
                          ? 'bg-[#FFCC99] hover:bg-[#FFCC99]/90'
                          : ''
                      }
                    >
                      <TableCell className="font-medium">{item.order}</TableCell>
                      <TableCell>{item.region}</TableCell>
                      <TableCell className="font-medium">{item.chinese}</TableCell>
                      <TableCell
                        className={
                          item.isInconsistent
                            ? 'text-orange-700 font-semibold'
                            : ''
                        }
                      >
                        {item.english}
                      </TableCell>
                      <TableCell>{Math.round(item.confidence)}%</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            </div>

            {/* 分页 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-gray-500">
                  {startIndex + 1}-{Math.min(endIndex, result.items.length)}{' '}
                  / {result.items.length} 项
                </p>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    上一页
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((p) => Math.min(totalPages, p + 1))
                    }
                    disabled={currentPage === totalPages}
                  >
                    下一页
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="w-full space-y-6">
      {/* 统计卡片 */}
      {renderStatsCard()}

      {/* 不一致项提示 */}
      {options.checkConsistency && allInconsistentItems.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-amber-900 mb-1">
                  发现 {allInconsistentItems.length} 处术语不一致
                </h4>
                <p className="text-sm text-amber-700">
                  以下术语在不同图片中的英文翻译不一致，已在表格中用橙色标记。建议检查并统一翻译。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 结果表格 */}
      {results.length === 1 ? (
        // 单张图片：直接显示表格
        renderSingleTable(results[0])
      ) : (
        // 多张图片：使用标签页切换
        <Tabs defaultValue={results[0]?.imageName || ''}>
          <TabsList className="mb-4 flex-wrap">
            {results.map((result, index) => (
              <TabsTrigger key={result.imageName} value={result.imageName}>
                图片 {index + 1}
              </TabsTrigger>
            ))}
          </TabsList>
          {results.map((result) => (
            <TabsContent key={result.imageName} value={result.imageName}>
              {renderSingleTable(result)}
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* 操作按钮 */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
        <Button
          onClick={onDownloadExcel}
          className="flex-1 bg-[#0EA5E9] hover:bg-[#0284C7]"
          size="lg"
        >
          <Download className="w-5 h-5 mr-2" />
          下载 Excel
        </Button>
        <Button
          onClick={onNewTask}
          variant="outline"
          className="flex-1"
          size="lg"
        >
          <FileText className="w-5 h-5 mr-2" />
          新建任务
        </Button>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color: string;
  bgColor: string;
}

function StatCard({ icon: Icon, label, value, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg ${bgColor}`}>
            <Icon className={`w-5 h-5 ${color}`} />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


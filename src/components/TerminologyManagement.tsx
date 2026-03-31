'use client';

import { useState, useEffect, useCallback } from 'react';
import { BookOpen, Search, Plus, Edit2, Trash2, ChevronDown, ChevronRight, Download, Upload, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import {
  getAllTerms,
  getTerminologyStats,
  getDefaultTerms,
  getHiddenTermIdsList,
  addTerm,
  updateTerm,
  deleteTerm,
  restoreTerm,
  exportTerms,
  importTerms,
  clearAllCustomTerms,
  type TermMapping,
  type TermCategory,
} from '@/lib/terminology';

const CATEGORY_LABELS: Record<TermCategory, string> = {
  general: '通用界面元素',
  medical: '医疗/药品行业',
  infusion: '输液监控系统',
  flowchart: '流程图元素',
  custom: '自定义术语',
};

const CATEGORY_COLORS: Record<TermCategory, string> = {
  general: 'bg-blue-100 text-blue-800',
  medical: 'bg-green-100 text-green-800',
  infusion: 'bg-purple-100 text-purple-800',
  flowchart: 'bg-orange-100 text-orange-800',
  custom: 'bg-pink-100 text-pink-800',
};

interface EditingTerm {
  id?: string;
  cn: string;
  en: string;
  th?: string;
  category: TermCategory;
  isNew: boolean;
  isBuiltIn?: boolean;
}

export function TerminologyManagement() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(['general', 'medical', 'infusion', 'flowchart', 'custom'])
  );
  const [stats, setStats] = useState<ReturnType<typeof getTerminologyStats>>();
  const [terms, setTerms] = useState<TermMapping[]>([]);
  const [defaultTerms, setDefaultTerms] = useState<TermMapping[]>([]);
  const [hiddenIds, setHiddenIds] = useState<string[]>([]);
  const [showHidden, setShowHidden] = useState(false);

  // 编辑相关状态
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingTerm, setEditingTerm] = useState<EditingTerm>({
    cn: '',
    en: '',
    category: 'custom',
    isNew: true,
  });
  const [editError, setEditError] = useState('');

  // 删除确认
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTerm, setDeletingTerm] = useState<TermMapping | null>(null);

  // 导入导出
  const [importText, setImportText] = useState('');
  const [importDialogOpen, setImportDialogOpen] = useState(false);

  // 加载数据
  const loadData = useCallback(() => {
    setTerms(getAllTerms());
    setDefaultTerms(getDefaultTerms());
    setStats(getTerminologyStats());
    setHiddenIds(getHiddenTermIdsList());
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

  // 过滤术语
  const filteredTerms = terms.filter(
    (term) =>
      term.cn.toLowerCase().includes(search.toLowerCase()) ||
      term.en.toLowerCase().includes(search.toLowerCase())
  );

  // 隐藏的术语（用于恢复）
  const hiddenTerms = defaultTerms.filter(t => hiddenIds.includes(t.id));

  // 按类别分组
  const termsByCategory = filteredTerms.reduce((acc, term) => {
    if (!acc[term.category]) {
      acc[term.category] = [];
    }
    acc[term.category].push(term);
    return acc;
  }, {} as Record<string, TermMapping[]>);

  // 切换类别展开/折叠
  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  // 打开新增对话框
  const handleAddNew = () => {
    setEditingTerm({ cn: '', en: '', th: '', category: 'custom', isNew: true, isBuiltIn: false });
    setEditError('');
    setEditDialogOpen(true);
  };

  // 打开编辑对话框
  const handleEdit = (term: TermMapping) => {
    setEditingTerm({
      id: term.id,
      cn: term.cn,
      en: term.en,
      th: term.th || '',
      category: term.category,
      isNew: false,
      isBuiltIn: !!term.originalId || defaultTerms.some(d => d.id === term.id && !term.isCustom),
    });
    setEditError('');
    setEditDialogOpen(true);
  };

  // 保存术语
  const handleSave = () => {
    if (!editingTerm.cn.trim() || !editingTerm.en.trim()) {
      setEditError('请填写中文和英文术语');
      return;
    }

    if (editingTerm.isNew) {
      const result = addTerm({
        cn: editingTerm.cn.trim(),
        en: editingTerm.en.trim(),
        th: editingTerm.th?.trim() || undefined,
        category: editingTerm.category,
      });
      if (!result.success) {
        setEditError(result.error || '保存失败');
        return;
      }
    } else if (editingTerm.id) {
      const result = updateTerm(editingTerm.id, {
        cn: editingTerm.cn.trim(),
        en: editingTerm.en.trim(),
        category: editingTerm.category,
      });
      if (!result.success) {
        setEditError(result.error || '保存失败');
        return;
      }
    }

    setEditDialogOpen(false);
    loadData();
  };

  // 确认删除
  const handleDeleteClick = (term: TermMapping) => {
    setDeletingTerm(term);
    setDeleteDialogOpen(true);
  };

  // 执行删除
  const handleConfirmDelete = () => {
    if (deletingTerm) {
      deleteTerm(deletingTerm.id);
      setDeleteDialogOpen(false);
      setDeletingTerm(null);
      loadData();
    }
  };

  // 恢复术语
  const handleRestore = (id: string) => {
    restoreTerm(id);
    loadData();
  };

  // 导出
  const handleExport = () => {
    const data = exportTerms();
    const exportData = {
      terms: data.all,
      hidden: data.hidden,
      exportedAt: new Date().toISOString(),
    };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'terminology-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // 导入
  const handleImport = () => {
    try {
      const imported = JSON.parse(importText);
      if (imported.terms && Array.isArray(imported.terms)) {
        // 新格式，包含完整数据
        const result = importTerms(imported.terms);
        alert(`导入完成：成功 ${result.imported} 条，失败 ${result.errors.length} 条\n${result.errors.join('\n')}`);
      } else if (Array.isArray(imported)) {
        // 旧格式，只是术语数组
        const result = importTerms(imported);
        alert(`导入完成：成功 ${result.imported} 条，失败 ${result.errors.length} 条\n${result.errors.join('\n')}`);
      } else {
        alert('格式错误');
        return;
      }
      setImportDialogOpen(false);
      setImportText('');
      loadData();
    } catch {
      alert('JSON 格式错误');
    }
  };

  // 清空自定义
  const handleClearAll = () => {
    if (confirm('确定要清空所有自定义术语和隐藏的术语吗？此操作不可恢复。')) {
      clearAllCustomTerms();
      loadData();
    }
  };

  // 判断术语是否被编辑过（自定义覆盖）
  const isOverridden = (term: TermMapping): boolean => {
    return !!term.originalId;
  };

  // 判断术语是否来自内置
  const isBuiltIn = (term: TermMapping): boolean => {
    return !term.isCustom && defaultTerms.some(d => d.id === term.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="sm">
            <BookOpen className="w-4 h-4 mr-2" />
            术语库
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>术语库管理</DialogTitle>
            <DialogDescription>
              管理医疗行业专业词汇翻译对照表，共 {stats?.total || 0} 个术语
              {stats?.hiddenCount ? `（含 ${stats.hiddenCount} 个已隐藏）` : ''}。
            </DialogDescription>
          </DialogHeader>

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={handleAddNew}>
              <Plus className="w-4 h-4 mr-1" /> 新增
            </Button>
            <Button size="sm" variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-1" /> 导出
            </Button>
            <Button size="sm" variant="outline" onClick={() => setImportDialogOpen(true)}>
              <Upload className="w-4 h-4 mr-1" /> 导入
            </Button>
            {hiddenTerms.length > 0 && (
              <Button size="sm" variant="outline" onClick={() => setShowHidden(!showHidden)}>
                <RotateCcw className="w-4 h-4 mr-1" /> 已隐藏({hiddenTerms.length})
              </Button>
            )}
            <Button size="sm" variant="destructive" onClick={handleClearAll}>
              <Trash2 className="w-4 h-4 mr-1" /> 清空
            </Button>
          </div>

          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="搜索术语..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* 统计信息 */}
          <div className="flex flex-wrap gap-2">
            {stats?.byCategory && Object.entries(stats.byCategory).map(([key, count]) => (
              count > 0 && (
                <span
                  key={key}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    CATEGORY_COLORS[key as TermCategory] || 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {CATEGORY_LABELS[key as TermCategory] || key}: {count}
                </span>
              )
            ))}
          </div>

          {/* 已隐藏术语恢复区域 */}
          {showHidden && hiddenTerms.length > 0 && (
            <div className="border rounded-lg overflow-hidden bg-red-50">
              <div className="p-2 bg-red-100 font-medium text-sm">已隐藏的术语（点击恢复）</div>
              <div className="divide-y max-h-32 overflow-y-auto">
                {hiddenTerms.map((term) => (
                  <div
                    key={term.id}
                    className="flex items-center justify-between p-2 hover:bg-red-100 cursor-pointer"
                    onClick={() => handleRestore(term.id)}
                  >
                    <div>
                      <span className="font-medium">{term.cn}</span>
                      <span className="text-gray-500 ml-2">🇬🇧 {term.en}</span>
                      {term.th && <span className="text-gray-500 ml-2">🇹🇭 {term.th}</span>}
                    </div>
                    <Button size="sm" variant="ghost" className="h-6">
                      <RotateCcw className="w-3 h-3 mr-1" /> 恢复
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 术语列表 */}
          <div className="flex-1 overflow-y-auto space-y-2">
            {Object.entries(termsByCategory).map(([category, categoryTerms]) => (
              <div key={category} className="border rounded-lg overflow-hidden">
                {/* 类别标题 */}
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {expandedCategories.has(category) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        CATEGORY_COLORS[category as TermCategory] || 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {CATEGORY_LABELS[category as TermCategory] || category}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({categoryTerms.length})
                    </span>
                  </div>
                </button>

                {/* 术语列表 */}
                {expandedCategories.has(category) && (
                  <div className="divide-y">
                    {categoryTerms.map((term, index) => (
                      <div
                        key={`${term.id}-${index}`}
                        className="flex items-center justify-between p-2 px-3 hover:bg-gray-50 group"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 truncate block">
                              {term.cn}
                            </span>
                            {isOverridden(term) && (
                              <span className="px-1 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">
                                已修改
                              </span>
                            )}
                          </div>
                          <div className="flex gap-3">
                            <span className="text-gray-500 text-sm truncate block">
                              🇬🇧 {term.en}
                            </span>
                            {term.th && (
                              <span className="text-gray-500 text-sm truncate block">
                                🇹🇭 {term.th}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(term)}
                            title="编辑"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-600"
                            onClick={() => handleDeleteClick(term)}
                            title="隐藏"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {filteredTerms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                {search ? '未找到匹配的术语' : '暂无术语'}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 新增/编辑对话框 */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTerm.isNew ? '新增术语' : '编辑术语'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="term-cn">中文术语 *</Label>
              <Input
                id="term-cn"
                value={editingTerm.cn}
                onChange={(e) => setEditingTerm({ ...editingTerm, cn: e.target.value })}
                placeholder="例如：输液监控"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term-en">英文术语 *</Label>
              <Input
                id="term-en"
                value={editingTerm.en}
                onChange={(e) => setEditingTerm({ ...editingTerm, en: e.target.value })}
                placeholder="例如：Infusion Monitoring"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term-th">泰文术语（可选）</Label>
              <Input
                id="term-th"
                value={editingTerm.th || ''}
                onChange={(e) => setEditingTerm({ ...editingTerm, th: e.target.value })}
                placeholder="例如：การเฝ้าติดตามการฉีดยา"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="term-category">分类</Label>
              <Select
                value={editingTerm.category}
                onValueChange={(value) => setEditingTerm({ ...editingTerm, category: value as TermCategory })}
              >
                <SelectTrigger id="term-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">{CATEGORY_LABELS.general}</SelectItem>
                  <SelectItem value="medical">{CATEGORY_LABELS.medical}</SelectItem>
                  <SelectItem value="infusion">{CATEGORY_LABELS.infusion}</SelectItem>
                  <SelectItem value="flowchart">{CATEGORY_LABELS.flowchart}</SelectItem>
                  <SelectItem value="custom">{CATEGORY_LABELS.custom}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editError && (
              <p className="text-red-500 text-sm">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-1" /> 保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 删除确认对话框 */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认隐藏术语</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>确定要隐藏术语 "<strong>{deletingTerm?.cn}</strong>" 吗？</p>
            <p className="text-gray-500 text-sm mt-2">隐藏后可以在"已隐藏"区域恢复。</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              取消
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              隐藏
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 导入对话框 */}
      <Dialog open={importDialogOpen} onOpenChange={setImportDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>导入术语</DialogTitle>
            <DialogDescription>
              请输入 JSON 格式的术语数组，或导出格式的完整备份文件。
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <textarea
              className="w-full h-48 p-2 border rounded-md font-mono text-sm"
              placeholder={'[\n  {"cn": "中文", "en": "English", "category": "custom"}\n]'}
              value={importText}
              onChange={(e) => setImportText(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImportDialogOpen(false)}>
              取消
            </Button>
            <Button onClick={handleImport}>
              导入
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

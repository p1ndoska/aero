//@ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Filter, Eye, Edit, Trash2, Download, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  useGetAllResumesQuery,
  useGetResumeStatsQuery,
  useUpdateResumeStatusMutation,
  useDeleteResumeMutation,
  type Resume,
} from '@/app/services/resumeApi';
import { BASE_URL } from '@/constants';

const ResumeManagement: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [statusNotes, setStatusNotes] = useState('');

  const { data: resumesData, isLoading, error, refetch } = useGetAllResumesQuery({
    page: pagination.page,
    limit: pagination.limit,
    status: filters.status !== 'all' ? filters.status : undefined,
    search: filters.search || undefined,
  }, {
    refetchOnMountOrArgChange: true,
  });

  const { data: stats, error: statsError } = useGetResumeStatsQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });
  
  // Обработка ошибок
  useEffect(() => {
    if (error) {
      console.error('Error loading resumes:', error);
      if ('status' in error && error.status === 401) {
        toast.error('Ошибка авторизации. Пожалуйста, войдите заново');
      } else if ('status' in error && error.status === 403) {
        toast.error('Недостаточно прав для просмотра резюме');
      } else {
        toast.error('Ошибка при загрузке резюме');
      }
    }
    if (statsError) {
      console.error('Error loading stats:', statsError);
    }
  }, [error, statsError]);
  
  // Сброс на первую страницу при изменении фильтров
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [filters.search, filters.status]);
  const [updateStatus] = useUpdateResumeStatusMutation();
  const [deleteResume] = useDeleteResumeMutation();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW': return 'bg-yellow-100 text-yellow-800';
      case 'VIEWED': return 'bg-blue-100 text-blue-800';
      case 'CONTACTED': return 'bg-green-100 text-green-800';
      case 'ARCHIVED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'NEW': return 'Новое';
      case 'VIEWED': return 'Просмотрено';
      case 'CONTACTED': return 'Связались';
      case 'ARCHIVED': return 'Архив';
      default: return status;
    }
  };

  const handleViewResume = (resume: Resume) => {
    setSelectedResume(resume);
    setStatusNotes(resume.notes || '');
    setIsViewDialogOpen(true);
  };

  const handleEditStatus = (resume: Resume) => {
    setSelectedResume(resume);
    setStatusNotes(resume.notes || '');
    setIsEditDialogOpen(true);
  };

  const handleUpdateStatus = async () => {
    if (!selectedResume) return;

    try {
      await updateStatus({
        id: selectedResume.id,
        data: {
          status: selectedResume.status,
          notes: statusNotes || undefined,
        },
      }).unwrap();
      toast.success('Статус резюме обновлен');
      setIsEditDialogOpen(false);
      setSelectedResume(null);
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении статуса');
    }
  };

  const handleDeleteResume = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить это резюме?')) {
      return;
    }

    try {
      await deleteResume(id).unwrap();
      toast.success('Резюме удалено');
      refetch();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении резюме');
    }
  };

  const handleDownloadResume = (resume: Resume) => {
    const url = `${BASE_URL}${resume.fileUrl}`;
    window.open(url, '_blank');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Управление резюме</h1>
        <p className="text-gray-600">Просмотр и управление загруженными резюме</p>
      </div>

      {/* Статистика */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-sm text-gray-600">Всего резюме</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.byStatus.new}</div>
              <p className="text-sm text-gray-600">Новых</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.byStatus.viewed}</div>
              <p className="text-sm text-gray-600">Просмотрено</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.byStatus.contacted}</div>
              <p className="text-sm text-gray-600">Связались</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-gray-600">{stats.byStatus.archived}</div>
              <p className="text-sm text-gray-600">Архив</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Фильтры */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Поиск по имени, email, телефону..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters({ ...filters, status: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Статус" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">Все статусы</SelectItem>
                  <SelectItem value="NEW">Новые</SelectItem>
                  <SelectItem value="VIEWED">Просмотрено</SelectItem>
                  <SelectItem value="CONTACTED">Связались</SelectItem>
                  <SelectItem value="ARCHIVED">Архив</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Таблица резюме */}
      <Card>
        <CardHeader>
          <CardTitle>Список резюме</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              <p>Загрузка резюме...</p>
            </div>
          ) : !resumesData?.resumes || resumesData.resumes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Резюме не найдены</p>
              {filters.search || filters.status !== 'all' ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setFilters({ search: '', status: 'all' });
                    setPagination({ page: 1, limit: 10 });
                  }}
                >
                  Сбросить фильтры
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ФИО</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Файл</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead>Дата</TableHead>
                    <TableHead>Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumesData.resumes.map((resume) => (
                    <TableRow key={resume.id}>
                      <TableCell className="font-medium">{resume.fullName}</TableCell>
                      <TableCell>{resume.email}</TableCell>
                      <TableCell>{resume.phone || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{resume.fileName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(resume.status)}>
                          {getStatusText(resume.status)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(resume.createdAt).toLocaleDateString('ru-RU')}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewResume(resume)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadResume(resume)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditStatus(resume)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteResume(resume.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Пагинация */}
              {resumesData.pagination.pages > 1 && (
                <div className="flex justify-between items-center mt-4">
                  <div className="text-sm text-gray-600">
                    Страница {resumesData.pagination.page} из {resumesData.pagination.pages}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page === 1}
                      onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                    >
                      Назад
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={pagination.page >= resumesData.pagination.pages}
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    >
                      Вперед
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Диалог просмотра резюме */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader>
            <DialogTitle>Резюме: {selectedResume?.fullName}</DialogTitle>
          </DialogHeader>
          {selectedResume && (
            <div className="space-y-4">
              <div>
                <Label>ФИО</Label>
                <p className="font-medium">{selectedResume.fullName}</p>
              </div>
              <div>
                <Label>Email</Label>
                <p>{selectedResume.email}</p>
              </div>
              <div>
                <Label>Телефон</Label>
                <p>{selectedResume.phone || '-'}</p>
              </div>
              <div>
                <Label>Файл</Label>
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{selectedResume.fileName}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownloadResume(selectedResume)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Скачать
                  </Button>
                </div>
              </div>
              <div>
                <Label>Статус</Label>
                <Badge className={getStatusColor(selectedResume.status)}>
                  {getStatusText(selectedResume.status)}
                </Badge>
              </div>
              {selectedResume.notes && (
                <div>
                  <Label>Заметки</Label>
                  <p className="text-sm text-gray-600">{selectedResume.notes}</p>
                </div>
              )}
              <div>
                <Label>Дата загрузки</Label>
                <p>{new Date(selectedResume.createdAt).toLocaleString('ru-RU')}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Диалог редактирования статуса */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Изменить статус резюме</DialogTitle>
          </DialogHeader>
          {selectedResume && (
            <div className="space-y-4">
              <div>
                <Label>Статус</Label>
                <Select  
                  value={selectedResume.status}
                  onValueChange={(value) => setSelectedResume({ ...selectedResume, status: value as any })}
                >
                  <SelectTrigger >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="NEW">Новое</SelectItem>
                    <SelectItem value="VIEWED">Просмотрено</SelectItem>
                    <SelectItem value="CONTACTED">Связались</SelectItem>
                    <SelectItem value="ARCHIVED">Архив</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Заметки</Label>
                <Textarea
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                  placeholder="Добавьте заметки..."
                  rows={4}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Отмена
                </Button>
                <Button onClick={handleUpdateStatus}>
                  Сохранить
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeManagement;


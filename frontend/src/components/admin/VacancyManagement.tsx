//@ts-nocheck
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Briefcase, Eye, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import {
  useGetAllVacanciesQuery,
  useCreateVacancyMutation,
  useUpdateVacancyMutation,
  useDeleteVacancyMutation,
  useGetAllApplicationsQuery,
  useUpdateApplicationStatusMutation,
  useDeleteApplicationMutation,
} from '@/app/services/vacancyApi';
import type { Vacancy, VacancyApplication } from '@/types/vacancy';

export default function VacancyManagement() {
  const { isAuthenticated, user } = useSelector((state: any) => state.auth);
  const roleValue = user?.role;
  const roleName = (typeof roleValue === 'string' ? roleValue : roleValue?.name) ?? '';
  const isAdmin = ['SUPER_ADMIN', 'HR_ADMIN'].includes(roleName.toString().toUpperCase());

  const { data: vacancies, refetch: refetchVacancies, isLoading } = useGetAllVacanciesQuery({});
  const { data: applications, refetch: refetchApplications } = useGetAllApplicationsQuery({});
  const [createVacancy, { isLoading: isCreating }] = useCreateVacancyMutation();
  const [updateVacancy, { isLoading: isUpdating }] = useUpdateVacancyMutation();
  const [deleteVacancy, { isLoading: isDeleting }] = useDeleteVacancyMutation();
  const [updateApplicationStatus] = useUpdateApplicationStatusMutation();
  const [deleteApplication] = useDeleteApplicationMutation();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingVacancy, setEditingVacancy] = useState<Vacancy | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [viewingApplications, setViewingApplications] = useState<number | null>(null);
  const [isApplicationsDialogOpen, setIsApplicationsDialogOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    titleBe: '',
    description: '',
    descriptionEn: '',
    descriptionBe: '',
    requirements: '',
    requirementsEn: '',
    requirementsBe: '',
    conditions: '',
    conditionsEn: '',
    conditionsBe: '',
    salary: '',
    salaryEn: '',
    salaryBe: '',
    location: '',
    locationEn: '',
    locationBe: '',
    employmentType: '',
    employmentTypeEn: '',
    employmentTypeBe: '',
    isActive: true,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      titleEn: '',
      titleBe: '',
      description: '',
      descriptionEn: '',
      descriptionBe: '',
      requirements: '',
      requirementsEn: '',
      requirementsBe: '',
      conditions: '',
      conditionsEn: '',
      conditionsBe: '',
      salary: '',
      salaryEn: '',
      salaryBe: '',
      location: '',
      locationEn: '',
      locationBe: '',
      employmentType: '',
      employmentTypeEn: '',
      employmentTypeBe: '',
      isActive: true,
    });
  };

  const handleCreate = async () => {

    try {
      await createVacancy(formData).unwrap();
      toast.success('Вакансия успешно создана');
      setIsCreateDialogOpen(false);
      resetForm();
      refetchVacancies();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при создании вакансии');
    }
  };

  const handleEdit = (vacancy: Vacancy) => {
    setEditingVacancy(vacancy);
    setFormData({
      title: vacancy.title,
      titleEn: vacancy.titleEn || '',
      titleBe: vacancy.titleBe || '',
      description: vacancy.description,
      descriptionEn: vacancy.descriptionEn || '',
      descriptionBe: vacancy.descriptionBe || '',
      requirements: vacancy.requirements || '',
      requirementsEn: vacancy.requirementsEn || '',
      requirementsBe: vacancy.requirementsBe || '',
      conditions: vacancy.conditions || '',
      conditionsEn: vacancy.conditionsEn || '',
      conditionsBe: vacancy.conditionsBe || '',
      salary: vacancy.salary || '',
      salaryEn: vacancy.salaryEn || '',
      salaryBe: vacancy.salaryBe || '',
      location: vacancy.location || '',
      locationEn: vacancy.locationEn || '',
      locationBe: vacancy.locationBe || '',
      employmentType: vacancy.employmentType || '',
      employmentTypeEn: vacancy.employmentTypeEn || '',
      employmentTypeBe: vacancy.employmentTypeBe || '',
      isActive: vacancy.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!editingVacancy) {
      return;
    }

    try {
      await updateVacancy({ id: editingVacancy.id, data: formData }).unwrap();
      toast.success('Вакансия успешно обновлена');
      setIsEditDialogOpen(false);
      setEditingVacancy(null);
      resetForm();
      refetchVacancies();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении вакансии');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить эту вакансию?')) return;

    try {
      await deleteVacancy(id).unwrap();
      toast.success('Вакансия успешно удалена');
      refetchVacancies();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении вакансии');
    }
  };

  const handleViewApplications = (vacancyId: number) => {
    setViewingApplications(vacancyId);
    setIsApplicationsDialogOpen(true);
  };

  const handleUpdateApplicationStatus = async (applicationId: number, status: string) => {
    try {
      await updateApplicationStatus({ id: applicationId, status }).unwrap();
      toast.success('Статус отклика обновлен');
      refetchApplications();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при обновлении статуса');
    }
  };

  const handleDeleteApplication = async (applicationId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот отклик?')) return;

    try {
      await deleteApplication(applicationId).unwrap();
      toast.success('Отклик успешно удален');
      refetchApplications();
    } catch (error: any) {
      toast.error(error.data?.error || 'Ошибка при удалении отклика');
    }
  };

  const getApplicationsByVacancyId = (vacancyId: number) => {
    return applications?.filter((app) => app.vacancyId === vacancyId) || [];
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      NEW: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Новый' },
      VIEWED: { color: 'bg-yellow-100 text-yellow-800', icon: Eye, label: 'Просмотрен' },
      ACCEPTED: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Принят' },
      REJECTED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Отклонен' },
    };
    const config = statusConfig[status] || statusConfig.NEW;
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Загрузка...</div>;
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          Управление вакансиями
        </h1>
        {isAuthenticated && isAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#213659] hover:bg-[#1a2a4a] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Добавить вакансию
              </Button>
            </DialogTrigger>
          <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
            <DialogHeader>
              <DialogTitle>Создать вакансию</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="title">Название вакансии (RU) *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Например: Frontend разработчик"
                      className="h-12 text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleEn">Название вакансии (EN)</Label>
                    <Input
                      id="titleEn"
                      value={formData.titleEn}
                      onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                      placeholder="Example: Frontend Developer"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="titleBe">Название вакансии (BE)</Label>
                    <Input
                      id="titleBe"
                      value={formData.titleBe}
                      onChange={(e) => setFormData({ ...formData, titleBe: e.target.value })}
                      placeholder="Напрыклад: Frontend распрацоўшчык"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="description">Описание (RU) *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Подробное описание вакансии"
                      rows={6}
                      className="min-h-[150px] p-4 text-base"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionEn">Описание (EN)</Label>
                    <Textarea
                      id="descriptionEn"
                      value={formData.descriptionEn}
                      onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                      placeholder="Detailed job description"
                      rows={6}
                      className="min-h-[150px] p-4 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="descriptionBe">Описание (BE)</Label>
                    <Textarea
                      id="descriptionBe"
                      value={formData.descriptionBe}
                      onChange={(e) => setFormData({ ...formData, descriptionBe: e.target.value })}
                      placeholder="Падрабязнае апісанне вакансіі"
                      rows={6}
                      className="min-h-[150px] p-4 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="requirements">Требования (RU)</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                      placeholder="Требования к кандидату"
                      rows={6}
                    className="min-h-[150px] p-4 text-base"
                      className="min-h-[100px] p-4 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirementsEn">Требования (EN)</Label>
                    <Textarea
                      id="requirementsEn"
                      value={formData.requirementsEn}
                      onChange={(e) => setFormData({ ...formData, requirementsEn: e.target.value })}
                      placeholder="Candidate requirements"
                      rows={6}
                    className="min-h-[150px] p-4 text-base"
                      className="min-h-[100px] p-4 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="requirementsBe">Требования (BE)</Label>
                    <Textarea
                      id="requirementsBe"
                      value={formData.requirementsBe}
                      onChange={(e) => setFormData({ ...formData, requirementsBe: e.target.value })}
                      placeholder="Патрабаванні да кандыдата"
                      rows={6}
                    className="min-h-[150px] p-4 text-base"
                      className="min-h-[100px] p-4 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="conditions">Условия работы (RU)</Label>
                    <Textarea
                      id="conditions"
                      value={formData.conditions}
                      onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                      placeholder="Условия работы и льготы"
                      rows={6}
                    className="min-h-[150px] p-4 text-base"
                      className="min-h-[100px] p-4 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditionsEn">Условия работы (EN)</Label>
                    <Textarea
                      id="conditionsEn"
                      value={formData.conditionsEn}
                      onChange={(e) => setFormData({ ...formData, conditionsEn: e.target.value })}
                      placeholder="Working conditions and benefits"
                      rows={6}
                    className="min-h-[150px] p-4 text-base"
                      className="min-h-[100px] p-4 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="conditionsBe">Условия работы (BE)</Label>
                    <Textarea
                      id="conditionsBe"
                      value={formData.conditionsBe}
                      onChange={(e) => setFormData({ ...formData, conditionsBe: e.target.value })}
                      placeholder="Умовы працы і льготы"
                      rows={6}
                    className="min-h-[150px] p-4 text-base"
                      className="min-h-[100px] p-4 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="salary">Зарплата (RU)</Label>
                    <Input
                      id="salary"
                      value={formData.salary}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="Например: от 100 000 руб"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryEn">Зарплата (EN)</Label>
                    <Input
                      id="salaryEn"
                      value={formData.salaryEn}
                      onChange={(e) => setFormData({ ...formData, salaryEn: e.target.value })}
                      placeholder="Example: from 100,000 rub"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="salaryBe">Зарплата (BE)</Label>
                    <Input
                      id="salaryBe"
                      value={formData.salaryBe}
                      onChange={(e) => setFormData({ ...formData, salaryBe: e.target.value })}
                      placeholder="Напрыклад: ад 100 000 руб"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="location">Местоположение (RU)</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Например: Москва"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locationEn">Местоположение (EN)</Label>
                    <Input
                      id="locationEn"
                      value={formData.locationEn}
                      onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                      placeholder="Example: Moscow"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="locationBe">Местоположение (BE)</Label>
                    <Input
                      id="locationBe"
                      value={formData.locationBe}
                      onChange={(e) => setFormData({ ...formData, locationBe: e.target.value })}
                      placeholder="Напрыклад: Масква"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="employmentType">Тип занятости (RU)</Label>
                    <Input
                      id="employmentType"
                      value={formData.employmentType}
                      onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                      placeholder="Например: Полная занятость"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentTypeEn">Тип занятости (EN)</Label>
                    <Input
                      id="employmentTypeEn"
                      value={formData.employmentTypeEn}
                      onChange={(e) => setFormData({ ...formData, employmentTypeEn: e.target.value })}
                      placeholder="Example: Full-time"
                      className="h-12 text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employmentTypeBe">Тип занятости (BE)</Label>
                    <Input
                      id="employmentTypeBe"
                      value={formData.employmentTypeBe}
                      onChange={(e) => setFormData({ ...formData, employmentTypeBe: e.target.value })}
                      placeholder="Напрыклад: Поўная занятасць"
                      className="h-12 text-base"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="isActive">Вакансия активна</Label>
                </div>
                
                {/* Кнопки формы */}
                <div className="flex justify-end gap-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Отмена
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isCreating} 
                    className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                  >
                    {isCreating ? 'Создание...' : 'Создать'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        )}
      </div>

      <div className="grid gap-4">
        {vacancies && vacancies.length > 0 ? (
          vacancies.map((vacancy) => (
            <Card key={vacancy.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      {vacancy.title}
                      {vacancy.isActive ? (
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Активна</span>
                      ) : (
                        <span className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">Неактивна</span>
                      )}
                    </CardTitle>
                    <p className="text-sm text-gray-500 mt-2">{vacancy.description}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewApplications(vacancy.id)}
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Отклики ({vacancy.applications?.length || 0})
                    </Button>
                    {isAuthenticated && isAdmin && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(vacancy)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(vacancy.id)}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {vacancy.salary && (
                    <div>
                      <span className="font-semibold">Зарплата:</span> {vacancy.salary}
                    </div>
                  )}
                  {vacancy.location && (
                    <div>
                      <span className="font-semibold">Местоположение:</span> {vacancy.location}
                    </div>
                  )}
                  {vacancy.employmentType && (
                    <div>
                      <span className="font-semibold">Тип занятости:</span> {vacancy.employmentType}
                    </div>
                  )}
                  <div>
                    <span className="font-semibold">Создано:</span>{' '}
                    {new Date(vacancy.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              Нет доступных вакансий. Создайте первую вакансию.
            </CardContent>
          </Card>
        )}
      </div>

      {/* Диалог редактирования */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Редактировать вакансию</DialogTitle>
          </DialogHeader>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdate(); }}>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-title">Название вакансии (RU) *</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Например: Frontend разработчик"
                    className="h-12 text-base"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-titleEn">Название вакансии (EN)</Label>
                  <Input
                    id="edit-titleEn"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    placeholder="Example: Frontend Developer"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-titleBe">Название вакансии (BE)</Label>
                  <Input
                    id="edit-titleBe"
                    value={formData.titleBe}
                    onChange={(e) => setFormData({ ...formData, titleBe: e.target.value })}
                    placeholder="Напрыклад: Frontend распрацоўшчык"
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-description">Описание (RU) *</Label>
                  <Textarea
                    id="edit-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Подробное описание вакансии"
                    rows={6}
                    className="min-h-[150px] p-4 text-base"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descriptionEn">Описание (EN)</Label>
                  <Textarea
                    id="edit-descriptionEn"
                    value={formData.descriptionEn}
                    onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                    placeholder="Detailed job description"
                    rows={6}
                    className="min-h-[150px] p-4 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-descriptionBe">Описание (BE)</Label>
                  <Textarea
                    id="edit-descriptionBe"
                    value={formData.descriptionBe}
                    onChange={(e) => setFormData({ ...formData, descriptionBe: e.target.value })}
                    placeholder="Падрабязнае апісанне вакансіі"
                    rows={6}
                    className="min-h-[150px] p-4 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-requirements">Требования (RU)</Label>
                  <Textarea
                    id="edit-requirements"
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="Требования к кандидату"
                    rows={4}
                    className="min-h-[100px] p-4 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-requirementsEn">Требования (EN)</Label>
                  <Textarea
                    id="edit-requirementsEn"
                    value={formData.requirementsEn}
                    onChange={(e) => setFormData({ ...formData, requirementsEn: e.target.value })}
                    placeholder="Candidate requirements"
                    rows={4}
                    className="min-h-[100px] p-4 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-requirementsBe">Требования (BE)</Label>
                  <Textarea
                    id="edit-requirementsBe"
                    value={formData.requirementsBe}
                    onChange={(e) => setFormData({ ...formData, requirementsBe: e.target.value })}
                    placeholder="Патрабаванні да кандыдата"
                    rows={4}
                    className="min-h-[100px] p-4 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-conditions">Условия работы (RU)</Label>
                  <Textarea
                    id="edit-conditions"
                    value={formData.conditions}
                    onChange={(e) => setFormData({ ...formData, conditions: e.target.value })}
                    placeholder="Условия работы и льготы"
                    rows={4}
                    className="min-h-[100px] p-4 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-conditionsEn">Условия работы (EN)</Label>
                  <Textarea
                    id="edit-conditionsEn"
                    value={formData.conditionsEn}
                    onChange={(e) => setFormData({ ...formData, conditionsEn: e.target.value })}
                    placeholder="Working conditions and benefits"
                    rows={4}
                    className="min-h-[100px] p-4 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-conditionsBe">Условия работы (BE)</Label>
                  <Textarea
                    id="edit-conditionsBe"
                    value={formData.conditionsBe}
                    onChange={(e) => setFormData({ ...formData, conditionsBe: e.target.value })}
                    placeholder="Умовы працы і льготы"
                    rows={4}
                    className="min-h-[100px] p-4 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-salary">Зарплата (RU)</Label>
                  <Input
                    id="edit-salary"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="Например: от 100 000 руб"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-salaryEn">Зарплата (EN)</Label>
                  <Input
                    id="edit-salaryEn"
                    value={formData.salaryEn}
                    onChange={(e) => setFormData({ ...formData, salaryEn: e.target.value })}
                    placeholder="Example: from 100,000 rub"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-salaryBe">Зарплата (BE)</Label>
                  <Input
                    id="edit-salaryBe"
                    value={formData.salaryBe}
                    onChange={(e) => setFormData({ ...formData, salaryBe: e.target.value })}
                    placeholder="Напрыклад: ад 100 000 руб"
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-location">Местоположение (RU)</Label>
                  <Input
                    id="edit-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Например: Москва"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-locationEn">Местоположение (EN)</Label>
                  <Input
                    id="edit-locationEn"
                    value={formData.locationEn}
                    onChange={(e) => setFormData({ ...formData, locationEn: e.target.value })}
                    placeholder="Example: Moscow"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-locationBe">Местоположение (BE)</Label>
                  <Input
                    id="edit-locationBe"
                    value={formData.locationBe}
                    onChange={(e) => setFormData({ ...formData, locationBe: e.target.value })}
                    placeholder="Напрыклад: Масква"
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="edit-employmentType">Тип занятости (RU)</Label>
                  <Input
                    id="edit-employmentType"
                    value={formData.employmentType}
                    onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                    placeholder="Например: Полная занятость"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-employmentTypeEn">Тип занятости (EN)</Label>
                  <Input
                    id="edit-employmentTypeEn"
                    value={formData.employmentTypeEn}
                    onChange={(e) => setFormData({ ...formData, employmentTypeEn: e.target.value })}
                    placeholder="Example: Full-time"
                    className="h-12 text-base"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-employmentTypeBe">Тип занятости (BE)</Label>
                  <Input
                    id="edit-employmentTypeBe"
                    value={formData.employmentTypeBe}
                    onChange={(e) => setFormData({ ...formData, employmentTypeBe: e.target.value })}
                    placeholder="Напрыклад: Поўная занятасць"
                    className="h-12 text-base"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="edit-isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4"
                />
                <Label htmlFor="edit-isActive">Вакансия активна</Label>
              </div>
              
              {/* Кнопки формы */}
              <div className="flex justify-end gap-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Отмена
                </Button>
                <Button 
                  type="submit" 
                  disabled={isUpdating} 
                  className="bg-[#213659] hover:bg-[#1a2a4a] text-white"
                >
                  {isUpdating ? 'Сохранение...' : 'Сохранить'}
                </Button>
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Диалог откликов */}
      <Dialog open={isApplicationsDialogOpen} onOpenChange={setIsApplicationsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Отклики на вакансию</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {viewingApplications &&
              getApplicationsByVacancyId(viewingApplications).length > 0 ? (
              getApplicationsByVacancyId(viewingApplications).map((application) => (
                <Card key={application.id}>
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{application.fullName}</h3>
                        <p className="text-sm text-gray-600">{application.email}</p>
                        <p className="text-sm text-gray-600">{application.phone}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(application.status)}
                        <p className="text-xs text-gray-500">
                          {new Date(application.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {application.coverLetter && (
                      <div className="mb-4">
                        <h4 className="font-semibold mb-2">Сопроводительное письмо:</h4>
                        <p className="text-sm bg-gray-50 p-3 rounded">{application.coverLetter}</p>
                      </div>
                    )}
                    {application.resumeUrl && (
                      <div className="mb-4">
                        <a
                          href={`http://localhost:8000/${application.resumeUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Скачать резюме
                        </a>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'VIEWED')}
                        disabled={application.status === 'VIEWED'}
                      >
                        Просмотрен
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'ACCEPTED')}
                        disabled={application.status === 'ACCEPTED'}
                      >
                        Принять
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleUpdateApplicationStatus(application.id, 'REJECTED')}
                        disabled={application.status === 'REJECTED'}
                      >
                        Отклонить
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-center text-gray-500 py-8">Откликов пока нет</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}


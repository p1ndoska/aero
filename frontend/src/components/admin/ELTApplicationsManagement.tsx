import { useCallback, useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, RefreshCw, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { BASE_URL } from '@/constants';
import { fetchWithAuth } from '@/utils/apiHelpers';

type ApplicationType = 'registration' | 'deregistration';
type FileKind = 'pdf' | 'scan' | 'excel';

interface ELTApplication {
  id: number;
  type: ApplicationType;
  eltCode: string;
  operator?: string | null;
  aircraftRegistration?: string | null;
  scanFileName: string;
  emailSent: boolean;
  emailError?: string | null;
  createdAt: string;
}

const API_URL = `${BASE_URL}/api/elt-applications`;

const TYPE_LABELS: Record<ApplicationType, string> = {
  registration: 'Регистрация',
  deregistration: 'Снятие с регистрации',
};

const FILE_LABELS: Record<FileKind, string> = {
  pdf: 'Бланк PDF',
  scan: 'Скан',
  excel: 'Excel',
};

const fileNameFromResponse = (response: Response, fallback: string) => {
  const match = (response.headers.get('Content-Disposition') || '').match(/filename\*=UTF-8''([^;]+)/);
  return match ? decodeURIComponent(match[1]) : fallback;
};

export default function ELTApplicationsManagement() {
  const [applications, setApplications] = useState<ELTApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<'all' | ApplicationType>('all');

  const loadApplications = useCallback(async () => {
    setLoading(true);
    try {
      const query = typeFilter === 'all' ? '' : `?type=${typeFilter}`;
      const response = await fetchWithAuth(`${API_URL}${query}`);
      if (!response.ok) throw new Error();
      setApplications(await response.json());
    } catch {
      toast.error('Не удалось загрузить заявления ELT');
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications]);

  const downloadFile = async (application: ELTApplication, kind: FileKind) => {
    try {
      const response = await fetchWithAuth(`${API_URL}/${application.id}/files/${kind}`);
      if (!response.ok) throw new Error();
      const url = URL.createObjectURL(await response.blob());
      const link = document.createElement('a');
      link.href = url;
      link.download = fileNameFromResponse(response, `elt-${application.id}-${kind}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      toast.error('Не удалось скачать файл');
    }
  };

  const deleteApplication = async (application: ELTApplication) => {
    if (!window.confirm(`Удалить заявление №${application.id}?`)) return;
    try {
      const response = await fetchWithAuth(`${API_URL}/${application.id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error();
      toast.success('Заявление удалено');
      loadApplications();
    } catch {
      toast.error('Не удалось удалить заявление');
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
        <CardTitle className="text-[var(--color-primary)]">Заявления ELT</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as 'all' | ApplicationType)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="all">Все заявления</SelectItem>
              <SelectItem value="registration">{TYPE_LABELS.registration}</SelectItem>
              <SelectItem value="deregistration">{TYPE_LABELS.deregistration}</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="icon" onClick={loadApplications} title="Обновить">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center text-gray-500 py-8">Загрузка...</p>
        ) : applications.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Заявлений пока нет</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>№</TableHead>
                <TableHead>Дата</TableHead>
                <TableHead>Тип</TableHead>
                <TableHead>Код ELT</TableHead>
                <TableHead>Эксплуатант / рег. знак</TableHead>
                <TableHead>Почта</TableHead>
                <TableHead>Файлы</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {applications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-medium">#{application.id}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(application.createdAt).toLocaleString('ru-RU')}
                  </TableCell>
                  <TableCell>{TYPE_LABELS[application.type] || application.type}</TableCell>
                  <TableCell className="font-mono">{application.eltCode}</TableCell>
                  <TableCell>
                    <div>{application.operator || '—'}</div>
                    <div className="text-sm text-gray-500">{application.aircraftRegistration || ''}</div>
                  </TableCell>
                  <TableCell>
                    {application.emailSent ? (
                      <Badge className="bg-green-100 text-green-800">Отправлено</Badge>
                    ) : (
                      <Badge className="bg-red-100 text-red-800" title={application.emailError || ''}>
                        Не отправлено
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {(Object.keys(FILE_LABELS) as FileKind[]).map((kind) => (
                        <Button key={kind} variant="outline" size="sm" onClick={() => downloadFile(application, kind)}>
                          <Download className="w-4 h-4 mr-1" />
                          {FILE_LABELS[kind]}
                        </Button>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => deleteApplication(application)} title="Удалить">
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

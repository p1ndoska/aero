import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BASE_URL } from '@/constants';
import { useLanguage } from '@/contexts/LanguageContext';

interface ELTScanUploadProps {
  endpoint: string;
  formData: unknown;
}

export default function ELTScanUpload({ endpoint, formData }: ELTScanUploadProps) {
  const { t } = useLanguage();
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    rootRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  const handleSend = async () => {
    if (!file) {
      toast.error(t('attach_scan_required'));
      return;
    }

    setIsSending(true);
    try {
      const body = new FormData();
      body.append('scan', file);
      body.append('formData', JSON.stringify(formData));

      const response = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', body });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || t('scan_send_error'));
      }

      toast.success(t('scan_sent'));
      setIsSent(true);
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t('scan_send_error'));
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div
      ref={rootRef}
      className="mt-8 space-y-4 rounded-lg border-2 p-6"
      style={{ borderColor: 'var(--color-primary)' }}
    >
      <h3 className="text-lg font-semibold text-center" style={{ color: 'var(--color-primary)' }}>
        {t('attach_scanned_document')}
      </h3>
      <p className="text-sm text-gray-600 text-center">{t('attach_scanned_document_hint')}</p>
      <div className="space-y-2">
        <Label htmlFor="elt-scan">{t('scanned_document')}</Label>
        <Input
          id="elt-scan"
          ref={inputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => {
            setFile(e.target.files?.[0] || null);
            setIsSent(false);
          }}
        />
      </div>
      {isSent && <p className="text-sm text-center text-green-700">{t('scan_sent')}</p>}
      <div className="flex justify-center">
        <Button
          type="button"
          onClick={handleSend}
          disabled={isSending || !file}
          className="text-white px-8 py-2 hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)' }}
        >
          {isSending ? t('sending') : t('send')}
        </Button>
      </div>
    </div>
  );
}

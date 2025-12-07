//@ts-nocheck
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { ChevronDown, ChevronUp, MessageCircle, X } from 'lucide-react';

// Функция для генерации HMAC-SHA256 хеша (совместимая с Node.js crypto)
async function generateUserHash(userId: string, secretKey: string): Promise<string> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secretKey);
    const messageData = encoder.encode(userId);

    // Импортируем ключ для HMAC
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    // Генерируем подпись
    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

    // Конвертируем в hex строку
    const hashArray = Array.from(new Uint8Array(signature));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
  } catch (error) {
    console.error('Error generating user hash:', error);
    // Fallback: возвращаем пустую строку, если crypto API недоступен
    return '';
  }
}

export const InventAIChat: React.FC = () => {
  const { user, isAuthenticated } = useSelector((state: any) => state.auth);
  const [iframeSrc, setIframeSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isMinimized, setIsMinimized] = useState(true);

  useEffect(() => {
    // Секретный ключ ассистента
    const secretKey = 'sk_1ax1wR8rpupXCkEkQdMmwb';
    // ID ассистента
    const assistantId = 'ast_5wJVIVBhpXeFN9MyXn4bPu';

    // Генерируем userId и userHash
    const initWidget = async () => {
      let userId: string;
      
      if (isAuthenticated && user?.id) {
        userId = `user_${user.id}`;
      } else {
        // Для неавторизованных пользователей используем уникальный ID из localStorage
        let guestId = localStorage.getItem('guest_id');
        if (!guestId) {
          guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('guest_id', guestId);
        }
        userId = guestId;
      }

      // Генерируем userHash
      const userHash = await generateUserHash(userId, secretKey);
      
      console.log('Invent AI - User ID:', userId);
      console.log('Invent AI - User Hash:', userHash);

      // Формируем URL для iframe с параметрами пользователя
      const baseUrl = `https://www.useinvent.com/e/${assistantId}`;
      const urlWithParams = new URL(baseUrl);
      urlWithParams.searchParams.set('userId', userId);
      urlWithParams.searchParams.set('userHash', userHash);
      
      setIframeSrc(urlWithParams.toString());
      setIsLoading(false);
    };

    initWidget();
  }, [user, isAuthenticated]);

  if (isLoading || !iframeSrc) {
    return null;
  }

  return (
    <div 
      className="fixed bottom-4 right-4 z-[9999] transition-all duration-300 ease-in-out"
      style={{ 
        width: isMinimized ? '320px' : '400px',
        height: isMinimized ? '60px' : '600px',
        maxWidth: 'calc(100vw - 2rem)',
        maxHeight: isMinimized ? '60px' : 'calc(100vh - 2rem)'
      }}
    >
      <div 
        className="w-full h-full rounded-lg shadow-lg overflow-hidden bg-white flex flex-col"
        style={{
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
        }}
      >
        {/* Заголовок с кнопками управления */}
        <div className="bg-[#213659] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={20} />
            <span className="font-semibold">Белаэронавигация</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 hover:bg-white/20 rounded transition-colors"
              aria-label={isMinimized ? 'Развернуть' : 'Свернуть'}
            >
              {isMinimized ? (
                <ChevronUp size={20} />
              ) : (
                <ChevronDown size={20} />
              )}
            </button>
          </div>
        </div>

        {/* Контент iframe */}
        {!isMinimized && (
          <div className="flex-1 overflow-hidden">
            <iframe
              src={iframeSrc}
              width="100%"
              height="100%"
              title="AI Assistant"
              className="border-0"
              allow="microphone; camera"
              loading="lazy"
            />
          </div>
        )}
      </div>
    </div>
  );
};


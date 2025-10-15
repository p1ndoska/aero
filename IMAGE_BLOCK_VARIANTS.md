# 🖼️ Варианты добавления изображений в блоки

## ✅ Текущий вариант (реализован)

Левый верхний блок теперь содержит:
- **Фоновое изображение**: `sky-bg.jpg` с прозрачностью 20%
- **Логотип**: `logo.png` в центре
- **Приветственный текст**: "Добро пожаловать" + название предприятия
- **Градиентный фон**: от голубого к светло-голубому

## 🎨 Альтернативные варианты

### Вариант 1: Простое фоновое изображение
```tsx
<motion.div
    className="flex-[2] bg-cover bg-center rounded-2xl shadow-md min-h-[150px] relative"
    style={{ backgroundImage: "url('/your-image.jpg')" }}
>
    <div className="absolute inset-0 bg-black bg-opacity-40 rounded-2xl" />
    <div className="relative z-10 flex items-center justify-center h-full">
        <h2 className="text-white text-2xl font-bold text-center">
            {t('welcome')}
        </h2>
    </div>
</motion.div>
```

### Вариант 2: Изображение слева, текст справа
```tsx
<motion.div
    className="flex-[2] bg-white rounded-2xl shadow-md flex items-center min-h-[150px] overflow-hidden"
>
    <div className="w-1/2 h-full">
        <img 
            src="/your-image.jpg" 
            alt="Описание"
            className="w-full h-full object-cover"
        />
    </div>
    <div className="w-1/2 p-6">
        <h2 className="text-xl font-bold text-[#213659] mb-2">
            {t('welcome')}
        </h2>
        <p className="text-[#213659] text-sm">
            Описание блока
        </p>
    </div>
</motion.div>
```

### Вариант 3: Карточка с изображением сверху
```tsx
<motion.div
    className="flex-[2] bg-white rounded-2xl shadow-md overflow-hidden min-h-[150px]"
>
    <div className="h-2/3 bg-cover bg-center" 
         style={{ backgroundImage: "url('/your-image.jpg')" }}>
    </div>
    <div className="h-1/3 p-4 flex items-center justify-center">
        <h2 className="text-lg font-bold text-[#213659] text-center">
            {t('welcome')}
        </h2>
    </div>
</motion.div>
```

### Вариант 4: Анимированное изображение
```tsx
<motion.div
    className="flex-[2] bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-md overflow-hidden min-h-[150px] relative"
>
    <motion.img 
        src="/your-image.jpg"
        alt="Анимированное изображение"
        className="absolute inset-0 w-full h-full object-cover"
        animate={{ 
            scale: [1, 1.1, 1],
            opacity: [0.8, 1, 0.8]
        }}
        transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
        }}
    />
    <div className="absolute inset-0 bg-black bg-opacity-30" />
    <div className="relative z-10 flex items-center justify-center h-full">
        <motion.h2 
            className="text-white text-2xl font-bold"
            animate={{ y: [0, -10, 0] }}
            transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }}
        >
            {t('welcome')}
        </motion.h2>
    </div>
</motion.div>
```

## 🖼️ Рекомендуемые изображения

### Для авиационной тематики:
- Самолеты в полете
- Аэропорты и взлетные полосы
- Авиадиспетчерские вышки
- Карты воздушных маршрутов
- Символы аэронавигации

### Размещение файлов:
```
public/
├── images/
│   ├── aircraft.jpg
│   ├── airport.jpg
│   ├── navigation.jpg
│   └── sky-sunset.jpg
```

### Использование:
```tsx
// Вместо url('/sky-bg.jpg')
style={{ backgroundImage: "url('/images/aircraft.jpg')" }}
```

## 🎯 Как изменить текущий блок

### Заменить фоновое изображение:
```tsx
// В App.tsx, строка 27
style={{ backgroundImage: "url('/images/your-new-image.jpg')" }}
```

### Заменить логотип:
```tsx
// В App.tsx, строка 36
<img 
    src="/images/your-logo.png" 
    alt="Ваш логотип" 
    className="h-16 w-auto mx-auto opacity-80"
/>
```

### Добавить кнопку:
```tsx
// После описания, перед закрывающим </div>
<Button className="mt-4 bg-[#213659] hover:bg-[#1a2a4a] text-white">
    {t('read_more')}
</Button>
```

## 📱 Адаптивность

Все варианты автоматически адаптируются под:
- **Desktop**: Полный размер блока
- **Tablet**: Уменьшенные размеры
- **Mobile**: Вертикальная компоновка

## 🔧 CSS классы для кастомизации

```css
/* Собственные стили */
.custom-block {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
}

.custom-block img {
    filter: brightness(0.8) contrast(1.2);
    transition: transform 0.3s ease;
}

.custom-block:hover img {
    transform: scale(1.05);
}
```

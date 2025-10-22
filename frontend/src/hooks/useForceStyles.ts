import { useEffect } from 'react';

export const useForceStyles = (dependencies: any[] = []) => {
  useEffect(() => {
    const applyStyles = () => {
      // Применяем стили ко всем элементам с data-align
      const elements = document.querySelectorAll('[data-align]');
      elements.forEach((element) => {
        const align = element.getAttribute('data-align');
        if (align) {
          (element as HTMLElement).style.setProperty('text-align', align, 'important');
        }
      });

      // Применяем стили ко всем заголовкам и абзацам
      const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
      headings.forEach((element) => {
        const htmlElement = element as HTMLElement;
        
        // Принудительно применяем выравнивание
        if (htmlElement.getAttribute('data-align')) {
          const align = htmlElement.getAttribute('data-align');
          htmlElement.style.setProperty('text-align', align!, 'important');
        }
        
        // Принудительно применяем цвет из data-атрибута или inline стиля
        const colorAttr = htmlElement.getAttribute('data-color');
        if (colorAttr) {
          htmlElement.style.setProperty('color', colorAttr, 'important');
        } else if (htmlElement.style.color && htmlElement.style.color !== 'rgb(0, 0, 0)') {
          htmlElement.style.setProperty('color', htmlElement.style.color, 'important');
        }
      });

      // Дополнительно применяем стили ко всем элементам с force-классами
      const forceElements = document.querySelectorAll('[class*="force-text-"]');
      forceElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const className = htmlElement.className;
        
        // Извлекаем выравнивание из класса
        const alignMatch = className.match(/force-text-(center|left|right|justify)/);
        if (alignMatch) {
          htmlElement.style.setProperty('text-align', alignMatch[1], 'important');
        }
      });

      // Принудительно применяем стили ко всем элементам с inline стилями
      const elementsWithInlineStyles = document.querySelectorAll('[style*="text-align"]');
      elementsWithInlineStyles.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const style = htmlElement.getAttribute('style');
        if (style) {
          const alignMatch = style.match(/text-align:\s*([^;]+)/);
          if (alignMatch) {
            htmlElement.style.setProperty('text-align', alignMatch[1].trim(), 'important');
          }
        }
      });

      // Принудительно применяем стили ко всем элементам с inline цветами
      const elementsWithInlineColors = document.querySelectorAll('[style*="color"]');
      elementsWithInlineColors.forEach((element) => {
        const htmlElement = element as HTMLElement;
        const style = htmlElement.getAttribute('style');
        if (style) {
          const colorMatch = style.match(/color:\s*([^;]+)/);
          if (colorMatch) {
            htmlElement.style.setProperty('color', colorMatch[1].trim(), 'important');
          }
        }
      });
    };

    // Применяем стили сразу
    applyStyles();

    // Применяем стили после каждого обновления
    const timeoutId = setTimeout(applyStyles, 100);
    
    // Принудительное применение стилей каждые 500ms
    const intervalId = setInterval(applyStyles, 500);
    
    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, dependencies);

  // MutationObserver для отслеживания изменений в DOM
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as HTMLElement;
              
              // Применяем стили к новым элементам
              if (element.hasAttribute('data-align')) {
                const align = element.getAttribute('data-align');
                if (align) {
                  element.style.setProperty('text-align', align, 'important');
                }
              }
              
              if (element.hasAttribute('data-color')) {
                const color = element.getAttribute('data-color');
                if (color) {
                  element.style.setProperty('color', color, 'important');
                }
              }
              
              // Применяем стили к дочерним элементам
              const childElements = element.querySelectorAll('[data-align], [data-color], [class*="force-text-"]');
              childElements.forEach((child) => {
                const childElement = child as HTMLElement;
                
                if (childElement.hasAttribute('data-align')) {
                  const align = childElement.getAttribute('data-align');
                  if (align) {
                    childElement.style.setProperty('text-align', align, 'important');
                  }
                }
                
                if (childElement.hasAttribute('data-color')) {
                  const color = childElement.getAttribute('data-color');
                  if (color) {
                    childElement.style.setProperty('color', color, 'important');
                  }
                }
                
                // Применяем стили из force-классов
                const className = childElement.className;
                const alignMatch = className.match(/force-text-(center|left|right|justify)/);
                if (alignMatch) {
                  childElement.style.setProperty('text-align', alignMatch[1], 'important');
                }
              });
            }
          });
        }
      });
    });

    // Начинаем наблюдение за всем документом
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
    };
  }, []);
};

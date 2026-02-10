import { describe, it, expect, vi } from 'vitest';

/**
 * Тесты для функции генерации капчи на фронтенде
 */

describe('Генерация капчи (Frontend)', () => {
  // Функция генерации капчи (копия из компонентов)
  const generateNewCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  it('должен генерировать строку длиной 7 символов', () => {
    const captcha = generateNewCaptcha();
    expect(captcha).toHaveLength(7);
  });

  it('должен генерировать разные значения при каждом вызове', () => {
    const captcha1 = generateNewCaptcha();
    const captcha2 = generateNewCaptcha();
    const captcha3 = generateNewCaptcha();

    // Вероятность совпадения очень мала
    const allSame = captcha1 === captcha2 && captcha2 === captcha3;
    expect(allSame).toBe(false);
  });

  it('должен генерировать строку только из допустимых символов', () => {
    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const captcha = generateNewCaptcha();

    for (let i = 0; i < captcha.length; i++) {
      expect(validChars).toContain(captcha[i]);
    }
  });

  it('должен генерировать строку, содержащую только буквы и цифры', () => {
    const captcha = generateNewCaptcha();
    const regex = /^[A-Za-z0-9]{7}$/;
    expect(captcha).toMatch(regex);
  });

  it('должен генерировать уникальные значения при множественных вызовах', () => {
    const captchas = new Set<string>();
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      captchas.add(generateNewCaptcha());
    }

    // Хотя бы 90% должны быть уникальными
    expect(captchas.size).toBeGreaterThan(iterations * 0.9);
  });

  it('должен генерировать строку без пробелов и специальных символов', () => {
    const captcha = generateNewCaptcha();
    expect(captcha).not.toMatch(/\s/);
    expect(captcha).not.toMatch(/[^A-Za-z0-9]/);
  });

  it('должен работать корректно при множественных последовательных вызовах', () => {
    const results: string[] = [];
    for (let i = 0; i < 50; i++) {
      results.push(generateNewCaptcha());
    }

    // Все результаты должны быть валидными
    results.forEach((captcha) => {
      expect(captcha).toHaveLength(7);
      expect(captcha).toMatch(/^[A-Za-z0-9]{7}$/);
    });
  });
});




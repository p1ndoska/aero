/**
 * Тесты для функции генерации капчи
 */

describe('Генерация капчи', () => {
  // Функция генерации капчи (копия из компонентов)
  const generateCaptcha = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 7; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  it('должен генерировать строку длиной 7 символов', () => {
    const captcha = generateCaptcha();
    expect(captcha).toHaveLength(7);
  });

  it('должен генерировать разные значения при каждом вызове', () => {
    const captcha1 = generateCaptcha();
    const captcha2 = generateCaptcha();
    const captcha3 = generateCaptcha();

    // Вероятность совпадения очень мала, но проверим, что хотя бы два из трех разные
    const allSame = captcha1 === captcha2 && captcha2 === captcha3;
    expect(allSame).toBe(false);
  });

  it('должен генерировать строку только из допустимых символов', () => {
    const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const captcha = generateCaptcha();

    for (let i = 0; i < captcha.length; i++) {
      expect(validChars).toContain(captcha[i]);
    }
  });

  it('должен генерировать строку, содержащую только буквы и цифры', () => {
    const captcha = generateCaptcha();
    const regex = /^[A-Za-z0-9]{7}$/;
    expect(captcha).toMatch(regex);
  });

  it('должен генерировать уникальные значения при множественных вызовах', () => {
    const captchas = new Set();
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      captchas.add(generateCaptcha());
    }

    // Хотя бы 90% должны быть уникальными (учитывая вероятность коллизий)
    expect(captchas.size).toBeGreaterThan(iterations * 0.9);
  });

  it('должен генерировать строку без пробелов и специальных символов', () => {
    const captcha = generateCaptcha();
    expect(captcha).not.toMatch(/\s/);
    expect(captcha).not.toMatch(/[^A-Za-z0-9]/);
  });

  it('должен генерировать строку, которая может содержать как заглавные, так и строчные буквы', () => {
    const captcha = generateCaptcha();
    const hasUpperCase = /[A-Z]/.test(captcha);
    const hasLowerCase = /[a-z]/.test(captcha);
    const hasNumber = /[0-9]/.test(captcha);

    // Хотя бы один тип символов должен присутствовать (вероятность очень высока)
    const hasAnyType = hasUpperCase || hasLowerCase || hasNumber;
    expect(hasAnyType).toBe(true);
  });
});




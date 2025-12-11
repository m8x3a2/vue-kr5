// src/utils/colorUtils.js

// Генерация случайного HEX
export const generateRandomHex = () => {
  return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0').toUpperCase();
}

// HEX -> RGB
export const hexToRgb = (hex) => {
  // Убираем # если есть
  hex = hex.replace(/^#/, '');
  
  // Парсим
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return { r, g, b };
}

// RGB -> HSL
export const rgbToHsl = (r, g, b) => {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0; 
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

// HSL -> HEX
export const hslToHex = (h, s, l) => {
  l /= 100;
  const a = s * Math.min(l, 1 - l) / 100;
  const f = n => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`.toUpperCase();
}

// Расчет относительной яркости (для WCAG)
const getLuminance = (r, g, b) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// Коэффициент контрастности
export const getContrastRatio = (hex1, hex2) => {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  return (brightest + 0.05) / (darkest + 0.05);
}

// Текстовая расшифровка уровня доступности (WCAG)
export const getAccessibilityLevel = (ratio) => {
  if (ratio >= 7) return 'AAA'; // Отлично
  if (ratio >= 4.5) return 'AA'; // Хорошо
  if (ratio >= 3) return 'AA Large'; // Для крупного текста
  return 'Fail'; // Недостаточно
}

// Генерация цвета по настроению (Mood)
export const generateMoodColor = (mood) => {
  let h, s, l;

  switch (mood) {
    case 'calm': // Спокойные: любые оттенки, низкая насыщенность, высокая светлота
      h = Math.floor(Math.random() * 360);
      s = Math.floor(Math.random() * 40) + 20; // 20-60%
      l = Math.floor(Math.random() * 30) + 60; // 60-90%
      break;
    case 'energetic': // Энергичные: яркие, высокая насыщенность
      h = Math.floor(Math.random() * 360);
      s = Math.floor(Math.random() * 30) + 70; // 70-100%
      l = Math.floor(Math.random() * 30) + 45; // 45-75%
      break;
    case 'professional': // Строгие: синие/холодные тона, сдержанные
      h = Math.floor(Math.random() * 80) + 180; // 180-260 (Cyan -> Blue -> Purple)
      s = Math.floor(Math.random() * 40) + 10; // 10-50%
      l = Math.floor(Math.random() * 40) + 30; // 30-70%
      break;
    default:
      return generateRandomHex();
  }
  return hslToHex(h, s, l);
}

// Основная функция генерации палитры
export const generateHarmony = (baseHex, mode, count) => {
  // 1. Обработка режимов настроения
  if (['calm', 'energetic', 'professional'].includes(mode)) {
    const colors = [];
    // Для настроений генерируем набор независимых цветов в заданном диапазоне
    // Либо можно адаптировать базу, но для разнообразия генерируем новые
    for (let i = 0; i < count; i++) {
        colors.push(generateMoodColor(mode));
    }
    return colors;
  }

  // 2. Обработка математических гармоний
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);
  const colors = [];

  for (let i = 0; i < count; i++) {
    let newH = hsl.h;
    let newS = hsl.s;
    let newL = hsl.l;

    if (mode === 'analogous') {
      newH = (hsl.h + (i * 30)) % 360;
    } else if (mode === 'monochromatic') {
      newL = Math.max(10, Math.min(90, hsl.l + (i * 15 - (count * 15 / 2))));
    } else if (mode === 'triad') {
       newH = (hsl.h + (i * 120)) % 360;
    } else if (mode === 'complementary') {
       newH = (hsl.h + (i * 180)) % 360;
    } else {
       // Fallback for random
       if (i === 0) return baseHex;
       colors.push(generateRandomHex());
       continue;
    }
    colors.push(hslToHex(newH, newS, newL));
  }
  return colors;
}
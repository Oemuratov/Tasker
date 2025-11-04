/**
 * Форматирует продолжительность времени в секундах в человекочитаемый формат.
 * Показывает только значимые единицы (недели, дни, часы, минуты, секунды).
 * 
 * @param seconds - Продолжительность в секундах
 * @returns Отформатированная строка, например: "1 нед 2 д 3 ч 4 мин 5 сек"
 */
export function formatDuration(seconds: number): string {
  // Константы для конвертации времени
  const SECONDS_PER_MINUTE = 60;
  const SECONDS_PER_HOUR = 3600;
  const SECONDS_PER_DAY = 86400; // 24 * 60 * 60
  const SECONDS_PER_WEEK = 604800; // 7 * 24 * 60 * 60

  // Округляем до целого числа секунд
  let remaining = Math.floor(seconds);

  // Вычисляем каждую единицу времени
  const weeks = Math.floor(remaining / SECONDS_PER_WEEK);
  remaining %= SECONDS_PER_WEEK;

  const days = Math.floor(remaining / SECONDS_PER_DAY);
  remaining %= SECONDS_PER_DAY;

  const hours = Math.floor(remaining / SECONDS_PER_HOUR);
  remaining %= SECONDS_PER_HOUR;

  const minutes = Math.floor(remaining / SECONDS_PER_MINUTE);
  remaining %= SECONDS_PER_MINUTE;

  // Функция для получения правильной формы слова в русском языке
  // 1 - единственное число, 2-4 - форма 2, 5+ - форма 3
  const getPluralForm = (num: number, forms: [string, string, string]): string => {
    const mod10 = num % 10;
    const mod100 = num % 100;
    if (mod100 >= 11 && mod100 <= 19) return forms[2]; // 11-19 всегда форма 3
    if (mod10 === 1) return forms[0]; // 1, 21, 31... - форма 1
    if (mod10 >= 2 && mod10 <= 4) return forms[1]; // 2-4, 22-24... - форма 2
    return forms[2]; // 5-9, 0, 10, 20... - форма 3
  };

  // Собираем массив частей, показывая только ненулевые значения
  const parts: string[] = [];

  if (weeks > 0) {
    const form = getPluralForm(weeks, ["нед", "нед", "нед"]);
    parts.push(`${weeks} ${form}`);
  }
  if (days > 0) {
    const form = getPluralForm(days, ["д", "д", "д"]);
    parts.push(`${days} ${form}`);
  }
  if (hours > 0) {
    const form = getPluralForm(hours, ["ч", "ч", "ч"]);
    parts.push(`${hours} ${form}`);
  }
  if (minutes > 0) {
    const form = getPluralForm(minutes, ["мин", "мин", "мин"]);
    parts.push(`${minutes} ${form}`);
  }
  if (remaining > 0 || parts.length === 0) {
    const form = getPluralForm(remaining, ["сек", "сек", "сек"]);
    parts.push(`${remaining} ${form}`);
  }

  // Возвращаем объединенную строку
  return parts.join(" ");
}


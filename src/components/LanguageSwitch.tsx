import { useTranslate, type Lang } from '@/hooks/useTranslate';

export default function LanguageSwitch() {
  const { language, changeLanguage } = useTranslate();

  return (
    <select
      value={language}
      onChange={(e) => changeLanguage(e.target.value as Lang)}
      className="bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm"
    >
      <option value="ru">🇷🇺 Русский</option>
      <option value="cn">🇨🇳 中文</option>
      <option value="kz">🇰🇿 Қазақша</option>
    </select>
  );
}
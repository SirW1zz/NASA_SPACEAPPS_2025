import { WeatherCondition, WeatherTheme } from '../types/weather';

export const weatherThemes: Record<WeatherCondition, WeatherTheme> = {
  'sunny': {
    gradient: 'linear-gradient(135deg, #FDB813 0%, #F97316 50%, #FEF3C7 100%)',
    primary: '#F97316',
    secondary: '#FDB813',
    accent: '#FBBF24',
    text: '#1F2937',
    cardBg: 'rgba(251, 191, 36, 0.12)',
    icon: '☀️'
  },
  'partly-cloudy': {
    gradient: 'linear-gradient(135deg, #60A5FA 0%, #93C5FD 50%, #E0F2FE 100%)',
    primary: '#60A5FA',
    secondary: '#93C5FD',
    accent: '#3B82F6',
    text: '#1F2937',
    cardBg: 'rgba(96, 165, 250, 0.12)',
    icon: '⛅'
  },
  'cloudy': {
    gradient: 'linear-gradient(135deg, #6B7280 0%, #9CA3AF 50%, #D1D5DB 100%)',
    primary: '#6B7280',
    secondary: '#9CA3AF',
    accent: '#4B5563',
    text: '#1F2937',
    cardBg: 'rgba(107, 114, 128, 0.12)',
    icon: '☁️'
  },
  'rainy': {
    gradient: 'linear-gradient(135deg, #0C4A6E 0%, #0369A1 50%, #1E293B 100%)',
    primary: '#0EA5E9',
    secondary: '#38BDF8',
    accent: '#0284C7',
    text: '#F9FAFB',
    cardBg: 'rgba(14, 165, 233, 0.18)',
    icon: '🌧️'
  },
  'stormy': {
    gradient: 'linear-gradient(135deg, #1E1B4B 0%, #3730A3 50%, #1F2937 100%)',
    primary: '#7C3AED',
    secondary: '#8B5CF6',
    accent: '#A78BFA',
    text: '#F9FAFB',
    cardBg: 'rgba(124, 58, 237, 0.18)',
    icon: '⛈️'
  },
  'snowy': {
    gradient: 'linear-gradient(135deg, #334155 0%, #64748B 50%, #CBD5E1 100%)',
    primary: '#64748B',
    secondary: '#94A3B8',
    accent: '#475569',
    text: '#F9FAFB',
    cardBg: 'rgba(100, 116, 139, 0.18)',
    icon: '❄️'
  },
  'clear-night': {
    gradient: 'linear-gradient(135deg, #0F172A 0%, #1E293B 50%, #334155 100%)',
    primary: '#6366F1',
    secondary: '#818CF8',
    accent: '#A5B4FC',
    text: '#F9FAFB',
    cardBg: 'rgba(99, 102, 241, 0.18)',
    icon: '🌙'
  }
};

export function getWeatherTheme(condition: WeatherCondition): WeatherTheme {
  return weatherThemes[condition];
}

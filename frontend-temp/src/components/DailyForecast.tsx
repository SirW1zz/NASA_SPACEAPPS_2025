import { Card } from './ui/card';
import { getWeatherTheme } from '../lib/weather-themes';
import { WeatherCondition, DailyForecastData } from '../types/weather';
import { motion } from 'motion/react';

interface DailyForecastProps {
  forecast: DailyForecastData[];
  currentCondition: WeatherCondition;
}

export function DailyForecast({ forecast, currentCondition }: DailyForecastProps) {
  const theme = getWeatherTheme(currentCondition);

  return (
    <Card className="p-6 border-0" style={{ backgroundColor: theme.cardBg }}>
      <h3 className="mb-4" style={{ color: theme.text }}>7-Day Forecast</h3>
      <div className="space-y-3">
        {forecast.map((item, index) => {
          const itemTheme = getWeatherTheme(item.condition);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="flex items-center justify-between p-4 rounded-xl"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
            >
              <div className="flex items-center gap-4 flex-1">
                <p className="min-w-[50px]">{item.day}</p>
                <div className="text-2xl">{itemTheme.icon}</div>
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm opacity-70">
                  <span>💧</span>
                  <span>{item.precipitation}%</span>
                </div>
                <div className="flex items-center gap-2 min-w-[80px] justify-end">
                  <span className="opacity-60">{item.low}°</span>
                  <span className="text-xl">{item.high}°</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </Card>
  );
}

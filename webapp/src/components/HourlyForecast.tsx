import { Card } from './ui/card';
import { ScrollArea } from './ui/scroll-area';
import { getWeatherTheme } from '../lib/weather-themes';
import { WeatherCondition } from '../types/weather';
import { motion } from 'motion/react';

interface HourlyForecastProps {
  forecast: Array<{
    hour: string;
    temperature: number;
    condition: WeatherCondition;
    precipitation: number;
  }>;
  currentCondition: WeatherCondition;
}

export function HourlyForecast({ forecast, currentCondition }: HourlyForecastProps) {
  const theme = getWeatherTheme(currentCondition);

  return (
    <Card className="p-6 border-0" style={{ backgroundColor: theme.cardBg }}>
      <h3 className="mb-4" style={{ color: theme.text }}>Hourly Forecast</h3>
      <ScrollArea className="w-full">
        <div className="flex gap-4 pb-4">
          {forecast.slice(0, 12).map((item, index) => {
            const itemTheme = getWeatherTheme(item.condition);
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                className="flex flex-col items-center gap-2 min-w-[80px] p-4 rounded-2xl"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
              >
                <p className="text-sm opacity-70">{item.hour}</p>
                <div className="text-3xl">{itemTheme.icon}</div>
                <p className="text-xl">{item.temperature}°</p>
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <span>💧</span>
                  <span>{item.precipitation}%</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </ScrollArea>
    </Card>
  );
}

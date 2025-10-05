import { WeatherData } from '../types/weather';
import { getWeatherTheme } from '../lib/weather-themes';
import { Card } from './ui/card';
import { 
  Droplets, 
  Wind, 
  Eye, 
  Sun, 
  CloudRain,
  Thermometer,
  Activity
} from 'lucide-react';
import { motion } from 'motion/react';

interface WeatherHomeProps {
  weather: WeatherData;
  layout: 'compact' | 'detailed' | 'minimal';
}

export function WeatherHome({ weather, layout }: WeatherHomeProps) {
  const theme = getWeatherTheme(weather.condition);

  const WeatherIcon = () => {
    switch (weather.condition) {
      case 'sunny':
        return <Sun className="w-32 h-32" style={{ color: theme.secondary }} />;
      case 'rainy':
      case 'stormy':
        return <CloudRain className="w-32 h-32" style={{ color: theme.secondary }} />;
      default:
        return <Sun className="w-32 h-32" style={{ color: theme.secondary }} />;
    }
  };

  const metrics = [
    { icon: Thermometer, label: 'Feels Like', value: `${weather.feelsLike}°` },
    { icon: Droplets, label: 'Humidity', value: `${weather.humidity}%` },
    { icon: Wind, label: 'Wind', value: `${weather.windSpeed} km/h` },
    { icon: CloudRain, label: 'Rain', value: `${weather.precipitation}%` },
    { icon: Sun, label: 'UV Index', value: weather.uvIndex },
    { icon: Activity, label: 'Air Quality', value: weather.airQuality }
  ];

  if (layout === 'minimal') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: theme.gradient }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="opacity-80" style={{ color: theme.text }}>
              {weather.location}
            </p>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="text-7xl" style={{ color: theme.text }}>
                {weather.temperature}°
              </span>
            </div>
          </div>
          <WeatherIcon />
        </div>
      </motion.div>
    );
  }

  if (layout === 'compact') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: theme.gradient }}
      >
        <div className="text-center mb-6">
          <p className="opacity-80 mb-2" style={{ color: theme.text }}>
            {weather.location}
          </p>
          <div className="flex items-center justify-center gap-4">
            <WeatherIcon />
            <div>
              <div className="text-7xl mb-2" style={{ color: theme.text }}>
                {weather.temperature}°
              </div>
              <p className="opacity-80" style={{ color: theme.text }}>
                Feels like {weather.feelsLike}°
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {metrics.slice(0, 3).map((metric, index) => (
            <Card
              key={index}
              className="p-4 border-0"
              style={{ backgroundColor: theme.cardBg }}
            >
              <metric.icon className="w-5 h-5 mb-2" style={{ color: theme.primary }} />
              <p className="text-sm opacity-70">{metric.label}</p>
              <p className="text-lg mt-1">{metric.value}</p>
            </Card>
          ))}
        </div>
      </motion.div>
    );
  }

  // Detailed layout
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div
        className="relative overflow-hidden rounded-3xl p-8"
        style={{ background: theme.gradient }}
      >
        <div className="text-center">
          <p className="opacity-80 mb-4" style={{ color: theme.text }}>
            {weather.location}
          </p>
          <div className="flex items-center justify-center gap-6 mb-6">
            <WeatherIcon />
            <div className="text-left">
              <div className="text-8xl mb-2" style={{ color: theme.text }}>
                {weather.temperature}°
              </div>
              <p className="text-xl opacity-80" style={{ color: theme.text }}>
                Feels like {weather.feelsLike}°
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {metrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="p-6 border-0"
              style={{ backgroundColor: theme.cardBg }}
            >
              <div className="flex items-center gap-3 mb-2">
                <metric.icon className="w-6 h-6" style={{ color: theme.primary }} />
                <p className="opacity-70">{metric.label}</p>
              </div>
              <p className="text-2xl mt-2">{metric.value}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

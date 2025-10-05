import { useState } from 'react';
import { WeatherData, ForecastSummary } from '../types/weather';
import { getWeatherTheme } from '../lib/weather-themes';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Calendar,
  Search,
  TrendingUp,
  TrendingDown,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  Activity,
  ChevronLeft,
  ChevronRight,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence, PanInfo } from 'motion/react';

interface ForecastCardData {
  id: string;
  title: string;
  period: string;
  type: 'current' | 'day' | 'week' | 'month' | 'sixmonth';
  data?: WeatherData | ForecastSummary;
}

interface StackedForecastCardsProps {
  currentWeather: WeatherData;
  nextDayData: WeatherData;
  weeklyData: ForecastSummary;
  monthlyData: ForecastSummary;
  sixMonthData: ForecastSummary;
  layout?: 'detailed' | 'compact' | 'minimal';
}

export function StackedForecastCards({
  currentWeather,
  nextDayData,
  weeklyData,
  monthlyData,
  sixMonthData,
  layout = 'detailed'
}: StackedForecastCardsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [searchDate, setSearchDate] = useState('');

  const cards: ForecastCardData[] = [
    {
      id: 'current',
      title: 'Current Weather',
      period: 'Now',
      type: 'current',
      data: currentWeather
    },
    {
      id: 'nextday',
      title: 'Next Day Forecast',
      period: 'Tomorrow',
      type: 'day',
      data: nextDayData
    },
    {
      id: 'week',
      title: 'Weekly Outlook',
      period: 'Next 7 Days',
      type: 'week',
      data: weeklyData
    },
    {
      id: 'month',
      title: 'Monthly Forecast',
      period: 'Next 30 Days',
      type: 'month',
      data: monthlyData
    },
    {
      id: 'sixmonth',
      title: 'Long-term Outlook',
      period: 'Next 6 Months',
      type: 'sixmonth',
      data: sixMonthData
    }
  ];

  const activeCard = cards[activeIndex];
  const theme = getWeatherTheme(
    activeCard.type === 'current' 
      ? currentWeather.condition 
      : (activeCard.data?.dominantCondition || 'partly-cloudy')
  );

  const handleNext = () => {
    if (activeIndex < cards.length - 1) {
      setActiveIndex(activeIndex + 1);
    }
  };

  const handlePrev = () => {
    if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    const threshold = 50;
    if (info.offset.y > threshold && activeIndex > 0) {
      handlePrev();
    } else if (info.offset.y < -threshold && activeIndex < cards.length - 1) {
      handleNext();
    }
  };

  const WeatherIcon = () => {
    const iconSize = 64;
    const iconColor = theme.text;
    
    if (activeCard.type === 'current') {
      const condition = currentWeather.condition;
      
      if (condition === 'sunny') return <Sun size={iconSize} color={iconColor} />;
      if (condition === 'rainy' || condition === 'stormy') return <CloudRain size={iconSize} color={iconColor} />;
      if (condition === 'partly-cloudy' || condition === 'cloudy') return <Sun size={iconSize} color={iconColor} className="opacity-70" />;
      return <Sun size={iconSize} color={iconColor} />;
    }
    
    const condition = activeCard.data?.dominantCondition || 'partly-cloudy';
    if (condition === 'sunny') return <Sun size={iconSize} color={iconColor} />;
    if (condition === 'rainy' || condition === 'stormy') return <CloudRain size={iconSize} color={iconColor} />;
    return <Sun size={iconSize} color={iconColor} className="opacity-70" />;
  };

  const renderCardContent = (card: ForecastCardData) => {
    if (card.type === 'current') {
      const weather = card.data as WeatherData;
      return (
        <div className="text-center">
          <p className="opacity-80 mb-3" style={{ color: theme.text }}>
            {weather.location}
          </p>
          <div className="flex items-center justify-center gap-6 mb-4">
            <WeatherIcon />
            <div className="text-left">
              <div className="text-7xl mb-2" style={{ color: theme.text }}>
                {weather.temperature}°
              </div>
              <p className="opacity-80" style={{ color: theme.text }}>
                Feels like {weather.feelsLike}°
              </p>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-3 mt-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Droplets className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>Humidity</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.humidity}%</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Wind className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>Wind</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.windSpeed} mph</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sun className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>UV Index</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.uvIndex}</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Eye className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>AQI</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.airQuality}</span>
            </div>
          </div>
        </div>
      );
    }

    if (card.type === 'day') {
      const weather = card.data as WeatherData;
      return (
        <div className="text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <WeatherIcon />
            <div className="text-left">
              <div className="text-6xl mb-2" style={{ color: theme.text }}>
                {weather.temperature}°
              </div>
              <p className="opacity-80" style={{ color: theme.text }}>
                Tomorrow's forecast
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-4">
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Droplets className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>Rain</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.precipitation}%</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Wind className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>Wind</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.windSpeed} mph</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
              <Sun className="w-5 h-5" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>UV</span>
              <span className="text-sm" style={{ color: theme.text }}>{weather.uvIndex}</span>
            </div>
          </div>
        </div>
      );
    }

    // Week, Month, or 6-month summary
    const summary = card.data;
    return (
      <div className="text-center">
        <div className="flex items-center justify-center gap-6 mb-4">
          <WeatherIcon />
          <div className="text-left">
            <div className="text-6xl mb-2" style={{ color: theme.text }}>
              {summary.avgTemp}°
            </div>
            <p className="text-sm opacity-80" style={{ color: theme.text }}>
              Average temperature
            </p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm mb-3">
          <p className="text-sm leading-relaxed" style={{ color: theme.text }}>{summary.summary}</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <Sun className="w-4 h-4" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>Sunny Days</span>
            </div>
            <div className="text-xl" style={{ color: theme.text }}>{summary.sunnyDays}</div>
          </div>
          <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
            <div className="flex items-center gap-2 mb-1">
              <CloudRain className="w-4 h-4" style={{ color: theme.text }} />
              <span className="text-xs opacity-70" style={{ color: theme.text }}>Rainy Days</span>
            </div>
            <div className="text-xl" style={{ color: theme.text }}>{summary.rainyDays}</div>
          </div>
        </div>

        <div className="mt-3 p-3 rounded-xl bg-white/20 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs opacity-70" style={{ color: theme.text }}>Weather Index</span>
            <Badge style={{ backgroundColor: theme.primary, color: theme.text === '#F9FAFB' ? '#1F2937' : '#F9FAFB' }}>
              {summary.weatherIndex}/100
            </Badge>
          </div>
          <div className="w-full bg-white/30 rounded-full h-2 mt-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${summary.weatherIndex}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="h-2 rounded-full"
              style={{
                backgroundColor: theme.primary
              }}
            />
          </div>
        </div>

        {summary.tempTrend && (
          <div className="mt-3 flex items-center justify-center gap-2 p-2 rounded-xl bg-white/20 backdrop-blur-sm">
            {summary.tempTrend === 'rising' ? (
              <TrendingUp className="w-4 h-4" style={{ color: theme.text }} />
            ) : (
              <TrendingDown className="w-4 h-4" style={{ color: theme.text }} />
            )}
            <span className="text-sm" style={{ color: theme.text }}>
              Temperature {summary.tempTrend}
            </span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="relative">
      {/* Date Search Bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4"
      >
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
            <Input
              type="date"
              placeholder="Search for a specific date..."
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="pl-10 rounded-full border-2"
              style={{ borderColor: theme.primary }}
            />
          </div>
          <Button
            size="icon"
            className="rounded-full"
            style={{ backgroundColor: theme.primary, color: theme.text === '#F9FAFB' ? '#1F2937' : '#F9FAFB' }}
          >
            <Search className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>

      {/* Card Stack Container */}
      <div className="relative" style={{ perspective: '1500px', minHeight: '600px', paddingBottom: '20px' }}>
        <AnimatePresence mode="wait">
          {cards.map((card, index) => {
            const isActive = index === activeIndex;
            const offset = index - activeIndex;
            
            // Only show active card and cards behind it
            if (offset < 0) return null;

            return (
              <motion.div
                key={card.id}
                drag={isActive ? "y" : false}
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.2}
                onDragEnd={handleDragEnd}
                initial={false}
                animate={{
                  scale: 1 - offset * 0.05,
                  y: offset * 20,
                  zIndex: cards.length - index,
                  opacity: offset > 2 ? 0 : 1 - offset * 0.2
                }}
                transition={{
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className={`absolute w-full ${isActive ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'}`}
                style={{
                  transformStyle: 'preserve-3d',
                  backfaceVisibility: 'hidden'
                }}
              >
                <Card
                  className="overflow-hidden border-0 shadow-2xl flex flex-col"
                  style={{
                    background: theme.gradient,
                    minHeight: '550px'
                  }}
                >
                  {/* Card Header & Content */}
                  <div className="p-8 pb-4 flex-1">
                    {/* Card Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 style={{ color: theme.text }}>{card.title}</h3>
                        <p className="text-sm opacity-70 mt-1" style={{ color: theme.text }}>
                          {card.period}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Badge
                          variant="outline"
                          className="border-2"
                          style={{
                            borderColor: theme.primary,
                            color: theme.text,
                            backgroundColor: 'transparent'
                          }}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {index + 1}/{cards.length}
                        </Badge>
                      </div>
                    </div>

                    {/* Card Content */}
                    {renderCardContent(card)}
                  </div>

                  {/* Navigation Controls - Inside Each Card */}
                  <div className="p-6 pt-0 mt-auto">
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center justify-between px-5 py-4 rounded-2xl backdrop-blur-md shadow-lg"
                      style={{ 
                        backgroundColor: 'rgba(255, 255, 255, 0.2)',
                        border: `2px solid ${theme.primary}25`,
                        boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.1)`
                      }}
                    >
                      {/* Previous Button */}
                      <motion.div
                        whileHover={{ scale: activeIndex === 0 ? 1 : 1.1 }}
                        whileTap={{ scale: activeIndex === 0 ? 1 : 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-11 w-11 transition-all duration-300 shadow-md"
                          style={{
                            backgroundColor: activeIndex === 0 ? 'rgba(0, 0, 0, 0.05)' : `${theme.primary}40`,
                            color: theme.text,
                            opacity: activeIndex === 0 ? 0.3 : 1,
                            border: activeIndex !== 0 ? `1px solid ${theme.primary}50` : 'none'
                          }}
                          onClick={handlePrev}
                          disabled={activeIndex === 0}
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </Button>
                      </motion.div>

                      {/* Dots Navigation */}
                      <div className="flex gap-2.5 items-center px-2">
                        {cards.map((c, idx) => (
                          <motion.button
                            key={c.id}
                            onClick={() => isActive && setActiveIndex(idx)}
                            disabled={!isActive}
                            className="rounded-full transition-all duration-300"
                            style={{
                              width: idx === activeIndex ? '44px' : '11px',
                              height: '11px',
                              backgroundColor: idx === activeIndex ? theme.primary : `${theme.primary}35`,
                              border: idx === activeIndex ? `2px solid ${theme.text}30` : `1px solid ${theme.primary}20`,
                              cursor: isActive ? 'pointer' : 'default',
                              boxShadow: idx === activeIndex ? `0 2px 8px ${theme.primary}40` : 'none'
                            }}
                            whileHover={isActive ? { scale: 1.15 } : {}}
                            whileTap={isActive ? { scale: 0.9 } : {}}
                            aria-label={`Go to ${c.title}`}
                          />
                        ))}
                      </div>

                      {/* Next Button */}
                      <motion.div
                        whileHover={{ scale: activeIndex === cards.length - 1 ? 1 : 1.1 }}
                        whileTap={{ scale: activeIndex === cards.length - 1 ? 1 : 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="icon"
                          className="rounded-full h-11 w-11 transition-all duration-300 shadow-md"
                          style={{
                            backgroundColor: activeIndex === cards.length - 1 ? 'rgba(0, 0, 0, 0.05)' : `${theme.primary}40`,
                            color: theme.text,
                            opacity: activeIndex === cards.length - 1 ? 0.3 : 1,
                            border: activeIndex !== cards.length - 1 ? `1px solid ${theme.primary}50` : 'none'
                          }}
                          onClick={handleNext}
                          disabled={activeIndex === cards.length - 1}
                        >
                          <ChevronRight className="w-5 h-5" />
                        </Button>
                      </motion.div>
                    </motion.div>

                    {/* Swipe Hint - Only on first card */}
                    {index === 0 && activeIndex === 0 && (
                      <motion.p
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.5, duration: 0.5 }}
                        className="text-center mt-3 text-xs opacity-60"
                        style={{ color: theme.text }}
                      >
                        👆 Swipe up or use arrows to explore forecasts
                      </motion.p>
                    )}
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>


    </div>
  );
}

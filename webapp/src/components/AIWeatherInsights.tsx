import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';
import { WeatherData } from '../types/weather';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Sparkles, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';

interface AIWeatherInsightsProps {
  weatherData: WeatherData;
  calendarEvents?: any[];
  tasks?: any[];
  theme: {
    primary: string;
    text: string;
  };
}

export function AIWeatherInsights({ 
  weatherData, 
  calendarEvents, 
  tasks,
  theme 
}: AIWeatherInsightsProps) {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const generateInsight = async () => {
    setLoading(true);
    const result = await apiService.getWeatherInsights(weatherData, calendarEvents, tasks);
    
    if (result.data) {
      setInsight(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    generateInsight();
  }, [weatherData.condition, calendarEvents?.length, tasks?.length]);

  if (!insight && !loading) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <Card className="p-4 border-2" style={{ borderColor: theme.primary }}>
        <div className="flex items-start gap-3">
          <div 
            className="p-2 rounded-xl flex-shrink-0"
            style={{ backgroundColor: `${theme.primary}20` }}
          >
            <Sparkles 
              className="w-5 h-5" 
              style={{ color: theme.primary }}
            />
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h4 className="flex items-center gap-2">
                AI Weather Insight
              </h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={generateInsight}
                disabled={loading}
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            {loading ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
              </div>
            ) : (
              <p className="text-sm opacity-80 leading-relaxed">
                {insight}
              </p>
            )}
          </div>
        </div>

        {(calendarEvents && calendarEvents.length > 0) || (tasks && tasks.length > 0) ? (
          <div className="mt-4 pt-4 border-t space-y-2">
            {calendarEvents && calendarEvents.length > 0 && (
              <div className="text-xs opacity-60">
                📅 {calendarEvents.length} event{calendarEvents.length !== 1 ? 's' : ''} today
              </div>
            )}
            {tasks && tasks.length > 0 && (
              <div className="text-xs opacity-60">
                ✓ {tasks.length} pending task{tasks.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        ) : null}
      </Card>
    </motion.div>
  );
}
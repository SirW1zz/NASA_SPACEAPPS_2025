import { Card } from './ui/card';
import { getWeatherTheme } from '../lib/weather-themes';
import { WeatherCondition } from '../types/weather';
import { Shirt, ShoppingBag, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface OutfitCardProps {
  condition: WeatherCondition;
  recommendation: {
    clothing: string[];
    accessories: string[];
    reason: string;
  };
}

export function OutfitCard({ condition, recommendation }: OutfitCardProps) {
  const theme = getWeatherTheme(condition);

  return (
    <Card className="p-6 border-0 shadow-lg backdrop-blur-sm" style={{ backgroundColor: theme.cardBg }}>
      <div className="flex items-center gap-2 mb-5">
        <div className="p-2 rounded-xl" style={{ backgroundColor: `${theme.primary}20` }}>
          <Shirt className="w-5 h-5" style={{ color: theme.primary }} />
        </div>
        <h3 style={{ color: theme.text }}>Outfit Recommendations</h3>
      </div>
      
      <div className="flex items-start gap-3 mb-5 p-4 rounded-xl backdrop-blur-sm" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)' }}>
        <Info className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.primary }} />
        <p className="text-sm opacity-80 leading-relaxed" style={{ color: theme.text }}>{recommendation.reason}</p>
      </div>

      <div className="space-y-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <Shirt className="w-4 h-4" style={{ color: theme.primary }} />
            <p className="text-sm opacity-70" style={{ color: theme.text }}>Clothing</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation.clothing.map((item, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm shadow-sm"
                style={{ 
                  backgroundColor: theme.primary,
                  color: theme.text === '#F9FAFB' ? '#F9FAFB' : '#1F2937'
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <ShoppingBag className="w-4 h-4" style={{ color: theme.primary }} />
            <p className="text-sm opacity-70" style={{ color: theme.text }}>Accessories</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {recommendation.accessories.map((item, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: (recommendation.clothing.length + index) * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className="px-4 py-2 rounded-full text-sm shadow-sm"
                style={{ 
                  backgroundColor: theme.secondary,
                  color: theme.text
                }}
              >
                {item}
              </motion.span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}

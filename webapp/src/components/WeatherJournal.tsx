import { Card } from './ui/card';
import { Calendar } from './ui/calendar';
import { getWeatherTheme } from '../lib/weather-themes';
import { WeatherCondition } from '../types/weather';
import { MoodEntry } from '../types/weather';
import { useState } from 'react';
import { motion } from 'motion/react';

interface WeatherJournalProps {
  condition: WeatherCondition;
  moodEntries: MoodEntry[];
}

export function WeatherJournal({ condition, moodEntries }: WeatherJournalProps) {
  const theme = getWeatherTheme(condition);
  const [date, setDate] = useState<Date | undefined>(new Date());

  const selectedEntry = moodEntries.find(
    entry => entry.date === date?.toISOString().split('T')[0]
  );

  const getMoodEmoji = (mood: MoodEntry['mood']) => {
    const emojis = {
      great: '😄',
      good: '🙂',
      neutral: '😐',
      bad: '😟',
      terrible: '😢'
    };
    return emojis[mood];
  };

  return (
    <Card className="p-6 border-0" style={{ backgroundColor: theme.cardBg }}>
      <h3 className="mb-4">Weather Journal</h3>
      
      <div className="space-y-4">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          className="rounded-xl border p-3"
          modifiers={{
            hasEntry: (date) => {
              const dateStr = date.toISOString().split('T')[0];
              return moodEntries.some(entry => entry.date === dateStr);
            }
          }}
          modifiersStyles={{
            hasEntry: {
              backgroundColor: theme.primary,
              color: theme.text === '#F9FAFB' ? '#F9FAFB' : '#1F2937',
              borderRadius: '50%'
            }
          }}
        />

        {selectedEntry ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl"
            style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{getMoodEmoji(selectedEntry.mood)}</span>
              <div>
                <p className="capitalize">{selectedEntry.mood}</p>
                <p className="text-sm opacity-70">
                  Productivity: {selectedEntry.productivity}/5
                </p>
              </div>
            </div>
            
            {selectedEntry.weatherImpact && (
              <p className="text-sm mb-2 px-3 py-1.5 rounded-lg inline-block" style={{ backgroundColor: theme.primary, color: theme.text === '#F9FAFB' ? '#F9FAFB' : '#1F2937' }}>
                Weather affected this day
              </p>
            )}
            
            {selectedEntry.notes && (
              <p className="text-sm mt-3 opacity-80">{selectedEntry.notes}</p>
            )}
          </motion.div>
        ) : (
          <div className="p-4 rounded-xl text-center opacity-60" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
            <p className="text-sm">No entry for this day</p>
          </div>
        )}

        <div className="text-xs opacity-60 text-center">
          {moodEntries.length} total entries
        </div>
      </div>
    </Card>
  );
}

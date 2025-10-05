import { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { getWeatherTheme } from '../lib/weather-themes';
import { WeatherCondition } from '../types/weather';
import { MoodEntry } from '../types/weather';
import { Smile, Frown, Meh, SmilePlus, Angry } from 'lucide-react';
import { motion } from 'motion/react';

interface MoodTrackerProps {
  condition: WeatherCondition;
  onSave: (entry: MoodEntry) => void;
}

export function MoodTracker({ condition, onSave }: MoodTrackerProps) {
  const theme = getWeatherTheme(condition);
  const [selectedMood, setSelectedMood] = useState<MoodEntry['mood'] | null>(null);
  const [productivity, setProductivity] = useState(3);
  const [weatherImpact, setWeatherImpact] = useState(false);
  const [notes, setNotes] = useState('');

  const moods: Array<{ mood: MoodEntry['mood']; icon: any; label: string }> = [
    { mood: 'great', icon: SmilePlus, label: 'Great' },
    { mood: 'good', icon: Smile, label: 'Good' },
    { mood: 'neutral', icon: Meh, label: 'Neutral' },
    { mood: 'bad', icon: Frown, label: 'Bad' },
    { mood: 'terrible', icon: Angry, label: 'Terrible' }
  ];

  const handleSave = () => {
    if (!selectedMood) return;

    const entry: MoodEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      mood: selectedMood,
      productivity,
      weatherImpact,
      notes
    };

    onSave(entry);
    
    // Reset
    setSelectedMood(null);
    setProductivity(3);
    setWeatherImpact(false);
    setNotes('');
  };

  return (
    <Card className="p-6 border-0" style={{ backgroundColor: theme.cardBg }}>
      <h3 className="mb-4" style={{ color: theme.text }}>How's your day?</h3>

      <div className="space-y-6">
        <div>
          <p className="text-sm opacity-70 mb-3" style={{ color: theme.text }}>Mood</p>
          <div className="flex gap-2 flex-wrap">
            {moods.map((mood, index) => (
              <motion.button
                key={mood.mood}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMood(mood.mood)}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                  selectedMood === mood.mood ? 'ring-2' : 'opacity-60 hover:opacity-100'
                }`}
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.5)',
                  ringColor: theme.primary
                }}
              >
                <mood.icon className="w-6 h-6" style={{ color: theme.primary }} />
                <span className="text-sm">{mood.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm opacity-70 mb-3">Productivity Level: {productivity}/5</p>
          <input
            type="range"
            min="1"
            max="5"
            value={productivity}
            onChange={(e) => setProductivity(Number(e.target.value))}
            className="w-full"
            style={{ accentColor: theme.primary }}
          />
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={weatherImpact}
            onChange={(e) => setWeatherImpact(e.target.checked)}
            id="weather-impact"
            className="w-5 h-5 rounded"
            style={{ accentColor: theme.primary }}
          />
          <label htmlFor="weather-impact" className="text-sm">
            Weather affected my mood/productivity
          </label>
        </div>

        <div>
          <p className="text-sm opacity-70 mb-2">Notes (optional)</p>
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional thoughts about today..."
            className="min-h-[60px]"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={!selectedMood}
          className="w-full"
          style={{
            backgroundColor: theme.primary,
            color: theme.text === '#F9FAFB' ? '#F9FAFB' : '#1F2937'
          }}
        >
          Save Entry
        </Button>
      </div>
    </Card>
  );
}

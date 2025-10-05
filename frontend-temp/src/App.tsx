import { useState, useEffect } from 'react';
import { StackedForecastCards } from './components/StackedForecastCards';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { OutfitCard } from './components/OutfitCard';
import { MoodTracker } from './components/MoodTracker';
import { WeatherJournal } from './components/WeatherJournal';
import { DailyContextDialog } from './components/DailyContextDialog';
import { CustomizationPanel } from './components/CustomizationPanel';
import { BackendStatus } from './components/BackendStatus';
import { AIWeatherInsights } from './components/AIWeatherInsights';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { useWeather } from './hooks/useWeather';
import { getWeatherTheme } from './lib/weather-themes';
import { 
  Settings, 
  Calendar, 
  Mic,
  RefreshCw,
  MapPin,
  Bell,
  ChevronDown
} from 'lucide-react';
import { CustomizationSettings, DailyContext, MoodEntry } from './types/weather';
import { motion, AnimatePresence } from 'motion/react';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner@2.0.3';

export default function App() {
  const {
    weather,
    hourlyForecast,
    dailyForecast,
    nextDayForecast,
    weeklyForecast,
    monthlyForecast,
    sixMonthForecast,
    outfit,
    refreshWeather
  } = useWeather();

  const [contextDialogOpen, setContextDialogOpen] = useState(false);
  const [customizationOpen, setCustomizationOpen] = useState(false);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [dailyContexts, setDailyContexts] = useState<DailyContext[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Backend integration state
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  
  const [settings, setSettings] = useState<CustomizationSettings>({
    homeLayout: 'detailed',
    theme: 'auto',
    units: 'celsius',
    notifications: {
      enabled: true,
      riskThreshold: 'medium',
      customAlerts: []
    },
    displayOptions: {
      showHourlyForecast: true,
      showOutfitRecommendations: true,
      showMoodTracking: true,
      showAirQuality: true
    }
  });

  const theme = getWeatherTheme(weather.condition);

  // Load saved data from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem('weatherAppSettings');
    const savedMoodEntries = localStorage.getItem('weatherAppMoodEntries');
    const savedContexts = localStorage.getItem('weatherAppContexts');

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
    if (savedMoodEntries) {
      setMoodEntries(JSON.parse(savedMoodEntries));
    }
    if (savedContexts) {
      setDailyContexts(JSON.parse(savedContexts));
    }
  }, []);

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem('weatherAppSettings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('weatherAppMoodEntries', JSON.stringify(moodEntries));
  }, [moodEntries]);

  useEffect(() => {
    localStorage.setItem('weatherAppContexts', JSON.stringify(dailyContexts));
  }, [dailyContexts]);

  const handleRefresh = () => {
    refreshWeather();
    toast.success('Weather data refreshed!');
  };

  const handleSaveMood = (entry: MoodEntry) => {
    setMoodEntries([...moodEntries, entry]);
    toast.success('Mood entry saved!');
  };

  const handleSaveContext = (context: DailyContext) => {
    setDailyContexts([...dailyContexts, context]);
    toast.success('Daily context saved! Weather forecasts will be personalized.');
  };

  const todayContext = dailyContexts.find(
    ctx => ctx.date === new Date().toISOString().split('T')[0]
  );

  const notifications = [
    { id: 1, text: 'Rain expected in 2 hours - bring an umbrella!', time: '10 min ago', type: 'warning' },
    { id: 2, text: 'UV index high today - apply sunscreen', time: '1 hour ago', type: 'info' },
    { id: 3, text: 'Perfect weather for your outdoor plans!', time: '2 hours ago', type: 'success' }
  ];

  // Determine background end color based on weather theme
  const isDarkTheme = ['rainy', 'stormy', 'snowy', 'clear-night'].includes(weather.condition);
  const backgroundEnd = isDarkTheme ? '#121212' : '#F9FAFB';

  return (
    <div 
      className="min-h-screen will-change-transform"
      style={{ 
        background: `linear-gradient(to bottom, ${theme.gradient}, ${backgroundEnd})`,
        transition: 'background 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div className="flex items-center gap-3">
            <div className="text-4xl">{theme.icon}</div>
            <div>
              <h1 className="text-2xl">WeatherFlow</h1>
              <div className="flex items-center gap-2 mt-1 opacity-70">
                <MapPin className="w-4 h-4" />
                <p className="text-sm">{weather.location}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full relative"
              onClick={() => setShowNotifications(!showNotifications)}
            >
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                {notifications.length}
              </Badge>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={handleRefresh}
            >
              <RefreshCw className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={() => setCustomizationOpen(true)}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </motion.header>

        {/* Notifications Dropdown */}
        <AnimatePresence>
          {showNotifications && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-4 p-4 rounded-2xl border bg-white/90 backdrop-blur-sm"
            >
              <h3 className="mb-3">Notifications</h3>
              <div className="space-y-2">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-3 p-3 rounded-xl bg-muted/50">
                    <div className="flex-1">
                      <p className="text-sm">{notif.text}</p>
                      <p className="text-xs opacity-60 mt-1">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backend Connection (Hidden - runs silently in background) */}
        <div className="hidden">
          <BackendStatus 
            onCalendarData={setCalendarEvents}
            onTasksData={setTasks}
          />
        </div>

        {/* AI Weather Insights */}
        <div className="mb-6">
          <AIWeatherInsights
            weatherData={weather}
            calendarEvents={calendarEvents}
            tasks={tasks}
            theme={theme}
          />
        </div>

        {/* Quick Actions */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-3 mb-8 overflow-x-auto pb-2"
        >
          <Button
            onClick={() => setContextDialogOpen(true)}
            className="rounded-full flex items-center gap-2 whitespace-nowrap"
            style={{
              backgroundColor: theme.primary,
              color: theme.text === '#F9FAFB' ? '#F9FAFB' : '#1F2937'
            }}
          >
            <Calendar className="w-4 h-4" />
            {todayContext ? 'Update Daily Context' : 'Add Daily Context'}
          </Button>
          
          <Button
            variant="outline"
            className="rounded-full flex items-center gap-2 whitespace-nowrap"
          >
            <Mic className="w-4 h-4" />
            Voice Assistant
          </Button>
        </motion.div>

        {/* Context Summary */}
        {todayContext && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-4 rounded-2xl border bg-white/90 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4" />
              <h4>Today's Context</h4>
            </div>
            <p className="text-sm opacity-80">{todayContext.schedule}</p>
            {todayContext.outdoorPlans && (
              <Badge className="mt-2" style={{ backgroundColor: theme.primary }}>
                Outdoor plans scheduled
              </Badge>
            )}
          </motion.div>
        )}

        {/* Section Divider */}
        <div className="mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Stacked Forecast Cards */}
        <div className="mb-12">
          <StackedForecastCards
            currentWeather={weather}
            nextDayData={nextDayForecast}
            weeklyData={weeklyForecast}
            monthlyData={monthlyForecast}
            sixMonthData={sixMonthForecast}
            layout={settings.homeLayout}
          />
        </div>

        {/* Section Divider */}
        <div className="mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Outfit Recommendations Section */}
        {settings.displayOptions.showOutfitRecommendations && (
          <section className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="mb-8"
            >
              <OutfitCard 
                condition={weather.condition} 
                recommendation={outfit} 
              />
            </motion.div>
          </section>
        )}

        {/* Section Divider */}
        <div className="mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Hourly Forecast Section */}
        {settings.displayOptions.showHourlyForecast && (
          <section className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="mb-8"
            >
              <HourlyForecast 
                forecast={hourlyForecast} 
                currentCondition={weather.condition} 
              />
            </motion.div>
          </section>
        )}

        {/* Section Divider */}
        <div className="mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Daily Forecast Section */}
        <section className="scroll-mt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mb-8"
          >
            <DailyForecast 
              forecast={dailyForecast} 
              currentCondition={weather.condition} 
            />
          </motion.div>
        </section>

        {/* Section Divider */}
        <div className="mb-8">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        {/* Mood & Wellness Section */}
        {settings.displayOptions.showMoodTracking && (
          <section className="scroll-mt-24">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="mb-8"
            >
              <MoodTracker 
                condition={weather.condition} 
                onSave={handleSaveMood} 
              />
            </motion.div>

            {/* Section Divider */}
            <div className="mb-8">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="mb-8"
            >
              <WeatherJournal 
                condition={weather.condition} 
                moodEntries={moodEntries} 
              />
            </motion.div>
          </section>
        )}
      </div>

      {/* Dialogs */}
      <DailyContextDialog
        open={contextDialogOpen}
        onOpenChange={setContextDialogOpen}
        onSave={handleSaveContext}
      />

      <CustomizationPanel
        open={customizationOpen}
        onOpenChange={setCustomizationOpen}
        settings={settings}
        onSettingsChange={setSettings}
      />

      <Toaster />
    </div>
  );
}

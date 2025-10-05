import { useState, useEffect } from 'react';
import { apiService } from '../lib/api-service';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, XCircle, RefreshCw, Calendar, CheckSquare, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';

interface BackendStatusProps {
  onCalendarData?: (events: any[]) => void;
  onTasksData?: (tasks: any[]) => void;
  onInsight?: (insight: string) => void;
}

export function BackendStatus({ onCalendarData, onTasksData, onInsight }: BackendStatusProps) {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [apiStatuses, setApiStatuses] = useState({
    calendar: false,
    tasks: false,
    gemini: false
  });

  const checkConnection = async () => {
    setIsChecking(true);
    
    // Check health endpoint
    const healthOk = await apiService.healthCheck();
    setIsConnected(healthOk);

    if (healthOk) {
      // Test individual APIs
      const calendarResult = await apiService.getTodayCalendar();
      const tasksResult = await apiService.getTasks();
      
      setApiStatuses({
        calendar: !!calendarResult.data,
        tasks: !!tasksResult.data,
        gemini: true // We'll test this when generating insights
      });

      // Pass data to parent
      if (calendarResult.data && onCalendarData) {
        onCalendarData(calendarResult.data);
      }
      if (tasksResult.data && onTasksData) {
        onTasksData(tasksResult.data);
      }
    }

    setIsChecking(false);
  };

  useEffect(() => {
    checkConnection();
    
    // Check connection every 30 seconds
    const interval = setInterval(checkConnection, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-4"
    >
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isConnected === null ? (
              <div className="w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
            ) : isConnected ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
            
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm">
                  Backend
                </p>
                <Badge 
                  variant={isConnected ? 'default' : 'destructive'}
                  className="text-xs"
                >
                  {isConnected === null ? 'Checking...' : isConnected ? 'Connected' : 'Disconnected'}
                </Badge>
              </div>
              {isConnected && (
                <p className="text-xs opacity-60">
                  http://localhost:8080
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isConnected && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide' : 'Show'} APIs
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={checkConnection}
              disabled={isChecking}
            >
              <RefreshCw className={`w-4 h-4 ${isChecking ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {showDetails && isConnected && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-4 pt-4 border-t space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Calendar API</span>
                </div>
                <Badge variant={apiStatuses.calendar ? 'default' : 'secondary'}>
                  {apiStatuses.calendar ? 'Available' : 'Not Found'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  <span>Tasks API</span>
                </div>
                <Badge variant={apiStatuses.tasks ? 'default' : 'secondary'}>
                  {apiStatuses.tasks ? 'Available' : 'Not Found'}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>Gemini API</span>
                </div>
                <Badge variant={apiStatuses.gemini ? 'default' : 'secondary'}>
                  {apiStatuses.gemini ? 'Ready' : 'Not Found'}
                </Badge>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isConnected && isConnected !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-4 pt-4 border-t"
          >
            <p className="text-sm opacity-70 mb-2">
              ⚠️ Cannot connect to backend
            </p>
            <ol className="text-xs opacity-60 space-y-1 list-decimal list-inside">
              <li>Make sure your backend is running in VS Code</li>
              <li>Check that it's running on port 8080</li>
              <li>Enable CORS headers in your backend</li>
            </ol>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => window.open('http://localhost:8080', '_blank')}
            >
              Open Backend URL
            </Button>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
}
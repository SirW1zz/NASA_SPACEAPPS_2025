import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Calendar, Zap } from 'lucide-react';
import { DailyContext } from '../types/weather';

interface DailyContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (context: DailyContext) => void;
}

export function DailyContextDialog({ open, onOpenChange, onSave }: DailyContextDialogProps) {
  const [schedule, setSchedule] = useState('');
  const [outdoorPlans, setOutdoorPlans] = useState(false);
  const [events, setEvents] = useState('');
  const [riskTolerance, setRiskTolerance] = useState<'low' | 'medium' | 'high'>('medium');

  const handleSave = () => {
    const context: DailyContext = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      schedule,
      outdoorPlans,
      events: events.split('\n').filter(e => e.trim()),
      riskTolerance
    };
    onSave(context);
    onOpenChange(false);
    // Reset form
    setSchedule('');
    setOutdoorPlans(false);
    setEvents('');
    setRiskTolerance('medium');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Daily Context Input
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label>Today's Schedule</Label>
            <Textarea
              placeholder="E.g., Morning gym, 2pm client meeting, evening walk..."
              value={schedule}
              onChange={(e) => setSchedule(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label>Planning outdoor activities?</Label>
            <Switch
              checked={outdoorPlans}
              onCheckedChange={setOutdoorPlans}
            />
          </div>

          <div className="space-y-2">
            <Label>Special Events (one per line)</Label>
            <Textarea
              placeholder="E.g., Picnic at 3pm&#10;Soccer practice at 5pm"
              value={events}
              onChange={(e) => setEvents(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Weather Risk Tolerance
            </Label>
            <RadioGroup value={riskTolerance} onValueChange={(value: any) => setRiskTolerance(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="low" id="low" />
                <Label htmlFor="low">Low - Alert me about minor changes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium - Standard weather alerts</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="high" id="high" />
                <Label htmlFor="high">High - Only severe weather alerts</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleSave} className="flex-1">
            Save Context
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

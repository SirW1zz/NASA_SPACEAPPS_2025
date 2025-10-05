import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Card } from './ui/card';
import { CustomizationSettings } from '../types/weather';
import { 
  Palette, 
  Layout, 
  Bell, 
  Eye,
  Smartphone,
  Settings
} from 'lucide-react';

interface CustomizationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: CustomizationSettings;
  onSettingsChange: (settings: CustomizationSettings) => void;
}

export function CustomizationPanel({ 
  open, 
  onOpenChange, 
  settings, 
  onSettingsChange 
}: CustomizationPanelProps) {
  
  const updateSettings = (updates: Partial<CustomizationSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  const updateDisplayOptions = (key: keyof CustomizationSettings['displayOptions'], value: boolean) => {
    onSettingsChange({
      ...settings,
      displayOptions: {
        ...settings.displayOptions,
        [key]: value
      }
    });
  };

  const updateNotifications = (key: keyof CustomizationSettings['notifications'], value: any) => {
    onSettingsChange({
      ...settings,
      notifications: {
        ...settings.notifications,
        [key]: value
      }
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Customization
          </SheetTitle>
          <SheetDescription>
            Personalize your weather experience with custom layouts, themes, and display preferences.
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="layout" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">
              <Layout className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="theme">
              <Palette className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="display">
              <Eye className="w-4 h-4" />
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="w-4 h-4" />
            </TabsTrigger>
          </TabsList>

          <TabsContent value="layout" className="space-y-6 mt-6">
            <Card className="p-6">
              <h4 className="mb-4 flex items-center gap-2">
                <Smartphone className="w-4 h-4" />
                Home Screen Layout
              </h4>
              <RadioGroup 
                value={settings.homeLayout} 
                onValueChange={(value: any) => updateSettings({ homeLayout: value })}
              >
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <RadioGroupItem value="minimal" id="minimal" />
                    <div className="flex-1">
                      <Label htmlFor="minimal">Minimal</Label>
                      <p className="text-sm opacity-70">Clean, essential info only</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <RadioGroupItem value="compact" id="compact" />
                    <div className="flex-1">
                      <Label htmlFor="compact">Compact</Label>
                      <p className="text-sm opacity-70">Balanced view with key metrics</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 p-3 rounded-lg border">
                    <RadioGroupItem value="detailed" id="detailed" />
                    <div className="flex-1">
                      <Label htmlFor="detailed">Detailed</Label>
                      <p className="text-sm opacity-70">All information at a glance</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </Card>
          </TabsContent>

          <TabsContent value="theme" className="space-y-6 mt-6">
            <Card className="p-6">
              <h4 className="mb-4">Theme Preferences</h4>
              <RadioGroup 
                value={settings.theme} 
                onValueChange={(value: any) => updateSettings({ theme: value })}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto">Auto (Match weather)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light">Always Light</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark">Always Dark</Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>

            <Card className="p-6">
              <h4 className="mb-4">Units</h4>
              <RadioGroup 
                value={settings.units} 
                onValueChange={(value: any) => updateSettings({ units: value })}
              >
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="celsius" id="celsius" />
                    <Label htmlFor="celsius">Celsius (°C)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fahrenheit" id="fahrenheit" />
                    <Label htmlFor="fahrenheit">Fahrenheit (°F)</Label>
                  </div>
                </div>
              </RadioGroup>
            </Card>
          </TabsContent>

          <TabsContent value="display" className="space-y-4 mt-6">
            <Card className="p-6">
              <h4 className="mb-4">Display Options</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Show Hourly Forecast</Label>
                  <Switch
                    checked={settings.displayOptions.showHourlyForecast}
                    onCheckedChange={(checked) => updateDisplayOptions('showHourlyForecast', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Outfit Recommendations</Label>
                  <Switch
                    checked={settings.displayOptions.showOutfitRecommendations}
                    onCheckedChange={(checked) => updateDisplayOptions('showOutfitRecommendations', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Mood Tracking</Label>
                  <Switch
                    checked={settings.displayOptions.showMoodTracking}
                    onCheckedChange={(checked) => updateDisplayOptions('showMoodTracking', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label>Show Air Quality</Label>
                  <Switch
                    checked={settings.displayOptions.showAirQuality}
                    onCheckedChange={(checked) => updateDisplayOptions('showAirQuality', checked)}
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4 mt-6">
            <Card className="p-6">
              <h4 className="mb-4">Notification Settings</h4>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Enable Notifications</Label>
                  <Switch
                    checked={settings.notifications.enabled}
                    onCheckedChange={(checked) => updateNotifications('enabled', checked)}
                  />
                </div>
              </div>
            </Card>

            {settings.notifications.enabled && (
              <Card className="p-6">
                <h4 className="mb-4">Risk Alert Threshold</h4>
                <RadioGroup 
                  value={settings.notifications.riskThreshold} 
                  onValueChange={(value: any) => updateNotifications('riskThreshold', value)}
                >
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="low" id="notif-low" />
                      <Label htmlFor="notif-low">Low - Alert for minor changes</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="medium" id="notif-medium" />
                      <Label htmlFor="notif-medium">Medium - Standard alerts</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="high" id="notif-high" />
                      <Label htmlFor="notif-high">High - Severe weather only</Label>
                    </div>
                  </div>
                </RadioGroup>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

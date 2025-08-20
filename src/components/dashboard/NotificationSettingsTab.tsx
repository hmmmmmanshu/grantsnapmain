import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useNotifications } from '@/hooks/useNotifications';
import { Bell, Mail, Smartphone, Clock, Settings, RotateCcw, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettingsTab() {
  const { 
    preferences, 
    loading, 
    updateNotificationPreferences, 
    toggleNotificationType,
    updateReminderFrequency,
    updateQuietHours,
    resetToDefaults,
    areNotificationsAllowed,
    getNotificationSummary 
  } = useNotifications();
  
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const notificationSummary = getNotificationSummary();

  const handleToggle = async (type: keyof typeof preferences) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const success = await toggleNotificationType(type);
      if (success) {
        toast({
          title: "Setting updated",
          description: `${type.replace(/_/g, ' ')} notifications ${preferences[type] ? 'disabled' : 'enabled'}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update notification setting.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleFrequencyChange = async (frequency: 'immediate' | 'daily' | 'weekly') => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const success = await updateReminderFrequency(frequency);
      if (success) {
        toast({
          title: "Frequency updated",
          description: `Reminder frequency set to ${frequency}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update reminder frequency.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleQuietHoursChange = async (start: string, end: string) => {
    if (!preferences) return;
    
    setSaving(true);
    try {
      const success = await updateQuietHours(start, end);
      if (success) {
        toast({
          title: "Quiet hours updated",
          description: `Quiet hours set to ${start} - ${end}.`,
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update quiet hours.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm('Are you sure you want to reset all notification settings to defaults?')) {
      setSaving(true);
      try {
        const success = await resetToDefaults();
        if (success) {
          toast({
            title: "Settings reset",
            description: "All notification settings have been reset to defaults.",
          });
        }
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to reset notification settings.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-32">
          <div className="text-muted-foreground">Loading notification settings...</div>
        </CardContent>
      </Card>
    );
  }

  if (!preferences) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center h-32">
          <Settings className="h-8 w-8 text-muted-foreground mb-2" />
          <p className="text-muted-foreground mb-4">No notification preferences found</p>
          <Button onClick={handleReset}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Initialize Default Settings
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Status
          </CardTitle>
          <CardDescription>
            Current notification settings and status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Status</Label>
              <div className="flex items-center space-x-2">
                {areNotificationsAllowed() ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Clock className="h-4 w-4 text-yellow-600" />
                )}
                <span className="text-sm">
                  {areNotificationsAllowed() ? 'Notifications Active' : 'Quiet Hours Active'}
                </span>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm font-medium">Enabled Types</Label>
              <div className="text-sm text-muted-foreground">
                {notificationSummary?.enabledTypes.length || 0} of 6 notification types enabled
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notification Types */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Notification Types
          </CardTitle>
          <CardDescription>
            Choose which types of notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={preferences.email_notifications}
                onCheckedChange={() => handleToggle('email_notifications')}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Push Notifications
                </Label>
                <p className="text-sm text-muted-foreground">
                  Receive push notifications in browser
                </p>
              </div>
              <Switch
                checked={preferences.push_notifications}
                onCheckedChange={() => handleToggle('push_notifications')}
                disabled={saving}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Grant Deadline Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get reminded about upcoming grant deadlines
                </p>
              </div>
              <Switch
                checked={preferences.grant_deadline_reminders}
                onCheckedChange={() => handleToggle('grant_deadline_reminders')}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Team Updates</Label>
                <p className="text-sm text-muted-foreground">
                  Notifications about team member changes
                </p>
              </div>
              <Switch
                checked={preferences.team_updates}
                onCheckedChange={() => handleToggle('team_updates')}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>AI Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  New AI-powered team optimization suggestions
                </p>
              </div>
              <Switch
                checked={preferences.ai_recommendations}
                onCheckedChange={() => handleToggle('ai_recommendations')}
                disabled={saving}
              />
            </div>

            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label>Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Weekly digest of activities and opportunities
                </p>
              </div>
              <Switch
                checked={preferences.weekly_summary}
                onCheckedChange={() => handleToggle('weekly_summary')}
                disabled={saving}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Frequency */}
      <Card>
        <CardHeader>
          <CardTitle>Reminder Frequency</CardTitle>
          <CardDescription>
            How often you want to receive reminders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="frequency">Reminder Frequency</Label>
            <Select
              value={preferences.reminder_frequency}
              onValueChange={handleFrequencyChange}
              disabled={saving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="immediate">Immediate</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              {preferences.reminder_frequency === 'immediate' && 'Receive notifications as soon as they occur'}
              {preferences.reminder_frequency === 'daily' && 'Receive a daily digest of notifications'}
              {preferences.reminder_frequency === 'weekly' && 'Receive a weekly summary of notifications'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quiet Hours
          </CardTitle>
          <CardDescription>
            Set times when you don't want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="quiet-start">Quiet Hours Start</Label>
              <Select
                value={preferences.quiet_hours_start}
                onValueChange={(value) => handleQuietHoursChange(value, preferences.quiet_hours_end)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quiet-end">Quiet Hours End</Label>
              <Select
                value={preferences.quiet_hours_end}
                onValueChange={(value) => handleQuietHoursChange(preferences.quiet_hours_start, value)}
                disabled={saving}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 24 }, (_, i) => {
                    const hour = i.toString().padStart(2, '0');
                    return (
                      <SelectItem key={hour} value={`${hour}:00`}>
                        {hour}:00
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Current quiet hours:</strong> {preferences.quiet_hours_start} - {preferences.quiet_hours_end}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              {areNotificationsAllowed() 
                ? 'Notifications are currently active (outside quiet hours)'
                : 'Notifications are currently paused (quiet hours active)'
              }
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
          <CardDescription>
            Manage your notification settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={saving}
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset to Defaults
            </Button>
            
            {saving && (
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                <span>Saving changes...</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
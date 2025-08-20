import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import { 
  NotificationPreferences, 
  NotificationSettings 
} from '../types/team';

export const useNotifications = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's notification preferences
  const fetchNotificationPreferences = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw fetchError;
      }

      setPreferences(data);
    } catch (err) {
      console.error('Error fetching notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch notification preferences');
    } finally {
      setLoading(false);
    }
  };

  // Create default notification preferences
  const createDefaultPreferences = async (): Promise<NotificationPreferences | null> => {
    if (!user) return null;

    try {
      setError(null);

      const defaultPreferences: Partial<NotificationPreferences> = {
        user_id: user.id,
        email_notifications: true,
        push_notifications: true,
        grant_deadline_reminders: true,
        team_updates: true,
        ai_recommendations: true,
        weekly_summary: true,
        reminder_frequency: 'daily',
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
      };

      const { data, error: createError } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Error creating notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to create notification preferences');
      return null;
    }
  };

  // Update notification preferences
  const updateNotificationPreferences = async (
    updates: Partial<NotificationSettings>
  ): Promise<NotificationPreferences | null> => {
    if (!user || !preferences) return null;

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('id', preferences.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setPreferences(data);
      return data;
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update notification preferences');
      return null;
    }
  };

  // Toggle specific notification type
  const toggleNotificationType = async (type: keyof NotificationSettings): Promise<boolean> => {
    if (!preferences) return false;

    const currentValue = preferences[type];
    if (typeof currentValue === 'boolean') {
      const success = await updateNotificationPreferences({ [type]: !currentValue });
      return success !== null;
    }
    return false;
  };

  // Update reminder frequency
  const updateReminderFrequency = async (frequency: 'immediate' | 'daily' | 'weekly'): Promise<boolean> => {
    const success = await updateNotificationPreferences({ reminder_frequency: frequency });
    return success !== null;
  };

  // Update quiet hours
  const updateQuietHours = async (start: string, end: string): Promise<boolean> => {
    const success = await updateNotificationPreferences({
      quiet_hours_start: start,
      quiet_hours_end: end,
    });
    return success !== null;
  };

  // Check if notifications are currently allowed (outside quiet hours)
  const areNotificationsAllowed = (): boolean => {
    if (!preferences) return true;

    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Convert to minutes

    const startTime = preferences.quiet_hours_start.split(':').map(Number);
    const endTime = preferences.quiet_hours_end.split(':').map(Number);
    
    const startMinutes = startTime[0] * 60 + startTime[1];
    const endMinutes = endTime[0] * 60 + endTime[1];

    // Handle overnight quiet hours (e.g., 22:00 to 08:00)
    if (startMinutes > endMinutes) {
      return currentTime >= endMinutes && currentTime <= startMinutes;
    } else {
      return currentTime < startMinutes || currentTime >= endMinutes;
    }
  };

  // Get notification summary
  const getNotificationSummary = () => {
    if (!preferences) return null;

    const enabledTypes = [];
    const disabledTypes = [];

    if (preferences.email_notifications) enabledTypes.push('Email');
    else disabledTypes.push('Email');

    if (preferences.push_notifications) enabledTypes.push('Push');
    else disabledTypes.push('Push');

    if (preferences.grant_deadline_reminders) enabledTypes.push('Grant Deadlines');
    else disabledTypes.push('Grant Deadlines');

    if (preferences.team_updates) enabledTypes.push('Team Updates');
    else disabledTypes.push('Team Updates');

    if (preferences.ai_recommendations) enabledTypes.push('AI Recommendations');
    else disabledTypes.push('AI Recommendations');

    if (preferences.weekly_summary) enabledTypes.push('Weekly Summary');
    else disabledTypes.push('Weekly Summary');

    return {
      enabledTypes,
      disabledTypes,
      reminderFrequency: preferences.reminder_frequency,
      quietHours: `${preferences.quiet_hours_start} - ${preferences.quiet_hours_end}`,
      currentlyAllowed: areNotificationsAllowed(),
    };
  };

  // Reset to default preferences
  const resetToDefaults = async (): Promise<boolean> => {
    const success = await updateNotificationPreferences({
      email_notifications: true,
      push_notifications: true,
      grant_deadline_reminders: true,
      team_updates: true,
      ai_recommendations: true,
      weekly_summary: true,
      reminder_frequency: 'daily',
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
    });
    return success !== null;
  };

  // Load preferences on mount
  useEffect(() => {
    if (user) {
      fetchNotificationPreferences();
    }
  }, [user]);

  return {
    preferences,
    loading,
    error,
    fetchNotificationPreferences,
    createDefaultPreferences,
    updateNotificationPreferences,
    toggleNotificationType,
    updateReminderFrequency,
    updateQuietHours,
    areNotificationsAllowed,
    getNotificationSummary,
    resetToDefaults,
  };
}; 
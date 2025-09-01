import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, TrendingUp, User, AlertCircle } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useAuth } from '@/hooks/useAuth';
import { 
  calculateProfileCompletion, 
  getCompletionStatusDisplay,
  getNextRecommendedField 
} from '@/lib/profileUtils';

interface ProfileCompletionNotificationProps {
  onOpenProfile: () => void;
}

export function ProfileCompletionNotification({ onOpenProfile }: ProfileCompletionNotificationProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const { user } = useAuth();
  const { profile, loading } = useProfile();

  // Don't show notification if loading or dismissed
  if (loading || isDismissed) return null;

  const completion = calculateProfileCompletion(profile);
  
  // Only show notification if completion is less than 90%
  if (completion.percentage >= 90) return null;

  const statusDisplay = getCompletionStatusDisplay(completion);
  const nextField = getNextRecommendedField(completion.missingFields);

  return (
    <Card className={`mb-6 ${statusDisplay.borderColor} border-l-4`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${statusDisplay.bgColor}`}>
              <AlertCircle className={`w-5 h-5 ${statusDisplay.color}`} />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="text-sm font-semibold text-gray-900">
                  {statusDisplay.icon} Complete Your Profile ({completion.percentage}%)
                </h3>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusDisplay.color} ${statusDisplay.bgColor}`}>
                  {statusDisplay.message}
                </div>
              </div>
              
              <p className="text-sm text-gray-600 mb-3">
                A complete profile helps our AI provide better grant recommendations and autofill assistance. 
                {nextField && ` Next step: Complete your ${nextField}.`}
              </p>
              
              {/* Progress Bar */}
              <div className="space-y-2 mb-3">
                <Progress value={completion.percentage} className="h-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{completion.completedFields} of {completion.totalFields} fields completed</span>
                  <span>{completion.missingFields.length} remaining</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={onOpenProfile}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <User className="w-3 h-3 mr-1" />
                  Complete Profile
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={() => setIsDismissed(true)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsDismissed(true)}
            className="text-gray-400 hover:text-gray-600 ml-2"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ProfileCompletionNotification;

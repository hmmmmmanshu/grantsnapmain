import { UserProfile } from '@/hooks/useProfile';

export interface ProfileCompletionStatus {
  percentage: number;
  completedFields: number;
  totalFields: number;
  missingFields: string[];
  isComplete: boolean;
}

// Define required profile fields for completion
export const PROFILE_FIELDS = {
  // Basic Info (40% weight)
  startup_name: { label: 'Startup Name', weight: 10, required: true },
  one_line_pitch: { label: 'One Line Pitch', weight: 10, required: true },
  problem_statement: { label: 'Problem Statement', weight: 10, required: true },
  solution_description: { label: 'Solution Description', weight: 10, required: true },
  
  // Business Details (40% weight)
  target_market: { label: 'Target Market', weight: 10, required: true },
  team_description: { label: 'Team Description', weight: 10, required: true },
  
  // Additional fields (20% weight) - can be added later
  company_description: { label: 'Company Description', weight: 5, required: false },
  unique_value_proposition: { label: 'Unique Value Proposition', weight: 5, required: false },
  mission_vision: { label: 'Mission & Vision', weight: 5, required: false },
  pitch_deck_summary: { label: 'Pitch Deck Summary', weight: 5, required: false },
} as const;

/**
 * Calculate profile completion percentage and status
 */
export function calculateProfileCompletion(profile: UserProfile | null): ProfileCompletionStatus {
  if (!profile) {
    return {
      percentage: 0,
      completedFields: 0,
      totalFields: Object.keys(PROFILE_FIELDS).length,
      missingFields: Object.entries(PROFILE_FIELDS).map(([key, field]) => field.label),
      isComplete: false,
    };
  }

  let totalWeight = 0;
  let completedWeight = 0;
  let completedFields = 0;
  const missingFields: string[] = [];

  // Calculate completion based on field weights
  Object.entries(PROFILE_FIELDS).forEach(([fieldKey, fieldConfig]) => {
    totalWeight += fieldConfig.weight;
    
    const fieldValue = profile[fieldKey as keyof UserProfile];
    const isFieldComplete = fieldValue && 
      typeof fieldValue === 'string' && 
      fieldValue.trim().length > 0;

    if (isFieldComplete) {
      completedWeight += fieldConfig.weight;
      completedFields++;
    } else if (fieldConfig.required) {
      missingFields.push(fieldConfig.label);
    }
  });

  const percentage = Math.round((completedWeight / totalWeight) * 100);
  const isComplete = percentage >= 90; // Consider 90%+ as complete

  return {
    percentage,
    completedFields,
    totalFields: Object.keys(PROFILE_FIELDS).length,
    missingFields,
    isComplete,
  };
}

/**
 * Get user display information
 */
export function getUserDisplayInfo(user: any, profile: UserProfile | null) {
  return {
    name: profile?.startup_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'User',
    email: user?.email || '',
    startupName: profile?.startup_name || '',
    tagline: profile?.one_line_pitch || '',
    hasBasicInfo: !!(profile?.startup_name && profile?.one_line_pitch),
  };
}

/**
 * Get completion status color and message
 */
export function getCompletionStatusDisplay(completion: ProfileCompletionStatus) {
  if (completion.percentage >= 90) {
    return {
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
      message: 'Profile Complete!',
      icon: '',
    };
  } else if (completion.percentage >= 70) {
    return {
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200',
      message: 'Almost there!',
      icon: '',
    };
  } else if (completion.percentage >= 40) {
    return {
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
      borderColor: 'border-amber-200',
      message: 'Good progress',
      icon: '',
    };
  } else {
    return {
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
      message: 'Needs attention',
      icon: '',
    };
  }
}

/**
 * Get next recommended field to complete
 */
export function getNextRecommendedField(missingFields: string[]): string | null {
  if (missingFields.length === 0) return null;
  
  // Prioritize basic fields first
  const priorityOrder = [
    'Startup Name',
    'One Line Pitch', 
    'Problem Statement',
    'Solution Description',
    'Target Market',
    'Team Description'
  ];

  for (const priority of priorityOrder) {
    if (missingFields.includes(priority)) {
      return priority;
    }
  }

  return missingFields[0];
}

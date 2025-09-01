import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles, Gift } from 'lucide-react'

interface ProBadgeProps {
  tier?: string
  className?: string
}

// Helper function to get plan display information
const getPlanInfo = (tier: string) => {
  switch (tier?.toLowerCase()) {
    case 'basic':
      return {
        name: 'BASE',
        icon: Gift,
        bgColor: 'from-green-500/10 to-emerald-500/10',
        borderColor: 'border-green-500/20',
        textColor: 'text-green-700 dark:text-green-400',
        iconColor: 'fill-green-500',
        showBadge: true
      };
    case 'pro':
      return {
        name: 'PROOF',
        icon: Crown,
        bgColor: 'from-blue-500/10 to-purple-500/10',
        borderColor: 'border-blue-500/20',
        textColor: 'text-blue-700 dark:text-blue-400',
        iconColor: 'fill-blue-500',
        showBadge: true
      };
    case 'enterprise':
      return {
        name: 'GROWTH',
        icon: Crown,
        bgColor: 'from-purple-500/10 to-pink-500/10',
        borderColor: 'border-purple-500/20',
        textColor: 'text-purple-700 dark:text-purple-400',
        iconColor: 'fill-purple-500',
        showBadge: true
      };
    default:
      return {
        name: 'BASE',
        icon: Gift,
        bgColor: 'from-gray-500/10 to-gray-500/10',
        borderColor: 'border-gray-500/20',
        textColor: 'text-gray-700 dark:text-gray-400',
        iconColor: 'fill-gray-500',
        showBadge: false // Don't show badge for unknown tiers
      };
  }
};

export function ProBadge({ tier = 'basic', className = '' }: ProBadgeProps) {
  const planInfo = getPlanInfo(tier);
  
  if (!planInfo.showBadge) return null;

  const IconComponent = planInfo.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 
        bg-gradient-to-r ${planInfo.bgColor}
        border ${planInfo.borderColor} ${planInfo.textColor}
        font-medium text-xs rounded-full
        hover:bg-gradient-to-r hover:${planInfo.bgColor.replace('/10', '/20')}
        transition-all duration-200
        ${className}
      `}
    >
      <IconComponent className={`w-3 h-3 ${planInfo.iconColor}`} />
      <span className="font-semibold">{planInfo.name}</span>
      {tier === 'enterprise' && (
        <Sparkles className="w-3 h-3 text-pink-500" />
      )}
    </Badge>
  )
}

export function ProBadgeSmall({ tier = 'basic', className = '' }: ProBadgeProps) {
  const planInfo = getPlanInfo(tier);
  
  if (!planInfo.showBadge) return null;

  const IconComponent = planInfo.icon;

  return (
    <Badge 
      variant="secondary" 
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 
        bg-gradient-to-r ${planInfo.bgColor}
        border ${planInfo.borderColor} ${planInfo.textColor}
        font-medium text-xs rounded-full
        ${className}
      `}
    >
      <IconComponent className={`w-2.5 h-2.5 ${planInfo.iconColor}`} />
      <span className="font-semibold text-xs">{planInfo.name}</span>
    </Badge>
  )
}

import { Badge } from '@/components/ui/badge'
import { Crown, Sparkles } from 'lucide-react'

interface ProBadgeProps {
  tier?: string
  className?: string
}

export function ProBadge({ tier = 'pro', className = '' }: ProBadgeProps) {
  const isPro = tier === 'pro' || tier === 'enterprise'
  
  if (!isPro) return null

  return (
    <Badge 
      variant="secondary" 
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-1 
        bg-gradient-to-r from-amber-500/10 to-orange-500/10 
        border border-amber-500/20 text-amber-700 dark:text-amber-400
        font-medium text-xs rounded-full
        hover:from-amber-500/20 hover:to-orange-500/20
        transition-all duration-200
        ${className}
      `}
    >
      <Crown className="w-3 h-3 fill-amber-500" />
      <span className="font-semibold">PRO</span>
      {tier === 'enterprise' && (
        <Sparkles className="w-3 h-3 text-orange-500" />
      )}
    </Badge>
  )
}

export function ProBadgeSmall({ tier = 'pro', className = '' }: ProBadgeProps) {
  const isPro = tier === 'pro' || tier === 'enterprise'
  
  if (!isPro) return null

  return (
    <Badge 
      variant="secondary" 
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 
        bg-gradient-to-r from-amber-500/10 to-orange-500/10 
        border border-amber-500/20 text-amber-700 dark:text-amber-400
        font-medium text-xs rounded-full
        ${className}
      `}
    >
      <Crown className="w-2.5 h-2.5 fill-amber-500" />
      <span className="font-semibold text-xs">PRO</span>
    </Badge>
  )
}

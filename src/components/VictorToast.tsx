import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VictorToastContentProps {
  message: string;
  channel?: string;
  timestamp?: string;
  isViolation?: boolean;
  violationCount?: number;
}

export function VictorToastContent({
  message,
  channel = 'victor-directives',
  timestamp,
  isViolation = false,
  violationCount = 0,
}: VictorToastContentProps) {
  const displayTime =
    timestamp ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const maxViolations = 3;
  const remainingStrikes = maxViolations - violationCount;

  return (
    <div className="flex flex-col gap-3 font-normal">
      <div className="flex items-start gap-3">
        <Avatar className="h-9 w-9 border border-slate-200 bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <AvatarFallback className="bg-transparent">
            <Icon icon="logos:slack-icon" width="20" height="20" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-slate-900">Viktor</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-emerald-600">APP</span>
            <span className="text-xs text-slate-400">{displayTime}</span>
          </div>
          <p className="mt-1 text-sm text-slate-700 leading-relaxed">{message}</p>

          {/* Violation indicators */}
          <div className="mt-3 flex items-center gap-2">
            {[...Array(maxViolations)].map((_, index) => {
              const isStrike = index < violationCount;
              const isCheckmark = !isViolation && index < maxViolations - remainingStrikes;

              return (
                <div
                  key={index}
                  className="flex items-center justify-center w-6 h-6 rounded border-2"
                  style={{
                    borderColor: isStrike ? '#ef4444' : isCheckmark ? '#10b981' : '#cbd5e1',
                    backgroundColor: isStrike ? '#fee2e2' : isCheckmark ? '#d1fae5' : '#f8fafc',
                  }}
                >
                  {isStrike && <span className="text-red-600 font-bold text-sm">✕</span>}
                  {!isViolation && !isStrike && index >= maxViolations - remainingStrikes && (
                    <span className="text-gray-400 font-bold text-sm">○</span>
                  )}
                  {isCheckmark && <span className="text-green-600 font-bold text-sm">✓</span>}
                </div>
              );
            })}
            <span className="text-xs text-slate-600 ml-1">
              {remainingStrikes > 0
                ? `${remainingStrikes} strike${remainingStrikes !== 1 ? 's' : ''} remaining`
                : 'TERMINATION INITIATED'}
            </span>
          </div>
        </div>
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">#{channel}</div>
    </div>
  );
}

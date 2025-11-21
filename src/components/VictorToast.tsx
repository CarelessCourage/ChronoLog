import { Icon } from '@iconify/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface VictorToastContentProps {
  message: string;
  channel?: string;
  timestamp?: string;
}

export function VictorToastContent({
  message,
  channel = 'victor-directives',
  timestamp
}: VictorToastContentProps) {
  const displayTime = timestamp ?? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col gap-3">
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
          <p className="mt-1 text-sm text-slate-700 leading-relaxed">
            {message}
          </p>
        </div>
      </div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">#{channel}</div>
    </div>
  );
}

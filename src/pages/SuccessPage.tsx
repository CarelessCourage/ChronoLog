import { Link } from '@tanstack/react-router';
import { RetroButton } from '@/components/ui/retro-button';

export function SuccessPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-white shadow-xl rounded-2xl p-8 space-y-4 text-center border border-slate-200">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">ChronoLog Directive</p>
        <h1 className="text-3xl font-semibold text-slate-900">Time logged. Compliance achieved.</h1>
        <p className="text-slate-600">
          Your 7.5 hours have been recorded in accordance with Section 12.4 of the Time Compliance
          Policy.
        </p>
        <p className="text-slate-500">
          Thank you for your punctual cooperation. You are now authorized to temporarily detach from
          your workstation. Enjoy your limited personal time responsibly.
        </p>
        <p className="text-sm text-slate-400">
          You will be reminded to repeat this ceremony tomorrow.
        </p>
        <Link to="/" className="inline-block">
          <RetroButton className="w-full md:w-auto">Back to time writing</RetroButton>
        </Link>
      </div>
    </div>
  );
}

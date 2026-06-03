import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  variant?: 'default' | 'compact' | 'white';
}

export function Logo({ className, showText = true, variant = 'default' }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark className="h-9 w-9" />
      {showText && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              'text-[17px] font-extrabold tracking-tight',
              variant === 'white' ? 'text-white' : 'text-dark-900'
            )}
          >
            ZOOM <span className="text-primary">MOBILES</span>
          </span>
          <span
            className={cn(
              'text-[10px] font-medium uppercase tracking-[0.15em] mt-0.5',
              variant === 'white' ? 'text-white/70' : 'text-dark-500'
            )}
          >
            Accessories Hub
          </span>
        </div>
      )}
    </div>
  );
}

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
      aria-hidden
    >
      <defs>
        <linearGradient id="zoomG1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#00C853" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
        <linearGradient id="zoomG2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFB800" />
          <stop offset="100%" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="44" height="44" rx="12" fill="url(#zoomG1)" />
      <path
        d="M14 16h20l-14 16h14"
        stroke="white"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="36" cy="12" r="4" fill="url(#zoomG2)" />
    </svg>
  );
}

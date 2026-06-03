import { LogoMark } from '@/components/brand/Logo';

export default function Loading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
      <div className="animate-pulse-soft">
        <LogoMark className="h-12 w-12" />
      </div>
      <div className="flex gap-1.5">
        <span className="h-2 w-2 rounded-full bg-primary animate-bounce [animation-delay:-0.3s]" />
        <span className="h-2 w-2 rounded-full bg-secondary animate-bounce [animation-delay:-0.15s]" />
        <span className="h-2 w-2 rounded-full bg-accent animate-bounce" />
      </div>
    </div>
  );
}

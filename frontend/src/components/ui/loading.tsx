import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-2",
    lg: "h-12 w-12 border-3",
    xl: "h-16 w-16 border-4",
  };

  return (
    <div
      className={cn(
        "inline-block animate-spin rounded-full border-gray-300 border-t-blue-600",
        sizeClasses[size],
        className
      )}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

interface LoadingOverlayProps {
  message?: string;
  className?: string;
}

export function LoadingOverlay({
  message = "Loading...",
  className,
}: LoadingOverlayProps) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm",
        className
      )}
    >
      <div className="bg-white rounded-lg p-6 shadow-xl">
        <div className="flex flex-col items-center gap-3">
          <LoadingSpinner size="lg" />
          <p className="text-sm font-medium text-gray-700">{message}</p>
        </div>
      </div>
    </div>
  );
}

interface LoadingDotsProps {
  className?: string;
}

export function LoadingDots({ className }: LoadingDotsProps) {
  return (
    <div className={cn("flex items-center justify-center gap-1", className)}>
      <div
        className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

interface LoadingBarProps {
  progress?: number;
  className?: string;
}

export function LoadingBar({ progress = 0, className }: LoadingBarProps) {
  return (
    <div
      className={cn(
        "w-full h-1 bg-gray-200 rounded-full overflow-hidden",
        className
      )}
    >
      <div
        className="h-full bg-blue-600 transition-all duration-300 ease-out"
        style={{ width: `${Math.min(progress, 100)}%` }}
      />
    </div>
  );
}

interface LoadingPulseProps {
  className?: string;
}

export function LoadingPulse({ className }: LoadingPulseProps) {
  return (
    <div className={cn("flex items-center justify-center gap-2", className)}>
      <div className="h-3 w-3 rounded-full bg-blue-600 animate-pulse" />
      <div
        className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="h-3 w-3 rounded-full bg-blue-600 animate-pulse"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  );
}

interface FullPageLoadingProps {
  message?: string;
}

export function FullPageLoading({
  message = "Loading...",
}: FullPageLoadingProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mx-auto mb-4" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
}

interface InlineLoadingProps {
  text?: string;
  className?: string;
}

export function InlineLoading({
  text = "Loading...",
  className,
}: InlineLoadingProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <LoadingSpinner size="sm" />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}

interface ButtonLoadingProps {
  className?: string;
}

export function ButtonLoading({ className }: ButtonLoadingProps) {
  return (
    <LoadingSpinner
      size="sm"
      className={cn("border-white border-t-transparent", className)}
    />
  );
}

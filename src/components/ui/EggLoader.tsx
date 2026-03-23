import { cn } from "../../lib/utils";

interface EggLoaderProps {
  className?: string;
  text?: string;
}

export function EggLoader({ className, text = "Loading..." }: EggLoaderProps) {
  return (
    <div
      className={cn("flex flex-col items-center justify-center p-8", className)}
    >
      <div className="relative size-16 mb-4">
        {/* Egg Shape */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-100 to-amber-200 rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] shadow-lg animate-wobble origin-bottom"></div>
        {/* Shine */}
        <div className="absolute top-2 left-3 w-4 h-6 bg-white/40 rounded-full rotate-[-15deg]"></div>
      </div>
      <p className="text-indigo-900 font-medium animate-pulse">{text}</p>

      <style>{`
        @keyframes wobble {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-5deg); }
          75% { transform: rotate(5deg); }
        }
        .animate-wobble {
          animation: wobble 1s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}

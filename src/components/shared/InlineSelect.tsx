import { cn } from "../../lib/utils";

interface Option {
  value: string;
  label: string;
  sublabel?: string;
}

interface InlineSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function InlineSelect({ options, value, onChange, placeholder, className }: InlineSelectProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {placeholder && !value && (
        <p className="text-sm text-gray-400 px-1">{placeholder}</p>
      )}
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            "w-full p-4 text-left rounded-2xl transition-all flex items-center justify-between",
            value === opt.value
              ? "bg-indigo-50 border-2 border-indigo-300 shadow-sm"
              : "bg-white shadow-sm hover:bg-gray-50"
          )}
        >
          <div>
            <p className={cn("font-semibold", value === opt.value ? "text-indigo-700" : "text-gray-900")}>
              {opt.label}
            </p>
            {opt.sublabel && (
              <p className="text-xs text-gray-500 mt-0.5">{opt.sublabel}</p>
            )}
          </div>
          {value === opt.value && (
            <div className="size-5 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
              <svg className="size-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}

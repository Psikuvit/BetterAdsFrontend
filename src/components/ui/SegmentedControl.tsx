interface SegmentedControlOption {
  value: string;
  label: string;
}

interface SegmentedControlProps {
  options: SegmentedControlOption[];
  value: string | string[];
  onChange: (value: string) => void;
  multiple?: boolean;
  disabled?: boolean;
  "aria-label": string;
}

export function SegmentedControl({
  options,
  value,
  onChange,
  multiple = false,
  disabled = false,
  "aria-label": ariaLabel,
}: SegmentedControlProps) {
  const isActive = (optionValue: string) =>
    multiple ? (value as string[]).includes(optionValue) : value === optionValue;

  return (
    <div role={multiple ? "group" : "radiogroup"} aria-label={ariaLabel} className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = isActive(option.value);
        return (
          <button
            key={option.value}
            type="button"
            role={multiple ? undefined : "radio"}
            aria-checked={multiple ? undefined : active}
            aria-pressed={multiple ? active : undefined}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 ${
              active
                ? "bg-gradient-brand text-white shadow-glow-blue"
                : "border border-neutral-200 bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-white/50 dark:hover:bg-white/10 dark:hover:text-white/70"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

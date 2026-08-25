import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import clsx from "clsx";

type QuantityStepperProps = {
  value: number;
  min?: number;
  max?: number;
  disabled?: boolean;
  compact?: boolean;
  quantityLabel: string;
  decreaseLabel: string;
  increaseLabel: string;
  onCommit: (value: number) => void | Promise<void>;
};

export default function QuantityStepper({
  value,
  min = 1,
  max = 99,
  disabled = false,
  compact = false,
  quantityLabel,
  decreaseLabel,
  increaseLabel,
  onCommit,
}: QuantityStepperProps) {
  const [edit, setEdit] = useState({ sourceValue: value, draft: String(value) });
  const [isSaving, setIsSaving] = useState(false);
  const draft = edit.sourceValue === value ? edit.draft : String(value);

  const normalize = (candidate: string | number) => {
    const parsed = typeof candidate === "number" ? candidate : Number(candidate);
    if (!Number.isFinite(parsed)) return value;
    return Math.min(max, Math.max(min, Math.trunc(parsed)));
  };

  const commit = async (candidate: string | number = draft) => {
    const nextValue = normalize(candidate);
    setEdit({ sourceValue: value, draft: String(nextValue) });
    if (nextValue === value || isSaving) return;

    setIsSaving(true);
    try {
      await onCommit(nextValue);
    } catch {
      setEdit({ sourceValue: value, draft: String(value) });
    } finally {
      setIsSaving(false);
    }
  };

  const draftValue = normalize(draft);
  const buttonClass = clsx(
    "flex h-full cursor-pointer items-center justify-center text-text-secondary transition hover:bg-primary/8 hover:text-primary disabled:cursor-not-allowed disabled:opacity-35",
    compact ? "w-9" : "w-12",
  );

  return (
    <div className={clsx(
      "flex items-center overflow-hidden rounded-md border border-border bg-bg",
      compact ? "h-9" : "h-12",
    )}>
      <button
        type="button"
        aria-label={decreaseLabel}
        disabled={disabled || isSaving || draftValue <= min}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => void commit(draftValue - 1)}
        className={buttonClass}
      >
        <Minus size={compact ? 15 : 19} />
      </button>
      <input
        type="number"
        inputMode="numeric"
        aria-label={quantityLabel}
        min={min}
        max={max}
        step={1}
        disabled={disabled || isSaving}
        value={draft}
        onChange={(event) => setEdit({ sourceValue: value, draft: event.target.value })}
        onBlur={() => void commit()}
        onKeyDown={(event) => {
          if (event.key === "Enter") event.currentTarget.blur();
          if (event.key === "Escape") {
            setEdit({ sourceValue: value, draft: String(value) });
            event.currentTarget.blur();
          }
        }}
        className={clsx(
          "h-full border-x border-border bg-transparent px-1 text-center font-semibold text-text outline-none focus:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50",
          compact ? "w-11 text-sm" : "w-14",
        )}
      />
      <button
        type="button"
        aria-label={increaseLabel}
        disabled={disabled || isSaving || draftValue >= max}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => void commit(draftValue + 1)}
        className={buttonClass}
      >
        <Plus size={compact ? 15 : 19} />
      </button>
    </div>
  );
}

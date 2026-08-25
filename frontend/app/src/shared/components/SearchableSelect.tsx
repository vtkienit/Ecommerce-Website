import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, LoaderCircle, Search } from "lucide-react";
import clsx from "clsx";

export type SelectOption = {
  value: number;
  label: string;
};

type SearchableSelectProps = {
  value: number | null;
  options: SelectOption[];
  placeholder: string;
  searchPlaceholder: string;
  emptyMessage: string;
  loading?: boolean;
  disabled?: boolean;
  onChange: (option: SelectOption) => void;
};

const normalize = (value: string) => value
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/đ/g, "d")
  .replace(/Đ/g, "D")
  .toLowerCase();

export default function SearchableSelect({
  value,
  options,
  placeholder,
  searchPlaceholder,
  emptyMessage,
  loading = false,
  disabled = false,
  onChange,
}: SearchableSelectProps) {
  const listboxId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const selectedOption = options.find((option) => option.value === value);
  const filteredOptions = useMemo(() => {
    const normalizedQuery = normalize(query.trim());
    if (!normalizedQuery) return options;
    return options.filter((option) => normalize(option.label).includes(normalizedQuery));
  }, [options, query]);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    return () => document.removeEventListener("mousedown", closeOnOutsideClick);
  }, [open]);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const toggle = () => {
    if (disabled || loading) return;
    setQuery("");
    setOpen((current) => !current);
  };

  const select = (option: SelectOption) => {
    onChange(option);
    setQuery("");
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative mt-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listboxId}
        aria-haspopup="listbox"
        disabled={disabled || loading}
        onClick={toggle}
        className={clsx(
          "flex h-11 w-full cursor-pointer items-center justify-between gap-3 rounded-lg border border-border bg-bg px-3.5 text-left text-sm outline-none transition hover:border-primary/60 focus:border-primary focus:ring-3 focus:ring-primary/10 disabled:cursor-not-allowed disabled:bg-bg-secondary disabled:text-text-tertiary",
          open && "border-primary ring-3 ring-primary/10",
        )}
      >
        <span className={clsx("truncate", selectedOption ? "text-text" : "text-text-muted")}>
          {selectedOption?.label ?? placeholder}
        </span>
        {loading
          ? <LoaderCircle className="shrink-0 animate-spin text-primary" size={17} />
          : <ChevronDown className={clsx("shrink-0 text-text-tertiary transition", open && "rotate-180")} size={17} />}
      </button>

      {open && (
        <div className="absolute z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-bg p-2 shadow-xl">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" size={16} />
            <input
              ref={searchRef}
              value={query}
              placeholder={searchPlaceholder}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") setOpen(false);
                if (event.key === "Enter" && filteredOptions.length === 1) {
                  event.preventDefault();
                  select(filteredOptions[0]);
                }
              }}
              className="h-10 w-full rounded-lg border border-border bg-bg pl-9 pr-3 text-sm text-text outline-none placeholder:text-text-muted focus:border-primary"
            />
          </div>
          <div id={listboxId} role="listbox" className="mt-2 max-h-60 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <p className="px-3 py-5 text-center text-sm text-text-tertiary">{emptyMessage}</p>
            ) : filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                onClick={() => select(option)}
                className={clsx(
                  "flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition hover:bg-primary/10 hover:text-primary",
                  option.value === value ? "bg-primary/10 font-semibold text-primary" : "text-text",
                )}
              >
                <span>{option.label}</span>
                {option.value === value && <Check className="shrink-0" size={16} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

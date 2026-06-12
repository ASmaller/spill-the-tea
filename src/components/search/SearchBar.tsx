import { SearchIcon } from "@/components/icons/SearchIcon";
import { FOCUS_RING } from "@/lib/styles";

export interface Props {
  query: string;
  placeholder?: string;
  onChange?: (value: string) => void;
  onClear?: () => void;
}

export function SearchBar({
  query,
  placeholder = "Search…",
  onChange,
  onClear,
}: Props) {
  return (
    <div className="bg-cream border-ink/[0.10] flex flex-1 items-center gap-2 rounded-lg border px-3 py-2">
      <SearchIcon />
      <input
        value={query}
        onChange={e => onChange && onChange(e.target.value)}
        placeholder={placeholder}
        className={`text-ink text-body flex-1 rounded-sm bg-transparent outline-none ${FOCUS_RING.cream}`}
      />
      {query && (
        <button
          type="button"
          onClick={onClear}
          aria-label="Clear search"
          className={`text-ink-soft text-meta cursor-pointer rounded-sm ${FOCUS_RING.cream}`}
        >
          ✕
        </button>
      )}
    </div>
  );
}

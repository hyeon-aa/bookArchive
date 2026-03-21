import { Calendar } from "lucide-react";

export function DateField({
  label,
  value,
  onChange,
  isAnimated,
}: {
  label: string;
  value?: string | null;
  onChange: (v: string) => void;
  isAnimated?: boolean;
}) {
  return (
    <div
      className={`space-y-2 ${
        isAnimated ? "animate-in fade-in slide-in-from-top-2 duration-300" : ""
      }`}
    >
      <label className="text-xs font-bold text-[#7C9885] flex items-center gap-2 px-1 uppercase tracking-wider">
        <Calendar size={14} /> {label}
      </label>
      <input
        type="date"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-12 bg-[#F9FAFB] rounded-xl px-4 text-sm outline-none focus:ring-2 ring-[#7C9885]/20 appearance-none border-none"
      />
    </div>
  );
}

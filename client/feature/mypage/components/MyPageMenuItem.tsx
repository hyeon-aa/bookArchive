import { ChevronRight } from "lucide-react";

interface MyPageMenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

export function MyPageMenuItem({ icon, label, onClick }: MyPageMenuItemProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white rounded-2xl shadow-sm border border-gray-50 hover:bg-gray-50 transition-all active:scale-[0.98]"
    >
      <div className="flex items-center gap-3 text-gray-700">
        <div className="text-[rgb(var(--primary-sage))]">{icon}</div>
        <span className="text-sm font-semibold">{label}</span>
      </div>
      <ChevronRight size={18} className="text-gray-300" />
    </button>
  );
}

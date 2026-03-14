import { ReactNode } from "react";

interface DashboardSectionProps {
  title?: string;
  emoji?: string;
  children: ReactNode;
  className?: string;
}

export function DashboardSection({
  title,
  emoji,
  children,
  className = "",
}: DashboardSectionProps) {
  return (
    <section
      className={`bg-white rounded-3xl p-6 shadow-sm border border-gray-100 ${className}`}
    >
      {title && (
        <h3 className="text-[15px] font-bold mb-4 flex items-center gap-2 text-gray-800">
          {emoji && <span>{emoji}</span>}
          {title}
        </h3>
      )}
      {children}
    </section>
  );
}

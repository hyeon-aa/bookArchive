import { ReactNode } from "react";

interface FunnelStepLayoutProps {
  title: ReactNode;
  description?: string;
  children: ReactNode;
  bottomContent?: ReactNode;
}

export function FunnelStepLayout({
  title,
  description,
  children,
  bottomContent,
}: FunnelStepLayoutProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-[#333] leading-tight">
          {title}
        </h2>
        {description && <p className="text-sm text-gray-400">{description}</p>}
      </div>

      <div>{children}</div>

      {bottomContent && <div className="pt-2">{bottomContent}</div>}
    </div>
  );
}

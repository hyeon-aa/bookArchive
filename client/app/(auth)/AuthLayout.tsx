"use client";

import { ReactNode } from "react";

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
}

export function AuthLayout({
  title,
  description,
  children,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-3 mt-6">{title}</h1>
          <p className="text-gray-500 text-lg">{description}</p>
        </div>

        {children}

        <div className="mt-8 text-center">{footer}</div>
      </div>
    </div>
  );
}

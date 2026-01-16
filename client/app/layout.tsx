import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex justify-center min-h-screen">
        <div className="w-full max-w-[480px] bg-white shadow-2xl min-h-screen overflow-y-auto">
          {children}
        </div>
      </body>
    </html>
  );
}

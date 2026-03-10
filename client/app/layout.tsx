import "./globals.css";
import { ModalProvider } from "./ModalProvider";
import Providers from "./provider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="flex justify-center min-h-screen">
        <div className="w-full max-w-[480px] bg-white shadow-2xl min-h-screen overflow-y-auto">
          <Providers>
            {children}
            <ModalProvider />
          </Providers>
        </div>
      </body>
    </html>
  );
}

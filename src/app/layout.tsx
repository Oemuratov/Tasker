import type { Metadata } from "next";
import "./globals.css";
import { SyncProvider } from "@/components/SyncProvider";

export const metadata: Metadata = {
  title: "Tasker",
  description: "Прибежище несчастных",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body className={`antialiased`}>
        <SyncProvider />
        {children}
      </body>
    </html>
  );
}

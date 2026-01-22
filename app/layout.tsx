import type { Metadata } from "next";
import "./globals.css";
import PinLock from "@/components/PinLock";

export const metadata: Metadata = {
  title: "Personal Finance Manager",
  description: "Manage your expenses, income, subscriptions, and wallets",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <PinLock>{children}</PinLock>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "../styles/globals.css";
import { ToastContainer } from "react-toastify";
import AosAnimation from "@/components/modules/ui/AosAnimation";

export const metadata: Metadata = {
  title: "Telegram messenger",
  description: "FullStack NextJs Telegram messenger with socket.io",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <link rel="manifest" href="/manifest.json" />
      <link
        rel="icon"
        type="image/png"
        href="./images/favicon-96x96.png"
        sizes="96x96"
      />
      <link rel="icon" type="image/svg+xml" href="./images/favicon.svg" />
      <link rel="shortcut icon" href="./images/favicon.ico" />
      <meta name="apple-mobile-web-app-title" content="Telegram" />
      <link rel="apple-touch-icon" href="/images/telegram-192x192.png" />
      <meta name="apple-mobile-web-app-status-bar" content="#000000" />

      <meta name="theme-color" content="#232735" />
      <body className="font-vazirRegular bg-leftBarBg h-full">
        <ToastContainer />
        <AosAnimation />
        {children}
      </body>
    </html>
  );
}

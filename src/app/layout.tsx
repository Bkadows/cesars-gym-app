import type { Metadata } from "next";
import "./globals.css";
import TopNavigation from "@/components/TopNavigation";

export const metadata: Metadata = {
  title: "Cesar's Gym",
  description: "Gym Management App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <TopNavigation />
        <div className="wrap">
          <div className="pad">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}

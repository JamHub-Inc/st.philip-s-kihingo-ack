import "./globals.css";
import { Toaster } from "sonner";


export const metadata = {
  title: "ACK St. Philip's Kihingo",
  description: "A welcoming family of believers in Kiambu, rooted in Christ and serving our community with love, fellowship, and compassion.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
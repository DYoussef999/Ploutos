import "./globals.css";
import LayoutShell from "@/components/LayoutShell";
import { UserProvider } from "@auth0/nextjs-auth0/client";

export const metadata = {
  title: "LaunchPad AI",
  description: "Expansion Intelligence for Small Businesses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=DM+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-gray-50">
        <UserProvider>
          <LayoutShell>{children}</LayoutShell>
        </UserProvider>
      </body>
    </html>
  );
}

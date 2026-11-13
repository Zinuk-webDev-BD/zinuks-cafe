import Link from "next/link";
import "./globals.css";
import { playfair, poppins } from "@/lib/fonts";
import { AuthProvider } from "@/components/AuthProvider";
import NavAuth from "@/components/NavAuth";
import ScrollProgress from "@/components/ScrollProgress";

export const metadata = {
  title: "Zinuk's Cafe Corner",
  description: "Handcrafted coffee, fresh bites and sweet moments",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-cream text-espresso antialiased`}>
        <AuthProvider>
          <ScrollProgress />
          <header className="sticky top-0 z-30 h-16 bg-espresso/95 text-white backdrop-blur">
            <div className="mx-auto flex h-full max-w-6xl items-center justify-between px-4">
              <Link href="/" className={`${playfair.className} text-xl font-bold`}>
                ☕ Zinuk&apos;s Cafe Corner
              </Link>
              <nav className="flex items-center gap-6 text-sm">
                <Link href="/#menu" className="nav-link">
                  Menu
                </Link>
                <Link href="/#about" className="nav-link">
                  About
                </Link>
                <NavAuth />
              </nav>
            </div>
          </header>

          <main>{children}</main>

          <footer className="bg-espresso py-10 text-center text-sm text-stone-300">
            <p className={`${playfair.className} text-lg text-white`}>
              Zinuk&apos;s Cafe Corner
            </p>
            <p className="mt-2">Dhaka, Bangladesh · Open daily 9 AM to 11 PM</p>
            <p className="mt-1 text-stone-500">
              A demo project built with Next.js, Node.js and MongoDB
            </p>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
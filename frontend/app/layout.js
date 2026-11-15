import "./globals.css";
import { playfair, poppins } from "@/lib/fonts";
import { AuthProvider } from "@/components/AuthProvider";
import Navbar from "@/components/Navbar";
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
          <Navbar />

          <main>{children}</main>

          <footer className="bg-espresso px-4 py-10 text-center text-sm text-stone-300">
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
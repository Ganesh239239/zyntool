import "./globals.css";

export const metadata = {
  title: "Image Tools – Free Online Image Tools",
  description: "Compress, resize, crop, and convert images online for free."
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        <header className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Image Tools</h1>
            <nav className="space-x-4 text-sm">
              <a href="/compress-image" className="hover:underline">Compress</a>
              <a href="/resize-image" className="hover:underline">Resize</a>
              <a href="/crop-image" className="hover:underline">Crop</a>
              <a href="/jpg-to-png" className="hover:underline">Convert</a>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-4 py-12">
          {children}
        </main>

        <footer className="border-t bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6 text-sm text-gray-500">
            © {new Date().getFullYear()} Image Tools. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  );
}

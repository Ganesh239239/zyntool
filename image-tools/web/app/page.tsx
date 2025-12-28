export default function HomePage() {
  return (
    <section className="text-center">
      <h2 className="text-4xl font-bold mb-4">
        Free Online Image Tools
      </h2>

      <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
        Compress, resize, crop, rotate, and convert images directly in your browser.
        No signup. No installation.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ToolCard title="Compress Image" href="/compress-image" />
        <ToolCard title="Resize Image" href="/resize-image" />
        <ToolCard title="Crop Image" href="/crop-image" />
        <ToolCard title="JPG to PNG" href="/jpg-to-png" />
        <ToolCard title="PNG to JPG" href="/png-to-jpg" />
        <ToolCard title="JPG to WebP" href="/jpg-to-webp" />
      </div>
    </section>
  );
}

function ToolCard({ title, href }: { title: string; href: string }) {
  return (
    <a
      href={href}
      className="block rounded-lg border bg-white p-6 hover:shadow-md transition"
    >
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-gray-500 mt-2">
        Fast, free, and easy to use.
      </p>
    </a>
  );
}

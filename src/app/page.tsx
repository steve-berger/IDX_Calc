import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-3xl font-bold mb-3">Wertsicherungsrechner</h1>
      <p className="text-muted max-w-lg mb-8">
        Verwalten Sie Kunden und Akten und berechnen Sie die jährliche
        Indexanpassung anhand des Verbraucherpreisindex (VPI) für Österreich.
      </p>
      <Link
        href="/customers"
        className="inline-flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-hover transition-colors"
      >
        Kunden verwalten →
      </Link>
    </div>
  );
}

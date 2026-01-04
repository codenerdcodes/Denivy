import Link from "next/link";

function Card({
  href,
  title,
  icon,
  subtitle,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  subtitle: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:bg-white/10 hover:border-white/15"
    >
      <div className="flex items-center gap-3">
        <div className="text-xl">{icon}</div>
        <div className="text-lg font-semibold">{title}</div>
      </div>
      <div className="mt-2 text-sm text-zinc-400">{subtitle}</div>
    </Link>
  );
}

export default function Home() {
  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
      <h1 className="text-3xl font-bold">Denivy</h1>
      <p className="mt-2 text-zinc-400">Personal home utilities dashboard</p>

      <div className="mt-8 grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card
          href="/documents"
          title="Documents"
          icon="📁"
          subtitle="Manuals, receipts, important files"
        />
        <Card
          href="/notes"
          title="Notes"
          icon="🧠"
          subtitle="Quick notes that autosave"
        />
        <Card
          href="/utilities"
          title="Utilities"
          icon="⚙️"
          subtitle="Home info, tools, and shortcuts"
        />
      </div>
    </main>
  );
}

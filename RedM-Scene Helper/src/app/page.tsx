import Link from "next/link";

export default function Home() {
  const stats = [
    { label: "Items generated", value: 1243 },
    { label: "Scenes created", value: 589 },
    { label: "Users online", value: 37 },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <section className="text-center mb-12">
        <h1 className="heading text-4xl md:text-5xl text-white mb-4">RedM Scene Helper</h1>
        <p className="text-neutral-300 max-w-2xl mx-auto">
          Create and preview RedM scene codes with customizable fonts, colors, alignment, and more.
        </p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 text-center transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_0_20px_rgba(244,63,94,0.25)]"
          >
            <div className="text-3xl md:text-4xl font-extrabold text-rose-400 animate-pulse">{s.value.toLocaleString()}</div>
            <div className="text-neutral-300 mt-1">{s.label}</div>
          </div>
        ))}
      </section>

      <section className="mb-12">
        <h2 className="heading text-2xl text-white mb-3">About the project</h2>
        <div className="rounded-2xl border border-white/10 bg-neutral-900/60 p-6 leading-relaxed text-neutral-300">
          RedM Scene Helper is built to speed up creating immersive in-game scenes. It lets you:
          <ul className="list-disc pl-6 mt-3 space-y-2">
            <li>Edit text with per-line colors and live preview</li>
            <li>Toggle bold/italic and adjust alignment</li>
            <li>Copy generated code in one click</li>
          </ul>
          Start now in the <Link className="text-rose-400 hover:underline" href="/item-generator">Item Generator</Link>.
        </div>
      </section>

      <section>
        <h2 className="heading text-2xl text-white mb-3">FAQ</h2>
        <div className="space-y-3">
          <details className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
            <summary className="cursor-pointer font-semibold">Does font size or alignment affect the exported tags?</summary>
            <p className="mt-2 text-neutral-300">Currently those are preview-only. If you have specific game tags, we can add them.</p>
          </details>
          <details className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
            <summary className="cursor-pointer font-semibold">Can I color individual lines?</summary>
            <p className="mt-2 text-neutral-300">Yes — select a line number and apply a color, or apply to all lines.</p>
          </details>
          <details className="rounded-xl border border-white/10 bg-neutral-900/60 p-4">
            <summary className="cursor-pointer font-semibold">Where are stats pulled from?</summary>
            <p className="mt-2 text-neutral-300">They are placeholders for now. We can wire them to your backend or Firebase.</p>
          </details>
        </div>
      </section>
    </div>
  );
}

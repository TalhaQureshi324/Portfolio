"use client";

const TECHS = [
  "PyTorch", "TensorFlow", "OpenCV", "Transformers", "FastAPI", "Django",
  "Next.js", "React", "Flutter", "Docker", "Kubernetes", "PostgreSQL",
  "Redis", "n8n", "Shopify Liquid", ".NET", "gRPC", "LIME",
];

/**
 * Infinite tech-stack ticker between hero and content —
 * duplicated track translates -50% for a seamless loop.
 * Pauses on hover; edge fades mask the overflow.
 */
export default function TechMarquee() {
  return (
    <div className="relative overflow-hidden border-y border-white/[0.06] bg-surface/30 py-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-obsidian to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-obsidian to-transparent" />
      <div className="marquee-track flex w-max items-center">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center" aria-hidden={copy === 1}>
            {TECHS.map((tech) => (
              <span key={`${copy}-${tech}`} className="flex items-center font-mono text-xs tracking-wide text-slate-500">
                <span className="px-6 transition-colors hover:text-cyanx">{tech}</span>
                <span className="h-1 w-1 rotate-45 bg-cyanx/40" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

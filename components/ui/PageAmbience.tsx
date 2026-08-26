/**
 * Site-wide ambient backdrop — three heavily-blurred gradient blobs
 * drifting on slow CSS transforms behind all content. Fixed to the
 * viewport so they peek through section gaps while scrolling.
 * Opacities are intentionally near-invisible (4–6%): continuity,
 * not decoration. GPU-composited (transform-only keyframes).
 */
export default function PageAmbience() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="aurora absolute -left-56 top-[18%] h-[580px] w-[580px] rounded-full bg-cyanx/[0.05] blur-[140px]" />
      <div className="aurora-reverse absolute -right-56 top-[55%] h-[620px] w-[620px] rounded-full bg-violetx/[0.06] blur-[150px]" />
      <div className="aurora absolute -bottom-40 left-[30%] h-[520px] w-[520px] rounded-full bg-azure/[0.04] blur-[140px] [animation-delay:-8s]" />
    </div>
  );
}

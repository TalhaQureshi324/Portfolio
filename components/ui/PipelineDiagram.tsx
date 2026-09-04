"use client";

/**
 * Static system diagrams in the editorial identity — thin ink
 * strokes, mono labels, the accent reserved for the pipeline's
 * core stage. These document real systems; nothing animates.
 */

interface DiagramProps {
  steps: string[];
  coreIndex: number;
  caption?: string;
}

export function PipelineDiagram({ steps, coreIndex, caption }: DiagramProps) {
  const W = 860;
  const H = 108;
  const pad = 34;
  const gap = (W - pad * 2) / (steps.length - 1);
  const y = H / 2;

  return (
    <figure>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`System pipeline: ${steps.join(", then ")}`}
      >
        {/* connector line */}
        <line x1={pad} y1={y} x2={W - pad} y2={y} stroke="rgba(26,25,21,0.25)" strokeWidth="1" />

        {steps.map((step, i) => {
          const cx = pad + gap * i;
          const isCore = i === coreIndex;
          const isLast = i === steps.length - 1;
          return (
            <g key={step}>
              {/* direction ticks on the line */}
              {!isLast && (
                <path
                  d={`M ${cx + gap / 2 - 4} ${y - 3.5} L ${cx + gap / 2 + 1} ${y} L ${cx + gap / 2 - 4} ${y + 3.5}`}
                  fill="none"
                  stroke="rgba(26,25,21,0.4)"
                  strokeWidth="1"
                />
              )}
              <circle
                cx={cx}
                cy={y}
                r={isCore ? 9 : 5.5}
                fill="var(--paper)"
                stroke={isCore ? "#B4442C" : "rgba(26,25,21,0.55)"}
                strokeWidth={isCore ? 1.6 : 1.1}
              />
              {isCore && <circle cx={cx} cy={y} r={3} fill="#B4442C" />}
              <text
                x={cx}
                y={y - 22}
                textAnchor="middle"
                fill={isCore ? "#B4442C" : "#6B675E"}
                fontSize="11.5"
                fontFamily="var(--font-jetbrains), monospace"
                letterSpacing="0.08em"
              >
                {step.toUpperCase()}
              </text>
              <text
                x={cx}
                y={y + 34}
                textAnchor="middle"
                fill="#9B958A"
                fontSize="10"
                fontFamily="var(--font-jetbrains), monospace"
              >
                {String(i + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}
      </svg>
      {caption && (
        <figcaption className="mt-2 text-[12px] text-ink3">{caption}</figcaption>
      )}
    </figure>
  );
}

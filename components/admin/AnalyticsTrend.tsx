type Point = { date: string; views: number; visitors: number };

export default function AnalyticsTrend({ data }: { data: Point[] }) {
  const width = 900;
  const height = 220;
  const max = Math.max(1, ...data.map((point) => point.views));
  const x = (index: number) =>
    data.length === 1 ? 0 : (index / (data.length - 1)) * width;
  const y = (value: number) => height - (value / max) * (height - 20);
  const line = data.map((point, index) => `${x(index)},${y(point.views)}`).join(" ");
  const area = `0,${height} ${line} ${width},${height}`;

  return (
    <div>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-56 w-full overflow-visible"
        role="img"
        aria-label="Page views over time"
      >
        <defs>
          <linearGradient id="analytics-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d9ff43" stopOpacity=".32" />
            <stop offset="100%" stopColor="#d9ff43" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => (
          <line
            key={step}
            x1="0"
            x2={width}
            y1={height * step}
            y2={height * step}
            stroke="rgba(255,255,255,.08)"
          />
        ))}
        <polygon points={area} fill="url(#analytics-fill)" />
        <polyline
          points={line}
          fill="none"
          stroke="#d9ff43"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="mt-3 flex justify-between text-xs text-white/40">
        <span>{data[0]?.date ?? "No data"}</span>
        <span>{data.at(-1)?.date ?? ""}</span>
      </div>
    </div>
  );
}

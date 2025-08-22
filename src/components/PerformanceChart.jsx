import React, { useMemo } from 'react'

function PerformanceChart({ data = [], height = 220 }) {
  const { points, minX, maxX, minY, maxY, pathD, areaD } = useMemo(() => {
    if (!data.length) {
      return { points: [], minX: 0, maxX: 1, minY: 0, maxY: 100, pathD: '', areaD: '' }
    }
    const parsed = data
      .map((d) => ({ x: new Date(d.date).getTime(), y: Math.max(0, Math.min(100, d.score)) }))
      .sort((a, b) => a.x - b.x)

    const xs = parsed.map((p) => p.x)
    const ys = parsed.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = 0
    const maxY = 100

    const width = 600
    const height = 200
    const pad = 16

    const scaleX = (x) => {
      if (maxX === minX) return pad
      return pad + ((x - minX) / (maxX - minX)) * (width - pad * 2)
    }
    const scaleY = (y) => pad + (1 - (y - minY) / (maxY - minY)) * (height - pad * 2)

    const pts = parsed.map((p) => [scaleX(p.x), scaleY(p.y)])
    const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ')
    const areaD = `${pathD} L ${pts[pts.length - 1]?.[0] ?? pad} ${height - pad} L ${pts[0]?.[0] ?? pad} ${height - pad} Z`

    return { points: pts, minX, maxX, minY, maxY, pathD, areaD }
  }, [data])

  return (
    <div className="w-100">
      <svg viewBox="0 0 600 200" width="100%" height={height} role="img" aria-label="Quiz scores over time">
        {/* Grid */}
        <g stroke="var(--sb-chart-grid)" strokeWidth="1" opacity="0.5">
          <line x1="16" y1="184" x2="584" y2="184" />
          <line x1="16" y1="104" x2="584" y2="104" />
          <line x1="16" y1="24" x2="584" y2="24" />
        </g>
        {/* Area */}
        {areaD && (
          <path d={areaD} fill="var(--sb-chart-fill)" opacity="0.25" />
        )}
        {/* Line */}
        {pathD && (
          <path d={pathD} fill="none" stroke="var(--sb-chart-line)" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
        )}
        {/* Points */}
        {points.map(([x, y], idx) => (
          <circle key={idx} cx={x} cy={y} r="3.5" fill="var(--sb-chart-line)" />
        ))}
      </svg>
    </div>
  )
}

export default PerformanceChart



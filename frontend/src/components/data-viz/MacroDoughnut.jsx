import { useEffect, useRef } from 'react';
import { Chart, DoughnutController, ArcElement, Tooltip, Legend } from 'chart.js';

Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

/* MacroDoughnut — Chart.js doughnut for the Macro Split calculator
   (spec §3.6). Colours come from the design-system tokens; the
   chart instance is destroyed on unmount / data change. */

export default function MacroDoughnut({ protein, carbs, fats, proteinPct, carbsPct, fatsPct }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const styles = getComputedStyle(document.documentElement);
    const pick = (name, fallback) => (styles.getPropertyValue(name) || '').trim() || fallback;
    if (chartRef.current) chartRef.current.destroy();
    chartRef.current = new Chart(canvas, {
      type: 'doughnut',
      data: {
        labels: [
          `Protein ${proteinPct}% (${protein}g)`,
          `Carbs ${carbsPct}% (${carbs}g)`,
          `Fat ${fatsPct}% (${fats}g)`,
        ],
        datasets: [{
          data: [protein, carbs, fats],
          backgroundColor: [
            pick('--color-accent', '#B45309'),
            pick('--color-primary', '#0A6640'),
            pick('--color-info', '#2563EB'),
          ],
          borderWidth: 2,
          borderColor: '#ffffff',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '62%',
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 12 } },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = protein + carbs + fats;
                const pct = total ? Math.round((ctx.parsed / total) * 100) : 0;
                return ` ${ctx.label} — ${ctx.parsed}g (${pct}%)`;
              },
            },
          },
        },
      },
    });
    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, [protein, carbs, fats, proteinPct, carbsPct, fatsPct]);

  return <canvas ref={canvasRef} aria-label="Macronutrient split doughnut chart" role="img" />;
}

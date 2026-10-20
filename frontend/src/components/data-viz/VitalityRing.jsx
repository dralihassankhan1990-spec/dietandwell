import { useEffect, useId, useRef } from 'react';
import './VitalityRing.css';

export default function VitalityRing({
  value = 70,
  max = 100,
  label = 'Score',
  unit = '',
  size = 140,
  strokeWidth = 12,
}) {
  const ringRef = useRef(null);
  /* Unique gradient id — several rings render on the same page. */
  const gradientId = useId();
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const offset = circumference * (1 - percentage / 100);

  useEffect(() => {
    if (ringRef.current) {
      ringRef.current.style.strokeDashoffset = offset;
    }
  }, [offset]);

  return (
    <div className="vitality-ring" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="vitality-ring-svg"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" className="vitality-ring-stop-start" />
            <stop offset="100%" className="vitality-ring-stop-end" />
          </linearGradient>
        </defs>
        {/* Track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-surface-container-high)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Fill circle */}
        <circle
          ref={ringRef}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          className="vitality-ring-fill"
        />
      </svg>
      {/* Center content */}
      <div className="vitality-ring-center">
        <span className="vitality-ring-value">
          {value}{unit}
        </span>
        <span className="vitality-ring-label">
          {label}
        </span>
      </div>
    </div>
  );
}

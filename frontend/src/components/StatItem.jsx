import React, { useState, useEffect, useRef } from 'react';

export default function StatItem({ number, label }) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const elementRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !hasAnimated) {
        setHasAnimated(true);
        const targetNumber = parseInt(number.replace(/[^0-9]/g, ''));
        const duration = 2000;
        const steps = 60;
        const increment = targetNumber / steps;
        let current = 0;
        const interval = setInterval(() => {
          current += increment;
          if (current >= targetNumber) {
            setCount(targetNumber);
            clearInterval(interval);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      }
    }, { threshold: 0.3 });

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [number, hasAnimated]);

  return (
    <div className="stat-item" ref={elementRef}>
      <h3 className="stat-number">
        {hasAnimated ? count : 0}
        {number.includes('+') ? '+' : number.includes('%') ? '%' : ''}
      </h3>
      <p className="stat-label">{label}</p>
    </div>
  );
}

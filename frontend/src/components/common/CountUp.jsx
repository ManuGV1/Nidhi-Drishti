import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'framer-motion';

export const CountUp = ({
  value = 0,
  duration = 1000,
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });
  const hasAnimated = useRef(false);

  const prevValue = useRef(value);

  useEffect(() => {
    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      setDisplayValue(value);
      return;
    }

    if (prevValue.current !== value) {
      hasAnimated.current = false;
      prevValue.current = value;
    }

    if (isInView && !hasAnimated.current) {
      hasAnimated.current = true;
      let startTimestamp = null;
      const numericValue = typeof value === 'number' ? value : parseFloat(value) || 0;

      const step = (timestamp) => {
        if (!startTimestamp) startTimestamp = timestamp;
        const progress = Math.min((timestamp - startTimestamp) / duration, 1);

        // Smooth cubic easing: 1 - Math.pow(1 - progress, 3)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = easeProgress * numericValue;

        setDisplayValue(current);

        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          setDisplayValue(numericValue);
        }
      };

      window.requestAnimationFrame(step);
    }
  }, [isInView, value, duration]);

  const formattedNumber =
    decimals > 0
      ? displayValue.toFixed(decimals)
      : Math.round(displayValue).toLocaleString('en-IN');

  return (
    <span ref={ref} className={`font-mono tabular-nums ${className}`}>
      {prefix}
      {formattedNumber}
      {suffix}
    </span>
  );
};

export default CountUp;

import { useEffect, useRef, useState } from 'react';

export function useCountUp(target = 0, duration = 900, decimals = 0) {
  const [val, setVal] = useState(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const start = performance.now(); const to = Number(target) || 0;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(to * eased);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  if (decimals > 0) return val.toFixed(decimals);
  return Math.round(val).toLocaleString('en-IN');
}


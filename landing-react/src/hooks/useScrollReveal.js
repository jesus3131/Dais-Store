import { useEffect, useRef } from 'react';

export default function useScrollReveal(className = 'scroll-reveal', threshold = 0.1, extraDeps = []) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      },
      { threshold }
    );

    if (el.classList.contains(className)) {
      observer.observe(el);
    } else {
      el.querySelectorAll(`.${className}`).forEach(child => observer.observe(child));
    }

    return () => observer.disconnect();
  }, [className, threshold, ...extraDeps]);

  return ref;
}

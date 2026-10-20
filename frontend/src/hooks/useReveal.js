/* ================================================================
   /frontend/src/hooks/useReveal.js
   ================================================================
   IntersectionObserver Hook for Scroll Reveal Animations
   A MutationObserver re-scans for `.reveal` elements so content
   rendered after mount (e.g. API-loaded blog cards) also reveals.
   ================================================================ */

import { useEffect } from 'react';

export function useReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    const scan = (root = document) => {
      root.querySelectorAll('.reveal:not(.visible), .reveal-scale:not(.visible)').forEach((el) => {
        observer.observe(el);
      });
    };
    scan();

    const mutations = new MutationObserver(() => scan());
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, []);
}

export function useCountUp(target, duration = 800) {
  useEffect(() => {
    const els = document.querySelectorAll('.count-up-value');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            const endValue = parseInt(el.dataset.value, 10);
            const startTime = Date.now();

            const animate = () => {
              const elapsed = Date.now() - startTime;
              const progress = Math.min(elapsed / duration, 1);
              const currentValue = Math.floor(progress * endValue);
              el.textContent = currentValue.toLocaleString();

              if (progress < 1) {
                requestAnimationFrame(animate);
              }
            };

            animate();
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.2 }
    );

    els.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [duration]);
}

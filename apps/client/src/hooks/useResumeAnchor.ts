import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useResumeAnchor() {
  const { hash, search } = useLocation();
  useEffect(() => {
    if (!hash) return;
    const frame = requestAnimationFrame(() => {
      const target = document.getElementById(hash.slice(1));
      target?.scrollIntoView({ behavior: "auto", block: "start" });
      target?.focus({ preventScroll: true });
    });
    return () => cancelAnimationFrame(frame);
  }, [hash, search]);
}

export function afterPageLoad(callback: () => void): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const schedule = () => {
    timer = setTimeout(callback, 1000);
  };
  if (document.readyState === "complete") schedule();
  else window.addEventListener("load", schedule, { once: true });
  return () => {
    window.removeEventListener("load", schedule);
    clearTimeout(timer);
  };
}
